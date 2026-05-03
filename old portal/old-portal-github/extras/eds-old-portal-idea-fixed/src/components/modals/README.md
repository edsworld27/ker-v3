# `src/components/modals/` — Overlay modals

18 modals + an aggregator `ui.config.ts` and an `index.ts` re-exporter. Every modal in the app lives here.

## How modals work

Three-piece system:

1. **State** — a boolean `show*Modal` lives in `ModalContext` (e.g. `showAddClientModal`).
2. **Trigger** — anywhere in the app calls `setShowAddClientModal(true)` to open it.
3. **Mount** — `<ModalManager />` (in `src/components/ModalManager.tsx`) reads every `show*Modal` boolean and conditionally renders the corresponding component.

Each modal:
- Reads its own `setShow*Modal(false)` from `useModalContext()` to dismiss.
- Self-sources data via `useAppContext()`.
- Uses motion / AnimatePresence for entrance/exit animation.

This means **modals don't take props** — they're decoupled from their triggers.

## All 18 modals

| Modal | Trigger | What it does |
| --- | --- | --- |
| `AddClientModal` | "Add Client" buttons | Form to create a new `Client` |
| `EditClientModal` | Click a client card | Edit existing client; uses `editingClient` from AppContext |
| `AddRoleModal` | RoleBuilder + AgencyConfigurator | Form to create a custom role with full config |
| `AddUserModal` | "Add User" in EmployeeManagement | Form to add an `AppUser` |
| `EmployeeManagementModal` | Sidebar / header button | Manage agency employees (also a full view) |
| `EmployeeProfileModal` | Click an employee | View/edit single employee |
| `NewProjectModal` | "New Project" button | Form to create a `Project` |
| `TaskModal` | "New Task" button | Form to create a `ProjectTask` |
| `TaskDetailModal` | Click a task | View task with steps, attachments, comments; uses `selectedTask` from AppContext |
| `GlobalTasksModal` | Header CheckSquare icon | Cross-project task list |
| `TicketModal` | "New Ticket" | Create a support ticket |
| `SupportTicketsModal` | Sidebar / header | Browse tickets in modal form |
| `ConfirmationModal` | Programmatic — `confirmationConfig` in AppContext | Generic confirm/cancel dialog. Set the config from anywhere; modal reads it. |
| `InboxModal` | Header Bell/Clock icon | Quick inbox preview |
| `AppLauncherModal` | Sidebar "Apps" item | Grid of app shortcuts |
| `AgencyCommunicateModal` | Agency operations | Internal agency chat |
| `PlanModal` | Sidebar "Your Plan" | Subscription / billing for client |
| `SettingsModal` | Sidebar Settings | App settings (in modal, not a full view) |

## ConfirmationModal pattern (worth highlighting)

A generic confirm dialog. Open it from anywhere by setting `confirmationConfig` in AppContext:

```ts
ctx.setConfirmationConfig({
  title: 'Delete this client?',
  message: 'This cannot be undone.',
  onConfirm: () => deleteClient(id),
  confirmText: 'Delete',
  cancelText: 'Cancel',
});
```

ConfirmationModal renders whenever `confirmationConfig` is non-null. Reuse it instead of writing custom `window.confirm()` shims.

## Folder anatomy

Each modal:

```
SomeModal/
├── SomeModal.tsx     ← Component
├── ui.ts             ← Co-located Tailwind classes as `someModalUI`
└── index.ts          ← Re-exports
```

Same pattern as views.

## ui.config.ts

Aggregates each modal's `ui.ts`:

```ts
export const modalsUI = {
  AddClientModal: addClientModalUI,
  TaskDetailModal: taskDetailModalUI,
  // ...
};
```

## index.ts

Barrel export. Re-exports every modal so other code can `import { AddClientModal, TaskModal } from '../modals'` without 18 separate import paths.

## When extracting

- **Best lifts:** `ConfirmationModal` (generic), `TaskModal`, `NewProjectModal`, `AddUserModal`. Pure forms with one or two inputs.
- **The pattern itself is highly reusable**: `ModalContext` + `ModalManager` + per-modal context-driven open/close. Avoids prop-drilling toggles through layout layers.
- **Heavy:** `EmployeeManagementModal`, `AgencyCommunicateModal`, `TaskDetailModal`. They have substantial internal state and dependencies on multiple context slots.
- **Don't forget the trigger.** Lifting a modal also requires lifting (or reproducing) the corresponding `show*Modal` toggle in your version of `ModalContext`.
