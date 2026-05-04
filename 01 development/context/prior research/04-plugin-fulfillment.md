# `04` plugin — Fulfillment

The agency-side workspace that drives every client's lifecycle. Lives at
`04 the final portal/plugins/fulfillment/`. Default-exports an
`AquaPlugin` manifest. Auto-installed for every agency (`core: true`).

> Owner: T2. Round 1. Built standalone (tsc-clean inside the plugin
> folder) so it composes with T1's foundation via dependency-injected
> ports rather than direct imports.

## Manifest contract

| Field | Value |
|-------|-------|
| `id` | `fulfillment` |
| `version` | `0.1.0` (beta) |
| `category` | `core` |
| `core` | `true` — auto-installed for every agency |
| `requires` | (none — everything is a foundation port) |
| `pages` | 6 lazy-loaded server components: index, clients, `:clientId`, phases, marketplace, checklist |
| `api` | 14 routes mounted at `/api/portal/fulfillment/*` |
| `navItems` | 5 sidebar entries (3 agency, 1 settings, 1 client-portal) |
| `settings` | 2 groups (`fulfillment defaults`, `notifications`) |
| `features` | `marketplace`, `phaseEditor`, `clientChecklist` |
| `onInstall` | seeds the six default phase definitions for the new agency |

## Folder layout

```
plugins/fulfillment/
├── package.json                 @aqua/plugin-fulfillment, peer next/react
├── tsconfig.json                strict, react-jsx, bundler resolution
├── README.md                    package summary + verification steps
├── index.ts                     default-exported AquaPlugin manifest
└── src/
    ├── lib/
    │   ├── aquaPluginTypes.ts   local AquaPlugin contract (TODO: replace with T1 import)
    │   ├── tenancy.ts           Agency / Client / PluginInstall / PhaseDefinition / PortalRole aliases
    │   ├── ids.ts               crypto-strong id generator
    │   └── time.ts              Date.now() indirection (testable)
    ├── server/
    │   ├── ports.ts             every foundation interface this plugin needs
    │   ├── presets.ts           the 6 default phase definitions
    │   ├── phases.ts            PhaseService (CRUD + idempotent seedDefaultPhases)
    │   ├── checklist.ts         ChecklistService (template + per-client progress)
    │   ├── transitions.ts       TransitionService.advancePhase
    │   ├── clients.ts           ClientLifecycleService.createWithPhase
    │   ├── marketplace.ts       MarketplaceService (per-client install / disable / uninstall)
    │   ├── starterVariant.ts    T3 integration shim + NOOP_PORTAL_VARIANT_PORT fallback
    │   └── index.ts             barrel + buildFulfillmentContainer(deps)
    ├── api/
    │   ├── handlers.ts          14 pure handler fns (Web Fetch Response)
    │   └── routes.ts            PluginApiRoute[] manifest
    ├── components/              client-side React components (use-client)
    │   ├── ChecklistTask.tsx
    │   ├── ChecklistColumn.tsx
    │   ├── ChecklistWidget.tsx
    │   ├── PhaseBoard.tsx
    │   ├── ClientList.tsx
    │   ├── NewClientModal.tsx
    │   ├── PhasesSettingsList.tsx
    │   ├── MarketplaceUI.tsx
    │   └── PluginCard.tsx
    └── pages/                   server-rendered page wrappers
        ├── ClientsPage.tsx              `/portal/agency/fulfillment` and `/clients`
        ├── PhaseBoardPage.tsx           `/portal/agency/fulfillment/[clientId]`
        ├── PhasesPage.tsx               `/portal/agency/fulfillment/phases`
        ├── MarketplacePage.tsx          `/portal/agency/fulfillment/marketplace?client=`
        └── ChecklistPage.tsx            `/portal/clients/[clientId]/checklist`
```

## Phase data model

`PhaseDefinition` rows are stored as data in T1's foundation storage
(`PortalState.phases`), keyed by `${'phase_'+agencyId+'_'+stage}` for the
seeded defaults. Shape mirrors T1's foundation type (commit `032100c`):

```ts
interface PhaseDefinition {
  id: string;
  agencyId: string;
  stage: ClientStage;            // "lead" | "discovery" | ... | "churned"
  label: string;
  description?: string;
  order: number;
  pluginPreset: string[];        // pluginIds to install/enable on entry
  portalVariantId?: string;      // T3-owned editor page id (optional)
  checklist: PhaseChecklistItem[];
}

interface PhaseChecklistItem {
  id: string;
  label: string;
  visibility: "internal" | "client";
  done?: boolean;                // template default; canonical state = ChecklistProgress
}
```

### Per-client checklist progress

