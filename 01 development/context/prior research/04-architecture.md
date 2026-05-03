# `04 the final portal/` — Architecture (LOCKED)

This chapter is the source of truth for `04 the final portal/`. Every
terminal reads this before writing a line of code. If you're about to
deviate from it, **stop and ask Ed first** — don't quietly redesign.

> Locked 2026-05-04 in conversation with Ed.

## Headline

A multi-tenant agency platform for Milesy Media. One Next.js 16 + React 19 app
serves three nested levels of tenant — Agency → Client → End-customer — each
with its own branded portal. The same engine powers every level. Plugins are
the unit of feature: every capability (fulfillment, website editor, ecommerce,
memberships, etc.) is a manifest in the plugin registry. Each tenant has its
own install state.

"Aqua portal — a portal to anywhere."

## 1. Tenancy model — three nested levels

```
Agency   (Milesy Media)
  ↓
  has many Clients   (Felicia / Luv & Ker, future ones)
      ↓
      has many End-customers   (Felicia's shoppers / members / affiliates)
```

Database scoping rules:
- Every row in every table carries `agencyId`.
- Rows about a specific client also carry `clientId`.
- Rows about an end-customer also carry `customerId` (or just identify by `userId`).
- API queries enforce: `WHERE agencyId = ?` (and `clientId = ?` where applicable). No exceptions.

This is the **pool model** — same architecture as Shopify, Notion, Vercel,
Stripe Dashboard. Cheap, scales to ten-thousand tenants on one Postgres,
well-understood operationally.

## 2. Plugin system — Aqua-manifest model (lifted from `02`)

Build-time: every plugin is a folder under `04 the final portal/plugins/<id>/`
exporting a default `AquaPlugin` object. The manifest declares:
- `id`, `name`, `version`, `category`, `tagline`, `description`
- `requires` / `conflicts` (other plugin ids)
- `pages: PluginPage[]` — admin routes the plugin contributes
- `api: PluginApiRoute[]` — API routes the plugin contributes
- `storefront: { blocks: BlockDescriptor[] }` — editor blocks the plugin contributes
- `settings: SettingsSchema` — per-install config form
- `features: PluginFeature[]` — granular toggles
- `setup: SetupStep[]` — multi-step onboarding wizard

Run-time: each tenant has an install record per plugin —
`{ pluginId, enabled, config, features, setupAnswers }`. The portal layout
queries this to build the sidebar nav, mount API routes, and render only
plugins that are enabled for the current tenant.

Foundation lifts from `02 felicias aqua portal work/src/plugins/`:
`_types.ts`, `_registry.ts`, `_runtime.ts`, `_presets.ts`, `_pathMapping.ts`,
`_validate.ts`. The runtime is the same; the registry starts empty and
plugins land in via T2 / T3 / future rounds.

> No `Bridge/registry` runtime component map. No multi-port iframes. We have
> one Next.js app; components import normally.

## 3. Auth — single cookie, role-routed, shared origin

Single source of truth for auth: `milesymedia.com` (or whatever the deployed
domain becomes). All sign-ins land here.

Cookie: `lk_session_v1`, HMAC-signed, payload carries
`{ userId, role, agencyId, clientId? }`. httpOnly + sameSite=lax + secure-in-prod.

