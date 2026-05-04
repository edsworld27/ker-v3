# Context — Master Index

This folder is the project's persistent memory, organised as a **context
tree** (fractal book metaphor):

```
context/
├── MASTER.md          ← the contents page (you are here)
├── prior research/    ← chapter files mapping `02` and `03` codebases
└── *.md               ← future top-level chapter files
```

`MASTER.md` is the table of contents. Every chapter on the shelf gets a row
here with a one-line summary. Each chapter is its own markdown file that
goes deep on a single topic.

---

## How it works

### Reading (recall)
1. Open `MASTER.md` (this file).
2. Scan the chapter table for the topic you need.
3. Open the corresponding chapter file for the full detail.

### Writing (a new learning)
1. Decide which topic the new knowledge belongs to.
2. Either:
   - **Existing topic** → open the chapter, add to it. Update the row's
     one-line summary if it shifted.
   - **New topic** → create a new file `chapter-name.md` AND add a new row.
3. Keep the table sorted; pick the next free number.

### Naming
- Lowercase-kebab-case filenames (`aqua-plugin-system.md`).
- One topic per chapter. Split when a chapter exceeds ~300 lines or covers
  two distinct things.

### Granularity rule of thumb
A chapter is right-sized when one paragraph in `MASTER.md` can't capture
what's in it.

---

## Chapters — Prior research (Phase 0)

Mapping of `02 felicias aqua portal work/` and `03 old portal/` codebases.
Synthesised from 6 parallel explore agents.

### From `02 felicias aqua portal work/` (Aqua / Felicia portal)

| # | Title | File | Summary |
|---|-------|------|---------|
| 01 | Plugin system | [prior research/aqua-plugin-system.md](prior%20research/aqua-plugin-system.md) | 34 plugins, contract types, runtime install/uninstall flow, 16 presets, path mapping, validator. |
| 02 | Server modules | [prior research/aqua-server-modules.md](prior%20research/aqua-server-modules.md) | 41 domain modules. Storage abstraction, eventBus, orgs, email, webhooks. The five most architecturally critical. |
| 03 | Admin routes | [prior research/aqua-admin-routes.md](prior%20research/aqua-admin-routes.md) | ~70 admin destinations grouped by domain. Plugin contributions + shared chrome (AdminTabs / PluginPageScaffold / SetupChecklist / Ask Aqua). |
| 04 | Aqua dashboard routes | [prior research/aqua-aqua-routes.md](prior%20research/aqua-aqua-routes.md) | Cross-client agency surface — `/aqua` + `/aqua/[orgId]/marketplace` + new-portal flow + support hub. |
| 05 | API surface | [prior research/aqua-api-routes.md](prior%20research/aqua-api-routes.md) | Every HTTP endpoint by area: `/api/auth`, `/api/admin`, `/api/portal/*`, `/api/stripe`, `/api/og`. |
| 06 | Visual editor | [prior research/aqua-visual-editor.md](prior%20research/aqua-visual-editor.md) | Live · Block · Code modes. Simple / Full / Pro complexity. Outliner + properties + topbar. Publish + GitHub PR flow. |
| 07 | Block library | [prior research/aqua-blocks.md](prior%20research/aqua-blocks.md) | 58 storefront blocks catalogue. BlockRenderer mechanics (split-test, theme overlay, responsive CSS, animations). |
| 08 | Portal variants | [prior research/aqua-portal-variants.md](prior%20research/aqua-portal-variants.md) | `PortalRole` + `isActivePortal` singleton. Server helpers. Admin UI. Starter trees. Customer-facing safety fallback. |
| 09 | Storefront | [prior research/aqua-storefront.md](prior%20research/aqua-storefront.md) | Public routes, customer components (Navbar, Footer, ProductDetail, CartDrawer, ChatBot, …), CartContext. |
| 10 | Auth + middleware + admin libs | [prior research/aqua-auth-middleware.md](prior%20research/aqua-auth-middleware.md) | Sessions (HMAC), scrypt, rate limits, CSP, dev-bypass modes, `/api/auth/*` endpoints, force-password-change, `src/lib/admin/` helpers. |

### From `03 old portal/` (Aqua Portal v9 archive)

| # | Title | File | Summary |
|---|-------|------|---------|
| 11 | Overview | [prior research/old-portal-overview.md](prior%20research/old-portal-overview.md) | 7-app monorepo, Phase-9 plugin migration, how to run, archive state. 70% architecturally sound, 40% functionally complete. |
| 12 | Bridge package | [prior research/old-portal-bridge.md](prior%20research/old-portal-bridge.md) | `@aqua/bridge` shared package. Types, auth, Prisma schema, eventBus, registry, sync helpers, UI kit (480 LOC), postMessage protocol, concepts/. |
| 13 | Host shell | [prior research/old-portal-host-shell.md](prior%20research/old-portal-host-shell.md) | `aqua-host-shell` — bootstrap loader, tolerant view resolver, sidebar/topbar, marketplace, AI chat (Claude Opus 4.7 SSE + prompt cache). |
| 14 | Sub-apps | [prior research/old-portal-suites.md](prior%20research/old-portal-suites.md) | The 6 sub-apps (Client / CRM / Finance / People / Revenue / Operations). What's wired vs stubbed per template. |
| 15 | Roles + multi-tenancy | [prior research/old-portal-roles-tenancy.md](prior%20research/old-portal-roles-tenancy.md) | 6 roles, Prisma models (Agency, User, Client, FulfilmentBrief, etc.), ClientStage, sync helpers. The most directly applicable to `04`. |
| 16 | Extras folder | [prior research/old-portal-extras.md](prior%20research/old-portal-extras.md) | `vite-prototype/` and `eds-old-portal-idea-fixed/` reference patterns (PageBuilder / RoleBuilder / AgencyConfigurator / collaboration widgets / DynamicRenderer). `sort-out-version/` is delete-safe. |

