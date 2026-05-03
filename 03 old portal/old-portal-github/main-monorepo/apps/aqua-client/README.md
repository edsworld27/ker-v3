# `aqua-client` — The client portal app (the big one)

> **Port:** 3002
> **Shell:** `ClientShell/`
> **Role:** The client-facing portal. Where actual customers (clients) of the agency log in to see their projects, dashboards, resources, fulfillment status, etc.
> **Size:** ~347 files — **3.5x larger than any other sub-app** because it owns 12 distinct template modules.

For the standard sub-app skeleton (which this app extends), see [`../README.md`](../README.md).

---

## What's distinctive about ClientShell

### 12 template modules in `ClientShell/ClientTemplates/`

Each is a feature suite — view + UI config + registry + logic hooks. They self-register via `BridgeRegistry.registerSuite()` when `ClientApp.tsx` mounts.

| Template module | Purpose |
| --- | --- |
| **`AgencyClients` / `ClientAgencyClients`** | Roster of all agency clients. Stage, assigned team, revenue, suite access. Quick actions: provisioning, impersonation, suite enablement. |
| **`ClientDashboard` / `ClientClientDashboard`** | Primary agency-side client dashboard. Project progress %, task board summary, support ticket count, lifecycle stage (Discovery → Design → Development → Live). |
| **`ClientManagement` / `ClientClientManagement`** | Detailed lifecycle management. Stage progression, CMS GitHub config, resource uploads, employee assignments, impersonation. |
| **`Fulfillment` / `ClientFulfillment`** | Project delivery tracking. Project board with status columns, per-project task lists, milestones, team workload. Direct feed from pipeline. |
| **`PortalView` / `ClientPortalView`** | The root client-portal shell. Drives dynamic suite rendering based on `enabledSuiteIds` for that client. Agency-branded, suite-gated nav. |
| **`WebStudio` / `ClientWebStudio`** | Web/CMS node editor — design / layout editing UI. |
| **`PhasesHub` / `ClientPhasesHub`** | Phase-mapped demo hub. Routes to Discovery, Design, Development, Live, Onboarding, Review phases — each maps to a sample client demo. |
| **`CustomSuites`** | Custom suite registry for iframe views. Registers "Clients Hub Suite" and "CMS Suite" (Payload). |
| **`ClientResources`** | Resource library (currently minimal — view component only). |
| **`Clientlogic`** | Shared logic constants and mock data for template orchestration. |
| **`types`** | Type definitions shared across templates (marketing types index). |

> Note: Several modules have a duplicate-prefixed sibling (`ClientX` and `ClientClientX`). This is a known naming inconsistency from a refactor — both are functional, but the team intended to consolidate.

### "Custom suites" via dynamic registry

`ClientShell/bridge/ClientSuiteRegistry.ts` reads registered suites from `BridgeRegistry` and provides `SUITE_METADATA.all`, `find()`, `forEach()` queries. Templates register suites; the sidebar enumerates them; the renderer mounts them.

This is more sophisticated than the other apps' template patterns — `aqua-client` was the testbed for the suite system.

### Dual portal modes (`/demo` vs `/user`)

- **`app/(main)/demo/[...view]/page.tsx`** — demo mode. Renders any registered component without auth. Uses `Bridge/auth/`'s `DEMO_SESSION` constant.
- **`app/(main)/user/[...view]/page.tsx`** — authed mode. Real user, real client data.

`ClientDynamicViewRenderer.tsx` checks `portalMode` and either uses the live registry or `Clientdemo/ClientdemoComponentMap.ts` for demo overrides.

### Atomic UI library

`ClientShell/components/ui/` has `ClientButton/`, `ClientCard/`, `ClientIcon/`, `ClientInput/`, `ClientSelect/`. These are app-specific (not shared from Bridge) but follow consistent design tokens via `useTheme()`.

---

## Routing

```
app/
├── (main)/
│   ├── page.tsx                    "/" — root portal (loads ClientApp via next/dynamic, ssr: false)
│   ├── layout.tsx                  global wrap (ModalProvider, CSS imports)
│   ├── demo/[...view]/page.tsx     demo mode catch-all
│   └── user/[...view]/page.tsx     authed mode catch-all
├── embed/[view]/page.tsx           iframe-target — consumed by host shell on port 3001
├── api/
│   ├── bridge/
│   │   ├── auth/route.ts          authentication endpoint
│   │   ├── provision/route.ts     client onboarding
│   │   └── state/route.ts         bridge state sync
│   └── sync/route.ts              general data sync
```

