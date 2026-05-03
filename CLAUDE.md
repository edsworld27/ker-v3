@AGENTS.md

# Aqua — project state

Living document. Update whenever a major piece lands or the next-up
list shifts. Aim is for any new contributor (human or Claude) to skim
this once and have the right mental model.

## What it is

Aqua is a plugin-driven multi-tenant platform. One Next.js codebase
serves many tenant orgs; each org has its own brand, sites, plugins
and settings.

The first tenant is **Felicia / Luv & Ker** — natural soap from Ghana.
Her storefront lives at `/`, `/shop`, `/blog`, `/help`, etc. The
operator-facing admin is at `/admin`; the agency-level dashboard
(across all clients) is at `/aqua`.

## How a portal is born

1. Operator hits `/aqua` → **+ New portal**
2. Picks a preset (Empty / Website / E-commerce physical-or-digital-or-hybrid /
   Blog / Marketing / SaaS / Subscription SaaS / Charity / Bookings /
   Membership site / Agency)
3. Org gets created with the preset's plugins installed automatically
4. Operator lands on `/aqua/<orgId>/marketplace` and can install / remove
   / configure additional plugins from there
5. Each plugin contributes admin pages + storefront blocks + API routes
   based on which features the operator turns on
6. Customer-facing portal pages (login, affiliates dashboard, order
   history, account home) get designed in `/admin/portals` as block-tree
   variants edited in the visual editor — multiple variants per role,
   pick which one's live

## Architecture

```
src/plugins/
  _types.ts           ← AquaPlugin contract — NavItem now carries
                        optional panelId / groupId for sidebar placement
  _registry.ts        ← lists every shipped plugin (33)
  _runtime.ts         ← install / uninstall / configure / applyPreset
  _presets.ts         ← 16 one-click bundles
  _pathMapping.ts     ← /admin path → plugin id
  <plugin-id>/        ← one folder per plugin
    index.ts          ← manifest (data only)

src/portal/server/    ← server-only runtime modules
  orgs.ts             ← tenant store
  storage.ts          ← cloud-routable backend (file / KV / Supabase / Postgres)
  eventBus.ts         ← typed pub/sub used by plugins
  webhooks.ts         ← outbound HMAC-signed dispatch + retry
  automation.ts       ← drip campaigns + if-this-then-that
  email.ts            ← Resend / Postmark / SMTP + per-org template
                        overrides (resolveMessage merges base + overrides)
  orders.ts           ← Stripe-keyed durable order persistence
  pages.ts            ← EditorPage CRUD + portal-variant helpers
                        (listVariantsForPortal, getActivePortalVariant,
                         setActivePortalVariant)
  analytics.ts        ← pageviews / events / heatmaps + aggregations
  searchIndex.ts      ← in-process inverted index across pages/products/blog/KB
  memberships.ts      reservations.ts donations.ts affiliates.ts
  crm.ts              forum.ts wiki.ts knowledgebase.ts
  formSubmissions.ts  newsletter.ts translations.ts
  healthchecks.ts     ← runs + persists per-plugin health status

src/lib/admin/        ← client-side admin helpers
  sidebarLayout.ts    ← DEFAULT_LAYOUT + applyPluginContributions
                        (manifest-declared placement merges into the
                         operator-customised tree)
  installedPlugins.ts ← per-org install cache + getPluginSidebarContributions
  editorPages.ts      ← client for /api/portal/pages + portal-variant helpers
  portalStarters.ts   ← per-role starter block trees for "+ New variant"
  editorMode.ts       ← Simple · Full · Pro complexity preference (per-operator)
  tabSets.ts          ← MARKETPLACE_TABS, SETTINGS_TABS, CONTENT_TABS,
                        productDetailTabs(slug)

src/components/admin/
  AdminTabs.tsx       ← horizontal tab strip used by hub surfaces
  PluginPageScaffold.tsx ← shared chrome for plugin landing pages
  PluginRequired.tsx  ← install-CTA empty-state gate

src/components/editor/blocks/   ← 58 editor blocks
src/app/aqua/                   ← agency dashboard + marketplace + new-org flow
src/app/admin/                  ← per-tenant operator panel (64 destinations)
src/app/api/portal/             ← plugin + tenant API
```

