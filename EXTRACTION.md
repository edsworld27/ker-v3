# Extracting into two repos

This monorepo will split into two deployable apps:

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   felicia-website           │         │   aqua-portal               │
│   luvandker.com             │ ◄─────► │   portal.aqua.com           │
│                             │ iframe  │                             │
│   Storefront only           │         │   Multi-tenant platform     │
│   (Hero, products, blog…)   │         │   (admin, plugins, agency)  │
└─────────────────────────────┘         └─────────────────────────────┘
```

The iframe bridge (`/embed/login` → `/admin`) is **already built** in
`aqua-portal`. Felicia's site embeds it at any URL using
`<EmbeddedPortal />` (see `src/components/EmbeddedPortal.tsx`).

## Quick split

```bash
bash scripts/extract.sh
```

Produces two sibling output folders:

```
out/
  felicia-website/   ← copy this to a new git repo, deploy to luvandker.com
  aqua-portal/       ← copy this to a new git repo, deploy to portal.aqua.com
```

Each folder is a self-contained Next.js app with its own
`package.json`, `tsconfig.json`, `next.config.ts`, `src/`, etc.

## What goes to Felicia's website

| Slice | Why |
|---|---|
| `src/app/page.tsx` (home) + `(about|blog|cart|checkout|contact|faq|ingredients|lab-tests|our-philosophy|our-story|privacy|products|redeem|reviews)/` | Customer-facing storefront pages |
| `src/app/account/` | Customer account flows (login / orders / verify) |
| `src/app/p/[...slug]/` | Visual-editor-rendered pages (kept locally so Felicia's content isn't dependent on the portal being up) |
| `src/app/api/stripe/` | Checkout + webhook |
| `src/app/api/og/` | OG-image generator |
| `src/app/api/portal/products/[slug]/` | Read-only product API (the storefront calls it) |
| `src/app/api/portal/forms/submit` `newsletter/subscribe` `donations/checkout` | Public form-submission endpoints |
| `src/app/api/portal/analytics/track` | Public tracking beacon |
| `src/app/api/portal/affiliates/track-click` | Public referral tracking |
| `src/components/(Hero|FeaturedProducts|ProductDetail|Navbar|Footer|HomeSections|CartDrawer|…)` | Storefront UI |
| `src/components/editor/` | Block renderer + 57 blocks (so storefront pages can render) |
| `src/lib/products` `cart` `discounts` `marketing` (read-only) | Catalog + cart logic |
| `src/portal/server/` (read paths only) | Server modules for product reads + analytics ingest |
| `src/components/EmbeddedPortal.tsx` | Iframe wrapper pointing at portal.aqua.com |

## What goes to the Aqua portal

| Slice | Why |
|---|---|
| `src/app/admin/` | Per-tenant operator panel |
| `src/app/aqua/` | Agency-level marketplace + new-org flow |
| `src/app/login/` | Operator sign-in |
| `src/app/embed/` | Iframe bridge for embedding from any host site |
| `src/app/api/auth/` `api/admin/` `api/portal/*` (everything except the public-facing endpoints listed above) | Admin + tenant management API |
| `src/plugins/` | All 33 plugin manifests + foundation |
| `src/portal/server/` (full) | All server runtimes |
| `src/components/admin/` `components/aqua/` `components/editor/` | Admin UI + editor + 57 blocks |
| `src/lib/admin/` `lib/server/` | Admin helpers |
| `src/middleware.ts` | Edge auth on `/admin` |

## Shared (duplicated to both)

- `src/lib/auth.ts` — both apps need session reads
- `src/components/editor/` — Felicia's `/p/[slug]` route renders blocks; portal's editor authors them. Same renderer.
- `src/lib/products`, `lib/cart`, `lib/discounts` — read-only on storefront, full CRUD on portal
- `src/portal/server/types.ts` — type definitions, no runtime
- `src/app/layout.tsx` — base layout (each app gets a tailored copy)
- `src/app/globals.css` — Tailwind base
- `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `package.json`

## Felicia's portal inside Aqua

Within the Aqua portal there's a per-org admin view at:

- `/aqua/felicia` — agency view of Felicia's portal
- `/aqua/felicia/marketplace` — install/configure plugins for her
- `/admin?org=felicia` — switch into Felicia's tenant admin

When Felicia's storefront is extracted, it embeds the **`/embed/login`**
iframe pointing at portal.aqua.com. The iframe is the portal app
running first-party from its own perspective; cookies, sessions, and
API calls all live in `portal.aqua.com`'s origin. The host site never
touches credentials. Same model as Intercom / Crisp / Calendly.

## Cross-origin checklist (after split)

- [ ] portal.aqua.com sets `Content-Security-Policy: frame-ancestors https://luvandker.com https://*.luvandker.com` (so Felicia's site can frame it; everyone else can't)
- [ ] `Set-Cookie` for `lk_session_v1` includes `SameSite=None; Secure` (so the iframe can carry cookies cross-site)
- [ ] portal.aqua.com responds to `OPTIONS /api/portal/*` with appropriate CORS headers if Felicia's site ever needs to call the portal API directly (rare — most calls happen from inside the iframe)
- [ ] Both apps share `STRIPE_WEBHOOK_SECRET` only if the storefront keeps the webhook handler; otherwise webhook moves to portal-only

## What this PR delivers

1. **`EXTRACTION.md`** (this file) — plan + manifest
2. **`scripts/extract.sh`** — runs the split into `out/felicia-website/` and `out/aqua-portal/`
3. **`src/components/EmbeddedPortal.tsx`** — `<EmbeddedPortal mode="login" />` helper for Felicia's site to iframe the portal
4. **`/aqua/felicia/page.tsx`** — Felicia's dedicated agency-side overview page

The actual move-to-two-git-repos step is manual after running the
script (you copy each output folder into a new repo, `git init`,
`git push` to GitHub, set up Vercel, point DNS).