---

## Hooks & logic

| Hook | Purpose |
| --- | --- |
| `useClientLogic()` | Facade — composes core + auth + shell logic. Loads/persists state to localStorage (`LS_KEY = 'aqua_portal_state'`). |
| `useCoreLogic()` | Data persistence — users, clients, notifications, activity logs, YDI allowances, affiliate accounts, approval requests, inventory, shipments. |
| `useAuthLogic()` | Session/auth, current user, impersonation. |
| `useShellLogic()` | Shell state — portalView, sidebar collapse, modal visibility. |
| `useRoleConfig()` | Role-based feature gates. |
| `useTheme()` | Color tokens from `agencyConfig.identity`. |
| `useDesignAwareData()` | Queries data aware of current design/client context. |
| `useAutoSync()` | Polls for external state updates (interval-based). |
| `useSyncStore()` | Local store persistence hook. |

---

## Bridge folder

This app's bridge folder (`ClientShell/bridge/`) extends the workspace `Bridge/` package with client-specific contexts and registries:

- `ClientAppContext.tsx` — main React context (clients, users, portal mode, current user, handlers)
- `ClientBridgeHub.tsx` — central provider wrapper (wires contexts + event handlers)
- `ClientInboxContext.tsx` — messages/inbox state
- `ClientModalContext.tsx` — modal stack
- `ClientRegistration.ts` — alias for `@aqua/bridge/registry`
- `ClientSuiteRegistry.ts` — suite metadata queries
- `Clientapi.ts` — HTTP client for Bridge API
- `Clientevents.ts` — cross-component events
- `Clientprovisioning.ts` — onboarding logic
- `ClientuiRegistration.ts` — UI class registration
- `ClientuseTemplateUI.ts` — fetches UI constants for a registered template
- `config/` — agencyConfig, constants, iconMap, masterConfig, templates, uiMaster
- `data/` — mock client DB, design mock data
- `demo/` — demoComponentMap, demoState
- `types/` — barrel export of shared types
- `utils/` — misc

---

## Known incomplete pieces

| Stub | Where | Notes |
| --- | --- | --- |
| `useClientManagementViewLogic.ts` (× 2 — duplicated) | `ClientShell/ClientTemplates/{Client,ClientClient}Management/logic/` | Comment: `// TODO: add ClientManagementView-specific state and handlers`. Empty handlers. |
| `ClientEditableText.tsx` | `ClientShell/components/design/` | "Simple stub that just renders the text for now" — no edit mode logic |
| `ClientSettingsPlaceholder.tsx` | `ClientShell/components/Settings/` | 6 placeholder settings views (Theme Engine, Account Config, Integrations, App Builder, User Access, Agency Dashboard). Templates must register overrides. |
| `useClientLogicStub()` etc. | `ClientShell/logic/useClientLogic.ts` lines 7-19 | 6 empty handlers (stage update, edit client, resource upload, settings, user add/remove). Plus `useDesignLogicStub()` (3 empty fns), `useSetupLogicStub()` (1), `useUserLogicStub()` (1). |
| `AIChatbot` widget | `ClientShell/widgets/AIChatbot/` | Folder exists, sparse contents — no LLM integration |
| `ClientResources` template | `ClientShell/ClientTemplates/ClientResources/` | Only ViewComponent present, minimal functionality |
| `next.config.mjs` `typescript.ignoreBuildErrors: true` | root | Hides type errors. Worth fixing — see polish list. |

---

## How to run

```bash
# From repo root:
npm run dev:client       # http://localhost:3002
```

Best experienced via the host shell (port 3001) which embeds it. Standalone, you'll see the embed/* and demo/* routes work, but the user/* routes need auth from the host.

---

## See also

- `../README.md` — apps overview + standard skeleton
- `../../Bridge/README.md` — workspace package this app depends on
- `../../dev-config.md` — original architecture notes (client portal in §§ 30-50ish)
