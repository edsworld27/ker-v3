# AQUA Portal v9 — Developer Configuration & Architecture Reference

> Last updated: 2026-04-05 (last conceptual update); 2026-05-02 (staleness banner added).
>
> ⚠ **STALENESS NOTE (2026-05-02):** This doc was written when the codebase was a **single Next.js app** at `(Live Application)/`. The repo has since been **split into 7 separate Next.js apps under `apps/`** (host-shell, client, crm, operations, ops-finance, ops-people, ops-revenue). Treat **file paths and topology** as historical — they no longer match what's on disk. The **conceptual content** (BridgeSession shape, registry pattern, role/permission system, login flow, demo mode, type-system rules) is still accurate and worth reading.
>
> For current setup + per-app port wiring, see [`SETUP.md`](./SETUP.md). For the 7-app architecture map, see the top-level `README.md` and per-app `apps/<app>/README.md`.

---

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [The Three Products](#2-the-three-products)
3. [The Bridge — Single Source of Truth](#3-the-bridge--single-source-of-truth)
4. [BridgeSession — Auth & Identity](#4-bridgesession--auth--identity)
5. [App Shell Architecture](#5-app-shell-architecture)
6. [Next.js API Routes](#6-nextjs-api-routes)
7. [Templates Architecture](#7-templates-architecture)
8. [View Mini-Registry Pattern (4-file)](#8-view-mini-registry-pattern-4-file)
9. [Suite Architecture](#9-suite-architecture)
10. [Data Flow](#10-data-flow)
11. [Type System](#11-type-system)
12. [Role & Permission System](#12-role--permission-system)
13. [Demo Mode](#13-demo-mode)
14. [Payload CMS](#14-payload-cms)
15. [Development Commands](#15-development-commands)
16. [Adding a New View (Checklist)](#16-adding-a-new-view-checklist)
17. [Adding a New Suite (Checklist)](#17-adding-a-new-suite-checklist)
18. [File Naming Conventions](#18-file-naming-conventions)
19. [Known In-Progress / Coming Soon](#19-known-in-progress--coming-soon)

---

## 1. Monorepo Overview

The repository is an **npm workspaces monorepo** with three packages. The root has no application code — it only wires the workspaces together.

```
aqua-portal-v9-main/                  ← repo root
├── (Live Application)/               ← Next.js 16.2.2 app server
├── Templates/                        ← @aqua/templates — all UI view packages
├── Bridge/                           ← @aqua/bridge — shared data, types, auth
├── package.json                      ← { "workspaces": ["(Live Application)", "Templates", "Bridge"] }
├── dev-config.md                     ← this file
└── phases.md                         ← roadmap / phase tracking
```

**Path aliases** (configured in `(Live Application)/tsconfig.json`):

| Alias | Resolves to | Used for |
|---|---|---|
| `@/` | `(Live Application)/` | AppShell, app routes, scripts |
| `@aqua/bridge` | `../Bridge` | Bridge types, auth, data |
| `@aqua/templates` | `../Templates` | Suite registries |

**Next.js config** (`(Live Application)/next.config.mjs`):
- `transpilePackages: ['@aqua/templates']` — Templates compiled by Next.js
- `turbopack.root` set to repo root — allows cross-package imports
- `experimental.externalDir: true` — allows imports from outside `(Live Application)/`
- `typescript.ignoreBuildErrors: true` — allows shipping with non-blocking TS errors during development

---

## 2. The Three Products

AQUA Portal serves three distinct user groups from one codebase. The `BridgeSession.productAccess` array controls which product a user sees after login.

| Product | Who Uses It | `productAccess` value | Key Suites |
|---|---|---|---|
| **AQUA Operations** | Agency staff (Founder, Manager, Employee) | `'operations'` | All 6 suites + PersonalWorkspace |
| **AQUA Client** | Client owners and employees | `'client'` | Client portal, fulfilment, documents |
| **AQUA CRM** | Sales/acquisition team | `'crm'` | CRM views, pipeline, lead gen |

A `Founder` gets `['operations', 'client', 'crm']` — access to all three.

---

## 3. The Bridge — Single Source of Truth

`Bridge/` (package name: `@aqua/bridge`) is the canonical data, type, and auth layer. **Nothing outside the Bridge should re-implement what the Bridge already defines.**

```
Bridge/
├── index.ts                   ← Main barrel export
├── package.json               ← { "name": "@aqua/bridge" }
│
├── types/
│   └── index.ts               ← ALL shared types: AppUser, Client, Agency,
│                                 BridgeSession, SuiteTemplate, SuiteSubItem, etc.
│
├── auth/
│   ├── index.ts               ← authenticate(email), validateSession(token)
│   └── constants.ts           ← DEMO_EMAIL, DEMO_SESSION
│
├── data/
│   ├── prisma.ts              ← PrismaClient singleton (server-only, always dynamic import)
│   ├── seed.ts                ← Seed script — run via CLI to populate DB
│   └── seedData.ts            ← seedUsers[], seedClients[] — client-safe static data
│
├── events/
│   └── index.ts               ← BridgeEvents typed event bus
│
├── registry/
│   └── index.ts               ← BridgeRegistry — component + suite registration store
│
├── sync/
│   └── index.ts               ← provisionClientWorkspace(), syncAgencyData()
│
├── ui/
│   └── index.ts               ← BridgeUIRegistry — UI variable config store
│
├── api/
│   └── index.ts               ← Server-side helpers (used in API routes)
│
└── config/                    ← Shared config constants
```

### The Bridge Rule
AppShell files in `(Live Application)/AppShell/bridge/` are **thin re-exports** of Bridge implementations — they contain no independent logic:

```typescript
// AppShell/bridge/registration.ts
export { BridgeRegistry } from '@aqua/bridge/registry';

// AppShell/bridge/events.ts
export { BridgeEvents } from '@aqua/bridge/events';
export type { BridgeEventMap } from '@aqua/bridge/events';

// AppShell/bridge/uiRegistration.ts
export { BridgeUIRegistry } from '@aqua/bridge/ui';
```

---

## 4. BridgeSession — Auth & Identity

The `BridgeSession` is the authoritative result of a successful login. Every downstream system reacts to it — which suites are shown, which data is loaded, which product the user sees.

```typescript
interface BridgeSession {
  user: AppUser;               // who logged in
  agency: Agency;              // which tenant (multi-tenancy key)
  enabledSuiteIds: string[];   // ['*'] = all suites, or specific suite IDs
  productAccess: PortalProduct[]; // ['operations', 'client', 'crm']
  isDemo: boolean;             // skips MFA, uses seed data
}
```

### Login Flow

```
1. User submits email
   → useAuthLogic.handleLogin(email, password)

2. BridgeAPI.authenticate(email)        [client-side wrapper in AppShell/bridge/api.ts]
   → POST /api/bridge/auth              [Next.js API route]
     → Bridge.authenticate(email)       [server-side, hits Prisma DB]
       → returns { success: true, session: BridgeSession }

3. onSessionEstablished(session)        [useCoreLogic]
   → setBridgeSession(session)
   → setActiveAgencyId(session.agency.id)
   → setEnabledSuiteIds(session.enabledSuiteIds)
   → BridgeAPI.getInitialState(agencyId) → hydrates users, clients, logs, notifications

4. setCurrentUserEmail(session.user.email)

5. if session.isDemo → setStep('portal')  [skip MFA]
   else              → setStep('security') [MFA screen]

6. MFA verified → savePersistedState() → step = 'portal'
```

**Demo shortcut:** Email `demo@aqua.portal` or `demo` — returns `DEMO_SESSION` directly, no DB call, no MFA, all suites unlocked (`enabledSuiteIds: ['*']`).

---

## 5. App Shell Architecture

The App Shell (`(Live Application)/AppShell/`) is the runtime container. It orchestrates rendering and state — it does not contain business logic.

```
AppShell/
├── App.tsx                    ← Root. Reads `step` state → renders correct screen
│                                 Steps: 'welcome' | 'login' | 'security' | 'portal' | 'setup-wizard'
├── AppFrame/                  ← Layout shell: Sidebar + TopBar + Renderer wrapper
├── Sidebar/                   ← Navigation tree built from registered suite subItems
├── TopBar/                    ← Header: user menu, notifications, impersonation banner
├── Renderer/                  ← SuiteRouter — maps portalView ID → component
│
├── logic/                     ← State management (the "brain")
│   ├── useAppLogic.ts         ← Facade orchestrator: composes all hooks into one context object
│   ├── useCoreLogic.ts        ← Central data kernel: users, clients, logs, bridgeSession, agencyConfig
│   ├── useAuthLogic.ts        ← Login, MFA verification, impersonation, currentUser
│   └── useShellLogic.ts       ← portalView, sidebarCollapsed, handleViewChange
│
├── bridge/                    ← Connectors to @aqua/bridge (mostly thin re-exports)
│   ├── api.ts                 ← BridgeAPI: authenticate(), getInitialState(), syncData()
│   ├── registration.ts        ← re-exports BridgeRegistry from @aqua/bridge
│   ├── events.ts              ← re-exports BridgeEvents from @aqua/bridge
│   ├── uiRegistration.ts      ← re-exports BridgeUIRegistry from @aqua/bridge
│   ├── provisioning.ts        ← Delegates to POST /api/bridge/provision
│   ├── suiteRegistry.ts       ← Loads all Templates suite registries into BridgeRegistry
│   ├── AppContext.tsx          ← React context: wraps useAppLogic() output
│   ├── InboxContext.tsx        ← Unified messaging context (conversations, messages)
│   ├── ModalContext.tsx        ← Global modal manager
│   ├── BridgeHub.tsx           ← Mounts ALL context providers in correct order
│   ├── useTemplateUI.ts        ← Hook for reading BridgeUIRegistry configs
│   │
│   ├── types/
│   │   └── index.ts            ← Re-exports core types from @aqua/bridge/types
│   │                              Adds AppShell-extended types: LogEntry (action/details/userName),
│   │                              SubNavItem, SuiteTemplate (extended), domain interfaces
│   │
│   ├── config/
│   │   ├── agencyConfig.ts     ← Default agency config, RoleConfig definitions, enabledSuiteIds
│   │   └── masterConfig.ts     ← MasterConfig shape + initial values (agency identity, theme)
│   │
│   └── data/
│       ├── mockData.ts         ← initialUsers, initialClients, initialActivityLogs, initialNotifications, etc.
│       ├── db.ts               ← loadSeedData() — thin wrapper around @aqua/bridge/data/seedData
│       └── clientDB.ts         ← Static local client records for dev mode
│
├── components/                ← Shared UI components used across views
│   ├── Modals/                ← GlobalTasksModal, NotificationsPanel, etc.
│   ├── DashboardConfigurator.tsx
│   ├── DesignModeInspector.tsx
│   ├── DynamicViewRenderer.tsx
│   ├── ModalManager.tsx
│   ├── auth/                  ← LoginView, SecurityCheckView, WelcomeScreen
│   ├── collaboration/         ← DesignConcepts, ProjectChat, ProjectTimeline, SyncCard
│   ├── design/                ← EditableIcon, EditableText
│   ├── componentMap.ts        ← Manual component ID → component map
│   └── autoComponentMap.ts    ← Auto-generated by scripts/generateRegistry.js
│
├── hooks/
│   └── useSyncStore.ts        ← Auto-syncs state changes to Bridge API in background
│
└── widgets/                   ← Sidebar widgets, notification bell
```

### State Hook Composition

```
AppContext (what all components consume via useAppContext())
  └── useAppLogic()
        ├── useCoreLogic()     → users, clients, logs, bridgeSession, agencyConfig, toggleSuite
        ├── useAuthLogic()     → currentUser, handleLogin, handleVerifyMfa, impersonation
        ├── useShellLogic()    → portalView, sidebarCollapsed, handleViewChange
        └── domain stubs       → clientLogic, designLogic (real logic lives in suite Contexts)
```

---

## 6. Next.js API Routes

```
(Live Application)/app/api/
├── bridge/
│   ├── auth/
│   │   └── route.ts           ← POST { email } → returns { session: BridgeSession }
│   │                             Delegates to Bridge.authenticate()
│   │                             Falls back to seedData if DB unavailable
│   │
│   ├── state/
│   │   └── route.ts           ← GET  ?agencyId=x → returns initial state (users, clients, etc.)
│   │                             POST { agencyId, key, value } → persists a data key
│   │
│   └── provision/
│       └── route.ts           ← POST { clientId } → provisions CMS workspace
│                                 Calls Bridge.provisionClientWorkspace()
│                                 Marks client.cmsProvisioned = true in DB
│
└── (payload)/                 ← Payload CMS API routes (separate system)
```

All bridge API routes use **dynamic imports of Prisma** (`await import('@aqua/bridge/data/prisma')`) so the Prisma client is never bundled into client-side code. Without a live DB they silently fall back to `@aqua/bridge/data/seedData`.

---

## 7. Templates Architecture

`Templates/` (package name: `@aqua/templates`) contains all product UI. It is fully decoupled from `(Live Application)` — it only imports from `@aqua/bridge` and `@/AppShell/bridge/types`.

```
Templates/
├── package.json                         ← { "name": "@aqua/templates" }
├── index.ts                             ← Top-level barrel: all suite registry exports
├── suiteRegistry.ts                     ← Registers every suite into BridgeRegistry on load
├── SuiteManager.tsx                     ← Suite lifecycle manager component
│
├── AQUA Operations/
│   ├── AQUA Functions/
│   │   ├── ExperienceSuite/             ← Client-facing ops
│   │   ├── FinanceSuite/                ← Finance, payroll, billing, treasury
│   │   ├── OperationsSuite/             ← Enterprise ops, projects, compliance, logistics
│   │   ├── PeopleSuite/                 ← HR, recruitment, payroll, LMS, benefits
│   │   ├── RevenueSuite/                ← CRM, sales, marketing
│   │   └── SystemSuite/                 ← Settings, users, roles, IT, integrations
│   │
│   └── PersonalWorkspace/
│       ├── CommandCenter/               ← Personal home dashboard
│       ├── MyInbox/                     ← Unified inbox
│       ├── MyTasks/                     ← Personal task manager
│       └── StaffPortal/                 ← Payroll, time, growth, personal space
│
├── AQUA Client/
│   ├── PortalView/                      ← Client-facing portal
│   ├── registry.tsx
│   └── index.ts
│
└── AQUA CRM/                            ← In development
```

---

## 8. View Mini-Registry Pattern (4-file)

Every view folder is a **self-contained, portable unit**. This is the core structural rule: to move a view to a different suite, you detach its mini-registry from the source suite and attach it to the destination — nothing else needs to change.

```
SomeView/
├── SomeView.tsx               ← The React component (the actual UI)
├── SomeView.ui.ts             ← UI variable declarations (colors, labels, layout config)
├── registry.tsx               ← Mini-registry: SuiteTemplate metadata + subItems
├── index.ts                   ← Barrel: re-exports component + registry
└── logic/
    ├── useSomeViewLogic.ts    ← Business logic hook (reads from suite context)
    └── mockData.ts            ← Local mock/seed data for this view
```

### registry.tsx structure

```typescript
import { SuiteTemplate } from '@/AppShell/bridge/types';

export const SomeViewRegistry: SuiteTemplate = {
  id: 'some-view',              // unique route ID — used by SuiteRouter to render component
  label: 'Some View',           // displayed in sidebar nav
  icon: SomeIcon,               // Lucide icon component
  component: SomeView,          // the React component to render
  section: 'Suite Name',        // sidebar section grouping label
  requiredSuites: ['suite-id'], // enabledSuiteId required to unlock this view
  subItems: [                   // child navigation items
    {
      id: 'sub-view',
      label: 'Sub View',
      icon: SubIcon,
      view: 'sub-view',         // portalView ID when this item is clicked
      component: SubView        // component rendered at this sub-view
    }
  ]
};
```

### 3-Tier Registry Hierarchy

```
[1] View mini-registry           SomeViewRegistry (SomeView/registry.tsx)
       ↓ imported into
[2] Suite master registry        SomeSuite/registry.tsx  →  suites[] array
       ↓ imported into
[3] Suite index barrel           SomeSuite/index.ts  →  exports to Templates/index.ts
       ↓ registered via
[4] Global registration          Templates/suiteRegistry.ts  →  BridgeRegistry.register()
       ↓ consumed by
[5] AppShell SuiteRouter         Renderer/ reads BridgeRegistry to map view IDs → components
```

---

## 9. Suite Architecture

Each suite is an isolated feature domain with its own React context, types, and view folders.

```
SomeSuite/
├── registry.tsx               ← Suite-level SuiteTemplate (top-level nav item + subItems)
├── index.ts                   ← Barrel + imports all view registries + exports suites[]
├── SomeSuiteContext.tsx        ← React context: all domain state + handlers for this suite
├── types/
│   └── index.ts               ← Domain-specific TypeScript interfaces
├── logic/
│   └── mockData.ts            ← Suite-wide seed/mock data
├── components/                ← Shared widgets used by multiple views in this suite
│   └── SomeWidget/
│       ├── SomeWidget.tsx
│       └── index.ts
│
├── SomeView/                  ← View (4-file mini-registry)
└── AnotherView/               ← View (4-file mini-registry)
```

### The 6 AQUA Operations Suites

| Suite | Context | View Count | Views |
|---|---|---|---|
| **ExperienceSuite** | AppContext (core) | 13 | ClientDashboard, CompanyHub, DiscoverView, DiscoveryDashboard, DesignDashboard, DevDashboard, OnboardingDashboard, IncubatorView, WebsiteView, MyDocumentsView, DataHubView, CustomPageView, FeatureRequestView |
| **FinanceSuite** | FinanceContext.tsx | 9 | FinanceSuiteView, BillingDashboard, ExpensesView, InvoicesView, LedgerView, PaymentsView, SubscriptionView, TaxesView, TreasuryView |
| **OperationsSuite** | EnterpriseContext.tsx | 15 | EnterpriseSuiteView, AdminDashboard, AuditView, BoardroomView, ComplianceView, ContractsView, FulfillmentView, InsuranceView, LegalSuiteView, LogisticsView, ProjectHubView, RiskView, SopHub, StrategyView, WarehouseView |
| **PeopleSuite** | HrContext.tsx | 20 | HrSuiteView, AttendanceView, BenefitsView, CollaborationView, EmployeeHubView, FeedbackView, FounderTodosView, GiftHub, HrAiView, LmsView, OnboardingView, PayrollView, PerformanceView, RecordsView, RecruitmentView, ResourcesView, SetSailGiftTracker, SupportView, TimeOffView, YouDeserveItFund |
| **RevenueSuite** | RevenueContext.tsx | 4 | AgencyClientsView, ClientManagementView, SalesSuiteView (shell), MarketingSuiteView (shell) |
| **SystemSuite** | InfrastructureContext.tsx | 13 | SettingsSuiteView, AgencyConfiguratorView, AgencyHub, AllUsersView, AquaAiView, AuthSuite, GlobalSettingsView, IntegrationsView, ItSuiteView, LogsView, MasterLogsView, PageBuilder, RoleBuilder |

### PersonalWorkspace

Not a suite — no Context. All views read directly from AppContext.

| View | Purpose |
|---|---|
| **CommandCenter** | Personal home dashboard |
| **MyInbox** | Unified inbox (email, Slack channels, direct messages) |
| **MyTasks** | Personal task manager |
| **StaffPortal** | MySpace, MyPayroll, MyTime, MyGrowth sub-views |

---

## 10. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│                                                               │
│  AppContext  ←──────────── useAppLogic()                      │
│    ↕                           ↕                              │
│  Suite Contexts             useCoreLogic, useAuthLogic,       │
│  (HrContext, etc.)          useShellLogic                     │
│    ↕                                                          │
│  View Components                                              │
│    ↕ call handlers                                            │
│  BridgeAPI                  (client-side wrapper)             │
│    ↕ fetch()                                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │  HTTP (JSON)
┌──────────────────▼──────────────────────────────────────────┐
│  Next.js Server — API Routes                                  │
│                                                               │
│  POST /api/bridge/auth      → Bridge.authenticate()           │
│  GET  /api/bridge/state     → Bridge.getAgencyState()         │
│  POST /api/bridge/state     → Bridge.syncData()               │
│  POST /api/bridge/provision → Bridge.provisionClientWorkspace()│
└──────────────────┬──────────────────────────────────────────┘
                   │  Prisma ORM
┌──────────────────▼──────────────────────────────────────────┐
│  Database                                                     │
│  Dev:  SQLite  → (Live Application)/prisma/dev.db             │
│  Prod: PostgreSQL (target)                                    │
│  Schema: (Live Application)/prisma/schema.prisma              │
└─────────────────────────────────────────────────────────────┘
```

### Offline / Dev Fallback
When Prisma is unavailable, every bridge call falls back to `@aqua/bridge/data/seedData` — static arrays baked into the bundle. The UI always renders with realistic mock data even without a database running.

### Client-side Persistence (localStorage)
AppShell persists a snapshot to `localStorage` key `aqua_portal_state` on each save:
```typescript
{
  portalMode,          // 'demo' | 'user'
  currentUserEmail,
  bridgeSession,       // full BridgeSession object
  portalView,          // last active view ID
  sidebarCollapsed,
  enabledSuiteIds,     // which suites are toggled on
  agencyConfig,        // full agency configuration
  setupComplete        // boolean — controls welcome → login step
}
```

Background sync via `useSyncStore` calls `BridgeAPI.syncData(agencyId, key, value)` whenever core state changes (users, agencyConfig).

---

## 11. Type System

### Where Types Live

| Type | Defined In | Notes |
|---|---|---|
| `AppUser` | `Bridge/types/index.ts` | Canonical — never redefine elsewhere |
| `Client` | `Bridge/types/index.ts` | Requires `agencyId` field |
| `Agency` | `Bridge/types/index.ts` | Tenant identity |
| `BridgeSession` | `Bridge/types/index.ts` | Auth session — drives everything |
| `SuiteTemplate` | `Bridge/types/index.ts` | Suite/view registration shape |
| `SuiteSubItem` | `Bridge/types/index.ts` | Child nav item shape |
| `PortalProduct`, `PortalTier`, `ClientStage`, `Step`, `UserRole` | `Bridge/types/index.ts` | Enums/literals |
| `LogEntry` | `AppShell/bridge/types/index.ts` | **AppShell-extended** — uses `action`, `details`, `userName` fields |
| `SubNavItem` | `AppShell/bridge/types/index.ts` | Sidebar nav item (superset of SuiteSubItem) |
| `SuiteTemplate` (extended) | `AppShell/bridge/types/index.ts` | Adds `name`, `demoComponent`, `setup`, `badge`, etc. |
| `RoleConfig`, `AgencyConfig` | `AppShell/bridge/config/agencyConfig.ts` | Permission + branding configuration |
| Domain types (HR, Finance, CRM entities) | `AppShell/bridge/types/index.ts` | Hundreds of interfaces — PayRun, Invoice, Deal, etc. |

### Important Distinction: LogEntry
The Bridge defines a minimal `LogEntry` (`id`, `type`, `message`, `timestamp`, `category?`).
The AppShell uses a richer version: `id`, `timestamp`, `userId`, `userName`, `action`, `details`, `type`, `clientId?`.
The AppShell defines its own `LogEntry` locally — it does **not** re-export the Bridge's version.

---

## 12. Role & Permission System

Roles are configured in `AppShell/bridge/config/agencyConfig.ts` under `agencyConfig.roles`. Each role has a `RoleConfig`:

```typescript
interface RoleConfig {
  displayName: string;
  accentColor: string;
  allowedViews: string[] | '*';  // '*' = unrestricted access
  isInternalStaff: boolean;
  isFounder: boolean;
  canManageUsers: boolean;
  canImpersonate: boolean;
  canViewFinancials: boolean;
  // ... additional permission flags
}
```

**Built-in role IDs:** `Founder`, `AgencyManager`, `AgencyEmployee`, `ClientOwner`, `ClientEmployee`, `Freelancer`

### hasPermission(view) resolution order:
1. `portalMode === 'demo'` → **always true**
2. No `roleConfig` found for role → **false**
3. `roleConfig.isFounder === true` → **always true**
4. `roleConfig.allowedViews === '*'` → **always true**
5. `roleConfig.allowedViews.includes(view)` → explicit grant

### Suite Toggling
Suites can be toggled per-agency or per-client via `toggleSuite(suiteId, clientId?)` in `useCoreLogic`. Agency-level toggles modify `enabledSuiteIds[]`. Client-level toggles modify `client.enabledSuiteIds[]`.

---

## 13. Demo Mode

Demo mode bypasses all auth and DB dependencies:

- **Email:** `demo@aqua.portal` or `demo`
- **User:** `Demo Founder` (id: 0, role: `'Founder'`)
- **Agency:** `Aqua Demo Agency` (id: `'demo-agency'`)
- **`enabledSuiteIds: ['*']`** — all suites unlocked
- **`isDemo: true`** — skips MFA, goes straight to portal step
- **Data:** `@aqua/bridge/data/seedData` (seedUsers, seedClients)

Entry points:
1. Log in with `demo` or `demo@aqua.portal`
2. `setPortalMode('demo')` called from code — triggers `onSessionEstablished(DEMO_SESSION)`

---

## 14. Payload CMS

Payload CMS runs alongside the AQUA portal under `app/(payload)/`. It is a **parallel, independent system** for managing website/page content.

```
(Live Application)/
├── app/(payload)/             ← Payload admin UI + API routes
├── payload/
│   ├── collections/           ← Payload content collections (Pages, Media, etc.)
│   └── components/            ← Custom Payload admin components
└── payload.config.ts          ← Payload configuration
```

Payload does **not** share state, types, or auth with the AQUA AppShell. They coexist in the same Next.js server as separate route namespaces. The Payload DB is separate from the Bridge Prisma DB.

---

## 15. Development Commands

**From `(Live Application)/`:**
```bash
npm run dev                    # Start dev server (Next.js + Turbopack)
npm run build                  # Production build
npm run generate:registry      # Regenerate autoComponentMap.ts from scanned components
npx tsc --noEmit               # TypeScript type-check without building
npx prisma studio              # Open Prisma DB browser (GUI)
npx prisma db push             # Push schema changes to dev.db (SQLite)
npx prisma generate            # Regenerate Prisma client after schema changes
```

**From repo root:**
```bash
npm install                    # Install all workspace dependencies
```

---

## 16. Adding a New View (Checklist)

1. Create `SomeSuite/MyNewView/` with the 4-file pattern:
   ```
   MyNewView.tsx               ← React component
   MyNewView.ui.ts             ← UI variable config (colors, labels)
   registry.tsx                ← exports MyNewViewRegistry: SuiteTemplate
   index.ts                    ← re-exports component + registry
   logic/useMyNewViewLogic.ts  ← reads from suite context
   logic/mockData.ts           ← local mock data
   ```

2. In the suite's `registry.tsx`, import `MyNewViewRegistry` and add it to `subItems[]`

3. In the suite's `index.ts`, add the view registry to the `suites[]` export

4. Add the view ID to the relevant role's `allowedViews` in `agencyConfig.ts`

5. Run `npm run generate:registry` to update `autoComponentMap.ts`

---

## 17. Adding a New Suite (Checklist)

1. Create `NewSuite/` folder in `Templates/AQUA Operations/AQUA Functions/`:
   ```
   NewSuite/
   ├── NewSuiteContext.tsx      ← React context with all suite state + handlers
   ├── registry.tsx             ← suite-level SuiteTemplate
   ├── index.ts                 ← barrel — imports all view registries, exports suites[]
   ├── types/index.ts           ← domain TypeScript types
   └── logic/mockData.ts        ← suite-wide seed data
   ```

2. Register in `Templates/index.ts` — import and add to the `registerSuites()` call

3. Register in `Templates/suiteRegistry.ts` — add to `BridgeRegistry.register()`

4. Add the suite ID to `defaultAgencyConfig.enabledSuiteIds[]` in `agencyConfig.ts`

5. Mount the suite's `<NewSuiteProvider>` in `AppShell/bridge/BridgeHub.tsx`

---

## 18. File Naming Conventions

| Pattern | Example |
|---|---|
| View component | `MyView.tsx` |
| View UI config | `MyView.ui.ts` |
| View registry | `registry.tsx` (always lowercase, always this name) |
| View logic hook | `logic/useMyViewLogic.ts` |
| View mock data | `logic/mockData.ts` |
| View barrel | `index.ts` |
| Suite context | `SomeSuiteContext.tsx` |
| Suite master registry | `SomeSuite/registry.tsx` |
| Suite barrel / index | `SomeSuite/index.ts` |
| Suite types | `SomeSuite/types/index.ts` |
| Shared widget | `components/MyWidget/MyWidget.tsx` |
| Widget barrel | `components/MyWidget/index.ts` |
| Bridge type | `Bridge/types/index.ts` (all in one file) |
| API route | `app/api/bridge/[name]/route.ts` |

---

## 19. Known In-Progress / Coming Soon

| Area | Status |
|---|---|
| **RevenueSuite — SalesSuiteView** | Shell only. `SalesHubOverview`, `SalesPipelineView`, `SalesCalendarView`, `CrmInboxWidget`, `ProposalsWidget`, `LeadTimelineWidget` are placeholder functions — not yet implemented |
| **RevenueSuite — MarketingSuiteView** | Shell only. All 7 marketing widgets are placeholders |
| **AQUA CRM product** | `Templates/AQUA CRM/` folder exists, not yet populated |
| **Bridge Prisma schema** | Uses SQLite locally (`prisma/dev.db`). Production target is PostgreSQL |
| **Payload CMS integration** | Collections and schema defined. Not yet deeply wired to AQUA client data |
| **`serverComponentsExternalPackages` warning** | `next.config.mjs` uses deprecated `experimental.serverComponentsExternalPackages` — should be moved to top-level `serverExternalPackages` |
| **Finance/People TS errors** | Some domain type mismatches in FinanceSuite and PeopleSuite widgets (field name divergence between context types and widget usage). Non-blocking (`typescript.ignoreBuildErrors: true`) but tracked for cleanup |
