# PHASES.md — Execution plan for Aqua Portal v9

> **Living document.** Marks what's done, what's queued, file paths, success criteria.
> Companion to `PROGRESS.md` (commit log), `TESTING.md` (test strategy), `SETUP.md` (fresh-clone bootstrap), `SESSION_HANDOFF.md` (boot guide for the next Claude session).
>
> **Current state (2026-05-02):** All 7 apps boot HTTP 200, typecheck cleanly, lint cleanly, build cleanly. Bridge has 37 passing unit tests. CI runs on every PR. The Bridge marketplace, dynamic plugin sidebar, CRM templates, Revenue Sales/Marketing widgets, Settings views, and the four `useClientLogicStub` handlers are all real. Phases 6 + 7 (AI integration + production prep) are queued.

---

## Phase 1 — Marketplace becomes a real feature ✅ DONE (commit `a1eae9c`)

**Why first:** the marketplace IS the product story. Today it exists as a component (`HostTemplateHubView.tsx`) and now also reaches users via the host-shell sidebar.

| Sub-phase | Status | File |
| --- | --- | --- |
| **P1.1** Add `Marketplace` nav item to host-shell sidebar | ✅ | `apps/aqua-host-shell/HostShell/Sidebar/HostSidebarLogic.ts` |
| **P1.2** Wire `marketplace` view ID to render `HostTemplateHubView` | ✅ | `apps/aqua-host-shell/HostShell/Renderer/HostDynamicViewRenderer.tsx` (new `LOCAL_HOST_VIEWS` map) |
| **P1.3** Add `description?: string` to `SuiteTemplate` + render on cards | ✅ | `Bridge/types/index.ts`, `apps/aqua-host-shell/HostShell/components/TemplateHub/HostTemplateHubView.tsx` |
| **P1.4** DB persistence for toggle (POST → upsert `AgencySuite`) | ✅ | `apps/aqua-host-shell/app/api/bridge/state/route.ts` |

**Success:** ✅ User opens `localhost:3001`, logs in as `demo@aqua.portal`, clicks "Marketplace" in sidebar, sees the suite cards, toggles one, refreshes → toggle persists.

---

## Phase 2 — CRM becomes usable (5 templates) ✅ DONE (commit `a1eae9c`)

5 new template modules under `apps/aqua-crm/CRMShell/CRMTemplates/`:

| Template | Status | Files (~lines) | View ID |
| --- | --- | --- | --- |
| **P2.1** `Pipeline/` — kanban board (Lead → Qualified → Proposal → Negotiation → Closed Won/Lost) | ✅ | 6 / ~600 lines | `crm-pipeline` |
| **P2.2** `Deals/` — sortable table + side panel (filter pills, animated detail) | ✅ | 6 / ~930 lines | `crm-deals` |
| **P2.3** `Contacts/` — directory + profile panel (15 cards, multi-field search) | ✅ | 6 / ~670 lines | `crm-contacts` |
| **P2.4** `Activities/` — vertical timeline (17 entries, type filter) | ✅ | 6 / ~460 lines | `crm-activities` |
| **P2.5** `Reports/` — KPI grid + recharts BarChart + LineChart | ✅ | 6 / ~350 lines | `crm-reports` |
| Wiring: `registerCrmApp()` called from `CRMApp.tsx` init | ✅ | `apps/aqua-crm/CRMShell/CRMTemplates/CRMindex.ts`, `CRMApp.tsx` |  |

Each follows the 4-file mini-registry pattern (`*View.tsx`, `*View.ui.ts`, `registry.tsx`, `index.ts` + `logic/use*Logic.ts` + `logic/mockData.ts`).

**Success:** ✅ Boot `aqua-crm` (port 3003), navigate to each template via sidebar, see polished UI rendering mock data.

---

## Phase 3 — Revenue Hub Sales + Marketing widgets ✅ DONE (commit `a1eae9c`)

### P3.1 — SalesSuite (6 widgets)

`apps/aqua-ops-revenue/RevenueShell/RevenueTemplates/SalesSuite/`:

| Widget | View ID | What it does |
| --- | --- | --- |
| `SalesHubOverview` | `sales-hub-overview` | KPI grid + recharts sparklines + 10-event activity feed |
| `SalesPipelineView` | `sales-pipeline` | 6-column kanban with 12 deals (agency-internal sales pipeline) |
| `SalesCalendarView` | `sales-calendar` | Month/week toggle, today highlighted, day-cell deal-count badges |
| `CrmInboxWidget` | `crm-inbox` | 20-lead inbox with source icons + assign-to-rep dropdown |
| `ProposalsWidget` | `proposals` | 3-column board (Drafted / Sent / Accepted) with totals |
| `LeadTimelineWidget` | `lead-timeline` | Per-lead activity feed with type icons |

### P3.2 — MarketingSuite (7 widgets)

`apps/aqua-ops-revenue/RevenueShell/RevenueTemplates/MarketingSuite/`:

| Widget | View ID | What it does |
| --- | --- | --- |
| `MarketingOverview` | `marketing-overview` | 4 KPI cards + recharts AreaChart sparkline |
| `CampaignList` | `campaigns` | Sortable table (8 campaigns) with status pill |
| `ContentCalendar` | `content-calendar` | Month grid with color-coded content type dots |
| `LeadFunnel` | `lead-funnel` | Custom funnel bars (Visitors → Customers) |
| `ChannelPerformance` | `channel-performance` | recharts BarChart with metric toggle |
| `EmailMetrics` | `email-metrics` | KPI cards + 6-month trend line chart |
| `SocialEngagement` | `social-engagement` | Per-platform cards (IG/LinkedIn/Twitter/TikTok) |

Wiring: `registerRevenueApp()` (`RevenueTemplates/Revenueindex.ts`) called from `RevenueApp.tsx` init.

**Success:** ✅ Boot `aqua-ops-revenue` (port 3007), navigate each sub-view, see populated dashboards with realistic mock data.

---

## Phase 4 — Settings placeholders → real Agency Configurator views ✅ DONE (commit `a1eae9c`)

Replaced the 6 placeholder views in each of the 7 apps' `<App>SettingsPlaceholder.tsx`:

- **`AgencyConfiguratorView`** — theme + identity form (agency name, logo URL, primary/secondary color pickers)
- **`GlobalSettingsView`** — toggles for email digest, browser notifications, audit log, 2FA, automatic backup
- **`IntegrationsView`** — 5 integration cards (Slack, GitHub, Stripe, Google Calendar, Gmail) with connect/disconnect
- **`AgencyBuilderView`** — white-label settings (hide AQUA branding, custom domain, hide footer)
- **`AllUsersView`** — searchable member directory with role pills + invite button
- **`DashboardView`** — 8-card settings landing page

Same code in all 7 apps with CSS-var prefix swapped per app (`--host-widget-` / `--client-widget-` / `--crm-widget-` / `--opshub-widget-` / `--finance-widget-` / `--people-widget-` / `--revenue-widget-`).

**Success:** ✅ Click any sidebar Settings item in any app → see a real working settings UI (not "Coming Soon" placeholder).

---

## Phase 5 — Wire `useClientLogicStub` family of empty handlers ✅ DONE (this commit)

**Why:** The host shell's `useHostLogic` and `aqua-client`'s `useClientLogic` import 4 stub hooks that returned no-op handler functions — silently dropping client-management actions.

Replaced in `apps/aqua-client/ClientShell/logic/ClientuseClientLogic.ts` (lines 7-19):

| Hook | What it now does |
| --- | --- |
| `useClientLogicStub` | `handleUpdateClientStage` updates `client.stage` via `setClients`. `handleEditClient` shallow-merges patch onto client. `handleUploadClientResource` appends to `client.resources` with timestamp + auto-id. `handleUpdateClientSettings` shallow-merges onto `client.settings`. `handleAddClientUser` / `handleRemoveClientUser` mutate `client.assignedEmployees`. Each emits an addLog entry. |
| `useDesignLogicStub` | `handleSaveLayout` / `handleDeleteLayout` / `handleSaveCustomPage` log via addLog (layout state is owned by suite contexts elsewhere; logging is the audit trail). |
| `useSetupLogicStub` | `handleCompleteSetup` advances `step` to `'login'` + logs. |
| `useUserLogicStub` | `handleDeleteUser` filters the user out of `users` via `setUsers` + logs. |