## Where we are

### ✅ Shipped (in main as of the latest merge)

#### Platform foundation
- **Plugin platform** — manifest contract, registry, runtime, presets,
  path mapping
- **33 plugins** registered (Brand · Website · E-commerce · Inventory ·
  Subscriptions · Blog · Wiki · KB · Forum · Memberships · Reservations
  · Donations · Email · Forms · Chatbot · LiveChat · SEO · Social ·
  Analytics · Funnels · Affiliates · CRM · Automation · Search · Reviews
  v2 · Compliance · Support · Auditor · Audit log · Backups · Webhooks
  · Repo · i18n · Notifications)
- **16 presets** for one-click portal creation
- **Marketplace** at `/aqua/<orgId>/marketplace` and `/admin/marketplace`
  — install / configure / disable / uninstall by category, with setup
  wizards for plugins that need credentials before installing
- **Auto-rendered settings page** per plugin from its `SettingsSchema`
- **Plugin gates** — `<PluginRequired plugin="x" feature="y">` wraps
  admin pages with contextual install/upgrade empty states
- **Plugin healthcheck** dashboard at `/admin/plugin-health`
- **Plugin authoring guide** at `/admin/portal-settings/plugin-authoring`

#### Sidebar + navigation (post-consolidation)
- **Tabbed hubs** — `/admin/marketplace` (Browse · Health · Features ·
  Authoring), `/admin/settings` (Integrations · Customise · Sites · Orgs ·
  Portal · Compliance), all share the `<AdminTabs>` component for
  cross-navigation without sidebar bouncing
- **CONTENT_TABS strip** — Editor · Pages · Blog · FAQ · Help · Wiki ·
  Forum · Sections · Popups · Themes · Assets — appears on every
  authoring listing page so an operator can hop between content types in
  one click
- **Detail page tabs** — `/admin/products/[slug]` and `/.../variants` get
  Details · Variants tabs; orders show "View profile →" cross-link to
  `/admin/customers/[email]`
- **Manifest-declared sidebar placement** — `NavItem.panelId` + `groupId`.
  16 plugins migrated (memberships / reservations / donations / affiliates
  / crm / subscriptions / livechat / reviewsV2 / forum / wiki / kb /
  webhooks / automation / i18n / notifications / auditlog / backups). Items
  auto-surface in the right panel when the plugin is installed —
  operators don't have to drag them in via /admin/customise.
- **Dynamic admin sidebar** filters nav items by what's installed for
  the active org (primary org sees everything)
- **19 previously-404ing admin routes now exist** — every plugin nav item
  lands somewhere coherent. New shared `<PluginPageScaffold>` gives each
  page consistent chrome (eyebrow, title, description, optional back
  link, default empty-state card). Top-level: subscriptions · reviews-v2
  · livechat · auditlog · backups. Sub-routes: memberships/{tiers,
  members}, reservations/resources, donations/donors, affiliates/{payouts,
  stats}, wiki/history, i18n/locales, notifications/preferences,
  subscriptions/plans, livechat/canned, backups/restore, forum/categories.

#### Visual editor
- **Editor at `/admin/editor`** with three modes (Live · Block · Code)
- **Editor accepts `?page=<id>`** — listing pages + external links can
  drop the operator straight into the editor with a specific page loaded
- **Device emulator** in the editor — 27 device presets, rotate, zoom,
  decorative bezel, custom W×H, persists per operator
- **Editor complexity modes** — Simple · Full · Pro per-operator preference,
  switchable from the topbar (segmented control) AND from
  `/admin/customise → Branding → "Visual editor mode"`. Simple hides
  outliner / properties sidebar / mode buttons / device strip / undo-redo
  (just the canvas). Pro adds an explicit ⚙ Page-settings button
  (custom head/foot, theme override, layout overrides) right in the
  topbar. Stored in localStorage with cross-tab sync via
  `lk-editor-complexity-change` event.
- **Portal-role badge** on the editor topbar — when editing a portal
  variant, a cyan "⤷ <role> portal" chip appears next to the page picker
