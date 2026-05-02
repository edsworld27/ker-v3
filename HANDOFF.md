# Aqua portal — handoff

Read this once. It's the lift-off briefing for a fresh session (you, a
new Claude, or a new contributor). Mental model first, then what shipped,
then what's next.

> Pair with `CLAUDE.md` (deeper architecture) and `AGENTS.md` (Next.js
> 16 caveats). This doc is the orientation; those are the references.

---

## Mental model

**One Next.js codebase, many tenants.** Every customer ("Felicia / Luv & Ker")
is an **org**. Each org owns sites, plugins, content, settings. The first
tenant lives at the apex domain; further tenants attach via custom domains.

Three top-level surfaces:

| URL          | Audience           | Purpose                                            |
|--------------|--------------------|----------------------------------------------------|
| `/`          | Public visitors    | Storefront. Renders Block tree from active site.   |
| `/admin/*`   | Per-tenant admin   | Operator panel. Active-org-scoped.                 |
| `/aqua/*`    | Agency owner       | Cross-client dashboard. Manages all orgs.          |

The agency owner uses both `/aqua` (cross-client overview) and `/admin`
(working *inside* a specific client's portal — set the active org from
the org switcher).

---

## How a portal is born

```
operator visits /aqua
  → clicks + New portal (/aqua/new)
  → picks a preset (Empty / Website / E-commerce / Blog / SaaS / …)
  → org created with preset's plugins auto-installed
  → redirected to /aqua/<orgId>/marketplace
  → installs / configures more plugins
  → clicks Open portal → drops into /admin as that tenant
```

---

## Repository structure (top of mind)

```
src/app/
  page.tsx, /shop, /blog, /faq, /help          ← storefront
  /admin/*                                      ← per-tenant operator panel
  /aqua/*                                       ← agency dashboard
  /api/portal/*                                 ← tenant-scoped APIs
  /api/auth/*                                   ← session minting
  /api/admin/*                                  ← admin-only utilities
  error.tsx, global-error.tsx, not-found.tsx    ← error boundaries

src/plugins/
  _types.ts          AquaPlugin contract
  _registry.ts       every shipped plugin
  _runtime.ts        install / configure / applyPreset
  _presets.ts        17 one-click bundles
  <plugin-id>/index.ts  manifest (data only)

src/portal/server/   server-only modules (orgs, storage, eventBus,
                     webhooks, automation, email, orders, analytics,
                     searchIndex, memberships, reservations, donations,
                     affiliates, crm, forum, wiki, knowledgebase,
                     formSubmissions, newsletter, translations,
                     healthchecks, users, content, pages, github,
                     promote, settings, compliance, activity, funnels,
                     notifications, calendar)

src/components/admin/    shared admin chrome
  ConfirmHost              styled confirm() singleton (replaces native)
  Toaster                  styled alert() singleton (replaces native)
  PromptHost               styled prompt() singleton (replaces native)
  Spinner / PageSpinner    consistent loading affordance
  SetupRequired            "plugin installed but not configured" empty
  PluginRequired           "plugin not installed" empty
  PluginMarketplace        shared marketplace UI (used by /admin & /aqua)
  CommandPalette           ⌘K palette
  SiteSwitcher / OrgSwitcher
  NotificationBell
  DevicePreview
  RichEditor

src/components/editor/blocks/  57 storefront blocks (hero, cta, product
                               grid, faq, gallery, pricing-table, …)

src/lib/server/
  auth.ts            HMAC-signed session cookies + requireAdmin()
  rateLimit.ts       in-memory token-bucket throttle

src/lib/admin/      client-side admin libs (one per concern)
```

---

## The 17 environment variables

Documented in `.env.example` at the repo root. Three groups:

