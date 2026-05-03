# Old portal — sub-apps (`03 old portal/.../main-monorepo/apps/`)

The 6 business sub-apps. Each registers into `BridgeRegistry` at boot. Most
have full kit UI but **shallow business logic** — only Leads (CRM), Dashboard
(Finance), HR (People), and the Client Portal templates are actually wired
to real state.

> Source: agent 6 sweep.

## aqua-client — Client portal

**Templates** in `ClientShell/ClientTemplates/`:

| template | file | what it renders | status |
|----------|------|-----------------|--------|
| **PortalView** | `PortalView/ClientPortalView.tsx` | Main client workspace entry point | UI complete, data model intact |
| **ClientDashboard** | `ClientDashboard/ClientDashboardView.tsx` | 5 lifecycle phase subviews (Discovery, Design, Development, Onboarding, LiveOps). Task progress (Done/In Progress/Review/To Do), open tickets, resources, engagement %. KPI cards w/ sparklines | **WORKING** — `useClientDashboardLogic()` pulls real task data from store |
| **ClientManagement** | `ClientManagement/ClientManagementView.tsx` | CRUD for active clients (list, search, filters, bulk actions). Stage / owner / team size / status | UI complete; handlers stubbed |
| **Fulfillment** | `Fulfillment/ClientFulfillmentView.tsx` | Briefs → Deliverables pipeline. `FulfilmentBrief` status (brief / in-progress / review / approved / revision / complete) and linked `FulfilmentDeliverable` items | UI present; no state persistence wired |
| **AgencyClients** | `AgencyClients/ClientAgencyClientsView.tsx` | Internal-staff list of every client under the agency. Filters, sort, cards | UI scaffolded, mock data |
| **ClientResources** | `ClientResources/ClientResourcesView.tsx` | File/link hub per client (document/image/video/zip/link) | UI stub |
| **WebStudio** | `WebStudio/ClientWebStudioView.tsx` | Website editor (GitHub-backed CMS provisioning) | Stub |
| **PhasesHub** | `PhasesHub/ClientPhasesHubView.tsx` | Timeline view of client lifecycle (Discovery → Design → Dev → Onboarding → Live → Churn). Phase duration, checkpoints, deliverables | UI scaffold only |

**Data model + persistence**:
- `ClientShell/hooks/ClientuseSyncStore.ts` + context providers
- Models: `Client`, `ClientResource`, `FulfilmentBrief`, `FulfilmentDeliverable`
- Persistence via `useSyncExternalStore` + localStorage fallback. No DB sync yet; all mutations local.

**Stubbed**:
- `ClientuseClientLogic.ts` lines 8-32: handlers exist but only log + setState (no `BridgeAPI` calls)
- ClientResources upload handler not wired
- WebStudio GitHub CMS not implemented
- PhasesHub stage transition logic not implemented

## aqua-crm — CRM

**Templates** in `CRMShell/CRMTemplates/`:

| template | status | notes |
|----------|--------|-------|
| **Leads** | **WORKING** | Wired to `useCRMLeadLogic()`. Active growth pipeline, conversion velocity (4.2 days), 12 active hot pipelines, efficiency 94.8%. Search + filter UI. Real `crmStore.ts` data. |
| **Pipeline** | STUB | Kanban UI present, no deal-state management |
| **Contacts** | STUB | UI scaffold only |
| **Deals** | STUB | UI scaffold only |
| **Activities** | STUB | UI scaffold only |
| **Reports** | STUB | UI scaffold only |

**Data model — `crmStore.ts` (lines 1-291)**: full, well-designed store with CRUD.

```ts
DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'
CRMActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

CRMContact { id, name, title, email, phone, company, notes?, createdAt }
CRMDeal { id, name, company, contactId?, value, probability, stage, owner, expectedClose, tags[], notes?, createdAt, updatedAt }
CRMActivity { id, type, summary, details?, dealId?, contactId?, actor, timestamp }
CRMOwner { id, name, initials, color }
```

Persistence: module-level state with subscription pattern (Zustand-lite).
localStorage key `aqua:crm-store`. Seed: 8 contacts, 12 deals, 7 activities.
Full CRUD: `createDeal`, `updateDeal`, `setDealStage`, `deleteDeal`, ...
`useCRMStore<T>(selector)` hook for React subscriptions.

**Worth porting forward**: `crmStore.ts` is a **gold standard** for state-management
patterns even outside CRM (clean subscription model, simple persistence).

