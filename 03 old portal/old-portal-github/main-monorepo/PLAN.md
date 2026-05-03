# PLAN.md — Remaining work for the AQUA Portal monorepo

> **Repo-status note (2026-05-03):** This monorepo is now archived at `old-portal-github/main-monorepo/`. Path references in this file are relative to that directory. The plan below describes work the *next-generation* portal could pick up if it wants to port the same surface area forward — none of these tasks block the archive itself.

> **What's done (sessions 1–4):** Phase 9 single-domain plugin model · per-suite localStorage stores w/ full CRUD across CRM (5 views) + Finance + People + Revenue + Operations · unified UI kit at `Bridge/ui/kit.tsx` · 6 views redesigned w/ the kit · all 7 apps tsc-clean.
>
> **What's done (sessions 5a–5j, all merged in PR #6 → main commit `0828114`):** Inner content (5 portal phase dashboards + ClientSharedWidgets), the marketplace, CRM Lead Management, Revenue Analytics, all 6 Marketing widgets, the 8 canonical Client portal views, the 5 phase subviews, host renderer + boot screen + iframe loading, plus 4 new shared kit modules (`Bridge/ui/AppSidebar.tsx`, `AppMarketplace.tsx`, `AppSettings.tsx`, `DashboardWidget.tsx`) that collapse 25+ near-duplicate per-app files into thin adapters / re-exports. Net delta in PR #6: **−14k LOC** (+6.7k / −20.8k across 241 files, 13 commits squashed). 8 dead-code duplicate `ClientTemplates/Client*/` folders + 7 per-app `components/ui/` directories removed.
>
> **What's done (PR #7 → main commit `ddd5c90`):** P3-1 — Aqua AI chat panel (Claude Opus 4.7 with adaptive thinking, prompt-cached system prompt, SSE streaming via `/api/ai/chat`); P3-4 — ESLint cleanup, 242 → 183 warnings.
>
> **What's done (PR #8 → main commit `a275855`):** P3-5 — production CSP headers + security baseline (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy with FLoC opt-out, X-DNS-Prefetch-Control, prod-only HSTS).
>
> **What's done (PR #9 → main commit `dae63ac`):** Repo restructure — every file moved into `old-portal-github/` to clear the root for the next-generation portal build.

---

## Priority order

### 🔴 P0 — Polish the visible chrome (every view inherits this)  ✅ done in session 5

**P0-1: Redesign the host sidebar with the kit**  ✅ done
- Files updated: `apps/aqua-host-shell/HostShell/Sidebar/HostSidebarContent.tsx` + `components/HostSidebarItem.tsx` + `components/HostSearch.tsx`
- Compact 268/76 widths, kit-aligned typography, indigo-free accent strip on active item, shared `IconButton` for quick actions, `bg-[#0e0e10]` user-dropdown popover.

**P0-2: Redesign the host topbar with the kit**  ✅ done
- File updated: `apps/aqua-host-shell/HostShell/TopBar/HostTopBar.tsx`
- Compact h-14 bar matching `Page` from kit, dot-pill for Demo/Live mode, shared `IconButton` for quick actions, kit-aligned avatar dropdown.

**P0-3: Migrate remaining CRM views to the kit**  ✅ done
- Activities (`apps/aqua-crm/CRMShell/CRMTemplates/Activities/ActivitiesView.tsx`) — kit Page/PageHeader/Card/EmptyState/Modal/Field/Avatar; type-tinted icon rings; lucide `Activity` empty state.
- Reports (`apps/aqua-crm/CRMShell/CRMTemplates/Reports/ReportsView.tsx`) — kit Page/PageHeader/Card; `ChartCard` subcomponent wrapping recharts; indigo/sky chart palette.

### 🟠 P1 — Migrate other suite views to the kit

**P1-1: Marketing CampaignList polish**  ✅ done in session 5b
- Full kit migration — Page/PageHeader/Card/Modal/Field/Input/Select/Badge/EmptyState. Sortable table styled w/ kit tokens.

**P1-2: Sales widgets visual pass**  ✅ done in session 5b
- All six Sales widgets migrated to kit primitives (`SalesHubOverview`, `SalesPipelineView`, `SalesCalendarView`, `ProposalsWidget`, `LeadTimelineWidget`, `CrmInboxWidget`).
- Owner avatars switched to kit `Avatar` (deterministic gradient by name), stage badges to kit `Badge`, KPI strip to indigo accents matching CRM Reports.

**P1-3: Client portal subviews**  ✅ done in sessions 5c + 5d
- Six canonical views migrated in 5c (`ClientPortalView`, `ClientDashboardView`, `ClientResourcesView`, `ClientAgencyClientsView`, `ClientPhasesHubView`, `ClientWebStudioView`).
- Five lifecycle phase views migrated in 5d (`Discovery`, `Design`, `Development`, `Onboarding`, `LiveOps`).
- Skipped: `ClientManagementView` and `ClientFulfillmentView` — both <30-line wrappers, no chrome to migrate.

