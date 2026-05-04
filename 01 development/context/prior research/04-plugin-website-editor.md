# Round-1 chapter — Website-editor plugin (T3)

`@aqua/plugin-website-editor` — port of the visual editor + 58-block
library + portal-variants admin from `02 felicias aqua portal work/`
into a self-contained, tsc-clean plugin package at
`04 the final portal/plugins/website-editor/`.

This chapter documents what shipped in Round 1, what was deferred to
Round 2, and the public contract T2's fulfillment plugin and T1's
foundation integrate against.

---

## Manifest contract

Default-exported `AquaPlugin` from `index.ts`:

| Field | Value |
|---|---|
| `id` | `website-editor` |
| `name` | `Website Editor` |
| `version` | `0.1.0` |
| `status` | `stable` |
| `category` | `content` |
| `core` | (omitted — agency operators install per-client; foundation auto-installs on client create) |
| `requires` | `[]` |
| `navGroup` | `{ id: "content", label: "Content", order: 10 }` |
| `navItems` | 8 entries (Editor / Pages / Portals / Customise / Themes / Assets / Sections / Popups) |
| `pages` | 11 lazy-loaded `PluginPage` entries |
| `api` | 41 `PluginApiRoute` entries mounted under `/api/portal/website-editor/<path>` |
| `storefront.blocks` | 58 `BlockDescriptor` entries — see catalogue below |
| `settings` | 2 groups: Publishing (githubRepo, githubBranch), Defaults (defaultThemeVariant, defaultStarterId) |
| `features` | 8 toggles: simpleEditor, advancedEditor, codeView (enterprise), templates, versionHistory, customCSS (pro+), headInjection (pro+), customDomain (pro+) |

Vendored contract at `src/lib/aquaPluginTypes.ts` extends T2's vendored
copy with `storefront: { blocks: BlockDescriptor[]; headInjections?:
HeadInjection[] }` so plugins can contribute blocks. T1 lifts canonical
copy to `portal/src/plugins/_types.ts`; both plugins swap when ready.

## Public exports

`@aqua/plugin-website-editor` exports four entry points:

| Subpath | Surface |
|---|---|
| `.` / `./manifest` | the default-exported `AquaPlugin` manifest |
| `./server` | `applyStarterVariant`, `listVariantsForPortal`, `getActivePortalVariant`, `setActivePortalVariant`, plus the full server module surface (pages / themes / content / sites / embeds / preview / discovery) and `storageKeys` |
| `./types` | `AquaPlugin`, `PortalRole`, `Block`, `EditorPage`, `Site`, `ThemeRecord`, `SiteContentState`, `PortalVariantPort`, etc. |
| `./components` | `BlockRenderer`, `BLOCK_REGISTRY`, the 58 block descriptors, storefront overlay (PortalEditOverlay / PortalPageRenderer / PreviewBar / SiteResolver / SiteUX / SiteHead / EditorThemeInjector) |

## `applyStarterVariant` contract (T2 integration)

```ts
import { applyStarterVariant } from "@aqua/plugin-website-editor/server";

await applyStarterVariant(
  {
    agencyId: "agency_abc",
    clientId: "client_xyz",
    role: "login",          // PortalRole — see contract note below
    variantId: "login-default",
    actor: "user_123",      // optional, for activity log
  },
  ctx.storage,              // PluginStorage from PluginCtx
);
// → { ok: true, variantId, pageId, siteId } | { ok: false, error }
```

Behaviour:
1. Load starter tree from `src/starters/<variantId>.json` (6 trees ship Round 1).
2. Validate `starter.role === input.role` — fail-safe `{ ok: false, error }` on mismatch.
3. Resolve target Site via `getOrCreateDefaultSite(storage, agencyId, clientId)`.
4. `createPage` with `portalRole`, `variantId`, and the JSON's blocks.
5. `setActivePortalVariant(...)` — atomically clears any existing active
   variant for `(siteId, role)`, flips the new page's `isActivePortal=true`.
6. Returns `{ ok: true, variantId, pageId, siteId }`. Never throws —
   phase transitions don't break on variant apply failures.

### Contract note: `role` parameter type

T2's `plugins/fulfillment/src/server/ports.ts:204` (commit before this
chapter) typed `PortalVariantPort.applyStarterVariant.role: Role` (user
role — `agency-owner | client-owner | …`). The semantically correct type
is `PortalRole` (`login | affiliates | orders | account`). Confirmed by
commander 2026-05-04T07:00Z reply in
`messages/terminal-3/from-orchestrator.md`. T2 will swap their port type
to `import type { PortalRole } from "@aqua/plugin-website-editor/types"`
in their next commit; T3 implements correctly.

## Admin route mounts

Foundation has a dynamic segment that resolves manifest pages. Routes
contributed:

