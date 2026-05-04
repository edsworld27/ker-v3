# `04` foundation — Round 3 (T1 — three plugins live)

T2's ecommerce + T3's website-editor land alongside fulfillment as
workspace deps. Foundation now hosts three plugins end-to-end. Route
resolver handles two manifest path conventions; portal-variant adapter
wires T3's real `applyStarterVariant`; ecommerce foundation adapter
registers at boot via a side-effect import.

> Built by T1 on 2026-05-04, on top of Round 2 chapter 23
> ([04-foundation-round2.md](04-foundation-round2.md)).

## 1. Workspace deps (final)

```jsonc
"dependencies": {
  "@aqua/plugin-ecommerce":      "file:../plugins/ecommerce",
  "@aqua/plugin-fulfillment":    "file:../plugins/fulfillment",
  "@aqua/plugin-website-editor": "file:../plugins/website-editor",
  // ...
}
```

`next.config.ts.transpilePackages` updated to include all three.
`.npmrc`'s `install-links=true` still required (Turbopack 16 doesn't
follow npm symlinks).

## 2. Manifest path conventions — two supported, side-by-side

| Plugin | Convention | Example `pages[].path` | Match against |
|--------|-----------|------------------------|----------------|
| fulfillment, ecommerce | **Relative** to plugin mount | `""`, `"clients"`, `":clientId"`, `"products/:slug"` | URL suffix after `/portal/agency/<plugin>/...` or `/portal/clients/<cid>/<plugin>/...` |
| website-editor | **Fully-qualified URL** | `"/portal/clients/[clientId]/editor"`, `"/portal/.../pages/[pageId]"` | Entire request URL |

Both honour dynamic segments — `:name` in relative paths, `[name]` in
full URLs. Captured values are exposed via `PluginPageProps.segments[]`
in declaration order.

The resolver (`src/plugins/_routeResolver.ts`) tries:

1. Plugin-id-prefixed match (T2/ecommerce style):
   `/portal/agency/<pluginId>/...` matches against `pages[].path`
   relative; same under `/portal/clients/<cid>/<pluginId>/...`.
