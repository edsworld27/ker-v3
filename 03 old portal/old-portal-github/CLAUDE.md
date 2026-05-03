# CLAUDE.md — Context for the next Claude session

> **Archive note (2026-05-03):** This monorepo has been moved into `old-portal-github/` at the repo root and is frozen. The portal v9 work shipped a full kit redesign + Aqua AI chat (Claude Opus 4.7) + production CSP. For the master archive overview, read `../HANDOFF.md` (one level up from this file). The next-generation portal is being built at the repo root.
>
> Where to read next, in order:
> 1. `../HANDOFF.md` — one-page archive overview (architecture, status, what's worth porting).
> 2. `main-monorepo/SESSION_HANDOFF.md` — current branch / PR / CI state. Status table at top.
> 3. `main-monorepo/PROGRESS.md` — chronological log of every session's work, newest first. Sessions 5e–5j + P3-1 + P3-4 + P3-5 + restructure are the latest entries.
> 4. `main-monorepo/PLAN.md` — what's left (mostly P2 persistence + P4 cleanups).
> 5. This file — architecture overview + "how to run".

---

## TL;DR for fresh sessions

- **Single-domain plugin model.** One Next.js app at `apps/aqua-host-shell/` runs on port 3000. Every other "sub-app" registers its components into `BridgeRegistry` at boot via `HostBridgeBootstrap.ts`. No iframes by default.
- **All 7 apps are tsc-clean** (verified locally + in CI).
- **Per-suite localStorage stores** at `apps/aqua-{crm,ops-finance,ops-people,ops-revenue}/.../store/*Store.ts` with full CRUD wired to every interactive view.
- **Unified UI kit** at `Bridge/ui/kit.tsx` — Page, PageHeader, Card, KpiCard, Button, Modal, Badge, DataTable, etc. Self-contained (no lucide / motion deps in the kit itself).
- **Active PR**: `#5` on `claude/skip-client-plugin-discovery-fix` — about to merge as of session 4 wrap.

---

## What this repo is

A consolidated workspace containing the full **Aqua Portal v9** Next.js + Prisma + custom-CMS monorepo PLUS preserved older versions of the same project for reference and cherry-picking.

> **Architecture update (Phase 9):** Migrated from the 7-port iframe topology to a **single-domain plugin model**. `apps/aqua-host-shell/` is THE app — boots on port **3000**, runs `bootstrapBridge()` to load every sub-app's `register*App()` function into the BridgeRegistry, and renders all suites in-process via `HostRegistryViewRenderer`. Iframes are retained as an opt-in fallback (set `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1`). Sub-app folders remain as plugin sources but no longer boot their own dev servers under default `npm run dev`. Vercel deploys a single Next.js app via `vercel.json`.

The user (Ed) wants this to be **production-ready, with every app booting cleanly, every function working, and a working "Bridge Marketplace" for enabling/disabling suites per agency**. He plans to **eventually upload portions of this into a different live SaaS application** (a separate repo from this one) — he's using this consolidation repo to monitor progress and continue work.

**Excluded by user request:** Payload CMS internals (`payload/` folders + `app/(payload)/` route groups). The user has built his own custom CMS in his live SaaS. The `payload.config.ts` and `payload-types.ts` files were KEPT as concept references for his custom version. Don't try to install/wire Payload.

**Also skip:** the website editor — user explicitly said skip that piece.

---

## Folder map

```
eds-aqua-portal-complete/                     ROOT
├── README.md                                  big-picture overview (READ THIS)
├── CLAUDE.md                                  ← you are here
├── .gitignore
│
├── main-monorepo/                             ← THE CANONICAL CODEBASE — work happens here
│   ├── README.md
│   ├── PLAN.md                                step-by-step productionization plan (READ NEXT)
│   ├── PROGRESS.md                            running log of what's been done
│   ├── package.json                           npm workspaces, dev:host / dev:client / etc.
│   ├── apps/
│   │   ├── README.md                          per-app skeleton + standard pattern
│   │   ├── aqua-host-shell/   (port 3001)    orchestrator — iframes the others. Has its own README.
│   │   ├── aqua-client/       (port 3002)    client portal — biggest app, 12 template modules
│   │   ├── aqua-crm/          (port 3003)    CRM — mostly stubbed, needs templates built
│   │   ├── aqua-operations/   (port 3004)    meta-ops hub
│   │   ├── aqua-ops-finance/  (port 3005)    Finance Hub — verified booting
│   │   ├── aqua-ops-people/   (port 3006)    People (HR) Hub
│   │   └── aqua-ops-revenue/  (port 3007)    Revenue Hub — most stubbed (Sales/Marketing widgets are placeholder fns)
│   ├── Bridge/                                shared workspace package @aqua/bridge
│   │   ├── README.md                          Bridge architecture doc
│   │   ├── concepts/                          ⚠️ reference patterns from older Vite prototype — NOT wired in yet
│   │   │   ├── README.md
│   │   │   ├── PageBuilder/                   drag-drop layout editor
│   │   │   ├── RoleBuilder/                   custom role CRUD
│   │   │   ├── AgencyConfigurator/            real-time agency identity editor
│   │   │   ├── collaboration/                 ProjectChat, Timeline, DesignConcepts, SyncCard
│   │   │   ├── DynamicRenderer/
│   │   │   ├── agencyConfig.reference.ts
│   │   │   └── templates.reference.ts
│   │   ├── config/                            ✨ NEW — APP_PORTS, ROLE_PRODUCT_MAP, BRIDGE_LS_KEYS, etc.
│   │   ├── auth/                              authenticate(email), DEMO_SESSION
│   │   ├── data/                              Prisma singleton, seed data
│   │   ├── api/                               BridgeAPI helpers
│   │   ├── events/                            BridgeEvents (typed event bus)
│   │   ├── registry/                          BridgeRegistry — suite + component registration
│   │   ├── sync/                              cross-app sync helpers
│   │   ├── ui/                                BridgeUIRegistry
│   │   ├── types/                             ALL shared types (single index.ts)
│   │   ├── postMessage.ts                     iframe ↔ host BridgeMessage protocol
│   │   └── index.ts                           barrel export — only entry point
│   ├── Templates/                             stub workspace package (currently no-ops)
│   ├── scripts/
│   │   ├── setup-db.sh                        runs prisma generate + db push for all 7 apps
│   │   ├── find_duplicate_keys.cjs            debug util for duplicate React keys
│   │   ├── refactor_registries.mjs
│   │   └── get_suite_ids.mjs
│   ├── dev-config.md                          original author's 84-section architecture doc — VITAL READ
│   └── NEXT_STEPS.md                          original author's deployment guide
│
└── extras/                                    supplementary reference versions
    ├── README.md
    ├── vite-prototype/                        older Vite + React monolithic prototype
    └── eds-old-portal-idea-fixed/             same prototype with bug fixes + 15 per-folder READMEs
    # (sort-out-version was here but is gitignored — just analysis scripts, no unique code)
```

---

## What's been done already

Done by the previous Claude session (current state of repo):

- ✅ **Consolidated 4 source folders** into one workspace (4.1 GB → 1.7 GB by stripping Payload internals)
- ✅ **Reused node_modules** from original (saved npm install time — but needs `npm install` re-run on a fresh clone)
- ✅ **Cherry-picked 7 reference patterns** from the older Vite prototype into `Bridge/concepts/` (PageBuilder, RoleBuilder, AgencyConfigurator, collaboration widgets, DynamicRenderer, agencyConfig + templates references)
- ✅ **Populated the empty `Bridge/config/`** with shared constants (APP_PORTS, ROLE_PRODUCT_MAP, BRIDGE_LS_KEYS, etc.) — exported from `Bridge/index.ts`
- ✅ **Verified host-shell (3001) and finance (3005) boot** — both serve HTTP 200
- ✅ **Initialized SQLite Prisma databases** for all 7 apps via `bash scripts/setup-db.sh`
- ✅ **Wrote 13 READMEs** across the codebase (top-level, Bridge, Bridge/concepts, Bridge/config, Templates, apps, + 1 per app)
- ✅ **Wrote `extras/README.md`** explaining what each extras folder is + the 15 bug fixes applied
- ✅ **Fixed `setup-db.sh`** which referenced a non-existent `(Live Application)` folder
- ✅ **Migrated to `serverExternalPackages`** (verified all 7 apps already use the modern pattern, not deprecated `experimental.serverComponentsExternalPackages`)

---

## Critical things to know

### Tech stack
- **Next.js 16.2.2** with Turbopack (dev mode confirmed working)
- **React 19** (per package.json)
- **TypeScript** — every app has `typescript.ignoreBuildErrors: true` in `next.config.mjs` because of known type drift, especially in Finance/People widgets vs Bridge canonical types
- **Prisma + SQLite** for local dev (PostgreSQL is the production target — see polish list)
- **npm workspaces** — `apps/*`, `Bridge`, `Templates` are workspace members
- **No Payload CMS** — was removed by user request. Each app's `next.config.mjs` still has `import { withPayload } from '@payloadcms/next/withPayload'` and `export default withPayload(nextConfig)`. The package IS in node_modules. If you boot, it works because `withPayload` doesn't care if the actual CMS routes are missing — it just adds Next config wrappers. **Do not remove withPayload** — it doesn't hurt.

### How the apps communicate
- **Iframes + postMessage**. Host shell (3001) embeds the other 6 via `<iframe src="http://localhost:300X/embed/[viewId]">`.
- Auth/theme/navigation flows through the typed `BridgeMessage` protocol in `Bridge/postMessage.ts`.
- Every app imports from `@aqua/bridge` (the workspace package).
- See `Bridge/README.md` for the full pattern.

### The marketplace
- **`HostTemplateHubView.tsx`** at `apps/aqua-host-shell/HostShell/components/TemplateHub/` is the de facto marketplace UI — it's actually pretty complete (search, filter by category, toggle on/off, "System Linked" / "Operational" status, preset buttons).
- **What's missing for production:**
  1. **DB persistence** — toggles only update React state, not the `AgencySuite` Prisma table. `PLAN.md` task #1.
  2. **Sidebar nav item** — TemplateHub isn't reachable from the sidebar. Needs adding to `HostShell/Sidebar/HostSidebarLogic.ts`. `PLAN.md` task #2.
  3. **Suite descriptions** — current cards show name/section/status, no long-form info.
  4. **Role-based visibility** — currently shows all suites to all roles.
  5. **Audit logging** — toggle actions aren't shown in activity stream.

### Known broken / stub stuff
**This list is the polish backlog (also in `main-monorepo/PLAN.md`):**

1. **RevenueShell stub widgets** — `apps/aqua-ops-revenue/RevenueShell/RevenueTemplates/SalesSuite/` and `MarketingSuite/` widgets are placeholder functions. ~13 widgets need real implementations.
2. **CRM templates** — `apps/aqua-crm/CRMShell/CRMTemplates/` only has `Leads/` populated. Needs Pipeline, Deals, Contacts, Activities, Reports.
3. **`useClientLogicStub()` etc.** in `apps/aqua-client/ClientShell/logic/useClientLogic.ts` lines 7-19 — empty handler stubs.
4. **`ClientSettingsPlaceholder.tsx`** — 6 placeholder views.
5. **`RevenueSettingsPlaceholder.tsx`** — 6 placeholder views.
6. **Templates/ workspace package** is a stub (currently no-op `register*App()` functions).
7. **Bridge Prisma schema** uses SQLite — production target is PostgreSQL.
8. **typescript.ignoreBuildErrors: true** in all 7 apps — Finance/People have known type drift vs Bridge.
9. **AIChatbot widgets** are shells — no LLM integration.

### How to run

```bash
cd main-monorepo
npm install                    # one-time on fresh clone
bash scripts/setup-db.sh       # initialize SQLite DBs (dev only)
npm run dev                    # http://localhost:3000 — single port, plugin model
```

Login flow: pick `demo@aqua.portal` for the no-DB shortcut (returns `Bridge/auth/DEMO_SESSION`).

**Legacy multi-port mode** (only if needed for debugging a sub-app in isolation):

```bash
npm run dev:legacy:all         # boots all 7 on ports 3001-3007 + iframe topology
# or per-app: dev:legacy:host, dev:legacy:client, dev:legacy:crm, dev:legacy:operations,
#             dev:legacy:finance, dev:legacy:people, dev:legacy:revenue
```

To re-enable iframes inside the host shell during legacy mode, also set `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1`.

---

## What's NEXT (priority order)

Read `main-monorepo/PLAN.md` for the full plan. Top items:

1. **Wire marketplace to sidebar** — add a `Marketplace` nav item in `HostShell/Sidebar/HostSidebarLogic.ts` that navigates to TemplateHub
2. **Add DB persistence to TemplateHub toggles** — when user toggles a suite, write to `AgencySuite.enabled` via a new Bridge API endpoint
3. **Implement Revenue Hub Sales widgets** — SalesHubOverview, SalesPipelineView, SalesCalendarView, CrmInboxWidget, ProposalsWidget, LeadTimelineWidget (~6 components)
4. **Implement Revenue Hub Marketing widgets** — 7 placeholder widgets
5. **Build out CRM templates** — Pipeline (kanban), Deals, Contacts, Activities, Reports
6. **Replace `RevenueSettingsPlaceholder.tsx` 6 stubs** — `Bridge/concepts/AgencyConfigurator/` has a real implementation that can be ported
7. **Fix `useClientLogicStub()` empty handlers** — implement real logic for stage update, edit client, resource upload, settings, user add/remove
8. **Resolve type drift in Finance/People** — then remove `typescript.ignoreBuildErrors: true`

---

## How to verify a change works

For each change you make:

1. Run TypeScript check on the affected app: `cd apps/aqua-X && npx tsc --noEmit` (acknowledge: ignoreBuildErrors is currently on, so this will surface a lot — focus on errors in YOUR changed file first)
2. Boot the app: `npm run dev:X` (from `main-monorepo/`)
3. Curl-verify: `curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:300X/`
4. If it's a UI change in the host shell, also try via host iframe: `curl http://localhost:3001/` and look for the change

---

## Repo conventions

- **Per-folder READMEs** — keep them up to date when you add/change files
- **`extras/`** is reference-only — don't import from there into `main-monorepo/`. Cherry-picks go through `Bridge/concepts/` first.
- **Path aliases** — each app has `@{App}Shell/*` (e.g. `@FinanceShell/bridge/FinanceContext`)
- **Naming** — files inside a shell are prefixed with the app name (`FinanceApp.tsx`, `FinanceSidebar.tsx`)
- **Hooks** — `use{App}{Feature}Logic` pattern
- **`Bridge/concepts/`** — reference implementations from the older Vite prototype. Use them as patterns; don't import from them at runtime (the runtime is different — Vite+context vs Next.js+iframe+Bridge package)

---

## How to commit

```bash
git add -A
git commit -m "Brief description

Longer body if needed.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Don't push without confirming with Ed first.

---

## If something boots blank

Pattern from earlier debugging sessions:

1. Check Vite/Next dev server output for compile errors (`tail -50` of the dev server output)
2. Inject an early error capture into `index.html` or wrap with try/catch to see what's throwing
3. Common culprit: a top-level module evaluation imports something that depends on `componentMap` or similar (circular dep). Fix by deferring the import inside a function.
4. Another common one: lucide icon imports with wrong casing (`briefCase` instead of `Briefcase`) — silently breaks the whole React tree mount.

---

## When stuck

- Read `main-monorepo/dev-config.md` — the original author left 84 sections of architecture notes that explain WHY things are the way they are
- Read `main-monorepo/Bridge/README.md` for the cross-app glue patterns
- Read `main-monorepo/Bridge/concepts/README.md` for productionization recipes for the cherry-picked patterns
- Read the per-app README for the specific app you're changing
- The PROGRESS.md log captures every prior session's work — append to it, don't overwrite

Good luck. The codebase is in better shape than it looks; most of what's "broken" is just stub functions waiting for real implementations.