| Path | Component | Purpose |
|---|---|---|
| `/portal/clients/[clientId]/editor` | `EditorPage` | Live · Block · Code editor (Round-2 UI) |
| `/portal/clients/[clientId]/pages` | `PagesPage` | Page list |
| `/portal/clients/[clientId]/pages/[pageId]` | `PageDetailPage` | Page detail / settings |
| `/portal/clients/[clientId]/portals` | `PortalsPage` | 4 portal-role tabs |
| `/portal/clients/[clientId]/customise` | `CustomisePage` | Brand-kit editor |
| `/portal/clients/[clientId]/sites` | `SitesPage` | Site selector + settings |
| `/portal/clients/[clientId]/themes` | `ThemesPage` | Theme list |
| `/portal/clients/[clientId]/themes/[themeId]` | `ThemeDetailPage` | Theme editor |
| `/portal/clients/[clientId]/sections` | `SectionsPage` | Reusable sections |
| `/portal/clients/[clientId]/assets` | `AssetsPage` | Asset library |
| `/portal/clients/[clientId]/popups` | `PopupsPage` | Popup builder |

Round 1 ships all 11 as structural placeholders. Round 2 lifts the full
UI from `02/src/app/admin/*`.

## API surface

41 `PluginApiRoute` handlers under `/api/portal/website-editor/<path>`:

| Group | Routes |
|---|---|
| Pages | `GET/POST/PATCH/DELETE /pages`, `GET /pages/get`, `GET /pages/by-slug`, `POST /pages/publish`, `POST /pages/revert`, `GET /portal-variants`, `POST /portal-variants/active` |
| Themes | `GET/POST/PATCH/DELETE /themes`, `GET /themes/get`, `POST /themes/default` |
| Content | `GET /content`, `POST /content/{draft,publish,discard,revert,discovery,preview-token}`, `GET /content/state` |
| Sites | `GET/POST/PATCH/DELETE /sites`, `GET /sites/get` |
| Embeds | `GET/PUT /embeds`, `GET /embeds/public`, `GET/PUT /embed-theme` |
| Discoveries | `GET /discoveries`, `POST /discoveries/{heartbeat,dismiss,confirm}` |
| Config | `GET /config` (storefront snapshot) |
| Promote | `POST /promote` (Round-1 stub) |
| Assets | `GET/POST/DELETE /assets` (Round-1 stub) |

Every handler runs `requireClientScope(ctx)` before any work, then
reads `siteId` from query/body. Tenancy is sourced from session via
foundation `requireRole()`.

## Storage namespace

All `PluginStorage` keys centralised in `src/server/storage-keys.ts`,
namespaced as `t/{agencyId}/{clientId}/...`. Examples:

| Key path | Purpose |
|---|---|
| `t/{a}/{c}/sites/index` | Index of site IDs for this client |
| `t/{a}/{c}/sites/{siteId}` | Site row |
| `t/{a}/{c}/sites/_default` | Pointer to default site |
| `t/{a}/{c}/pages/{siteId}/index` | Page IDs in this site |
| `t/{a}/{c}/pages/{siteId}/{pageId}` | EditorPage row |
| `t/{a}/{c}/portals/{siteId}/{role}/active` | Active portal-variant pointer (singleton) |
| `t/{a}/{c}/themes/{siteId}/{themeId}` | Theme row |
| `t/{a}/{c}/content/{siteId}` | Content draft/published state |

## Block catalogue

58 `BlockDescriptor` entries across 6 categories. Round-1 component
files are structural placeholders (recursive children + `data-block-type`
marker); Round-2 lifts the full UI from
`02/src/components/editor/blocks/*.tsx`.

| Category | Count | Types |
|---|---|---|
| **layout** | 7 | container, section, row, column, grid, spacer, divider |
| **content** | 22 | heading, text, button, hero, cta, testimonials, pricing-table, faq, quote, banner, author-bio, stats-bar, logo-grid, feature-grid, tabs, accordion, card-grid, footer, navbar, timeline, form, contact-form |
| **media** | 7 | image, video, icon, gallery, map, before-after, marquee |
| **commerce** | 11 | product-card\*, product-grid\*, collection-grid\*, cart-summary\*, checkout-summary\*, payment-button\*, order-success\*, variant-picker\*, product-search\*, donation-button, booking-widget |
| **auth** | 5 | login-form, signup-form, theme-selector, social-auth, member-gate |
| **advanced** | 6 | html, countdown-timer, language-switcher, newsletter-signup, app-showcase, social-proof-bar |

\* Gated behind `requiresPlugin: "ecommerce"` (Round-2 ecommerce plugin).

## Starter trees

6 JSON trees in `src/starters/`, each carrying
`{ variantId, role, title, description, blocks }`:

| Variant ID | Role | Description |
|---|---|---|
| `login-default` | login | Minimal sign-in surface — heading + lede + login form |
| `login-onboarding` | login | Welcome-first variant (hero + 3-step stats + login) for clients in onboarding phase |
| `login-design` | login | Marketing-style split layout (hero column + login column + logo grid) for design phase |
| `affiliates-default` | affiliates | Heading + performance stats + login with `signupHref=/affiliate-signup` |
| `orders-default` | orders | Heading + lede + support banner (list itself rendered by ecommerce plugin Round 2) |
| `account-default` | account | Heading + 4-card hub linking to Orders / Profile / Affiliates / Preferences |

