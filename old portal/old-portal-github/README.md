# Aqua Portal — Consolidated Codebase

> **What this is:** Every meaningful version of the Aqua Portal codebase, consolidated into one folder for cherry-picking, comparison, and continued development.
>
> **Total size:** ~12 MB source (excluding `node_modules`); ~3-5 GB with deps installed
>
> **What was excluded:** Payload CMS internals (`payload/` folders, `app/(payload)/` route groups). The `payload.config.ts` and `payload-types.ts` files were KEPT as concept references for the team's custom CMS implementation. `node_modules`, `.git`, `.next` build artifacts excluded from the snapshot but reinstallable.

---

## Folder map

```
eds-aqua-portal-complete/
├── README.md                              ← you are here
│
├── main-monorepo/                         ← THE CANONICAL CODEBASE
│   │   Next.js + Prisma + (custom) CMS monorepo, 7 sub-apps, npm workspaces.
│   │   This is the production target. Everything else is supplementary.
│   ├── README.md                          (full architecture)
│   ├── package.json                       (workspaces + dev scripts)
│   ├── apps/
│   │   ├── aqua-host-shell/              port 3001 — orchestrator, iframes the others
│   │   ├── aqua-client/                  port 3002 — client portal (12 template modules)
│   │   ├── aqua-crm/                     port 3003 — CRM
│   │   ├── aqua-operations/              port 3004 — ops hub
│   │   ├── aqua-ops-finance/             port 3005 — Finance Hub
│   │   ├── aqua-ops-people/              port 3006 — People (HR) Hub
│   │   └── aqua-ops-revenue/             port 3007 — Revenue Hub
│   ├── Bridge/                            shared package: auth, types, events, postMessage protocol
│   │   └── concepts/                     reference patterns ported from prototype (see below)
│   ├── Templates/                         shared package (currently stubs)
│   ├── scripts/                           setup-db.sh + find_duplicate_keys.cjs (debug tool)
│   ├── dev-config.md                      original author's architecture notes (84 sections)
│   └── NEXT_STEPS.md                      original author's deployment guide
│
└── extras/                                supplementary versions kept for reference
    ├── README.md                          (what each is)
    ├── vite-prototype/                   older Vite + React monolithic prototype (~250 files)
    ├── eds-old-portal-idea-fixed/        same prototype with bug fixes + per-folder READMEs we wrote
    └── sort-out-version/                 even older monolithic snapshot (just for diffing — not useful otherwise)
```

---

## How the architecture works (TL;DR)

**It's a micro-frontend monorepo.** Each of the 7 apps is a fully independent Next.js app with its own port, its own routes, its own Prisma DB schema. They communicate via:

- **iframes + postMessage** — the host shell (port 3001) embeds the others via `<iframe src="http://localhost:3002/embed/clientId">` etc., and syncs auth/theme/navigation through the typed `BridgeMessage` protocol in `Bridge/postMessage.ts`
- **Bridge package** — shared types, auth, Prisma client, event bus, registry. Workspace-linked into every app via `@aqua/bridge`

The `Bridge/` package is the glue. Every app imports `BridgeSession`, `BridgeAPI`, `BridgeEvents`, `BridgeRegistry`, `sendBridgeMessage`, `onBridgeMessage` from it.

