#!/usr/bin/env bash
# scripts/extract.sh
#
# Splits this monorepo into two output folders:
#   out/felicia-website/   ← deployable Next.js app for luvandker.com
#   out/aqua-portal/       ← deployable Next.js app for portal.aqua.com
#
# Each folder is a complete, standalone repo-in-waiting:
#   cd out/felicia-website && git init && git add . && git commit -m "init"
#   git remote add origin <new-felicia-repo-url>
#   git push -u origin main
# Repeat for out/aqua-portal.
#
# This script is idempotent: it deletes out/ first, then rebuilds.
# Read EXTRACTION.md for the file-by-file rationale.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/out"
FELICIA="${OUT}/felicia-website"
AQUA="${OUT}/aqua-portal"

echo "▸ Extracting from ${ROOT}"
rm -rf "${OUT}"
mkdir -p "${FELICIA}" "${AQUA}"

# ─── Shared scaffolding ──────────────────────────────────────────────
# Every Next.js app needs these regardless of which side it's on.
SHARED_FILES=(
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "next.config.ts"
  "next-env.d.ts"
  "tailwind.config.ts"
  "postcss.config.mjs"
  "eslint.config.mjs"
  ".gitignore"
)

copy_shared() {
  local target="$1"
  for f in "${SHARED_FILES[@]}"; do
    [ -f "${ROOT}/${f}" ] && cp "${ROOT}/${f}" "${target}/" || true
  done
  mkdir -p "${target}/public"
  cp -r "${ROOT}/public/." "${target}/public/" 2>/dev/null || true
}

copy_shared "${FELICIA}"
copy_shared "${AQUA}"

# ─── Felicia's website ──────────────────────────────────────────────
echo "▸ Building out/felicia-website/"
mkdir -p "${FELICIA}/src/app" "${FELICIA}/src/components" "${FELICIA}/src/lib" \
         "${FELICIA}/src/context" "${FELICIA}/src/portal/server"

# Storefront routes
for r in about account blog cart checkout contact faq help ingredients \
         lab-tests our-philosophy our-story p portal privacy products \
         redeem reviews; do
  if [ -d "${ROOT}/src/app/${r}" ]; then
    cp -r "${ROOT}/src/app/${r}" "${FELICIA}/src/app/"
  fi
done

# Top-level app files (home, layout, globals, not-found, favicon)
cp "${ROOT}/src/app/page.tsx"     "${FELICIA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/layout.tsx"   "${FELICIA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/globals.css"  "${FELICIA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/not-found.tsx" "${FELICIA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/favicon.ico"  "${FELICIA}/src/app/" 2>/dev/null || true

# Storefront-side APIs
mkdir -p "${FELICIA}/src/app/api"
for api in stripe og donations; do
  if [ -d "${ROOT}/src/app/api/${api}" ]; then
    cp -r "${ROOT}/src/app/api/${api}" "${FELICIA}/src/app/api/"
  fi
done
mkdir -p "${FELICIA}/src/app/api/portal"
for api in products forms newsletter orders analytics affiliates; do
  if [ -d "${ROOT}/src/app/api/portal/${api}" ]; then
    cp -r "${ROOT}/src/app/api/portal/${api}" "${FELICIA}/src/app/api/portal/"
  fi
done
cp "${ROOT}/src/app/api/admin/fonts/route.ts" "${FELICIA}/src/app/api/" 2>/dev/null || true

# Components — storefront UI + the renderer + the embed wrapper
for c in Hero Footer Navbar FeaturedProducts ProductDetail ProductVariantPicker \
         HomeSections Problem InfoPage InfoPageHeader IngredientGrid \
         GiftCardPurchaseForm CartDrawer DiscountPopup CookiePreferencesModal \
         PurpleSideScroller SiteHead SiteResolver SiteUX ChatBot ChatBotLazy \
         AnalyticsResolver AnalyticsTracker FeatureGate ABTestRunner \
         ThemeInjector PreviewBar PortalEditOverlay PortalPageRenderer \
         PortalTagInjector ImpersonationBar ForcePasswordChange \
         EmbeddedPortal web-vitals-reporter; do
  cp "${ROOT}/src/components/${c}.tsx" "${FELICIA}/src/components/" 2>/dev/null || true
done

# Editor block renderer (storefront pages render blocks)
mkdir -p "${FELICIA}/src/components/editor"
cp -r "${ROOT}/src/components/editor/blocks"       "${FELICIA}/src/components/editor/" 2>/dev/null || true
cp "${ROOT}/src/components/editor/BlockRenderer.tsx" "${FELICIA}/src/components/editor/" 2>/dev/null || true
cp "${ROOT}/src/components/editor/blockRegistry.ts"  "${FELICIA}/src/components/editor/" 2>/dev/null || true
cp "${ROOT}/src/components/editor/blockStyles.ts"    "${FELICIA}/src/components/editor/" 2>/dev/null || true
cp "${ROOT}/src/components/editor/themeCss.ts"       "${FELICIA}/src/components/editor/" 2>/dev/null || true
cp "${ROOT}/src/components/editor/AnimateOnScroll.tsx" "${FELICIA}/src/components/editor/" 2>/dev/null || true