Login surfaces:
- `milesymedia.com/login` — primary, full-page login.
- `milesymedia.com/embed/login` — iframe-able, customised per `clientId` query
  param (renders client's brand). Cookies still scoped to `milesymedia.com`
  origin so the same session works in both surfaces.

Roles (extending `02`'s admin/operator and `03`'s 6-role model):

```
agency-owner     — full agency (you, Ed)
agency-manager   — full agency except role / billing changes
agency-staff     — only assigned clients + their function
client-owner     — full client (Felicia)
client-staff     — restricted client scope
freelancer       — fulfillment-only, only assigned briefs
end-customer     — storefront / iframe-embedded
```

Role gating happens server-side at every API call via
`requireRole(role | role[])` and at every page via the layout server
component reading the cookie. Never trust client-side role checks.

## 4. Server-rendered chrome — built from manifests at request time

When a user navigates to `/portal/clients/felicia/products`:

```
Middleware:    decode cookie → { userId, role, agencyId, clientId? }
   ↓
Page layout (server component):
  ├─ Load Felicia's record from DB by clientId
  ├─ Load Felicia's installed plugins (one query: pluginInstalls WHERE clientId = ?)
  ├─ Build sidebar:
  │     DEFAULT_NAV  +  installedPlugins.flatMap(p => p.navItems)
  ├─ Inject brand-kit CSS vars from felicia.brand: { logo, primary, fonts }
  ├─ Render <Layout><Sidebar/><Topbar/><Content/></Layout>
   ↓
Page content (server component):
  Route /portal/clients/[clientId]/products is contributed by ecommerce plugin
  Plugin's page renders, scoped to Felicia's data via WHERE clientId = ?
```

Sidebar items appear/disappear as plugins install/uninstall. Theme paint
changes per tenant. Same shell, different paint, different content.

## 5. Brand kit per client — CSS variables on the client row

Each `Client` row carries a `brand` JSON column:

```ts
brand: {
  logoUrl: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  fontHeading: string;
  fontBody: string;
  borderRadius?: string;
  customCSS?: string;
}
```

The per-client layout injects these as CSS custom properties in a
`<style>:root{...}</style>` tag at the top of the page. Every block + chrome
component reads `var(--brand-primary)`, `var(--brand-logo)`, etc.

Same machinery applies to `Agency.brand` (Milesy Media's own brand) — the
agency layout uses agency colours; the per-client layout overrides with
client colours.

## 6. One column = one tenant scope

Strict rule, no exceptions:

| level | identifying column | parent column |
|-------|-------------------|---------------|
| Agency | `agencyId` | (none — top tenant) |
| Client | `clientId` | `agencyId` |
| End-customer | `customerId` (or `userId` with role=end-customer) | `clientId` (and `agencyId` transitively) |

Every read query: must scope to the most specific tenant available from the
session.
Every write query: must scope to the same. Helper: `withTenantScope(query, session)` adds the WHERE clauses automatically.

## 7. Phases (lifecycle stages)

Stored as data, not hardcoded enum. Seeded with 6 defaults, agency-customisable later:

```
Discovery  →  Design  →  Development  →  Onboarding  →  Live  →  Churned
```

Each phase carries:
- `id`, `agencyId` (so each agency can fork its own phase definitions)
- `label`, `description`, `order`
- **Plugin preset**: list of plugin ids to install when this phase becomes active
- **Portal-variant starter**: block tree for the client's homepage / login at this phase
- **Checklist** of tasks, each tagged `internal` (team-only) or `client` (client visible + tickable)

Behaviour:
- **At client creation**: team picks an initial phase. Phase's preset plugins install for the new client. Phase's portal variant becomes the active one.
- **On phase advance** (team confirms after both sides finish their checklist items):
  - Old phase's plugins → set `enabled=false` (config preserved). Reversible.
  - New phase's plugins → set `enabled=true` (install if not already present).
  - New phase's portal variant becomes active.
  - Activity log entry recorded.

Locked behaviour: **auto-disable, config preserved** on transition. Never
auto-uninstall. Never auto-delete config.

## 8. Demo on milesymedia.com — both views toggle

The "Demo" button on Milesy Media's public marketing site drops the visitor
into a sandboxed agency with seed data. The demo session has a header toggle
that flips between:

- **Agency POV** — they're the fake agency owner. See the seeded client (Felicia mirror), can advance phases, install plugins, browse marketplace.
- **Client POV** — they're the fake client owner. See the branded portal, tick checklist items, look at their installed plugins.

Reset cadence: nightly. The demo agency is its own row; not connected to real Milesy Media data.

## 9. Folder layout

```
04 the final portal/
├── milesymedia website/         (already exists — public marketing site)
├── portal/                      THE Next.js app — agency + client + end-customer
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              public landing
│   │   │   ├── login/
│   │   │   ├── embed/login/          iframe-able login (clientId param)
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── tenant/           agency CRUD, client CRUD, plugin install
│   │   │   │   └── portal/           plugin-mounted APIs
│   │   │   └── portal/
│   │   │       ├── layout.tsx        loads session + builds chrome
│   │   │       ├── agency/           agency-only routes (HR, finance, fulfillment)
│   │   │       ├── clients/[clientId]/   per-client routes (plugin-mounted)
│   │   │       └── customer/         end-customer routes (plugin-mounted)
│   │   ├── plugins/                  manifest registry (lifted from 02)
│   │   ├── server/
│   │   │   ├── storage.ts            multi-backend persistence
│   │   │   ├── eventBus.ts
│   │   │   ├── tenants.ts            agencies, clients, end-customers
│   │   │   ├── users.ts              scrypt + roles
│   │   │   ├── pluginInstalls.ts     per-tenant install state
│   │   │   ├── phases.ts             phase definitions + checklist
│   │   │   └── activity.ts           audit log
│   │   ├── lib/
│   │   │   ├── server/
│   │   │   │   ├── auth.ts           HMAC cookie + requireRole
│   │   │   │   └── rateLimit.ts
│   │   │   └── chrome/
│   │   │       ├── sidebarLayout.ts  builds nav from plugin manifests
│   │   │       └── brandKit.ts       CSS-var injection per tenant
│   │   ├── components/
│   │   │   ├── chrome/Sidebar.tsx
│   │   │   ├── chrome/Topbar.tsx
│   │   │   └── chrome/ThemeInjector.tsx
│   │   └── middleware.ts             session check + tenant scoping
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json (strict, no ignoreBuildErrors)
├── plugins/                     each plugin = self-contained folder
│   ├── fulfillment/             phase engine + checklist + client CRUD + marketplace UI
│   ├── website-editor/          ported from 02 (visual editor + 58 blocks)
│   ├── ecommerce/               ported from 02 (products / orders / cart / Stripe)
│   └── ...                      future
└── clients/
    └── felicias perfect portal/      (existing reference — don't touch)
```

## 10. Request flow — single example

User: Felicia (`role=client-owner`, `clientId=felicia`, `agencyId=milesy`).
Navigates to `/portal/clients/felicia/products`.

```
1. Middleware
     reads cookie → { userId: u_42, role: 'client-owner', agencyId: 'milesy', clientId: 'felicia' }
     allows the route (clientId in URL matches cookie clientId)

2. /portal/clients/[clientId]/layout.tsx (server component)
     param.clientId === 'felicia'  ← matches cookie
     getClient('felicia') → { id, agencyId, name, brand: {...}, ... }
     getInstalledPlugins('felicia') → [website-editor, ecommerce, fulfillment, brand]
     buildSidebar(installedPlugins) → ['/products','/orders','/customers',...]
     injectBrandCSS(client.brand)
     <Layout><Sidebar/><Topbar/><children/></Layout>

3. /portal/clients/[clientId]/products/page.tsx (server component)
     this route is contributed by the ecommerce plugin
     listProducts({ where: { clientId: 'felicia' } })
     <ProductList products={...} />

4. Response: HTML with Felicia's brand colours, Felicia's products, the
   sidebar reflects only Felicia's installed plugins.
```

Same shell. Different tenant. Different paint. Different data.

## 11. URL surface

```
milesymedia.com/                       public marketing
milesymedia.com/login                  primary login
milesymedia.com/embed/login?client=X   iframe login (per-client branded)
milesymedia.com/demo                   sandboxed agency demo

milesymedia.com/portal                 role-aware home (redirects)
   /portal/agency/                     agency-internal (HR, finance, fulfillment)
   /portal/agency/fulfillment          client list + phase board
   /portal/agency/fulfillment/[clientId]   per-client fulfillment workspace
   /portal/clients                     client list (agency-staff sees only assigned)
   /portal/clients/[clientId]/         per-client admin shell
   /portal/clients/[clientId]/products    plugin-contributed
   /portal/clients/[clientId]/...         everything else plugin-contributed
   /portal/customer/                   end-customer view (their own account)
```

## 12. Round 1 — terminal split (locked)

Round 1 builds the foundation + the fulfillment plugin (the killer first
feature) + the website-editor port (the heavyweight visual surface).

| Terminal | Goal |
|----------|------|
| **T1** | Scaffold `04 the final portal/portal/`. Lift plugin runtime from `02`. Implement auth + middleware + multi-tenant scoping + role hierarchy. Build the chrome (sidebar that mounts plugin nav items, topbar, brand-kit injector). Ship `npm run dev` working with stub login. |
| **T2** | Build the **fulfillment plugin** at `04 the final portal/plugins/fulfillment/`. Phase engine (data model + transitions), collaborative checklist (internal + client tasks), client CRUD, plugin marketplace UI (team-side install). Phases seeded with 6 defaults but stored as data. |
| **T3** | Port the **website-editor plugin** from `02` → `04 the final portal/plugins/website-editor/`. Editor + 58 blocks + portal variants + admin pages. Standalone manifest. |

Round 2 (after Round 1 lands): port ecommerce plugin · wire all three into shell · build first phase preset end-to-end · demo button on milesymedia.com.

## 13. Open questions (parked, not blocking Round 1)

- DB choice: file backend for dev, Postgres for prod (lift `02`'s storage abstraction). Schema migration path TBD.
- Stripe Connect for affiliate payouts — same as `02`'s TODO.
- Custom-domain provisioning per client (Vercel domain auto-attach — `02` already has the code).
- Real-time collaboration on the visual editor (Yjs / CRDT).
- Per-tenant DB isolation (already a hook in `02` storage; not wired).

## 14. Decisions log (locked in this conversation)

| # | Decision | Outcome |
|---|----------|---------|
| 1 | Auth surface | Two entry points (milesymedia.com + iframe on client website), shared session, single auth origin |
| 2 | Phases | 6 defaults (Discovery → Churned), stored as data, agency-customisable later |
| 3 | What a phase contains | Preset bundle (plugins + portal variant) + lifecycle script (checklist + plugin swap on transition) |
| 4 | Plugin behaviour on phase transition | Auto-disable, config preserved. Reversible. |
| 5 | Phase visibility | Collaborative — internal and client task tags |
| 6 | Demo button | Both views (agency + client), header toggle, sandboxed seed data, nightly reset |
| 7 | Persistence model | Pool model — one Postgres, every table carries agencyId |
| 8 | Plugin model | Aqua manifest plugins (build-time declaration + per-tenant install state) |
| 9 | Tenancy levels | Three: Agency → Client → End-customer |
| 10 | Chrome rendering | Server-rendered, derived from plugin manifests at request time |
| 11 | Brand kit | CSS variables on the tenant row, injected per layout |
| 12 | Tenant scoping | One column per tenant level, enforced by helper at every query |
| 13 | Fulfillment as plugin | Yes — `plugins/fulfillment/`, not foundation |
| 14 | Plugin install | Team-only for v1; client-side self-serve later |