The auto-save useEffect (`savePersistedState` deps in `useClientLogic`) catches the `setClients`/`setUsers` changes and persists them to `localStorage` automatically. **No new API endpoints** were added in Phase 5 — that's Phase 5b below.

**Success:** ✅ tsc clean, app builds, boot the client app, click "Update stage" on a client → state updates → reload still shows the new stage.

### Phase 5b (queued) — wire `BridgeAPI` persistence

The local-state path is now real. Next step: extend `BridgeAPI` (`apps/aqua-client/ClientShell/bridge/Clientapi.ts`) with:
- `BridgeAPI.updateClient(clientId, patch)` → PATCH `/api/bridge/state`
- `BridgeAPI.uploadResource(clientId, file)` → POST `/api/bridge/state` (or new `/api/clients/[id]/resources/route.ts`)
- `BridgeAPI.inviteUser({ email, role, clientId? })` → POST `/api/bridge/users`
- `BridgeAPI.removeUser(userId)` → DELETE `/api/bridge/users/[id]`

Then call them from the handlers in this file. The Prisma schema already has the `Client.resources`, `User`, `Agency` models — no schema changes needed.

---

## Phase 6 — AI integration ⏳ QUEUED

**Why:** Every app has an `AIChatbot` widget shell. None talks to an LLM today.

| Task | File | Notes |
| --- | --- | --- |
| Add Anthropic SDK | root `package.json` | `npm install --save @anthropic-ai/sdk` |
| Create `app/api/chat/route.ts` per app | 7 new files | POST `{messages, systemPromptHint?}` → streams Claude Sonnet 4.6 response |
| Each app's AIChatbot widget POSTs to its own `/api/chat` | `apps/<app>/<App>Shell/widgets/AIChatbot/` | (folder doesn't exist yet — create) |
| Per-app system prompt scoped to its domain | `app/api/chat/route.ts` | e.g. Revenue: "You are a sales operations assistant for an agency." |
| Env var: `ANTHROPIC_API_KEY` | `.env.local` | + document in `SETUP.md` |

**Recommended model:** `claude-sonnet-4-6` (fast, cost-effective for chat). For more complex reasoning add `claude-opus-4-7` as an opt-in.

**Success:** Open any app, click AIChatbot, type, get a real LLM-generated response.

---

## Phase 7 — Production-readiness ⏳ QUEUED

| Task | File | Notes |
| --- | --- | --- |
| **P7.1** Switch all 7 schemas to PostgreSQL provider | `apps/<app>/prisma/schema.prisma` | `provider = "postgresql"`. Consider single-DB vs per-app Postgres. |
| **P7.2** Add migrations directory per app | `apps/<app>/prisma/migrations/` | `npx prisma migrate dev --name init` (per app) |
| **P7.3** Production CSP `frame-ancestors` | each `next.config.mjs` `headers()` | replace `localhost:300X` with env-driven `process.env.NEXT_PUBLIC_*_URL` |
| **P7.4** Production `ALLOWED_ORIGINS` | `Bridge/postMessage.ts` | read from `process.env.ALLOWED_BRIDGE_ORIGINS` (comma-split) |
| **P7.5** Document env-var matrix | update `NEXT_STEPS.md` | one table for dev / staging / prod |
| **P7.6** TESTING T1/T2/T3 | new `*.test.ts` files | Per-app boot smoke (T1), Marketplace integration (T2), Playwright cross-iframe E2E (T3). T0 + T4 already done. |

---

## Phase 8 — Plugin model ✅ DONE (commits `01718c6` + `1241fbc`)

| Sub-phase | Status | What |
| --- | --- | --- |
| **P8.1** `SuiteTemplate.configSchema`, `category`, `pricing`, `requiredPermissions`, lifecycle hooks | ✅ | `Bridge/types/index.ts` |
| **P8.2** `AgencySuite.config: String` + `installedAt` + `updatedAt` | ✅ | All 7 prisma schemas (synced for shared client gen) |
| **P8.3** Dynamic sidebar — sub-app sidebars derive from `BridgeRegistry.getSuites()` filtered by `enabledSuiteIds` | ✅ | 6 `<App>SidebarLogic.ts` files |
| **P8.4** Marketplace v2 — install/configure/uninstall, category filter, config drawer | ✅ | `HostTemplateHubView.tsx` |
| **P8.5** API extension — `/api/bridge/state` POST accepts `config` field | ✅ | `apps/aqua-host-shell/app/api/bridge/state/route.ts` |
| **P8.6** Lifecycle hooks fire client-side around install/configure/uninstall | ✅ | Marketplace component try/catch wraps each hook |
| **P8.7** Enrich existing registries with category/description/configSchema | ✅ | 7 registries in CRM + Revenue |