Lives in fulfillment's plugin-namespaced storage under the key
`progress:<clientId>:<phaseId>`:

```ts
interface ChecklistProgress {
  clientId: string;
  phaseId: string;
  items: Record<string, { done: boolean; doneAt?: number; doneBy?: string; notes?: string }>;
  updatedAt: number;
}
```

### 6 seeded defaults (`src/server/presets.ts`)

| stage | label | pluginPreset | starterVariantId |
|-------|-------|--------------|------------------|
| `discovery` | Discovery | `brand`, `forms` | `starter-discovery` |
| `design` | Design | `brand`, `website-editor` | `starter-design` |
| `development` | Development | `website-editor`, `forms`, `email` | `starter-development` |
| `onboarding` | Onboarding | `website-editor`, `email`, `analytics` | `starter-onboarding` |
| `live` | Live | `website-editor`, `email`, `analytics`, `seo`, `support` | `starter-live` |
| `churned` | Churned | (empty — all plugins disabled) | — |

Each carries seed checklist items split into `internal` (agency-side) and
`client` (client-side). `seedDefaultPhases(agencyId)` is idempotent — it
only runs when the agency has zero phase rows, so re-installs don't
clobber agency edits.

## Transition algorithm

`TransitionService.advancePhase({ agencyId, clientId, fromPhase, toPhase, actor })`
runs through 7 ordered steps (locked in `04-architecture.md §7` and
Decisions log #4):

1. **Disable old plugins** — `pluginRuntime.setEnabled({ enabled: false })`
   for every plugin in `fromPhase.pluginPreset` *not also* in
   `toPhase.pluginPreset`. Config preserved.
2. **Enable / install new plugins** — for each id in `toPhase.pluginPreset`:
   re-enable an existing install, or `pluginRuntime.installPlugin` if the
   client doesn't have it yet. Lifecycle hooks fire normally.
3. **Apply starter portal variant** — if `toPhase.portalVariantId` is
   set, call `services.variants.applyStarterVariant({ role: "login", … })`.
   Soft-fails: a variant error is logged but doesn't block the advance
   (the variant can be re-applied manually from the editor).
4. **Update `client.stage`** — `clients.updateClient(agencyId, clientId, { stage })`.
5. **Initialise checklist progress** — write a fresh `ChecklistProgress`
   row for the new (clientId, phaseId).
6. **Activity log** — `activity.logActivity({ category: "phase", action: "phase.advanced", … })`.
7. **Event bus** — `events.emit({ agencyId, clientId }, "phase.advanced", { from, to, disabled, enabled, actor })`.

Auto-disable, config preserved, never auto-uninstall. Reversible by
running `advancePhase` in the opposite direction.

### Events emitted

| name | when | payload |
|------|------|---------|
| `phase.advanced` | a client moves between phases | `{ from, to, fromStage, toStage, disabled, enabled, actor }` |
| `phase.checklist_item_completed` | an item is ticked `done: true` | `{ phaseId, itemId, itemLabel, visibility, actor }` |
| `plugin.installed` / `plugin.enabled` / `plugin.disabled` / `plugin.uninstalled` | bubbled from `pluginRuntime` | (per the runtime contract) |

T2 only **emits**; consumers like an email-on-advance hook live elsewhere.

## Client creation flow

`ClientLifecycleService.createWithPhase({ agencyId, name, stage, brand, … })`:

1. Resolve the `PhaseDefinition` for `(agencyId, stage)` — error if no
   phase row exists (the seed must have run; agency setup invariant).
2. `clients.createClient(agencyId, { name, slug?, ownerEmail?, stage, brand?, … })`.
3. For each `phase.pluginPreset` plugin id, call
   `pluginRuntime.installPlugin({ pluginId, scope: { agencyId, clientId } })`.
   Records partial-failure list rather than rolling back; the agency
   owner sees a warning and can retry per-plugin from marketplace.
4. Apply starter portal variant if present (no-op shim until T3 ships).
5. Initialise checklist progress for the phase.
6. Activity log entry.

## Marketplace UX

`MarketplaceService.listForClient({ agencyId, clientId, filter })` merges
T1's `PluginRegistry` with the client's `PluginInstall` rows into
`MarketplaceCard[]`. Search + category filter, faceted counts.

Per-card actions, all scoped to one client:
- **Install** → `pluginRuntime.installPlugin({ scope: { agencyId, clientId } })`
- **Enable / Disable** → `pluginRuntime.setEnabled`
- **Uninstall** → `pluginRuntime.uninstallPlugin`

Every mutation logs an activity entry (`plugin.installed`, `.enabled`, etc.).

## Collaborative checklist UX

Two surfaces consume the same `ChecklistView`:

- **Agency phase board** (`/portal/agency/fulfillment/[clientId]`): two
  columns — internal (editable) + client (read-only progress). Advance
  button gated by `view.allRequiredComplete`; modal warns on outstanding
  items but allows override.
- **Client checklist** (`/portal/clients/[clientId]/checklist`):
  visible to `client-owner` + `client-staff`. Shows ONLY the
  client-tagged items. Tickable. Activity feed reflects progress so the
  agency sees ticks in near-real-time (foundation polls or pushes).

Both use the same API endpoint (`POST /api/portal/fulfillment/checklist/tick`)
with role-aware permission checks at the handler boundary.

## Foundation port surface (`src/server/ports.ts`)

The plugin reaches into T1 (and T3) only via these interfaces, so the
plugin tsc-cleans standalone and integration is an explicit hand-shake
the chief commander brokers:

| Port | Owner | Methods |
|------|-------|---------|
| `ClientStorePort` | T1 (`server/tenants.ts`) | createClient, getClient, getClientForAgency, listClients, updateClient |
| `PluginInstallStorePort` | T1 (`server/pluginInstalls.ts`) | getInstall, listInstalledFor[Client]Only, upsertInstall, patchInstall, deleteInstall |
| `PluginRuntimePort` | T1 (`src/plugins/_runtime.ts`, pending) | installPlugin, setEnabled, uninstallPlugin |
| `PluginRegistryPort` | T1 (`src/plugins/_registry.ts`, pending) | listPlugins, listInstallablePlugins, getPlugin |
| `PhaseStorePort` | T1 (`server/phases.ts`) | listPhasesForAgency, getPhase, upsertPhase, deletePhase |
| `ActivityLogPort` | T1 (`server/activity.ts`) | logActivity, listActivity |
| `EventBusPort` | T1 (`server/eventBus.ts`) | emit |
| `PortalVariantPort` | T3 (`@aqua/plugin-website-editor/server/portalVariants.ts`) | applyStarterVariant({ agencyId, clientId, role: PortalRole, variantId, actor? }) |

T1's foundation builds a `PluginServices` container per-request and
passes it to the manifest's pages (`PluginPageProps.services`) and api
handlers (`PluginCtx.services`). `buildFulfillmentContainer(deps)`
(exported from `src/server/index.ts`) wires the per-plugin services
together — the foundation calls this once per request after assembling
the deps.

## Cross-terminal integration TODOs

| Item | Status | Action when ready |
|------|--------|-------------------|
| Foundation `PluginServices` shape | T1 to publish | Replace `aquaPluginTypes.ts` with single import from `portal/src/plugins/_types` |
| `PluginRuntimePort` impl | T1 to ship `_runtime.ts` | Foundation registers it as `services.pluginRuntime` |
| `PluginRegistryPort` impl | T1 to ship `_registry.ts` | Foundation registers it as `services.registry` |
| `applyStarterVariant` | T3 shipped (stubbed body, signature locked) | Foundation adapts `applyStarterVariant(input, storage)` → `PortalVariantPort.applyStarterVariant(input)` by binding T3's plugin storage |
| `PortalRole` import | T3 owns at `@aqua/plugin-website-editor/types` | Replace local mirror in `lib/tenancy.ts` |
| Per-client checklist push | foundation event-fanout | When a `client-staff` ticks a task, foundation can push a Server-Sent Event to the agency's open phase-board so progress updates without reload |

## Verifying

```sh
cd "04 the final portal/plugins/fulfillment"
npm install
npm run typecheck      # tsc --noEmit — currently clean (verified 2026-05-04)
```

## API surface

All routes mount at `/api/portal/fulfillment/<path>`.

| method | path | purpose |
|--------|------|---------|
| `GET` | `clients` | list clients for the current agency |
| `POST` | `clients` | create a client (with phase preset) |
| `POST` | `phase/advance` | run `advancePhase` |
| `GET` | `checklist?clientId=&phaseId=` | render-ready checklist view |
| `POST` | `checklist/tick` | tick / untick an item |
| `GET` | `phases` | list phase definitions |
| `POST` | `phases` | upsert a phase definition |
| `DELETE` | `phases?id=` | delete a phase |
| `GET` | `presets` | seeded preset descriptors (wizard tooltip) |
| `GET` | `marketplace?clientId=&q=&category=` | per-client cards |
| `POST` | `marketplace/install` | install a plugin for a client |
| `POST` | `marketplace/enable` | enable / disable an install |
| `POST` | `marketplace/uninstall` | uninstall a plugin for a client |
| `GET` | `activity?clientId=&limit=` | recent activity entries |

Every handler returns JSON with shape `{ ok: boolean, … }` (200/201 on
success; 4xx with `{ ok: false, error }`).