- **Brand kit** feeds the admin chrome (logo, colours, fonts) per org
- **58 storefront blocks** (33 layout/commerce/auth originals + 25
  marketing/content additions: pricing-table, faq, contact-form, gallery,
  quote, map, banner, member-gate, donation-button, tabs, accordion,
  timeline, card-grid, before-after, marquee, app-showcase,
  social-proof-bar, …)

#### Customer-facing portals (block-tree variants in the editor)
- **`PortalRole` on `EditorPage`** — `"login" | "affiliates" | "orders" |
  "account"`, plus `isActivePortal` flag (singleton per (siteId, role)).
  Server-side helpers: `listVariantsForPortal`, `getActivePortalVariant`,
  `setActivePortalVariant`.
- **`/admin/portals` admin** — tabs across Login · Affiliates · Orders ·
  Account home. For each role: list of variants with status badges,
  Make active button, Edit in editor → link, Duplicate, Delete, View
  live ↗ (active only), Preview ↗ (any). + New variant prompts for a
  name and pre-populates the editor with a role-appropriate starter
  block tree (login/affiliates ship a working LoginFormBlock so the
  variant is functional from save 1). Tabs show a cyan dot when that
  role has an active variant.
- **`/admin/portals/preview/[id]`** — admin-only route that renders any
  saved variant (active or draft) behind the storefront's Navbar/Footer
  with a sticky cyan preview banner. Lets operators A/B between
  candidates without flipping the live one.
- **Customer-facing routes consume the active variant**:
  - `/account` (logged-out) renders the active "login" variant via
    `BlockRenderer`. Falls back to the existing `AuthForm` +
    `LoginCustomisation` form when no variant is configured OR when the
    active variant has zero blocks (safety against accidental
    activation).
  - `/affiliates` renders the active "affiliates" variant. Falls back to
    a default landing.
  - `/account/orders` (index) renders the active "orders" variant. Falls
    back to the live orders list. Per-order detail still at
    `/account/orders/[id]`.
- **Bridge** — `/admin/customise → Login` tab now shows a "New" callout
  pointing operators at `/admin/portals?role=login` for full
  block-tree control. Form-based fallback fields preserved.

#### Email
- **Email plugin** — Resend / Postmark transport, 6 bundled templates,
  per-org delivery log, test-send
- **Compose tab** at `/admin/email` — operator drafts one-off email
  (recipient, subject, plain-text or HTML body, optional template
  prefill). Sends via configured provider, logs alongside transactional
  sends.
- **Editable templates** — `DEFAULT_TEMPLATES` overridable per org via
  `setTemplateOverride` / `clearTemplateOverride`. Edit subject / HTML /
  text inline, Save persists, Reset reverts to bundled. Live
  transactional sends pick up overrides via `mergeTemplateForOrg`.
  API: `GET / PUT / DELETE /api/portal/email/templates`,
  `POST /api/portal/email/send`.

#### Other
- **Stripe webhook** persists orders + sends confirmation emails +
  emits events
- **Analytics plugin** — auto-mounted tracker, ingest endpoint, summary
  + heatmap aggregations, dashboard at `/admin/analytics`
- **Webhooks plugin** — HMAC-signed outbound dispatch with auto-retry +
  delivery log, admin pages at `/admin/webhooks` + `/admin/webhooks/log`
- **Automation runtime** — bus-driven drip campaigns + IFTTT rules
- **CRM** — auto-imports contacts from forms / orders / newsletter
- **Public storefront pages** — `/help` (KB index), `/account/orders/[id]`
  (per-order detail), plus the new `/affiliates`, `/account/orders`
  (index), and the variant-rendered logged-out `/account` flow

### 🚧 Partial — has the manifest + scaffold, runtime stubbed

- **Backups plugin** — manifest + `/admin/backups` + `/admin/backups/restore`
  scaffold pages exist; scheduled snapshots not running yet (needs
  S3-compatible client + cron)
- **Audit log plugin** — manifest + `/admin/auditlog` scaffold exists;
  capture hook not wired into every admin mutation yet
- **Repo browser plugin** — admin page works against a connected
  GitHub repo; PAT-token storage on the install record needs the
  encryption-at-rest layer
- **Subscriptions plugin** — manifest + `/admin/subscriptions` +
  `/admin/subscriptions/plans` scaffolds; Stripe billing-portal
  redirect + dunning emails not wired