## aqua-ops-finance — Finance Hub

**Single template**: `FinanceShell/FinanceTemplates/Dashboard/FinanceDashboardView.tsx`.

Renders:
- 4 KPI cards (total revenue, pending, processed, failed)
- Recent transactions table (12 mock rows: Settlement / Credit / Payment / Payout / Fee)
- Upcoming payouts (12 partner records with split %, payout date)
- New-transaction modal (description, type, amount, status, date, partnerId)
- Splits-review modal (per-partner split % edit)
- Statements modal ("view all statements" — no backend)

**`financeStore.ts`**:
```ts
Transaction { id, date, description, type, amount, status, partnerId? }
Partner { id, name, splitPercent }
FinanceStatistics { totalRevenue, pending, processed, failed }
```
Seed: 12 transactions, 3 partners (splits sum to 100%).

**Missing**:
- No invoice CRUD model or UI
- No expense tracking
- No reconciliation / statement matching
- No bank integration
- Payout calendar shows dates but doesn't integrate with transaction flow
- "Download" button exists with no handler

## aqua-ops-people — People Hub (HR)

**Single template**: `PeopleShell/PeopleTemplates/HR/PeopleHRView.tsx`.

Renders:
- Employee directory (12 seed employees)
- Search + dept filter (Engineering / Design / Marketing / Operations / Sales)
- Dept-count pills
- Post-role modal (title / dept dropdown / location / job type / description)
- Profile-editor modal (bio / skills / location / status)
- Expiring-clearances section (security audit)
- Activity toast (audit log)

**`peopleStore.ts`**:
```ts
Dept = 'Engineering' | 'Design' | 'Marketing' | 'Operations' | 'Sales'
EmployeeStatus = 'On-site' | 'Remote' | 'Hybrid' | 'On Leave'
Employee { id, name, title, dept, email, avatar?, status, joinedDate, skills[] }
Job { id, title, dept, location, type, description?, createdAt }
```
Seed: 12 employees, 6 open jobs.

**Missing**: no timesheets, leave management, payroll (`baseSalaryCents` exists on User but not used), performance reviews, org chart (managerId exists but no visual hierarchy), team / project assignments.

## aqua-ops-revenue — Revenue Hub (Sales + Marketing)

### SalesSuite — all 6 widgets are mock placeholders

| widget | what it renders |
|--------|-----------------|
| `SalesHubOverview` | 4 KPI cards (Revenue This Quarter, Pipeline Value, Deals Closed, Win Rate) + 10 hardcoded recent activity items + recharts sparklines |
| `SalesPipelineView` | Kanban deals board (Lead → Qualified → Proposal → Negotiation → Closed Won/Lost) — no drag-drop wired |
| `SalesCalendarView` | Calendar with deal close dates — placeholder only |
| `CrmInboxWidget` | Inbound message list — 8 hardcoded messages |
| `ProposalsWidget` | 3-column kanban (Drafted / Sent / Accepted) with 12 mock proposals + value totals — no write handlers |
| `LeadTimelineWidget` | Lead-interaction timeline — hardcoded, no filtering |

### MarketingSuite — all 7 widgets are mock placeholders

`CampaignList`, `MarketingOverview`, `LeadFunnel`, `SocialMetrics`, `ChannelAnalytics`, `EmailAnalytics`, `ContentCalendar` — all render placeholder UI with hardcoded data; no real data flow.

### Analytics dashboard

`RevenueAnalyticsView.tsx`: 4 hardcoded KPI cards, recharts line chart with no
data updates, timeframe toggle (1W/1M/1Y/ALL — not wired).

## aqua-operations — Operations hub

Single cross-suite KPI overview (`OpsHubShell/OpsHubApp.tsx`). Top-level
agency KPIs (revenue, client count, task completion %), recent activity
across all suites, quick actions (add client, post job, etc.). Mock data.

## Implementation depth summary

| sub-app | UI complete | logic wired | DB persistence |
|---------|-------------|-------------|----------------|
| aqua-host-shell | yes | yes (registry, marketplace) | partial (marketplace toggles local-only) |
| aqua-client | yes | partial (Dashboard yes, others stubbed) | localStorage only |
| aqua-crm | yes | Leads only | localStorage only |
| aqua-ops-finance | yes | Dashboard only | localStorage only |
| aqua-ops-people | yes | HR only | localStorage only |
| aqua-ops-revenue | yes | none — all mock | none |
| aqua-operations | yes | none — all mock | none |
