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

## What shipped (across 3 PRs from this branch line)

The branch `claude/continue-work-1FFJ6` shipped via PRs #85, #86, and #87 (in flight). Three pillars:

### Pillar 1 — Production-grade closeout (PR #85)

Nine documented priorities cleared:

1. **Real CRUD on memberships / donations / affiliates** — `/admin/memberships/{tiers,members}`, `/admin/donations/donors`, `/admin/affiliates/{payouts,stats}` are now real working pages backed by the existing runtimes. Adds `recordPayout` to the affiliates server so commission settlement is a real persisted action.
2. **Audit log capture** — `recordAdminAction(actor, …)` helper in `src/portal/server/activity.ts`; mutating endpoints in memberships + affiliates instrument; `/admin/auditlog` renders the activity feed with category / actor / search filters, diff viewer, CSV export.
3. **Force-password-change on first login** — `mustChangePassword` flag on `ServerUser`, surfaced through `/api/auth/me` + `/api/auth/login`, admin shell redirects to `/account/change-password?forced=1` when set, `/api/auth/change-password` clears the flag on success.
4. **Brand kit refresh on org switch** — `lk_orgs_v1` localStorage mirror (so `readBrandPluginBranding` synchronously sees the right tenant on first render) + admin layout subscription to `lk-orgs-change` (so the chrome flips without a navigation).
5. **Plugin manifest validator** — `src/plugins/_validate.ts` runs at registry boot; malformed manifests are filtered out with descriptive console errors instead of crashing the layout. Re-exported from `_registry.ts` for the marketplace + plugin authoring UI.
6. **Pro-mode editor surfaces** — Page Settings modal grows a Pro-only `<details>` for theme override / hideNav-hideFooter / page-scoped custom CSS. Renderer scopes the CSS via `[data-portal-page="…"]` so rules can't leak globally.
7. **Subscriptions Stripe billing-portal handoff** — `createBillingPortalSession` in `src/lib/stripe/server.ts`; `POST /api/stripe/billing-portal` is dual-mode (customer self-serve via session, admin "send portal link" via email lookup); `/admin/subscriptions` grows an "Open portal" card.
8. **Backups runtime** — `src/portal/server/backups.ts` with file adapter (default; writes to `.data/backups/`) AND a real S3 adapter via AWS Signature V4 (no SDK dep, in `src/lib/s3/server.ts` — works against AWS S3, R2, Spaces, MinIO, B2). Retention sweep, full restore flow. `POST /api/portal/backups` doubles as the cron-trigger endpoint. `/admin/backups` lists snapshots with download / restore / delete; `/admin/backups/restore` demands a typed-id confirmation.
9. **Custom domain auto-attach via Vercel API** — `src/lib/vercel/server.ts` (no SDK dep) wraps `/v10/projects/{id}/domains`. `POST /api/portal/domains` attaches; verification records pass through verbatim. `/admin/sites` grows an "Add + attach to Vercel" button — toast surfaces verified / DNS-pending / Vercel-not-configured states.

### Pillar 2 — Felicia-mode core (PR #86)

Operator-friendliness pass for non-technical operators (Felicia, the first tenant):

- **Setup checklist on `/admin`** (`src/components/admin/SetupChecklist.tsx` + `/api/portal/setup-status`) — live progress bar showing which of 8 high-leverage things are configured (brand, site, product, published page, Stripe, email, GitHub, backups). Server-side checks for what it can see; client component overlays site + product counts since those stores live in localStorage. Per-row "Set up →" CTA links. Auto-hides when all done, dismiss persists per-org.
- **Floating `?` help drawer** (`src/components/admin/HelpButton.tsx` + `src/lib/admin/helpDocs.ts`) — bottom-right amber `?` on every admin page (positioned `bottom-20 right-5` to clear mobile bottom-nav and desktop Toaster). Opens a slide-out drawer with the per-route help doc. `?` keyboard shortcut to toggle.
- **`/admin/help` index** — searchable directory of all documented admin surfaces (search across title / route / intro / section content).
- **Command-palette help integration** — Cmd+K indexes every help doc. Typing "stripe" or "backup" pulls up the matching pages alongside customer/order/product results.
- **Ask Aqua AI assistant** (`/api/portal/help/ask` + `<AskAqua>` panel inside the help drawer) — Claude Opus 4.7 via raw fetch (no `@anthropic-ai/sdk` dep). Tuned for help Q&A: thinking disabled, effort low, max_tokens 2048. Help-docs system prompt wrapped in `cache_control: ephemeral` so subsequent requests pay ~0.1× input cost. Falls back gracefully with a "Connect Anthropic" CTA when no key is set. Per-IP rate-limited at 30/min.
- **Tooltip pass** on the admin pages shipped this session (memberships/tiers, affiliates/payouts) — `Field` helpers grow optional `tip` props rendering `<Tip>` next to the label.
- **Friendly error helper** (`src/lib/admin/friendlyError.ts`) — catalog of ~15 known API error codes mapped to operator-readable strings with optional fix hints. `friendlyError(code, fallbackTitle)` and `friendlyFromResponse(res, body)` helpers. Unknown codes pass through with a "mention this to your admin" hint.