- **i18n plugin** — translation table works; `/admin/i18n/locales`
  scaffold; storefront URL-prefix resolution + locale cookie reading
  happen on page render but are not yet end-to-end tested
- **Reviews v2 plugin** — manifest + `/admin/reviews-v2` scaffold;
  runtime + admin TBD
- **13 sub-route admin pages** (memberships/tiers, donations/donors,
  affiliates/payouts, etc.) — all use `<PluginPageScaffold>` empty
  states pointing the operator at the parent and explaining the
  intended functionality. Real CRUD is the next iteration per feature.
- **Pro mode** — currently exposes the Page-settings shortcut + portal
  badge that Full mode hides; reserved for theme tokens, custom CSS
  quick-edit, layout overrides drawer in future PRs

### ❌ Not started

- **Custom domain provisioning** — Site already has `domains: string[]`
  + the admin shows DNS instructions, but Vercel domain attachment
  via API is manual today
- **Real password hashing** — DONE. Now scrypt (Node stdlib, RFC 7914)
  with N=16384/r=8/p=1, 16-byte random per-user salt, 32-byte derived
  key. Legacy sha256+salt hashes upgrade transparently on next login.
  verifyPassword uses crypto.timingSafeEqual + a dummy-hash run on
  user-not-found to defang email-enumeration via timing.
- **Shopify integration** — `auth.ts` carries TODO markers for the
  eventual Customer Account swap
- **Plugin sandbox** — third-party plugins running in isolation
  (right now everything ships in the registry)
- **Stripe Connect for affiliates** — manual transfer flow only
- **SMTP transport** — adapters for Resend + Postmark live; SMTP via
  nodemailer is stubbed
- **Editor unification for non-page content** — blog posts, FAQ entries,
  KB articles still have their own per-type editors. Long-term goal is
  to make any block-tree-based content editable in `/admin/editor`
  (extending the portal-variant pattern). Bigger refactor; deferred.

## Next priorities (verification-only — no code left to write)

The full code path for every previously-documented priority is now in
the tree. What remains is plugging in credentials and validating
against real services.

1. **Email plugin actually sending** — operator pastes a Resend /
   Postmark key under the Email plugin config, hits "Test send",
   confirms inbox delivery. All plumbing (transports, templates, log)
   is in place.
2. **Stripe end-to-end** — full test purchase against Felicia's
   storefront with real Stripe keys. Order persists + email
   confirmation arrives + Analytics event is recorded. Validation,
   not fresh code.
(S3 adapter for Backups now ships in-tree — `src/lib/s3/server.ts`
implements AWS SigV4 against any S3-compatible endpoint, dispatched
per-org from `src/portal/server/backups.ts` based on plugin config.
Operators paste bucket / region / access keys and "Backup now" hits
real S3 — no remaining code work, just configuration.)

The following infra-grade items shipped in this session:
- Real CRUD on memberships/tiers, memberships/members,
  donations/donors, affiliates/payouts, affiliates/stats
- Audit log capture (`recordAdminAction` + instrumented mutating
  endpoints + `/admin/auditlog` rendering the activity feed)
- Force-password-change flow (`mustChangePassword` flag + admin-shell
  redirect + `/account/change-password` + `/api/auth/change-password`)
- Brand kit refresh on org switch (`lk_orgs_v1` localStorage mirror
  + admin layout subscription)
- Plugin manifest validator (`_validate.ts`) wired into the registry
- Pro-mode editor surfaces (theme override, layout overrides,
  page-level custom CSS in Page Settings modal)
- Subscriptions Stripe billing-portal handoff
  (`createBillingPortalSession`, `POST /api/stripe/billing-portal`,
  `/admin/subscriptions` "Open portal" card — dual-mode customer +
  admin)
- Backups runtime (`src/portal/server/backups.ts` + `serializeStateJson`
  / `restoreStateFromJson` storage hooks + `/api/portal/backups`
  list / create / download / delete / restore + `/admin/backups`
  + `/admin/backups/restore` with typed-id confirmation)
- Custom domain auto-attach via Vercel API
  (`src/lib/vercel/server.ts` + `/api/portal/domains` +
  `/admin/sites` "Add + attach to Vercel" button surfacing
  verification records)

