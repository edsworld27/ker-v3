# `04` foundation — Round 2 (T1 wire + demo)

T2's fulfillment plugin is mounted into T1's shell as a workspace
package. Adapters bridge T2's port interfaces to T1's server modules.
Catch-all routes resolve plugin URLs to manifest pages + API handlers.
Demo seed drops Milesy Demo + a Felicia mirror with onboarding-stage
fulfillment in one POST.

> Built by T1 on 2026-05-04, on top of Round 1 chapter 21
> ([04-foundation.md](04-foundation.md)). T3's website-editor lands its
> own contributions in chapter 22; foundation hosts both.

## 1. Workspace dep wiring

### `04 the final portal/portal/package.json`

```jsonc
"dependencies": {
  "@aqua/plugin-fulfillment": "file:../plugins/fulfillment",
  // ...
}
```

### `04 the final portal/portal/.npmrc`

```
install-links=true
```

Turbopack 16 doesn't follow npm's default symlinked workspaces. With
`install-links=true`, npm copies the plugin source into `node_modules`
on every install — Turbopack resolves the copy fine.

**Dev-loop note**: when iterating on `plugins/fulfillment/` source, run
`npm install` inside `portal/` to refresh the copy. Same for
`plugins/website-editor/` once it's wired (Round 3).

### `next.config.ts`

```ts
transpilePackages: [
  "@aqua/plugin-fulfillment",
  "@aqua/plugin-website-editor",
],
```

Workspace plugins ship `*.ts` source (no build step). Next/Turbopack
needs `transpilePackages` to compile them rather than treat as pre-built
node_modules.

## 2. Foundation port adapters

T2's `aquaPluginTypes.ts` declared a `PluginServices` toolbox the plugin
needs from the foundation. Round 1's `_types.ts` didn't have services
injection — Round 2 aligns the contract and adds adapters.

### Surface (`@/plugins/_types`)

```ts
export interface PluginServices {
  clients:        ClientStorePort;
  pluginInstalls: PluginInstallStorePort;
  pluginRuntime:  PluginRuntimePort;
  registry:       PluginRegistryPort;
  phases:         PhaseStorePort;
  activity:       ActivityLogPort;
  events:         EventBusPort;
  variants:       PortalVariantPort;
}

export interface PluginCtx {
  agencyId: string;
  clientId?: string;
  install: PluginInstall;
  storage: PluginStorage;
  services: PluginServices;       // NEW — Round 2 alignment
  actor: string;                  // NEW — userId of caller
}
```

### Implementation (`@/plugins/foundation-adapters/`)

```
foundation-adapters/
├── index.ts                 exports FOUNDATION_SERVICES (singleton)
├── clientStoreAdapter.ts    wraps @/server/tenants
├── pluginInstallStoreAdapter.ts wraps @/server/pluginInstalls
├── pluginRuntimeAdapter.ts  wraps @/plugins/_runtime
├── pluginRegistryAdapter.ts wraps @/plugins/_registry
├── phaseStoreAdapter.ts     wraps @/server/phases (extended w/ upsert+delete)
├── activityLogAdapter.ts    wraps @/server/activity
├── eventBusAdapter.ts       wraps @/server/eventBus
└── portalVariantAdapter.ts  STUB — logs activity, returns ok
```

`FOUNDATION_SERVICES` is a module-level singleton (the adapters are
stateless). The `_runtime.ts` and the catch-all routes pass the same
singleton into every `PluginCtx` / `PluginPageProps`.

#### `portalVariantAdapter` (T3 deferred)

```ts
async applyStarterVariant({ agencyId, clientId, role, variantId, actor }) {
  logActivity({
    agencyId, clientId, actorUserId: actor, category: "system",
    action: "variant.apply.stub",
    message: `Starter variant '${variantId}' for portal role '${role}' acknowledged (T3 stub).`,
    metadata: { variantId, role },
  });
  return { ok: true, variantId };
}
```

Phase advances soft-fail on variant apply per the architecture
(`04-plugin-fulfillment.md §"Transition algorithm" step 3`), so the stub
unblocks Round 2 without depending on T3's editor wiring.

## 3. Catch-all route resolver

