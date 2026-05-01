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

## Architecture

```
src/plugins/
  _types.ts           ← AquaPlugin contract (the single source of truth)
  _registry.ts        ← lists every shipped plugin
  _runtime.ts         ← install / uninstall / configure / applyPreset
  _presets.ts         ← 14 one-click bundles
  _pathMapping.ts     ← /admin path → plugin id
  <plugin-id>/        ← one folder per plugin
    index.ts          ← manifest (data only)

src/portal/server/    ← server-only runtime modules
  orgs.ts             ← tenant store
  storage.ts          ← cloud-routable backend (file / KV / Supabase / Postgres)
  eventBus.ts         ← typed pub/sub used by plugins
  webhooks.ts         ← outbound HMAC-signed dispatch + retry
  automation.ts       ← drip campaigns + if-this-then-that
  email.ts            ← Resend / Postmark / SMTP
  orders.ts           ← Stripe-keyed durable order persistence
  analytics.ts        ← pageviews / events / heatmaps + aggregations
  searchIndex.ts      ← in-process inverted index across pages/products/blog/KB
  memberships.ts      reservations.ts donations.ts affiliates.ts
  crm.ts              forum.ts wiki.ts knowledgebase.ts
  formSubmissions.ts  newsletter.ts translations.ts
  healthchecks.ts     ← runs + persists per-plugin health status

src/components/editor/blocks/   ← 57 editor blocks
src/app/aqua/                   ← marketplace + new-org flow
src/app/admin/                  ← per-tenant operator panel
src/app/api/portal/             ← plugin + tenant API
```

## Where we are

### ✅ Shipped (in main as of the latest merge)

- **Plugin platform foundation** — manifest contract, registry, runtime,
  presets, path mapping
- **33 plugins** registered (Brand · Website · E-commerce · Inventory ·
  Subscriptions · Blog · Wiki · KB · Forum · Memberships · Reservations
  · Donations · Email · Forms · Chatbot · LiveChat · SEO · Social ·
  Analytics · Funnels · Affiliates · CRM · Automation · Search · Reviews
  v2 · Compliance · Support · Auditor · Audit log · Backups · Webhooks
  · Repo · i18n)
- **14 presets** for one-click portal creation
- **Marketplace** at `/aqua/<orgId>/marketplace` — install / configure /
  disable / uninstall by category, with setup wizards for plugins that
  need credentials before installing (Stripe, Resend, GitHub PAT, etc.)
- **Auto-rendered settings page** per plugin from its `SettingsSchema`
- **Plugin gates** — `<PluginRequired plugin="x" feature="y">` wraps
  admin pages with contextual install/upgrade empty states
- **Dynamic admin sidebar** filters nav items by what's installed for
  the active org (primary org sees everything)
- **Plugin healthcheck** dashboard at `/admin/plugin-health`
- **Plugin authoring guide** at `/admin/portal-settings/plugin-authoring`
- **Device emulator** in the editor — 26 device presets, rotate, zoom,
  decorative bezel, custom W×H, persists per operator
- **Brand kit** feeds the admin chrome (logo, colours, fonts) per org
- **57 storefront blocks** (33 layout/commerce/auth originals + 24
  marketing/content additions: pricing-table, faq, contact-form, gallery,
  quote, map, banner, member-gate, donation-button, tabs, accordion,
  timeline, card-grid, before-after, marquee, app-showcase,
  social-proof-bar, …)
- **Email plugin** — Resend / Postmark transport, 6 bundled templates,
  per-org delivery log, test-send
- **Stripe webhook** persists orders + sends confirmation emails +
  emits events
- **Analytics plugin** — auto-mounted tracker, ingest endpoint, summary
  + heatmap aggregations, dashboard at `/admin/analytics`
- **Webhooks plugin** — HMAC-signed outbound dispatch with auto-retry +
  delivery log, admin pages at `/admin/webhooks` + `/admin/webhooks/log`
- **Automation runtime** — bus-driven drip campaigns + IFTTT rules
- **CRM** — auto-imports contacts from forms / orders / newsletter
- **Per-plugin admin pages** for memberships, reservations, donations,
  affiliates, CRM, wiki, KB, forum, automation, email, webhooks, i18n,
  analytics, notifications
- **Public storefront pages** — `/help` (KB index), `/account/orders/[id]`
  (post-purchase order detail)
- **Funnels working end-to-end** — server-side persistence, every
  pageview the storefront sends to /api/portal/analytics/track now
  matches the URL against active funnels and advances counters
  server-side. Drop-off + conversion-rate stats endpoint.