2. Top-level scan:
   - For each plugin's pages with full-URL paths: match against the
     entire request URL (e.g. T3's `/portal/clients/[clientId]/editor`).
   - For each plugin's pages with relative paths: match against the
     URL suffix beneath `/portal/clients/<cid>/...` (e.g.
     fulfillment's `"checklist"` → `/portal/clients/<cid>/checklist`).

API resolver (`/api/portal/<pluginId>/<sub>`) normalises leading
slashes — both `route.path: "pages"` and `route.path: "/pages"` match
the same URL. T3's manifest authors with leading slash; T2's without.

## 3. Real `portalVariantAdapter` (T3 wired)

Round 2 stub replaced with a thin wrapper around T3's
`applyStarterVariant`:

```ts
export const portalVariantAdapter: PortalVariantPort = {
  async applyStarterVariant({ agencyId, clientId, role, variantId, actor }) {
    const install = getInstall({ agencyId, clientId }, "website-editor");
    if (!install || !install.enabled) {
      // Soft-fail: log + return ok:false; phase advance keeps going.
      return { ok: false, error: "website-editor not installed for client" };
    }
    const storage = makePluginStorage(install.id);
    const result = await t3ApplyStarterVariant({ ... }, storage);
    logActivity({ ... });
    return result;
  },
};
```

Per the architecture, phase transitions soft-fail on variant errors —
the fulfillment plugin's `TransitionService` already treats variant
errors as non-fatal so a missing website-editor install doesn't block
the client lifecycle.

## 4. Ecommerce foundation registration

T2's ecommerce manifest expects a register-once-at-boot adapter
(`registerEcommerceFoundation`). The foundation hosts a
side-effect-import module that registers it:

```ts
// src/plugins/foundation-adapters/ecommerceFoundation.ts
import { registerEcommerceFoundation } from "@aqua/plugin-ecommerce/server";
import { getClient, getClientForAgency } from "@/server/tenants";
import { logActivity, listActivity } from "@/server/activity";
import { emit } from "@/server/eventBus";
import { getInstall } from "@/server/pluginInstalls";

let registered = false;
export function ensureEcommerceFoundationRegistered() {
  if (registered) return;
  registerEcommerceFoundation({ tenant: { ... }, activity: { ... }, ... });
  registered = true;
}
ensureEcommerceFoundationRegistered();
```

`_registry.ts` performs a side-effect import of this module so the
registration runs before any ecommerce route handler executes:

```ts
import "./foundation-adapters/ecommerceFoundation";
```

### Cross-team patch: re-export from T2's barrel

T2's package's `exports` map permits `@aqua/plugin-ecommerce/server`
but not deeper paths. `registerEcommerceFoundation` lived in
`./foundationAdapter` and wasn't re-exported from `./server`. Per the
Round-2 prompt's authorisation, T1 added a one-line re-export to
`plugins/ecommerce/src/server/index.ts`:

```ts
export {
  registerEcommerceFoundation,
  clearEcommerceFoundation,
  isFoundationRegistered,
  requireFoundation,
  containerFor,
} from "./foundationAdapter";
export type { EcommerceFoundation } from "./foundationAdapter";
```

Notified T2 via `messages/terminal-2/from-orchestrator.md`.

`ActivityCategory` in `@/server/types.ts` extended with `"ecommerce"`
so plugin-emitted activity entries type-check through the port.

## 5. Demo seed (extended)

POST `/api/dev/seed-demo` now installs `website-editor` and `ecommerce`
for the Felicia client install (after creating the client). Returns
the full install scope:

```jsonc
{
  "ok": true,
  "agency": { "id": "demo-agency", "name": "Demo · Aqua" },
  "client": { "id": "cli_xxx", "name": "Luv & Ker · Demo", "stage": "onboarding" },
  "credentials": { "owner": ..., "client": ... },
  "seededChecklist": { "phaseId": "...", "ticked": 2, "total": 5 },
  "installedClientPlugins": ["website-editor", "ecommerce"],
  "installedScope": [
    { "pluginId": "fulfillment",     "enabled": true },
    { "pluginId": "website-editor",  "enabled": true },
    { "pluginId": "ecommerce",       "enabled": true }
  ],
  "bootstrapped": { "agency": true, "client": true }
}
```

Order matters: `website-editor` installs first because ecommerce
declares `requires: ["website-editor"]`. The runtime's dep check
honours that.

## 6. Smoke-test results (verified)

Pages (server-rendered, all 200):

```
/portal/agency                                          → 200
/portal/agency/fulfillment                              → 200
/portal/agency/fulfillment/clients                      → 200
/portal/agency/fulfillment/<cid>                        → 200
/portal/agency/fulfillment/marketplace?client=<cid>     → 200
/portal/clients/<cid>                                   → 200
/portal/clients/<cid>/editor          (T3 full URL)     → 200
/portal/clients/<cid>/pages           (T3)              → 200
/portal/clients/<cid>/portals         (T3)              → 200
/portal/clients/<cid>/themes          (T3)              → 200
/portal/clients/<cid>/ecommerce/products  (T2 ecom)     → 200
/portal/clients/<cid>/ecommerce/orders                  → 200
/portal/clients/<cid>/ecommerce/customers               → 200
/portal/clients/<cid>/checklist       (fulfillment)     → 200
```

API dispatcher (with auth cookie):

```
GET  /api/portal/fulfillment/clients                                → 200 (Felicia)
GET  /api/portal/fulfillment/phases                                 → 200 (6 phases)
GET  /api/portal/website-editor/sites?clientId=<cid>                → 200 (sites: [])
GET  /api/portal/website-editor/pages?clientId&siteId               → 400 (legitimate — no siteId in seed)
GET  /api/portal/ecommerce/products?clientId=<cid>                  → 200
GET  /api/portal/ecommerce/orders?clientId=<cid>                    → 200
POST /api/portal/fulfillment/checklist/tick                         → 200 + activity entry
```

`npm run build` clean. `npx tsc --noEmit` clean across portal + all
three plugin packages.

## 7. Round 3 deviations

| Topic | Round 2 | Round 3 | Why |
|-------|---------|---------|-----|
| Manifest path matching | Relative only | Relative + full-URL | T3 authors full URLs; T2 + ecommerce author relative |
| API path leading slash | Strict equality | Normalised — both `"foo"` and `"/foo"` match | T3 authors with leading slash; T2 + ecommerce without |
| `portalVariantAdapter` | Stub returning ok | Calls T3's `applyStarterVariant` with website-editor's plugin storage | Needed once T3 plugin landed |
| Ecommerce foundation | n/a | Side-effect-import module registers `EcommerceFoundation` at boot | T2's ecommerce uses a register-once pattern |
| Cross-team patch | n/a | Added re-exports to T2's `src/server/index.ts` | Required so the foundation can reach `registerEcommerceFoundation` through the package's `exports` map |
| `ActivityCategory` | 7 values | 8 (added `"ecommerce"`) | T2's ecommerce plugin emits its own category |

## 8. Cross-team handoff state

| Item | Status |
|------|--------|
| Fulfillment manifest registered | ✅ |
| Website-editor manifest registered | ✅ |
| Ecommerce manifest registered | ✅ |
| Fulfillment auto-installs at agency scope (core) | ✅ |
| Website-editor + ecommerce installed per-client by demo seed | ✅ |
| Phase preset auto-installs both via `applyPreset` | ✅ (mechanic verified; T2 owns phase preset definitions) |
| `applyStarterVariant` real implementation wired | ✅ |
| Ecommerce foundation registered at boot | ✅ |
| Catch-all routes serve all three plugin URL families | ✅ |
| `/api/portal/<plugin>/<sub>` dispatch for all three | ✅ |
| End-to-end build + tsc clean | ✅ |

All Round-3 integration points closed. Future-rounds work:

- T3 R2: lift block-renderer UIs from `02` so the editor's block palette
  renders. Foundation needs no changes.
- T2 R2: real Stripe webhook end-to-end test. Foundation needs no
  changes; ecommerce route already mounted.
- Phase preset end-to-end: pick `Onboarding` on client creation →
  `applyPreset` installs the phase's plugin set → checklist appears →
  both sides tick → `advancePhase` swaps plugins. T2 owns the preset
  definitions; foundation already runs the preset machinery.
- Demo button on milesymedia.com — wraps `/api/dev/seed-demo` with a
  POV toggle.