### URL conventions

| URL | Resolver branch | Plugin scope |
|-----|----------------|--------------|
| `/portal/agency/<pluginId>/<sub-path>` | `resolveAgencyPluginPage` | agency install (auto-installed when `core: true`) |
| `/portal/clients/<clientId>/<pluginId>/<sub>` | `resolveClientPluginPage` (branch 1) | client install if present, else agency |
| `/portal/clients/<clientId>/<plain-path>` | `resolveClientPluginPage` (branch 2) | searches all manifests' `pages[]` for path match |
| `/api/portal/<pluginId>/<sub>` | `resolvePluginApiRoute` | scope from `?clientId=` / `x-aqua-client-id` header |

### Path matching (`tryMatchPage`)

```
PP === ""           matches when remaining segments is empty
PP === "literal"    exact match against single remaining segment
PP === "a/b"        joined-segments match against remainder
PP starts with ":"  single-parameter match — captures one segment, exposed via segments[0]
```

T2's manifest exercises every branch:

| `pages[].path` | URL | Branch |
|---------------|-----|--------|
| `""` | `/portal/agency/fulfillment` | empty |
| `"clients"` | `/portal/agency/fulfillment/clients` | literal |
| `":clientId"` | `/portal/agency/fulfillment/cli_xxx` | param |
| `"phases"` | `/portal/agency/fulfillment/phases` | literal |
| `"marketplace"` | `/portal/agency/fulfillment/marketplace` | literal |
| `"checklist"` | `/portal/clients/<clientId>/checklist` | client-scope branch 2 |

### Catch-all entry points

```
src/app/portal/agency/[...rest]/page.tsx           agency-scope catch-all
src/app/portal/clients/[clientId]/[...rest]/page.tsx client-scope
src/app/api/portal/[plugin]/[...rest]/route.ts     API dispatcher (GET/POST/PATCH/PUT/DELETE)
```

Each unwraps the URL → `(plugin, page|route, install, segments)`,
verifies role + feature gates, then renders / dispatches with a
`PluginPageProps` (or `PluginCtx`) built from the live session.

## 4. Auto-install core plugins on agency creation

### `@/server/agencyBootstrap.ts`

```ts
export async function bootstrapAgency(input: CreateAgencyInput, installedBy?: string) {
  const agency = createAgency(input);
  await installCorePluginsForScope({ agencyId: agency.id }, installedBy);
  // ... activity log
  return { agency, installedCorePlugins };
}
```

Wired in:

- `/api/auth/login` first-run bootstrap path (replaces direct
  `createAgency` call) — so a fresh `npm run dev` + login lands an
  agency with fulfillment already installed and phase defaults seeded
  via `fulfillment.onInstall`.
- `/api/dev/seed-demo` — same path for the Demo Agency seed.

### Registry shape (Round 2)

```ts
const PLUGINS: AquaPlugin[] = [
  fulfillmentManifest as unknown as AquaPlugin,  // T2
  // T3 → import websiteEditor from "@aqua/plugin-website-editor"
];
```

The `as unknown as AquaPlugin` cast bridges T2's vendored
`aquaPluginTypes.ts` and foundation's `_types.ts`. They are
structurally aligned in Round 2; the cast satisfies TypeScript's
nominal-interface check. The validator runs the real shape check at
module load.

## 5. Demo seed shape

### POST `/api/dev/seed-demo`

Gated on `NEXT_PUBLIC_DEV_BYPASS=1` OR an authenticated
agency-owner / agency-manager session. Idempotent — repeat calls return
the existing ids.

```jsonc
{
  "ok": true,
  "agency":   { "id": "demo-agency", "name": "Demo · Aqua", "slug": "demo-agency" },
  "client":   { "id": "cli_xxx", "name": "Luv & Ker · Demo", "stage": "onboarding" },
  "credentials": {
    "owner":  { "email": "demo@aqua.dev", "password": "demo-aqua-2026", "role": "agency-owner" },
    "client": { "email": "felicia@luvandker.demo", "password": "felicia-demo-2026", "role": "client-owner" }
  },
  "seededChecklist": { "phaseId": "phase_demo-agency_onboarding", "ticked": 2, "total": 5 },
  "bootstrapped": { "agency": true, "client": true }
}
```