Loaded by `src/server/starterLoader.ts` via `import` with JSON
attributes (TS5 / ES2022). T2 calls `applyStarterVariant({ ...,
variantId: "<id>" })` to apply.

## Verification

Standalone build (no T1):

```bash
cd "04 the final portal/plugins/website-editor"
npm install
npm run typecheck                  # tsc --noEmit clean
npm test                           # 31/31 smoke assertions pass
```

Smoke (`src/__smoke__/blocks.test.ts`) validates:
- Manifest counts: id, navItems(8), pages(11), api(≥30), blocks(58), features(8)
- BLOCK_REGISTRY: 58 entries, all components callable
- All 6 starter trees load with non-empty blocks
- `applyStarterVariant` happy path returns `{ ok, variantId, pageId, siteId }`
- Second variant on same role triggers active flip
- Role / variantId mismatch returns `{ ok: false, error }`
- Unknown variantId returns `{ ok: false, error }`

## What's NOT in this plugin

By design, T3 did not lift:

- Auth / middleware / cookie code — T1 foundation owns
- `PluginRequired` widget / Sidebar / Topbar — T1 chrome
- Phase engine / checklists / client CRUD — T2 fulfillment
- Products / collections / inventory / cart / checkout / Stripe / discounts / giftCards / reviews — Round-2 ecommerce plugin
- Marketing / blog / forum / donations / reservations — Round-2 plugins
- Customer-facing storefront pages under `02/src/app/(storefront)/` — Round-2 ecommerce plugin

## Outstanding TODOs / Round-2 work

1. **Block UI port.** All 58 block components are Round-1 structural
   placeholders. Round-2 lifts the full implementations from
   `02/src/components/editor/blocks/*.tsx` faithfully. Schedule:
   first the layout + content + auth blocks (35 blocks); commerce
   blocks deferred to ecommerce plugin install; advanced blocks last.
2. **Editor admin UI port.** All 11 admin pages are placeholders.
   Round-2 lifts: editor page (Live/Block/Code modes, complexity
   tiers, outliner, properties panel, publish modal), portals page
   (4 portal-role tabs), pages list, customise (brand-kit editor),
   themes detail, etc.
3. **Split-test resolution wiring.** `variantResolver.ts` is round-1
   stub picking the first variant. Round-2 wires real cookie-bucketing
   + exposure tracking per `aqua-blocks.md:79`.
4. **GitHub PR promote.** `handlePromote` is Round-1 shim. Lift the
   Octokit branch + PR creation flow from
   `02/src/app/api/portal/promote/[siteId]/route.ts` once Postgres
   migration lands per `04-architecture.md` §13.
5. **Asset uploads.** `assets.ts` handlers return 501. Wire against
   T1's storage adapter (or a foundation `components/shared/`
   AssetPicker promotion) in Round 2.
6. **Theme-token-system.** Deferred per `04-architecture.md` §13.
   Round-2 swaps inline theme overrides for token-driven CSS variables.
7. **Custom domains.** `SiteResolver` simplified to clientId-only
   lookup. Round-2 plugin handles host-matching for custom domains.
8. **Real-time collaboration on editor (Yjs/CRDT).** Explicitly
   deferred per `04-architecture.md` §13.
9. **`SiteHead` analytics extraction.** Pure-meta version ships in T3;
   analytics / script-tag injection moves to a future SEO/analytics
   plugin's `headInjections[]` manifest contribution.
10. **`useProducts` data port.** Round-1 returns empty list. Wire
    against ecommerce plugin's `ctx.services.products` once that port
    lands.

## Cross-team handoffs

- **T1 (foundation)**: must publish canonical `AquaPlugin` type at
  `portal/src/plugins/_types.ts` so T3 + T2 can swap their vendored
  `aquaPluginTypes.ts` to a re-export. Must also wire the catchall
  `app/api/portal/[...slug]/route.ts` that dispatches to plugin
  manifest `api[]` entries, and the dynamic segment that mounts
  manifest `pages[]` entries. `requireRole()` + `PluginStorage` impl
  must land before the plugin can run end-to-end.
- **T2 (fulfillment)**: swap `PortalVariantPort.applyStarterVariant.role:
  Role` → `role: PortalRole` (`import type { PortalRole } from
  "@aqua/plugin-website-editor/types"`). One-line refactor.
- **AssetPicker shared promotion**: the editor's asset picker is
  also useful for blog/forms/ecommerce. Round-2 candidate for
  promotion to foundation `components/shared/`.

## Files of note

- `index.ts` — manifest entry
- `src/server/portalVariants.ts` — `applyStarterVariant` impl
- `src/server/pages.ts` — page CRUD + variant helpers
- `src/server/storage-keys.ts` — single source of truth for `PluginStorage` keys
- `src/components/blockRegistry.ts` — 58 BlockDescriptor entries + component lookup
- `src/components/BlockRenderer.tsx` — recursive renderer
- `src/api/routes.ts` — 41 `PluginApiRoute` entries
- `src/starters/*.json` — 6 starter trees
- `src/__smoke__/blocks.test.ts` — 31-assertion verification suite