| Group | Vars | When required |
|-------|------|---------------|
| **Security** | `PORTAL_SESSION_SECRET`, `NEXT_PUBLIC_PORTAL_SECURITY`, `NEXT_PUBLIC_PORTAL_DEV_BYPASS`, `PORTAL_PREVIEW_SECRET` | `PORTAL_SESSION_SECRET` MUST be set in production. `NEXT_PUBLIC_PORTAL_SECURITY` must NOT be `off`/`dev`/`false` in prod. |
| **Storage** | `PORTAL_BACKEND` (`file`/`memory`/`kv`/`supabase`), `PORTAL_KV_URL`+`PORTAL_KV_TOKEN`, `PORTAL_SUPABASE_URL`+`PORTAL_SUPABASE_SERVICE_KEY`, `PORTAL_SITE_ID` | Pick one backend. `file` is great for dev. Production needs `kv` or `supabase`. |
| **Storefront** | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_AQUA_PORTAL_URL` | Optional, default to localhost / same-origin. |
| **Plugins** | `STRIPE_SECRET_KEY`+`STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SHOPIFY_*`, `EASYPOST_API_KEY` | Only when those plugins are actually installed + configured. |

Generate session secret:
```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Production-grade state (after this session's 22 PRs)

### Auth & sessions
- ✅ HMAC-signed session cookies, httpOnly + sameSite=lax + secure-in-prod
- ✅ scrypt password hashing (RFC 7914), N=16384 r=8 p=1, 16-byte random salt
- ✅ Transparent legacy sha256 → scrypt upgrade on next sign-in
- ✅ `crypto.timingSafeEqual` on compare
- ✅ Dummy-hash run on user-not-found (defangs email enumeration via timing)
- ✅ Password strength validation (length 8–256, blocks trivial / sequential / common pwds)
- ✅ Per-IP (10/min) + per-email (5/min) rate limit on `/api/auth/login`
- ✅ Open-redirect guard on `/login?next=`
- ✅ `requireAdmin()` on previously-open mutating endpoints (`/api/admin/export-code`, `DELETE /api/portal/activity`, `POST /api/portal/compliance`, link-checker)

### Network / response hardening
- ✅ HSTS (`max-age=63072000; preload`)
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=()/microphone=()/geolocation=()/interest-cohort=()
- ✅ CSP — lenient on script-src to keep Tailwind+Next.js inline working; strict on object-src/base-uri/form-action
- ✅ SSRF guard on `/api/portal/links/[siteId]?check=1` — admin-gated + RFC1918 + cloud-metadata + IPv6-loopback blocklist

### Reliability
- ✅ Root error boundary (`/src/app/error.tsx`)
- ✅ Last-resort boundary (`/src/app/global-error.tsx`)
- ✅ Admin-scoped boundary (`/src/app/admin/error.tsx`)
- ✅ Admin-scoped 404 (`/src/app/admin/not-found.tsx`)

### Admin UX consistency
- ✅ Zero native browser dialogs — `confirm` / `alert` / `prompt` all styled
- ✅ 27 plain `Loading…` strings → `<PageSpinner />` with aria-label
- ✅ Empty states with action prompts on dashboard, customers, orders, memberships, forum, wiki, kb, faq, affiliates
- ✅ Modal accessibility (Esc + click-outside + busy-disabled + ARIA) on team modals
- ✅ Form labels on faq inputs
- ✅ Outliner section state persists in localStorage
- ✅ First-run onboarding card on `/admin` (auto-disappears once you have stuff)

---

## The editor (`/admin/editor`)

Single workspace combining three modes:

- **Live** — iframe of the storefront with `?portal_edit=1` overlay. Click any `[data-portal-edit]` element → right sidebar opens with the value, you type, save commits to the override store.
- **Block** — inline three-pane block editor (library / canvas / properties) for editor-managed pages. Drag-drop, undo/redo, history.
- **Code** — JSON view of the page's `blocks` array.

Plus:
- **Outliner** (left) — pages + funnels list, inline CRUD, search, expand/collapse persists.
- **Funnel mode** — when a funnel is selected, stage swaps to a funnel editor (inline name, status pill, steps with reorder, stats).
- **Publish** (top-right) — opens a modal that publishes drafts → publishes the active page → opens a GitHub PR with `portal.overrides.json` + `portal.pages.json` + `portal.site.json`. Shows diff preview before sending.

Cmd+S → publish modal. Cmd+Z / Cmd+⇧Z → block-mode undo/redo.

---

## Plugin marketplace

Two entry points, same UI:
- `/aqua/[orgId]/marketplace` — agency view, picks an org first
- `/admin/marketplace` — per-tenant view, operates on active org

Both use the shared `<PluginMarketplace orgId>` component. Install / configure / disable / uninstall. Setup wizards run for plugins that declare them (Stripe, Resend, GitHub PAT, etc.).

---

## API map (the bits worth knowing)

```
/api/auth/login            POST   { email, password } → cookie    rate-limited
/api/auth/dev              POST   dev session bootstrap
/api/auth/me               GET    current session
/api/auth/logout           POST   clear cookie

/api/portal/orgs/[orgId]/plugins         GET / POST install / DELETE / PATCH enabled
/api/portal/plugins                       GET registry
/api/portal/presets                       GET preset bundles

/api/portal/content/[siteId]              GET / POST drafts (admin=1 for full)
/api/portal/content/[siteId]/publish      POST drafts → published
/api/portal/content/[siteId]/discard      POST clear drafts
/api/portal/content/[siteId]/revert       POST snapshot rollback

/api/portal/pages/[siteId][/pageId][/publish|/revert]   editor-page CRUD

/api/portal/promote/[siteId]              POST  bundle → GitHub PR

/api/portal/links/[siteId]?check=1        GET   broken-link checker (admin-gated, SSRF-guarded)

/api/portal/repo/{tree,file}              GET / PUT  GitHub file browser
/api/portal/settings                       GET / POST / DELETE  PAT + repo URL + backend

/api/portal/health                        GET    capabilities
/api/portal/health/[orgId]                GET    per-org plugin health

/api/portal/{crm,donations,memberships,reservations,forum,wiki,kb,
            i18n,funnels,webhooks,automation,affiliates,...}      per-plugin CRUD

/api/admin/export-code                    GET    src/ as ZIP (requireAdmin)
```

Every `requireAdmin()` honours the dev-bypass env vars so local prototyping
is friction-free; production deploys must not set them.

---

## Operator runbook

| Task | Where |
|---|---|
| Onboard a new client          | `/aqua` → **+ New portal** → pick preset |
| Install a plugin              | `/aqua/<orgId>/marketplace` *or* `/admin/marketplace` |
| Configure a plugin            | `/aqua/<orgId>/plugins/<pluginId>` |
| Edit pages (live click-to-edit) | `/admin/editor` (Live mode) |
| Edit pages (drag-drop blocks)  | `/admin/editor` (Block mode) |
| Edit pages (raw JSON)          | `/admin/editor` (Code mode) |
| Publish to GitHub              | Editor → **Publish** button → modal |
| Manage funnels                 | `/admin/editor` → outliner Funnels tab |
| Diagnose plugin health         | `/admin/plugin-health` |
| Debug emails                   | `/admin/email` → Log tab |
| Debug webhooks                 | `/admin/webhooks/log` |
| Add team member                | `/admin/team` → Invite |
| Switch active org / site       | sidebar org switcher / site switcher |
| Author a new plugin            | `/admin/portal-settings/plugin-authoring` |
| Configure GitHub               | `/admin/portal-settings` |

---

## Next priorities (in order, not started)

1. **Audit log capture** — wrap every admin mutation through a single hook that emits `admin.action`. Plumbing exists; instrumentation is partial.
2. **Backups runtime** — S3-compatible client + cron + restore flow. Compliance prerequisite.
3. **Custom domain auto-attach** — Vercel API integration so adding a domain in `/admin/sites` actually wires it up rather than just showing DNS instructions.
4. **Force-password-change on first login** — `forcePasswordChange` flag on `ServerUser`, redirect to `/account/change-password`, use the `setUserPassword` export already in place.
5. **Email plugin actually sending** — operator pastes Resend key, hits "Test send", confirms inbox delivery. Plumbing is there; verify end-to-end.
6. **Stripe end-to-end** — real test purchase on Felicia's site. Confirm Order persisted + email confirmation arrived + Analytics events recorded.
7. **Brand kit refresh on org switch** — `getBranding()` reads active org's brand-plugin config but the cache needs to reload on `lk-orgs-change` so admin chrome updates without a navigation.
8. **Subscriptions plugin** — Stripe billing-portal redirect + dunning emails.

## Future ideas (parking lot)

- Marketplace tiers + paid plugins (Stripe Connect revenue share)
- Per-tenant database isolation (routing layer per request)
- Real-time collaboration in the editor (Yjs)
- AI page builder ("describe a page → get a Block tree")
- Mobile app shell (Capacitor)
- Native iOS/Android admin app

---

## Quick verify

```sh
git log origin/main --oneline | grep "Merge pull request #" | head -25
# Should list PRs #45 through #66 (the 22 PRs from this session).

npx tsc --noEmit
# Clean apart from sandbox-only `next/*` declaration noise.

ls src/components/admin/{ConfirmHost,Toaster,PromptHost,Spinner,SetupRequired,PluginMarketplace}.tsx
# All present.

cat HELLO_ED.md
# Receipt that this session ran.
```

If those four things check out, lift off.