## Future ideas (parking)

- **Marketplace tiers + paid plugins** — operators charge for
  third-party plugins; revenue share via Stripe Connect
- **Per-tenant database isolation** — `OrgRecord.database` config
  exists; routing layer needs to actually pick the right backend at
  request time
- **Editor unification for blog posts / FAQ / KB** — extending the
  EditorPage + portalRole pattern so any block-tree content is editable
  in `/admin/editor` instead of having per-type editors
- **Real-time collaboration in the editor** — multiple operators
  editing the same page (CRDT, probably Yjs)
- **AI page builder** — describe a page in natural language, get a
  Block tree
- **Mobile app shell** — wrap the storefront in Capacitor or
  Tauri-Mobile when it makes sense
- **Native iOS / Android admin app** — remote-manage portals without
  a laptop

## Operator runbook

| Task | Where |
|---|---|
| Spin up a new client | `/aqua` → + New portal → pick preset |
| Install a plugin     | `/aqua/<orgId>/marketplace` |
| Configure a plugin   | `/aqua/<orgId>/plugins/<pluginId>` |
| Edit pages           | `/admin/editor` (Simple · Full · Pro modes) |
| Design portal pages  | `/admin/portals` → pick role → + New variant |
| Preview a variant    | `/admin/portals` → row → Preview ↗ |
| Compose an email     | `/admin/email` → Compose tab |
| Edit email templates | `/admin/email` → Templates tab → Edit |
| Diagnose plugin      | `/admin/plugin-health` (refresh all) |
| Debug emails         | `/admin/email` → Log tab |
| Debug webhooks       | `/admin/webhooks/log` |
| Author a new plugin  | `/admin/portal-settings/plugin-authoring` |
| Switch editor mode   | Topbar segmented control OR `/admin/customise → Branding` |

## Conventions

- **No global side-effects on import** — plugin manifests are data only
- **Server modules go in `src/portal/server/`** with `import "server-only"`
- **Per-plugin storage** uses `ctx.storage` (namespaced) — never poke
  the global state directly
- **Events flow via the bus** — when something interesting happens,
  `emit(orgId, name, payload)` so the Webhooks / Automation / CRM
  plugins can react
- **Plan-gating** is declared on the manifest (`features[].plans`)
- **Admin pages on per-tenant features** wrap with `<PluginRequired>`
- **Plugin sidebar placement** — declare `panelId` (and optional
  `groupId`) on the primary navItem in your manifest. The sidebar
  layout merger picks it up; you don't need to edit DEFAULT_LAYOUT.
- **New admin pages** — wrap with `<PluginPageScaffold>` for consistent
  chrome unless you need a fully custom layout
- **Portal-variant feature** — add `portalRole` on an `EditorPage` to
  make it eligible as a customer-portal variant; flip
  `isActivePortal` via `setActivePortalVariant` (singleton-enforced)
- **Type errors fail builds** — `tsc --noEmit` clean is the
  expectation; the `ignoreBuildErrors` flag is in place only because
  sandbox dev environments are missing some `next/*` declarations

## Recent session highlights (May 2026)

Major batch of UX consolidation + portal-variant feature work:

- **Sidebar consolidation** — Phases 1-4 (#67, #68, #72) shipped
  tab strips on hub surfaces, detail-page tabs, content-workbench tabs
  on every authoring page, and migrated 16 plugin manifests to declare
  their sidebar placement
- **19 missing admin pages** (#72) — every plugin nav item now lands
  on a real `<PluginPageScaffold>` page, not a 404
- **Email composer + editable templates** (#72) — full compose UI plus
  per-org template overrides
- **Portal variants** (#73-78, #80-82) — design `/login`, `/affiliates`,
  `/account/orders`, `/account` in the visual editor as named variants
  with active selection. Includes duplicate, starter blocks per role,
  view-live and preview affordances, empty-variant safety fallback,
  active-variant tab indicator, and a bridge from the legacy
  LoginCustomisation flow
- **Editor complexity modes** (#79, #80) — Simple / Full / Pro per-operator
  preference, switchable from the editor toolbar AND from
  `/admin/customise`. Pro adds Page-settings shortcut + portal-role badge.