### Pillar 3 — Felicia-mode polish extension (PR #87)

Wider coverage of the same patterns:

- **Help docs: 22 → 54 routes** (53% of all admin pages). Added: inventory, shipping, seo, analytics, marketing, orgs, popup, automation, themes, webhooks, funnels, notifications, subscriptions, reviews, i18n, crm, repo, support, automation/runs, faq, forum, wiki, kb, orders/[id], products/[slug], products/new, blog/[id], pages, portals, activity, dashboards, compliance, billing.
- **friendlyError: 5 → 12 surfaces**. Added: backups/restore, email (template save + send result), auditlog, subscriptions, crm/contacts, crm/tasks.
- **Tooltips on legacy pages: 3 → 5**. Added: products/[slug] (regular price, sale price, SKU, badge), sites (display name, tagline, description), email (template subject, HTML body, plain-text body).

## Truly remaining (verification-only — no code left to write)

1. **Email plugin actually sending** — operator pastes Resend / Postmark key, hits "Test send", confirms inbox delivery. Plumbing is in place.
2. **Stripe end-to-end** — full test purchase against Felicia's storefront with real Stripe keys. Validation, not fresh code.

(The S3 adapter for Backups now ships in-tree — `src/lib/s3/server.ts` + plugin-config-driven dispatch in `src/portal/server/backups.ts`. Operator pins `adapter:"s3"` + pastes bucket / region / access keys → "Backup now" hits real S3.)

## Future ideas (parking lot)

- Marketplace tiers + paid plugins (Stripe Connect revenue share)
- Per-tenant database isolation (routing layer per request)
- Real-time collaboration in the editor (Yjs)
- AI page builder ("describe a page → get a Block tree")
- Mobile app shell (Capacitor)
- Native iOS/Android admin app

---

## Quick verify (for the next session)

```sh
# Confirm both Felicia-mode PRs landed on main.
git log origin/main --oneline | grep -E "Merge pull request #(85|86|87)" | head -3
# Should show #85 (production-grade closeout), #86 (Felicia-mode core),
# #87 (polish extension) — most recent first.

npx tsc --noEmit
# Clean apart from sandbox-only `next/*` and `react/jsx-runtime` noise.

# Server modules (real CRUD, runtimes, helpers).
ls src/portal/server/{activity,memberships,donations,affiliates,backups}.ts

# New admin pages.
ls src/app/admin/{memberships,donations,affiliates,auditlog,backups,help}/page.tsx
ls src/app/account/change-password/page.tsx

# Felicia-mode infrastructure.
ls src/components/admin/{SetupChecklist,HelpButton}.tsx
ls src/lib/admin/{helpDocs,friendlyError}.ts

# Third-party clients (no SDK deps — pure fetch).
ls src/lib/{stripe,vercel,s3}/server.ts

# Plugin validator.
ls src/plugins/_validate.ts
```

## Where to start a new session

1. **Read this file + `CLAUDE.md`** — they're the orientation.
2. **Pick a task from the "Truly remaining" section above** — every documented in-tree code task is shipped; what's left is plugging in real credentials and verifying each integration end-to-end.
3. **Or extend Felicia-mode coverage further** — see "What still has shallow coverage" in PR #87. Lower marginal value per touch but always more polish to do.
4. **Or take Felicia herself through the admin** — the highest-leverage next session is finding friction points she actually hits, not adding more pre-emptive code.

Branches: `claude/continue-work-1FFJ6` is the current development branch. Both prior session PRs (#85, #86) merged into main; #87 is in flight at time of writing.