### Synthesis

| # | Title | File | Summary |
|---|-------|------|---------|
| 17 | Concepts to port | [prior research/concepts-to-port.md](prior%20research/concepts-to-port.md) | Ranked list: from `02` (port directly), from `03` (recreate as plugins). Architecture target for `04`. |
| 18 | Anti-patterns | [prior research/anti-patterns.md](prior%20research/anti-patterns.md) | 20 specific things from `02` and `03` we should NOT replicate in `04`. |

### Architecture (LOCKED — read before any 04 work)

| # | Title | File | Summary |
|---|-------|------|---------|
| 19 | `04` architecture | [prior research/04-architecture.md](prior%20research/04-architecture.md) | The locked design for `04 the final portal/`. Pool-model multi-tenancy (Agency → Client → End-customer), Aqua manifest plugins, server-rendered chrome, single-cookie auth, phase lifecycle, brand kit per client. Round 1 terminal split. Decisions log. |

### Round 1 implementation chapters

| # | Title | File | Summary |
|---|-------|------|---------|
| 20 | Fulfillment plugin | [prior research/04-plugin-fulfillment.md](prior%20research/04-plugin-fulfillment.md) | T2's deliverable. Manifest contract, six seeded phase defaults, `advancePhase` 7-step transition algorithm, collaborative checklist (template + per-client progress), per-client marketplace UX, foundation port surface (T1 + T3 integration TODOs), API surface. Standalone tsc-clean. |
| 21 | Foundation (T1) | [prior research/04-foundation.md](prior%20research/04-foundation.md) | T1's deliverable. Folder tree of `04 the final portal/portal/`, plugin contract (AquaPlugin manifest + new `scopePolicy` field + `:clientId` href rewriting), auth API (issueSession/requireRole/requireRoleForClient/AuthError), chrome contract (buildSidebar + ThemeInjector + Sidebar/Topbar), server module surface (tenants/users/pluginInstalls — composite install id `${agencyId}\|${clientId??_agency}\|${pluginId}`), bootstrap flow, six deviations from architecture. |
| 22 | Website-editor plugin (T3) | [prior research/04-plugin-website-editor.md](prior%20research/04-plugin-website-editor.md) | T3's deliverable. `@aqua/plugin-website-editor` package — manifest (8 navItems / 11 pages / 41 api / 58 blocks / 8 features), public exports (./manifest, /server, /types, /components), `applyStarterVariant({agencyId, clientId, role: PortalRole, variantId, actor?}, storage)` contract for T2, 6 starter JSON trees, full server runtime (pages.ts variant helpers + themes/content/sites/embeds/preview), storage-keys namespacing under `t/{agencyId}/{clientId}/...`, smoke 31/31 pass, tsc clean. Round-2 TODO list: block UI port, admin UI port, split-test wiring, GitHub PR promote, custom domains, theme-token-system, real-time collab. |
| 23 | Foundation Round 2 (T1) | [prior research/04-foundation-round2.md](prior%20research/04-foundation-round2.md) | T1's Round-2 wire-and-demo. `@aqua/plugin-fulfillment` mounted as `file:..` workspace dep with `install-links=true` + `transpilePackages`; foundation port adapters (`clientStore`, `pluginInstalls`, `pluginRuntime`, `pluginRegistry`, `phaseStore`, `activityLog`, `eventBus`, `portalVariant` STUB) bridge T2's ports to T1 server modules; `_routeResolver.ts` + 3 catch-all routes (`/portal/agency/[...rest]`, `/portal/clients/[clientId]/[...rest]`, `/api/portal/[plugin]/[...rest]`) dispatch URLs to manifest pages + handlers; agency creation auto-installs core plugins via `bootstrapAgency`; `/api/dev/seed-demo` provisions Demo · Aqua + Felicia mirror with onboarding-stage half-ticked checklist. Smoke flow green end-to-end. |

### Round 2 implementation chapters

| # | Title | File | Summary |
|---|-------|------|---------|
| 24 | Ecommerce plugin (T2) | [prior research/04-plugin-ecommerce.md](prior%20research/04-plugin-ecommerce.md) | T2's Round-2 deliverable. `@aqua/plugin-ecommerce` (`scopePolicy: "client"`, `requires: ["website-editor"]`). Server domain: OrderService (Stripe-webhook-idempotent upserts), ProductService (per-install CRUD, override + inventory-snapshot merge), GiftCardService, ReferralCodeService, DiscountService (gift card → referral → static promo → custom code). Per-install Stripe (no env vars) — keys read from `install.config`. 23 API routes including `/stripe/{checkout,webhook,billing-portal}`. 13 admin pages (Products + Variants + Collections + Orders + Receipt + Customers + Inventory + Shipping + Discounts). Storefront cart context + 7 client components. 8 block ids contributed (rendering delegated to T3). Foundation adapter pattern: `registerEcommerceFoundation` + `containerFor(storage)` per request. Vestigial `billing.ts` flagged. tsc-clean standalone. |

---

## Discipline

- Update this index **before** you finish any task. If a session ends
  without a chapter row, the learning is lost.
- Don't write speculative chapters — only write what's been verified in
  the codebase or confirmed by the user.
- When a chapter goes stale, mark its row with `(stale — superseded by #NN)`
  rather than deleting. The history of decisions matters.
