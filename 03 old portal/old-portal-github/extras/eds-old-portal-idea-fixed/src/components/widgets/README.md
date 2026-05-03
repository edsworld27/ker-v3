# `src/components/widgets/` — Composable dashboard widgets

18 widgets. Each is a self-contained card that reads from `AppContext` and renders a single concern (a list, a stats grid, an activity feed, etc.). They're the **building blocks** of the new component-driven view system.

## How widgets are used

A role's `viewLayouts` config references them by string:

```ts
// In agencyConfig.ts:
roles.AgencyManager.viewLayouts['dashboard'] = {
  layout: 'grid-cols-2',
  components: [
    { component: 'AdminStatsWidget', props: {} },
    { component: 'ClientListWidget', props: { limit: 5 } },
    { component: 'ProjectListWidget', props: {} },
    { component: 'ActivityFeedWidget', props: {} },
  ],
};
```

`<DynamicViewRenderer>` sees this config, mounts the four widgets in a 2-column grid. No view component needed.

## All 18 widgets

| Widget | What it shows | Data source |
| --- | --- | --- |
| `ActivityFeedWidget` | Color-coded activity log feed (auth, impersonation, action, system events) | `activityLogs` |
| `AdminActivityWidget` | Admin-tier activity panel with role-aware widget configs (founder/manager/employee variants) | `activityLogs` + `useRoleConfig` |
| `AdminStatsWidget` | Stat tiles (clients, projects, employees, tickets) for admin roles | All domain entities + `useRoleConfig` |
| `ClientActivityWidget` | Per-client activity panel — used inside ClientManagementView | `activityLogs` filtered by clientId |
| `ClientDirectoryWidget` | Client list with stage dropdown, used inside ClientManagement and Agency Hub | `clients` + `StageDropdown` |
| `ClientListWidget` | Compact client list (name, stage badge, avatar) | `clients` |
| `ClientRecentActivityWidget` | ⚠️ STUB — placeholder. Original was missing from source repo. | — |
| `ClientWelcomeWidget` | ⚠️ STUB — placeholder. Original was missing from source repo. | — |
| `ClientsStatsWidget` | Stat card showing client count + breakdown by stage | `clients` |
| `ProjectListWidget` | Project cards with progress bar, client name, status | `projects` (uses STUB ui config) |
| `ProjectsStatsWidget` | Stat card for projects (total, active, completed) | `projects` (uses STUB ui config) |
| `QuickActionsWidget` | Grid of action buttons (Add Client, New Project, etc.) — opens modals | `ModalContext` setters |
| `TaskBoardWidget` | Mini kanban board (Backlog / In Progress / Review / Done) | `projectTasks` |
| `TaskListWidget` | Flat task list with status, priority, assignee, due date | `projectTasks` |
| `TasksStatsWidget` | Stat card for tasks | `projectTasks` |
| `TeamListWidget` | Agency team member list with avatar, role, working hours | `users` |
| `TicketsStatsWidget` | Stat card for tickets (open, in progress, closed) | `tickets` |

## ui.ts in this folder

`widgets/ui.ts` is special — it's NOT a component-specific config like other `ui.ts` files. It's an **aggregator** that:

1. Re-exports `clientManagementViewUI` from `views/ClientManagementView/ui` (used by `ClientActivityWidget` and `ClientDirectoryWidget`).
2. Provides STUB `projectListWidgetUI` and `projectsStatsWidgetUI` configs (the originals were missing from the source repo).

The two stub configs render the project widgets functionally but the styling is best-guess. Replace if you adopt those widgets seriously.

## Conventions

Most widgets follow this skeleton:

```tsx
import React from 'react';
import { iconA, iconB } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useRoleConfig } from '../../hooks/useRoleConfig';

export const SomeWidget: React.FC = () => {
  const { someData } = useAppContext();
  const theme = useTheme();
  const { canView, label } = useRoleConfig();

  if (!canView('some-view')) return null;

  return <div className="glass-card p-6 rounded-3xl">…</div>;
};
```

- Self-source data (no required props).
- Self-permission-check via `useRoleConfig`.
- Read theme via `useTheme` for inline styles where Tailwind can't hit.
- No view-routing logic — that's the parent's concern.

## When extracting

- **Most extractable:** `ClientListWidget`, `TaskListWidget`, `TeamListWidget`, `TasksStatsWidget`, `TicketsStatsWidget`. Lightweight, self-contained patterns.
- **Lift the AdminStatsWidget pattern** (role-aware widget config table) — it's a cleaner alternative to per-role component branches.
- **Avoid:** `ClientWelcomeWidget`, `ClientRecentActivityWidget` — stubs only. `ProjectListWidget` and `ProjectsStatsWidget` work but rely on stub UI configs.
- **All widgets use `glass-card` + `rounded-3xl` + Tailwind utilities.** Bring `src/index.css` along or replicate those utility classes.