**Success:** ✅ Open the marketplace, browse plugins, install one, open its config drawer, save settings, see the plugin appear in the sub-app sidebar after enabling. (Manual verification by user; automated test is queued as TESTING T2.)

---

## Phase 9 — Plugin authoring contract (deferred polish) ⏳ QUEUED

Stretch goal from the plugin discussion. Not needed for "lift off" but useful long-term:

| Task | Notes |
| --- | --- |
| **P9.1** Plugin manifest discovery | `import.meta.glob('/plugins/*/manifest.ts')` → no app-code change to add a plugin |
| **P9.2** Plugin scoped storage | Per-plugin `localStorage` namespace + per-plugin Prisma table OR JSON column |
| **P9.3** Plugin sandboxing (untrusted plugins) | Optional iframe wrapper for 3rd-party plugins |
| **P9.4** Plugin permission gate | `requiredPermissions` enforced both in marketplace + in render path |
| **P9.5** Plugin marketplace API | Browse / install plugins from a registry server |

---

## Verification commands

After any phase work, run these from `main-monorepo/`:

```bash
# Type-check all 7 apps in parallel (~30s)
npm run typecheck

# ESLint all 7 apps (~30s)
npm run lint

# Bridge unit tests (~3s, 37 tests)
npm test

# Boot dev server for a specific app
npm run dev:host        # 3001 — orchestrator
npm run dev:client      # 3002
npm run dev:crm         # 3003
npm run dev:operations  # 3004
npm run dev:finance     # 3005
npm run dev:people      # 3006
npm run dev:revenue     # 3007

# Production build (per app)
npm run build --workspace=aqua-host-shell

# Re-initialize Prisma after schema changes
bash scripts/setup-db.sh
```

CI (`.github/workflows/ci.yml`) runs all of the above on every PR.

---

## File-tree quick reference

```
main-monorepo/
├── PHASES.md              ← this doc (the plan)
├── PROGRESS.md            ← chronological commit log
├── TESTING.md             ← Vitest + CI strategy
├── SETUP.md               ← fresh-clone bootstrap
├── NEXT_STEPS.md          ← production deployment guide
├── SESSION_HANDOFF.md     ← boot guide for the next Claude session
├── CLAUDE.md (repo root)  ← context for future Claude sessions
├── PLAN.md                ← original P0-P3 backlog (still useful for some items)
├── eslint.config.mjs      ← flat config, repo-wide
├── apps/
│   ├── aqua-host-shell/   ← 3001 — orchestrator + marketplace
│   ├── aqua-client/       ← 3002 — biggest sub-app
│   ├── aqua-crm/          ← 3003 — Pipeline / Deals / Contacts / Activities / Reports / Leads
│   ├── aqua-operations/   ← 3004 — meta-ops landing
│   ├── aqua-ops-finance/  ← 3005 — Finance hub
│   ├── aqua-ops-people/   ← 3006 — People (HR) hub
│   └── aqua-ops-revenue/  ← 3007 — Revenue (SalesSuite + MarketingSuite + Analytics)
├── Bridge/                ← @aqua/bridge — types, auth, registry, postMessage, events
│   ├── types/index.ts     ← canonical SuiteTemplate, AppUser, BridgeSession, etc.
│   ├── registry/          ← BridgeRegistry (registerSuite, registerAll, resolve)
│   ├── ui/                ← BridgeUIRegistry (UIViewConfig, plugin token store)
│   ├── auth/              ← authenticate(), DEMO_SESSION
│   ├── events/            ← BridgeEvents (typed event bus)
│   ├── postMessage.ts     ← BridgeMessage protocol (7-app source union)
│   └── concepts/          ← reference patterns from older Vite prototype (unwired)
└── Templates/             ← @aqua/templates (currently a stub)
```