Brand kits:

- **Demo · Aqua** — cyan primary `#06B6D4`, pink accent `#F472B6`,
  14 px radius. Distinguishes the demo agency at a glance.
- **Luv & Ker · Demo** — orange primary `#F97316`, cream surface
  `#FFF7ED`, Playfair Display heading. Mirrors Felicia's storefront
  aesthetic.

The Felicia mirror lands at `stage: "onboarding"`, with the first half
of the seeded onboarding checklist pre-ticked (`doneBy: "demo-seed"`)
so the phase board has visible state immediately.

## 6. Smoke-test results

```
Demo seed:                 200 → bootstrapped agency + client + 2/5 ticked checklist
Login as demo-owner:       200 → cookie set
/portal/agency:            200 → agency chrome painted (cyan brand)
/portal/agency/fulfillment:           200 → ClientsPage (T2 component)
/portal/agency/fulfillment/clients:   200 → ClientsPage
/portal/agency/fulfillment/<cli_id>:  200 → PhaseBoardPage
/portal/agency/fulfillment/phases:    200 → PhasesPage
/portal/agency/fulfillment/marketplace?client=<cli_id>: 200 → MarketplacePage
/api/portal/fulfillment/clients:      200 → JSON list with Felicia
/api/portal/fulfillment/phases:       200 → 6 phase definitions
/api/portal/fulfillment/checklist?clientId&phaseId: 200 → ChecklistView (2/3 internal done)
POST /api/portal/fulfillment/checklist/tick: 200 → progress updated, activity entry recorded
GET  /api/portal/fulfillment/activity: 200 → 3 entries (demo.seeded, user.signed_in, ...)
```

`npm run build` clean. `npx tsc --noEmit` clean (portal + fulfillment).

## 7. T3 / cross-team handoff notes

When T3's website-editor lands as a workspace dep:

1. Add it to `_registry.ts`:

   ```ts
   import websiteEditorManifest from "@aqua/plugin-website-editor";
   const PLUGINS: AquaPlugin[] = [
     fulfillmentManifest as unknown as AquaPlugin,
     websiteEditorManifest as unknown as AquaPlugin,
   ];
   ```

2. Replace `portalVariantAdapter`'s stub body with a thin wrapper around
   T3's exported `applyStarterVariant({input}, storage)` — bind the
   plugin's storage scoped to the website-editor install and forward.
   T3's signature is locked at `(args, storage) → Promise<{ok, variantId, pageId?, siteId?}>`.

3. T3's plugin scopes are client-only (every variant belongs to a
   client). When T3's manifest has `scopePolicy: "client"` (or omits it),
   the runtime's `installCorePluginsForScope({agencyId})` will skip it
   automatically; client-scoped installs land via T2's
   `ClientLifecycleService.createWithPhase` per phase preset.

4. Catch-all routes already work for T3's pages — the resolver matches
   any plugin manifest. The two extant URL families
   (`/portal/agency/<plugin>/...` and
   `/portal/clients/<clientId>/<plugin>/...`) cover everything T3 needs.

## 8. Deviations from Round 1 contract

| Topic | Round 1 | Round 2 | Why |
|-------|---------|---------|-----|
| `PluginCtx` shape | `{ agencyId, clientId, install, storage }` | adds `services`, `actor` | T2's manifest expects this — alignment |
| `PluginPageProps` | minimal | adds `searchParams`, `services`, `storage`, `actor` | same |
| `NavItem.roles` | required name | accepts `roles` OR `visibleToRoles` | T2 uses `visibleToRoles`; both work |
| `NavItem.parent` | not declared | declared (rendering still flat) | T2's hierarchical nav field; resolver tolerates |
| `AquaPlugin.scopePolicy` | required | optional, defaults to `"either"` | T2's manifest doesn't set it; back-compat |
| Sidebar: scope filter | n/a | filters out items whose href is for the wrong scope | needed once a manifest contributes to BOTH agency + client surfaces |

None invalidate the architecture. Round 1 deviations remain in force
(see chapter 21).