For the deep version of this — read `main-monorepo/dev-config.md` (the original author's 84-section architecture doc).

---

## Running it

### First time

```bash
cd main-monorepo
npm install                    # workspaces install — installs deps for all 7 apps
npm run setup                  # initializes SQLite databases for each app via Prisma
```

### Run the host (most-common dev workflow)

```bash
npm run dev:host               # http://localhost:3001 — login + orchestrator
```

The host iframes the other apps, so you typically also want them running:

```bash
npm run dev:client             # 3002
npm run dev:crm                # 3003
npm run dev:operations         # 3004
npm run dev:finance            # 3005
npm run dev:people             # 3006
npm run dev:revenue            # 3007
```

Or run all 7 in parallel:

```bash
npm run dev                    # spawns all 7 — heavy, requires ~8GB RAM
```

### Demo mode (no DB needed)

Login as `demo@aqua.portal` — `Bridge/auth/index.ts` returns the `DEMO_SESSION` constant with all suites unlocked. Useful for quick UI work without setting up Prisma.

---

## What's been done in this consolidation

1. **Copied the full Next.js monorepo** to `main-monorepo/` (Payload internals stripped — see top note).
2. **Cherry-picked valuable patterns** from the older Vite prototype into `main-monorepo/Bridge/concepts/`:
   - `PageBuilder/` — drag-drop layout builder (the monorepo has placeholder views; this is a working pattern)
   - `RoleBuilder/` — full role CRUD UI
   - `AgencyConfigurator/` — real-time agency identity / branding editor
   - `collaboration/` — ProjectChat, ProjectTimeline, DesignConcepts, SyncCard widgets
   - `DynamicRenderer/` — generic config-to-JSX renderer
   - `agencyConfig.reference.ts` + `templates.reference.ts` — canonical role/template config schema
3. **Added `find_duplicate_keys.cjs` debug utility** to `main-monorepo/scripts/` — scans `*.tsx` for duplicate React `key=...` values
4. **Preserved older versions** in `extras/` for diff reference

See `main-monorepo/Bridge/concepts/README.md` for full details on what each concept module is and how to productionize it.

---

## Polish punch list

The codebase has some self-acknowledged incompleteness (from `dev-config.md` § "Known In-Progress / Coming Soon"):

| Priority | Item | Where | Notes |
| --- | --- | --- | --- |
| 🔴 High | RevenueShell widgets are placeholder fns | `apps/aqua-ops-revenue/RevenueShell/` | SalesHubOverview, SalesPipelineView, SalesCalendarView, CrmInboxWidget, ProposalsWidget, LeadTimelineWidget |
| 🔴 High | AQUA CRM templates folder empty | `apps/aqua-crm/CRMShell/CRMTemplates/` | Folder exists, no templates registered |
| 🟠 Mid | All 7 apps have `typescript.ignoreBuildErrors: true` | `apps/*/next.config.mjs` | Hides type errors. Finance/People have known field-name divergence |
| 🟠 Mid | Deprecated `experimental.serverComponentsExternalPackages` | `apps/*/next.config.mjs` | Should move to top-level `serverExternalPackages` |
| 🟠 Mid | `Bridge/config/` is empty | `Bridge/config/` | Reserved but unused; should hold shared constants |
| 🟡 Low | Bridge Prisma schema uses SQLite | `Bridge/data/prisma.ts` | Production target is PostgreSQL |
| 🟡 Low | `Templates/` package is stub | `Templates/index.ts` | Currently no-op registration fns |
| 🟡 Low | Settings placeholder views in RevenueShell | `apps/aqua-ops-revenue/RevenueShell/components/Settings/RevenueSettingsPlaceholder.tsx` | 6 stub views for AgencyConfigurator, GlobalSettings, Integrations, AgencyBuilder, AllUsers, Dashboard |
| 🟡 Low | `useClientLogicStub()` etc. — empty handler stubs | `apps/aqua-client/ClientShell/logic/useClientLogic.ts` | 6+ empty fns for stage update, edit client, resource upload, settings, user add/remove |

---

## Where to look for what

| You want… | Read… |
| --- | --- |
| The big picture | `main-monorepo/dev-config.md` (84 sections, the original author's deep dive) |
| Deployment notes | `main-monorepo/NEXT_STEPS.md` |
| How apps share state | `main-monorepo/Bridge/postMessage.ts` + `main-monorepo/Bridge/index.ts` |
| Auth + role config | `main-monorepo/Bridge/auth/` + `main-monorepo/Bridge/concepts/agencyConfig.reference.ts` |
| One app's structure | Any of `main-monorepo/apps/*/README.md` (per-app READMEs) |
| Reusable concept patterns | `main-monorepo/Bridge/concepts/README.md` |
| The bug fixes from the older prototype | `extras/eds-old-portal-idea-fixed/` (we patched 15 files, see commit history) |
| Simple debug utility for duplicate React keys | `main-monorepo/scripts/find_duplicate_keys.cjs` |