- **Service-business stack** — bookings calendar + iCal export to
  Google/Apple/Notion/Outlook + external feed import + 24h/1h
  email reminders + booking widget block + services / staff /
  buffer time + cross-calendar merging.
- **Notifications plugin** — in-app activity feed (`/admin/notifications`),
  bell in admin chrome with unread badge, email digest, browser
  push subscriptions stored ready for Web Push dispatch.
- **Live editor** at `/admin/editor` — Wix / GoHighLevel-style
  iframe wrapper around the storefront with page selector, Edit/View
  toggle, device emulator, "Publish to GitHub" link. Click any
  `data-portal-edit` element inside the iframe → existing
  PortalEditOverlay popover handles the actual editing.
- **Block editor polish** — floating block toolbar (drag handle,
  ↑↓⧉🗑) on hover/select, visible drop indicators (orange line
  for before/after, dashed border for inside) when dragging,
  inline text editing on heading/text blocks via
  `lk-block-text-commit` event chain.

### 🚧 Partial — has the manifest + some surface, runtime stubbed

- **Backups plugin** — manifest exists, scheduled snapshots not running
  yet (needs S3-compatible client + cron)
- **Audit log plugin** — manifest exists, capture hook not wired into
  every admin mutation yet
- **Repo browser plugin** — admin page works against a connected
  GitHub repo; PAT-token storage on the install record needs the
  encryption-at-rest layer
- **Subscriptions plugin** — manifest exists, Stripe billing-portal
  redirect + dunning emails not wired
- **i18n plugin** — translation table works; storefront URL-prefix
  resolution + locale cookie reading happen on page render but are
  not yet end-to-end tested
- **Reviews v2 plugin** — manifest only; runtime + admin TBD

### ❌ Not started

- **Custom domain provisioning** — Site already has `domains: string[]`
  + the admin shows DNS instructions, but Vercel domain attachment
  via API is manual today
- **Real password hashing** — sha256+salt scaffold; swap to argon2id
  before any production launch
- **Shopify integration** — `auth.ts` carries TODO markers for the
  eventual Customer Account swap
- **Plugin sandbox** — third-party plugins running in isolation
  (right now everything ships in the registry)
- **Stripe Connect for affiliates** — manual transfer flow only
- **SMTP transport** — adapters for Resend + Postmark live; SMTP via
  nodemailer is stubbed

## Next priorities (in order)

1. **Verify the merged PR #37 deploys cleanly on Vercel** — quota was
   refreshing when we merged; eyeball the build output, fix any
   surface issue
2. **Email plugin actually sending** — operator pastes Resend key, hits
   "Test send", confirms inbox delivery
3. **Stripe end-to-end** — real test purchase on Felicia's site,
   confirm Order persisted + email confirmation arrived + Analytics
   pageview / purchase events recorded
4. **Backups runtime** — S3-compatible client, cron trigger, restore
   flow (compliance prerequisite)
5. **Audit log capture** — hook every admin mutation through a single
   wrapper that emits `admin.action`; AuditLog plugin's runtime
   listens + persists with diffs
6. **Custom domain auto-attach** — Vercel API integration so adding a
   domain in `/admin/sites` actually wires it up rather than just
   showing DNS instructions
7. **Brand kit refresh on org switch** — `getBranding()` already reads
   the active org's brand-plugin config, but the in-memory orgs cache
   needs to persist / reload on the `lk-orgs-change` event so the
   admin chrome updates without a navigation
8. **Plugin sandbox / hot-reload in dev** — drop a folder in
   `src/plugins/`, restart, the marketplace picks it up
   (this works today; what's missing is the validation step that
   refuses malformed manifests)

## Future ideas (parking)

- **Marketplace tiers + paid plugins** — operators charge for
  third-party plugins; revenue share via Stripe Connect
- **Per-tenant database isolation** — `OrgRecord.database` config
  exists; routing layer needs to actually pick the right backend at
  request time
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
| Edit pages           | `/admin` → Visual editor |
| Diagnose plugin      | `/admin/plugin-health` (refresh all) |
| Debug emails         | `/admin/email` → Log tab |
| Debug webhooks       | `/admin/webhooks/log` |
| Author a new plugin  | `/admin/portal-settings/plugin-authoring` |

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
- **Type errors fail builds** — `tsc --noEmit` clean is the
  expectation; the `ignoreBuildErrors` flag is in place only because
  sandbox dev environments are missing some `next/*` declarations