# Storefront lib
for l in products cart discounts marketing reviews customers blog auth utils; do
  cp "${ROOT}/src/lib/${l}.ts"  "${FELICIA}/src/lib/" 2>/dev/null || true
  cp "${ROOT}/src/lib/${l}.tsx" "${FELICIA}/src/lib/" 2>/dev/null || true
done
cp -r "${ROOT}/src/context"                 "${FELICIA}/src/" 2>/dev/null || true

# Server modules the storefront actually needs (read paths + form/analytics ingest)
for s in storage orgs types auth analytics formSubmissions newsletter \
         orders email donations affiliates eventBus webhooks searchIndex \
         knowledgebase blog; do
  cp "${ROOT}/src/portal/server/${s}.ts" "${FELICIA}/src/portal/server/" 2>/dev/null || true
done

# ─── Aqua portal ────────────────────────────────────────────────────
echo "▸ Building out/aqua-portal/"
mkdir -p "${AQUA}/src/app" "${AQUA}/src/components" "${AQUA}/src/lib" \
         "${AQUA}/src/plugins" "${AQUA}/src/portal/server"

# Portal routes
for r in admin aqua login embed; do
  if [ -d "${ROOT}/src/app/${r}" ]; then
    cp -r "${ROOT}/src/app/${r}" "${AQUA}/src/app/"
  fi
done

# Top-level app files
cp "${ROOT}/src/app/page.tsx"      "${AQUA}/src/app/" 2>/dev/null || true   # home redirects to /aqua
cp "${ROOT}/src/app/layout.tsx"    "${AQUA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/globals.css"   "${AQUA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/not-found.tsx" "${AQUA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/app/favicon.ico"   "${AQUA}/src/app/" 2>/dev/null || true
cp "${ROOT}/src/middleware.ts"     "${AQUA}/src/" 2>/dev/null || true

# All API routes (full surface)
cp -r "${ROOT}/src/app/api" "${AQUA}/src/app/" 2>/dev/null || true

# Plugins, full server modules, admin lib
cp -r "${ROOT}/src/plugins"        "${AQUA}/src/" 2>/dev/null || true
cp -r "${ROOT}/src/portal"         "${AQUA}/src/" 2>/dev/null || true
cp -r "${ROOT}/src/lib"            "${AQUA}/src/" 2>/dev/null || true

# Components — admin + aqua + editor + the storefront renderer
# (the admin's preview iframe + visual editor render storefront pages)
cp -r "${ROOT}/src/components"     "${AQUA}/src/" 2>/dev/null || true
cp -r "${ROOT}/src/context"        "${AQUA}/src/" 2>/dev/null || true

# ─── Per-app package.json overrides ─────────────────────────────────
cat > "${FELICIA}/.aqua-extracted-readme.md" <<'EOF'
# felicia-website (extracted from monorepo)

This is Felicia's storefront, freshly split out. Everything you need
to deploy to luvandker.com is here.

## Quick start

```bash
npm install
npm run dev
```

## Connecting the admin

Set the portal origin in `.env.local`:

```
NEXT_PUBLIC_AQUA_PORTAL_URL=https://portal.aqua.com
```

Then anywhere you want to drop the admin iframe:

```tsx
import EmbeddedPortal from "@/components/EmbeddedPortal";
<EmbeddedPortal siteId="felicia" mode="login" />
```

## What's missing

- All admin / agency / plugin code lives in the `aqua-portal` repo
- `/admin`, `/aqua`, `/login`, `/embed` are not part of this app —
  they're served by `portal.aqua.com` and embedded via iframe
EOF

cat > "${AQUA}/.aqua-extracted-readme.md" <<'EOF'
# aqua-portal (extracted from monorepo)

Multi-tenant agency platform. 33 plugins, marketplace, per-org
admin, the whole show.

## Quick start

```bash
npm install
npm run dev
```

## Cross-origin

For Felicia's storefront (luvandker.com) to embed `/embed/login`,
the portal needs to permit framing from her domain. Add a
`Content-Security-Policy: frame-ancestors` header in `next.config.ts`
or via a middleware response header:

```
frame-ancestors https://luvandker.com https://*.luvandker.com 'self'
```

Sessions: cookies must be `SameSite=None; Secure` so they work
inside the iframe context. Already true in `src/lib/server/auth.ts`.

## What's NOT in this app

- Felicia's customer-facing storefront pages (Hero, /shop, /blog,
  /products/[slug], /cart, /checkout, …) live in the `felicia-website`
  repo. They render against this portal's read-only product API.
EOF

echo ""
echo "✓ Done"
echo ""
echo "  out/felicia-website/  ← Felicia's storefront"
echo "  out/aqua-portal/      ← Aqua platform"
echo ""
echo "Next:"
echo "  1. cd out/felicia-website && git init && git add . && git commit -m 'init from monorepo extract'"
echo "  2. Push to a new GitHub repo, set up Vercel, point luvandker.com at it"
echo "  3. Repeat for out/aqua-portal at portal.aqua.com"
echo "  4. Drop <EmbeddedPortal /> on any felicia route to connect them"
