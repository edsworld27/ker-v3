# `src/data/` — Mock seed data and template presets

There is no real backend. Everything renders against in-memory mock data seeded once at startup.

## Files

### `mockData.ts` (~86 lines)

Initial data exported as `initialX` constants, consumed by `useAppLogic` to seed React state:

- **`initialTodos`** — 3 sample `Todo` items (founder-level admin tasks).
- **`initialUsers`** — Sample `AppUser` list covering all roles (Founder, AgencyManager, AgencyEmployee, ClientOwner). One user per role minimum so impersonation/role-switching has something to show.
- **`initialClients`** — Mock `Client` records across all four `ClientStage` values (`discovery`, `design`, `development`, `live`).
- **`initialProjects`** — `Project[]` linked to client IDs.
- **`initialProjectTasks`** — `ProjectTask[]` linked to project IDs, spanning all four statuses.
- **`initialTickets`** — `AppTicket[]` showing both `internal` and `client` types.
- **`initialActivityLogs`** — `LogEntry[]` so log/activity views aren't empty on first load.
- **`initialAiSessions`** — Pre-baked AI conversation history for the AiSessions view.

### `templates.ts` (~375 lines)

Pre-baked **agency presets**. Each is a complete `AgencyTemplate` containing:

- `roles` — full role definitions (allowedViews, viewLayouts, permissions, labels)
- `sidebarLinks` — default nav items
- `features` — feature flag list
- `name` / `description` — for the template picker UI

Activating a template (via `AgencyBuilderView` or `AgencyConfigurator`) writes its `roles` into `agencyConfig.roles`, replacing the current role set. Sidebar links and feature flags are also applied.

Templates make it possible to reset a fresh agency to (for example) "Web Design Agency" preset and immediately have appropriate roles, navigation, and labels — without manually configuring each role.

## Why mock data, not fixtures or factories

This is a UI prototype. Mock data is:

- **Inline** so the app boots with zero setup.
- **Realistic enough** to show every state (active project, completed task, escalated ticket).
- **Mutable in memory** — components write back via `setUsers`/`setClients`/etc.

For a production port, replace these with real API calls in the relevant `useAppLogic` slot, or wrap in a data-fetching hook (TanStack Query, SWR, etc.).

## When extracting

- `mockData.ts` is fine as a template for your own seed/fixture file.
- `templates.ts` is the more interesting file — the template-as-config pattern lets you ship multiple "starter" experiences without different codebases.
