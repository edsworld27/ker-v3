# `src/config/` — Static configuration

These files are the wiring layer between data, layout, and roles. The most important file in the entire codebase is here: **`agencyConfig.ts`**.

## Files

### `agencyConfig.ts` — THE single source of truth

Defines the entire role/permission/branding/layout system. Everything user-facing in the app derives from this object.

```ts
export const agencyConfig: AgencyConfig = {
  identity: { name, tagline, primaryColor, secondaryColor, logoUrl },
  features: { crm: true, website: true, ... },           // FeatureKey → boolean
  labels:   { clients: 'Clients', projects: 'Projects', ... }, // LabelKey → display string
  roles:    { Founder: {...}, AgencyManager: {...}, ... },
};
```

Each role inside `roles` is a `RoleConfig`:

```ts
{
  displayName: 'Founder',
  accentColor: '#6366f1',
  allowedViews: '*' | string[],          // access gate per view
  canImpersonate: boolean,
  canManageUsers: boolean,
  canManageRoles: boolean,
  canAccessConfigurator: boolean,
  labelOverrides: { clients?: 'Customers', ... },
  isSystem?: boolean,                     // true for built-in roles
  viewLayouts: {                          // OPTIONAL component-driven layouts
    'dashboard': {
      layout: 'grid-cols-2',
      components: [
        { component: 'AdminStatsWidget', props: {} },
        { component: 'ClientListWidget', props: { limit: 5 } },
      ],
    },
    // ...one entry per view this role uses the new renderer for
  },
}
```

#### How a role's permissions resolve at runtime

1. `useRoleConfig()` reads `currentUser.customRoleId || currentUser.role` to find the role ID.
2. Looks up `agencyConfig.roles[roleId]`.
3. Returns helpers: `canView(view)`, `canDo(action)`, `label(key)`, `feature(key)`.

#### Editing at runtime

`AgencyConfiguratorView` provides a UI to mutate `agencyConfig` via `setAgencyConfig()` in AppContext. Every change immediately re-themes the app, re-evaluates permissions, and re-renders affected views.

### `masterConfig.ts` — Per-agency override container

A wrapper around `Agency`, custom pages, custom sidebar links, and theme. Initial state lives in `initialMasterConfig`. Used to seed the multi-agency setup. Less central than `agencyConfig` — most of the action happens in `agencyConfig`.

### `sidebar.ts` — `getSidebarItems()`

Pure function that returns the sidebar structure for the current user.

```ts
getSidebarItems({
  currentUser,
  activeClient,
  portalView,
  clients, projects, tickets,
  isAgencyRole,
  impersonatingClientId,
  hasPermission,
  handleViewChange,
  setShowEmployeeManagementModal,
  setShowAppLauncherModal,
  sidebarCollapsed,
  agencyConfig,
}): SidebarSection[]
```

Returns sections like:
```
[
  { section: 'WORKSPACE', items: [{ id: 'dashboard', label: 'Dashboard', ... }, ...] },
  { section: 'CLIENTS',   items: [...] },
  { section: 'OPERATIONS', items: [...] },
  ...
]
```

Each section/item is filtered against `hasPermission(view)` so users only see what they're allowed to access. Active item is determined by comparing `portalView` to the item's view.

### `uiMaster.ts` — Aggregator

```ts
export const uiMaster = {
  views: viewsUI,            // from components/views/ui.config.ts
  shared: sharedUI,          // from components/shared/ui.config.ts
  collaboration: collaborationUI,
  modals: modalsUI,
};
```

A convenience namespace that imports the per-folder `ui.config.ts` aggregators. Lets a component reach `uiMaster.modals.SettingsModal.button.className` if it needs cross-folder UI references. Most components don't use this — they import their local `ui.ts` instead.

## When extracting

- **The role/permission system is the most reusable thing here.** Lift `agencyConfig.ts`'s `RoleConfig` shape, `useRoleConfig()` hook, and `hasPermission()` pattern wholesale.
- **`getSidebarItems()` is highly reusable** as a function — input current user + permissions, output sidebar structure. Decouples nav from layout.
- **`viewLayouts`** (the per-role view → component layout map) is a powerful pattern. Pair it with `componentMap` and `DynamicViewRenderer` for the full effect.

## Gotchas

- `agencyConfig.ts` has a **duplicate `client-management` key** (line ~260) that Vite warns about. Harmless.
- `viewLayouts` is OPTIONAL per view. If a role doesn't define `viewLayouts['some-view']`, the renderer falls back to the full-page View component for that view.
