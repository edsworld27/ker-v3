# `src/types/` — Shared TypeScript types

Single file: **`index.ts`**. Every interface and union type used across the app lives here. Most components in the codebase import from this file.

## What's defined

### State machine

- **`Step`** — `'setup' | 'login' | 'security' | 'portal'`. The top-level flow stage in `App.tsx`.
- **`PortalView`** — Big union of every navigable view ID. Examples: `'dashboard'`, `'crm'`, `'agency-hub'`, `'project-hub'`, `'task-board'`, `'collaboration'`, etc. ~50 values. Used as the type for `portalView` in app state and as keys in `agencyConfig.viewLayouts`.

### Domain models

| Type | Shape (key fields) | Where used |
| --- | --- | --- |
| **`AppUser`** | `id, name, email, role, customRoleId?, clientId?, avatar?, workingHours?, bio?, joinedDate?` | All user lists, current-user state, impersonation lookups |
| **`Client`** | `id, name, email, stage, logo?, websiteUrl?, discoveryAnswers, assignedEmployees?` | CRM, AgencyClients, ClientManagement |
| **`Project`** | `id, name, clientId?, description, status, createdAt` | ProjectHub, ProjectListWidget |
| **`ProjectTask`** | `id, projectId, title, status, priority, assigneeId?, dueDate?` | TaskBoard, TaskList, TaskDetailModal |
| **`AppTicket`** | `id, title, status, priority, creator, type` | SupportTickets, TicketsStats |
| **`Agency`** | `id, name, logo?, theme?, isConfigured` | AgencySetup, AgencyHub |
| **`Todo`** | `id, text, completed, priority, category` | FounderTodos, GlobalTasksModal |
| **`LogEntry`** | `id, timestamp, userId, userName, action, details, type` | LogsView, GlobalActivityView |
| **`ActivityLog`** | `id, userId, userName, action, module, timestamp` | Activity feeds |
| **`TaskStep`** | `id, taskId, text, completed` | Subtasks within a ProjectTask |
| **`TaskAttachment`** | `id, taskId, name, url, type` | Files/links pinned to a task |

### Status enums

- **`ClientStage`** — `'discovery' | 'design' | 'development' | 'live'` (the client journey)
- `Project.status` — `'Planning' | 'Active' | 'On Hold' | 'Completed'`
- `ProjectTask.status` — `'Backlog' | 'In Progress' | 'Review' | 'Done'`
- `ProjectTask.priority` — `'High' | 'Medium' | 'Low'`
- `AppTicket.status` — `'Open' | 'Closed' | 'In Progress'`
- `AppTicket.type` — `'internal' | 'client'`
- `LogEntry.type` — `'auth' | 'impersonation' | 'action' | 'system'`

### Role / permission types

- **`UserRole`** — `'Founder' | 'AgencyManager' | 'AgencyEmployee' | 'ClientOwner' | 'ClientEmployee' | string`. The trailing `string` allows custom roles created at runtime.
- **`TemplateRoleConfig`** — Full role spec used inside an `AgencyTemplate`. Includes `allowedViews`, `canImpersonate`, `canManageUsers`, `canManageRoles`, `canAccessConfigurator`, `labelOverrides`, and a `viewLayouts` map.
- **`AgencyTemplate`** — A complete role/layout preset (e.g. "Web Design Agency", "Marketing Agency"). Contains `roles`, `sidebarLinks`, `features`. See `data/templates.ts`.

### Config types

- **`CustomPage`** — User-created dashboard page. `id, title, slug, iconName, widgets[], roles[]`.
- **`CustomSidebarLink`** — User-added nav item. `id, label, iconName, view, url?, roles[], order`.
- **`DashboardWidgetConfig`** — Slot config inside a `CustomPage`. `id, type ('metric'|'chart'|'list'|'text'), title, size, dataEndpoint?, content?`.
- **`TemplateViewLayouts`** — Map from view ID → `{ layout: 'grid-cols-X', components: [{component, props}] }`. Same shape as `agencyConfig.roles[X].viewLayouts`.

### Sidebar types

- **`SidebarItem`** — `{ id, label, iconName, view }`.
- **`SidebarSection`** — `{ section: string, items: SidebarItem[] }`.
- **`ClientStageConfig`** / **`SidebarConfigurator`** — Older types for stage-based sidebar variations. Less central.

## How to use

```ts
import { AppUser, Client, PortalView, ClientStage } from '../../types';

interface Props {
  user: AppUser;
  onSelectClient: (id: Client['id']) => void;
  goToView: (v: PortalView) => void;
}
```

## When extracting

If you copy any non-trivial component, copy this file too (or the subset of types it needs). Trying to redefine these inline always ends in cascading type errors because of how interconnected they are (`Client` references `ClientStage`, `Project` references `Client.id`, etc.).
