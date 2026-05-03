# `src/components/shared/` — Reusable primitives

Four reusable components used throughout the app. These are the most extractable pieces in the codebase — all are self-contained and dependency-light.

## The four components

### `DashboardWidget/`

A generic stat card with icon + label + value + color accent. Used by `AdminStatsWidget` and elsewhere.

```tsx
<DashboardWidget
  icon={Users}
  label="Clients"
  value={clients.length}
  color="bg-indigo-500"
/>
```

The visual treatment (rounded glass card, hover state, gradient backdrop) is consistent across all stat tiles in the app.

### `RoleSwitcher/`

The floating button group in the top-right corner showing the four built-in roles (Founder / Client / Operator / Employee). Click one to switch the current user's role mid-session — useful during the prototype phase to compare role-specific UIs without re-logging-in.

Internally it calls `setUserProfile()` and `setImpersonatedUserEmail()` to flip identity.

In a production port you'd remove this entirely (it's a developer aid).

### `SidebarItem/`

Single nav row in the sidebar. Used by `App.tsx` when rendering each section returned from `getSidebarItems()`.

```tsx
<SidebarItem
  icon={LayoutDashboard}
  label="Dashboard"
  active={portalView === 'dashboard'}
  onClick={() => handleViewChange('dashboard')}
  collapsed={sidebarCollapsed}
  badge={3}                  // optional unread/count indicator
/>
```

Handles:
- Active-state highlight (uses `var(--color-primary)`).
- Collapsed-state (icon-only) layout.
- Badge rendering.
- Hover transitions.

### `StageDropdown/`

A custom dropdown for changing a `Client.stage` (`discovery` → `design` → `development` → `live`). Renders the four stages with color-coded badges. Used inside `ClientDirectoryWidget` and the CRM views.

Calls `handleUpdateClientStage(clientId, newStage)` from AppContext on selection — which updates the client in state and emits an activity log entry.

## Folder anatomy

```
SomeShared/
├── SomeShared.tsx
├── ui.ts            ← Tailwind classes as `someSharedUI` object
└── index.ts         ← Re-exports
```

## ui.config.ts

```ts
export const sharedUI = {
  DashboardWidget: dashboardWidgetUI,
  SidebarItem: sidebarItemUI,
  RoleSwitcher: roleSwitcherUI,
  StageDropdown: stageDropdownUI,
};
```

## When extracting

- **`DashboardWidget`, `SidebarItem`, `StageDropdown`** are the cleanest lifts in the entire codebase. Take them as-is.
- **`RoleSwitcher`** is a dev aid — almost certainly don't lift it. Useful as a reference for "how to bind to AppContext from a free-floating UI element."
- All four use `var(--color-primary)` and `glass-card` — bring `src/index.css` along.