**P1-4 (was P1-3): Client portal subviews (legacy notes)**
- Folders: `apps/aqua-client/ClientShell/ClientTemplates/{ClientDashboard, ClientResources, AgencyClients, Fulfillment, PortalView, WebStudio, PhasesHub, ClientManagement}`
- Each has a main `*View.tsx`. Copy the kit pattern.
- `ClientPortalView.tsx` Bell + Settings buttons are already wired — just restyle.

**P1-4: People + Finance — already redesigned, no action.**

### 🟡 P2 — Persistence + integration

**P2-1: Migrate suite stores from localStorage to `/api/sync`**
- Files: `apps/aqua-{crm,ops-finance,ops-people,ops-revenue}/.../store/*Store.ts`
- Pattern: keep `useSyncExternalStore`. Replace `loadFromStorage` with a `fetch('/api/bridge/state?agencyId=X')` call on first subscribe. Replace `saveToStorage` with a debounced POST to `/api/sync`.
- Server side: extend `/api/sync` to accept slice keys (`crm`, `finance`, etc.) and persist to `ApplicationState` table.

**P2-2: Postgres for production**
- `Bridge/data/schema.prisma` is currently `provider = "sqlite"`.
- Action: change to `postgresql` (production target). Each sub-app's `prisma/schema.prisma` likewise.
- Add `migrations/` dir under each Prisma schema and create initial migration.
- Set `DATABASE_URL` in Vercel project env to a managed Postgres (Vercel Postgres / Neon / Supabase).
- The demo-mode fallbacks in `/api/bridge/state` and `/api/sync` will silently no-op when the DB is unavailable — that's how local dev keeps working.

**P2-3: Lift `typescript.ignoreBuildErrors` from host's `next.config.mjs`**
- Currently set to `true` because cross-tsconfig type-checks across sub-app boundaries are infeasible.
- Real fix: unify all sub-app tsconfigs into one project graph using TypeScript project references (`tsconfig.references`). Big refactor.
- Pragmatic fix: keep flag, document why. Per-app `npm run typecheck` already runs in CI to enforce types within each app.

### 🟢 P3 — Feature buildout

**P3-1: AIChatbot LLM wiring**
- The Anthropic SDK is in node_modules (it's in deps somewhere). Endpoints not yet built.
- Add `/api/ai/chat` route in host shell that streams Claude responses.
- Add a chat panel component using kit's Card + Input + Avatar.

**P3-2: Replace `Bridge/concepts/AgencyConfigurator/` placeholder views**
- Currently 6 placeholder Settings views (Revenue settings, Client settings) — `Bridge/concepts/AgencyConfigurator/` has a real implementation that can be ported.

**P3-3: Templates/ workspace package no-op stubs**
- `main-monorepo/Templates/index.ts` has empty stub `register*App()` functions. They're shadowed by the real ones in each sub-app's `*Templates/*index.ts`. Either delete `Templates/` workspace or wire real registrations.

**P3-4: 854 ESLint warnings (mostly unused imports)**
- `npm run lint` from `main-monorepo` shows ~854 warnings across the 7 apps.
- Run `eslint --fix` to auto-fix most. Manual review for the rest.

**P3-5: Production CSP headers**
- `apps/aqua-host-shell/next.config.mjs` currently has `frame-ancestors 'self'`. For production, add a strict CSP that whitelists known origins (Vercel Analytics, Stripe iframes, etc).

### 🔵 P4 — Cleanups

**P4-1: Delete legacy sub-app `app/`, `payload/`, `prisma/` directories**
- Once Phase 9 plugin model is fully verified end-to-end, the per-app Next.js routes (`apps/aqua-X/app/`) and per-app Payload configs are dead code.
- The sub-app `*Shell/*Templates/` source trees stay as plugin code.
- Pre-conditions: PR #5 merged, deploy verified, all suites rendering correctly via plugin model.

**P4-2: Delete `HELLO-ED.md` from repo root** (merge-verification marker, no longer useful)

**P4-3: Suite descriptions on marketplace cards**
- File: `apps/aqua-host-shell/HostShell/components/TemplateHub/HostTemplateHubView.tsx`
- The `description` field exists on `SuiteTemplate` and is populated for every suite, but cards don't render it.
- Add a description line under the suite name on each card.

---

## Out of scope (do not attempt)

- Payload CMS internals — user excluded these. `payload.config.ts` and `payload-types.ts` are kept as concept references for the user's own custom CMS.
- Website editor — explicitly skipped.
- Bespoke per-view designs — the kit is the design system; further differentiation can come later.

---

## Quickstart for the next session

```bash
# 1. Sync
git fetch origin
git checkout claude/skip-client-plugin-discovery-fix   # if PR #5 still open
# OR: git checkout -b claude/<new-task-name> origin/main  # if #5 merged

# 2. Install + bring up dev
cd main-monorepo
npm install
bash scripts/setup-db.sh
npm run dev          # http://localhost:3000 — single port, plugin model

# 3. Verify
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/    # → HTTP 200
npm run typecheck    # all 7 apps should pass
```

Login: pick `demo@aqua.portal` for the no-DB shortcut.
