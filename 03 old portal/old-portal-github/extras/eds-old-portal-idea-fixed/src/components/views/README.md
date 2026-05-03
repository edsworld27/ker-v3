# `src/components/views/` — Full-page views

41 view folders + one aggregator `ui.config.ts`. Each folder corresponds to one `PortalView` ID and represents a full-page screen rendered into the main content area of the portal shell.

## Folder anatomy (consistent across all 41)

```
SomeView/
├── SomeView.tsx     ← The component
├── ui.ts            ← All Tailwind class strings + icon refs as `someViewUI` object
└── index.ts         ← Re-exports SomeView for clean folder imports
```

The `ui.ts` pattern means **no inline Tailwind classes inside the component file**. This makes it possible to restyle a whole view by editing one file — and lets multiple components in the same folder share the same visual config.

## How a view is reached

1. User clicks a sidebar item → `handleViewChange('crm')` runs in App.tsx.
2. `portalView` state changes to `'crm'`.
3. `<DynamicViewRenderer viewId="crm" />` re-renders.
4. DynamicViewRenderer checks `agencyConfig.roles[currentRole].viewLayouts['crm']`:
   - **If present** → render via `<DynamicRenderer layout={…} />` (the new path). Bypasses the View component entirely.
   - **If absent** → looks up `'CrmView'` in `componentMap` and mounts `<CrmView />` (the transitional path).

Most views are still on the transitional path. The viewLayouts mechanism is being progressively populated to phase the monoliths out.

## All 41 views

### Agency-side (admin / operator)

| View ID | Component | What it does |
| --- | --- | --- |
| `dashboard` | (no view file — uses widget layouts only) | Generic landing page, layout depends on role |
| `agency-hub` | `AgencyHubView` | Top-level agency operations dashboard |
| `agency-clients` | `AgencyClientsView` | List of all agency clients (kanban or table) |
| `client-management` | `ClientManagementView` | Detail view for a single client |
| `project-hub` | `ProjectHubView` | All active projects across clients |
| `task-board` | `TaskBoardView` | Kanban board of tasks |
| `crm` | `CrmView` | Pipeline-style CRM (clients by stage) |
| `inbox` | `InboxView` | Channel-based messaging center |
| `support-tickets` | `SupportTicketsView` | Tickets queue (internal + client) |
| `global-activity` | `GlobalActivityView` | Activity feed across the whole agency |
| `logs` | `LogsView` | Raw activity log (LogEntry list) |
| `data-hub` | `DataHubView` | Aggregate data / reports landing |

### Founder-only

| View ID | Component | Notes |
| --- | --- | --- |
| `founder-todos` | `FounderTodosView` | Founder's personal todo list |
| `global-settings` | `GlobalSettingsView` | App-level settings |
| `agency-builder` | `AgencyBuilderView` | Multi-agency setup |
| `agency-configurator` | `AgencyConfiguratorView` | Edit agencyConfig live (roles, layouts, labels, branding) |
| `admin-dashboard` | `AdminDashboardView` | Founder-level stats |
| `dev-dashboard` | `DevDashboardView` | Developer/internal status view |

### Client-side

| View ID | Component | Notes |
| --- | --- | --- |
| `your-plan` | `(via PlanModal)` | Client's plan/subscription |
| `website` | `WebsiteView` | "Launch Editor" / website management placeholder |
| `resources` | `ResourcesView` | Knowledge base / training materials |
| `support` | `SupportView` | Support landing |
| `discover` | `DiscoverView` | Discovery questionnaire intro |
| `discovery-form` | `(used inside views)` | Discovery answers form |
| `collaboration` | `CollaborationView` | Composes ProjectChat + Timeline + DesignConcepts + SyncCard |
| `aqua-ai` | `AquaAiView` | Client-facing AI assistant landing |

### Cross-role / utility

| View ID | Component | Notes |
| --- | --- | --- |
| `onboarding` | `OnboardingView` | Initial setup flow for a new account |
| `onboarding-dashboard` | `OnboardingDashboardView` | Tracks onboarding progress |
| `discovery-dashboard` | `DiscoveryDashboardView` | Tracks discovery completion |
| `design-dashboard` | `DesignDashboardView` | Tracks design phase |
| `feature-request` | `FeatureRequestView` | Submit a feature request |
| `ai-sessions` | `AiSessionsView` | List of past AI conversations |
| `employee-management` | `EmployeeManagementView` | Manage agency employees (also exposed via modal) |
| `apps` | `(via AppLauncherModal)` | App launcher / quick actions |
| `setup` | `AgencySetupView` | First-run agency setup |
| `agency-login` | `AgencyLoginView` | Agency-side login screen variant |
| `client-login` | `ClientLoginView` | Client-side login screen variant |
| `custom-page` | `CustomPageView` | Renders a user-created `CustomPage` |
| `page-builder` | `PageBuilder/` | UI for creating a CustomPage |
| `role-builder` | `RoleBuilder/` | UI for creating a custom role |

### Shared dashboard layouts

`DashboardOverviewView` is a generic dashboard that composes widgets — used by multiple roles when no specific view is needed.

## ui.config.ts (in this folder)

```ts
export const viewsUI = {
  AgencyHubView: agencyHubUI,
  CrmView: crmViewUI,
  // ...
};
```

Aggregates each view's `ui.ts` config so cross-folder code (e.g. `uiMaster`) can reach them by view name.

## When extracting

- **Best candidates for direct lift:** `WebsiteView`, `ResourcesView`, `FeatureRequestView`, `DiscoverView`, `LogsView`. Mostly self-contained.
- **Heavy dependencies (lift carefully):** `AgencyConfiguratorView` (writes to AppContext), `AgencyBuilderView` (multi-agency state), `CrmView` (deep client lifecycle logic), `ProjectHubView`/`TaskBoardView` (project + task state coupling).
- **Layout-driven (consider extracting the layout, not the view):** `AdminDashboardView`, `DashboardOverviewView`, `AgencyHubView`. These are mostly compositions of widgets. The composition pattern is more reusable than the view itself.
- **Always copy the view's `ui.ts` and `index.ts` along with the component.** They aren't optional.
