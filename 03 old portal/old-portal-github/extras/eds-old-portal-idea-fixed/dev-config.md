# Aqua Portal v9 — Developer Configuration & State of Play

This document is the **primary source of truth** for any developer picking up this codebase. Read it fully before making changes.

---

## 1. What Is This App?

**Aqua Portal is a white-label, multi-tenant client portal for digital agencies.**

An agency (the "Founder") uses it to manage clients and internal teams. Each client gets a branded, secure portal to collaborate, track projects, and access resources. The app is designed to be fully dynamic — roles, labels, features, and branding are all configured at runtime via the Agency Configurator.

### Portals

- **Operations Portal** — Agency staff view (Founder, Manager, Employee roles). Accessed when `isAgencyRole === true` and not impersonating a client.
- **Client Portal** — Client view (ClientOwner, ClientEmployee roles). Stage-driven loadout: discovery → design → development → live.

### Key Roles (defined in `src/config/agencyConfig.ts`)

| Role | Access | Notes |
|------|--------|-------|
| `Founder` | Everything (`allowedViews: '*'`) | `canImpersonate: true`, `canAccessConfigurator: true` |
| `AgencyManager` | Most ops views | `canManageUsers: true` |
| `AgencyEmployee` | Core ops views only | |
| `ClientOwner` | Client portal | Has label overrides (e.g. "Your Projects") |
| `ClientEmployee` | Minimal client views | |

Custom roles can be created in the Configurator and are stored in `agencyConfig.roles`.

---

## 3. The End-Game: A Component-Driven Layout System

The current architecture is a stepping stone. The ultimate goal is a system where views themselves are not static components but are dynamically assembled based on the `agencyConfig`.

### The Vision

Instead of a role having access to a hardcoded `ProjectHubView`, a role's configuration will define *which components make up their version of the Project Hub*.

This requires three key pieces:

**1. An Evolved `agencyConfig` Structure**

The `allowedViews` key will be replaced by a richer `viewLayouts` object.

```typescript
// src/config/agencyConfig.ts
roles: {
  Founder: {
    viewLayouts: {
      dashboard: {
        layout: 'grid-cols-3',
        components: [
          { component: 'RevenueWidget', props: {} },
          { component: 'TeamStatusWidget', props: {} },
          { component: 'ProjectPipelineWidget', props: {} }
        ]
      }
    }
  }
}
```

**2. A `componentMap.ts` File**

This file will map string identifiers from the config to actual React component imports. This is the bridge between the JSON-like config and the React world.

```typescript
// src/components/componentMap.ts
import { RevenueWidget } from './widgets/RevenueWidget';
import { TeamStatusWidget } from './widgets/TeamStatusWidget';

export const componentMap = {
  RevenueWidget,
  TeamStatusWidget,
};
```

**3. A Generic `DynamicViewRenderer.tsx` Component**

Instead of dozens of view files, we'll have one master renderer. It will read the `viewLayouts` for the current user's role, look up the components in the `componentMap`, and render them with their specified props. This makes the entire application's layout driven by a single config object.

---

## 2. Architecture Overview

### The Two Config Layers

**Layer 1 — UI Config (visual/layout)**
Every component has a `ui.ts` file in its folder. All Tailwind classes, text labels, icons, animation objects live there — zero hardcoded values in `.tsx` files.

```
[Component]/ui.ts  →  [directory]/ui.config.ts  →  src/config/uiMaster.ts
```

**Layer 2 — Agency Config (behaviour/permissions)**
One file governs the entire app's role system, feature flags, labels, and branding.

```
src/config/agencyConfig.ts  →  AppContext (runtime state)  →  useRoleConfig() hook  →  every component
```

### Key Files

| File | Purpose |
|------|---------|
| `src/config/agencyConfig.ts` | THE single source of truth. Roles, features, labels, identity/branding. Edit here to change app-wide defaults. |
| `src/hooks/useRoleConfig.ts` | Hook: call in any component to get `canView()`, `canDo()`, `label()`, `feature()`, `accentColor` for current user's role. |
| `src/hooks/useTheme.ts` | Hook: call to get typed color tokens (`theme.primary`, `theme.primaryBgStyle`) sourced from `agencyConfig.identity`. |
| `src/context/AppContext.tsx` | Provides `agencyConfig` + `setAgencyConfig` as runtime state. Changes propagate instantly app-wide. |
| `src/config/sidebar.ts` | `getSidebarItems()` — filters sidebar by `agencyConfig` role permissions and applies label overrides. |
| `src/config/uiMaster.ts` | Aggregates all `ui.config.ts` files. Reference point for all visual config. |
| `src/App.tsx` | Top-level provider. Owns all state. Contains `hasPermission()`, `canCurrentUserImpersonate()`, `label()`, `featureEnabled()` helpers. |
| `src/views/AgencyConfiguratorView.tsx` | 4-tab runtime UI for editing `agencyConfig` (Identity, Roles & Permissions, Feature Flags, Labels). |

---

## 3. The Agency Config — Full Reference

Location: `src/config/agencyConfig.ts`

This is the "fake database". It is the **only** file that should contain hardcoded values for roles, colours, labels, and feature flags.

### Structure

```typescript
export const agencyConfig: AgencyConfig = {
  identity: {
    name: 'Aqua Digital HQ',
    tagline: 'Your Agency Portal',
    logo: null,
    primaryColor: '#6366f1',   // ← THE only hardcoded primary colour in the entire app
    secondaryColor: '#10b981',
  },
  roles: {
    Founder: {
      displayName: 'Founder',
      accentColor: '#6366f1',
      allowedViews: '*',           // '*' = full access
      canImpersonate: true,
      canManageUsers: true,
      canManageRoles: true,
      canAccessConfigurator: true,
      labelOverrides: {},
      isSystem: true,              // system roles cannot be deleted
    },
    // AgencyManager, AgencyEmployee, ClientOwner, ClientEmployee ...
  },
  features: {
    crm: true,
    website: true,
    resources: true,
    aiAssistant: true,
    collaboration: true,
    featureRequests: true,
    supportTickets: true,
    activityLogs: true,
    employeeManagement: true,
    agencyBuilder: true,
    analytics: true,
  },
  labels: {
    clients: 'Clients',
    projects: 'Projects',
    team: 'Team',
    portal: 'Portal',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    tickets: 'Tickets',
    resources: 'Resources',
    support: 'Support',
  },
};
```

### Feature Flags Explained

Feature flags are **global switches for embedded tools/integrations** — not role-based view access (that's `allowedViews`). Examples:
- `crm: false` → CRM view hidden for everyone
- `aiAssistant: false` → Aqua AI view hidden for everyone
- `website: false` → Website editor hidden for everyone

Role-based access is separate — a feature can be globally on but still blocked for a specific role via `allowedViews`.

---

## 4. Permission & Role Resolution — How It Works

### `hasPermission(view)` in App.tsx

```typescript
const hasPermission = (view: PortalView | string): boolean => {
  const effectiveUser = impersonatedUserEmail
    ? users.find(u => u.email === impersonatedUserEmail)
    : currentUser;
  const roleId = effectiveUser?.customRoleId || effectiveUser?.role || 'AgencyEmployee';
  const roleConfig = agencyConfig.roles[roleId];
  if (!roleConfig) return false;
  if (roleConfig.allowedViews === '*') return true;
  return (roleConfig.allowedViews as string[]).includes(view);
};
```

- Reads **only** from `agencyConfig.roles` — NOT from `currentUser.permissions` (those arrays on user objects are dead code now)
- When impersonating a user, resolves permissions against the **impersonated user's** role in agencyConfig
- Changes made in the Configurator immediately affect what every role can see

### `canCurrentUserImpersonate()` in App.tsx

```typescript
const canCurrentUserImpersonate = (): boolean => {
  const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
  return agencyConfig.roles[roleId]?.canImpersonate ?? false;
};
```

- Gates both the "Switch User" dropdown and the "View Workspace" button on client cards
- Only roles with `canImpersonate: true` in agencyConfig see impersonation UI

### `useRoleConfig()` hook — use this in individual view components

```typescript
const { canView, canDo, label, feature, accentColor, primaryColor } = useRoleConfig();
// canView('crm')          → boolean
// canDo('impersonate')    → boolean
// label('clients')        → 'Clients' or role override
// feature('aiAssistant')  → boolean
```

### `useTheme()` hook — use this for color tokens

```typescript
const theme = useTheme();
// theme.primary           → '#6366f1' (or whatever is set in agencyConfig)
// theme.primaryBgStyle    → { backgroundColor: '#6366f1' }
// theme.agencyName        → 'Aqua Digital HQ'
```

### Color Switcher Variables

In App.tsx a `useEffect` syncs `agencyConfig.identity.primaryColor` and `secondaryColor` to CSS custom properties:
- `--color-primary`
- `--color-secondary`

These update in real-time when the Configurator saves. Use `var(--color-primary)` in inline styles when Tailwind JIT can't handle dynamic values.

---

## 5. Sidebar System

`src/config/sidebar.ts` — `getSidebarItems()` takes `agencyConfig` as a param and:

1. Filters agency workspace items by `agencyConfig.roles[roleId].allowedViews`
2. Uses `agencyConfig.labels` (with role-level overrides) for display names
3. Shows "Admin Tools" section (logs, configurator) only if `canAccessConfigurator` or specific view access
4. Uses `agencyConfig.identity.name` as the section header (not hardcoded "Agency Workspace")
5. For client portal: stage-based loadout (discovery/design/development/live) — unchanged

---

## 6. Folder Structure

```
src/
├── config/
│   ├── agencyConfig.ts        ← THE fake database. Edit here for defaults.
│   ├── masterConfig.ts        ← Master-level app config (separate from agency config)
│   ├── sidebar.ts             ← Sidebar item resolver (reads agencyConfig)
│   └── uiMaster.ts            ← Aggregated UI config tree
├── context/
│   ├── AppContext.tsx          ← Provides agencyConfig, setAgencyConfig, all app state
│   └── InboxContext.tsx
├── hooks/
│   ├── useRoleConfig.ts        ← Role permission/label/feature hook
│   └── useTheme.ts             ← Color token hook
├── components/
│   ├── shared/
│   │   ├── SidebarItem/        ← ui.ts + component + index.ts
│   │   ├── DashboardWidget/
│   │   ├── RoleSwitcher/
│   │   ├── StageDropdown/
│   │   ├── AIChatbot/
│   │   └── ui.config.ts        ← Aggregates all shared UI configs
│   ├── views/
│   │   ├── AgencyBuilderView/
│   │   ├── CustomPageView/
│   │   ├── EmployeeManagementView/
│   │   ├── PageBuilder/
│   │   ├── RoleBuilder/
│   │   ├── InboxView/
│   │   ├── SupportView/
│   │   ├── DataHubView/
│   │   ├── ... (all views foldered)
│   │   └── ui.config.ts        ← Aggregates all view UI configs
│   └── modals/
│       ├── AddClientModal/
│       ├── AddUserModal/
│       ├── ... (all modals foldered)
│       └── ui.config.ts
├── views/                      ← Legacy standalone views (being migrated)
│   ├── AgencyClientsView.tsx
│   ├── AgencyConfiguratorView.tsx
│   └── GlobalSettingsView.tsx
└── types.ts                    ← All TypeScript interfaces
```

Every component follows this pattern:
```
ComponentName/
├── ui.ts          ← ALL hardcoded values (classes, labels, icons, animations)
├── ComponentName.tsx  ← Zero hardcoded values, imports from ./ui
└── index.ts       ← Barrel: export * from './ComponentName'
```

---

## 7. Impersonation Flow

Impersonation lets authorized roles see the app from another user's perspective.

**Two types:**
1. **User impersonation** (`impersonatedUserEmail`) — Switch User dropdown in avatar menu. Shows a blue banner. `hasPermission` resolves against the impersonated user's role config.
2. **Client workspace impersonation** (`impersonatingClientId`) — "View Workspace" button on client cards. Shows an amber banner. Loads the client portal with that client's stage-based sidebar.

**Gating:**
- Both require `agencyConfig.roles[currentRole].canImpersonate === true`
- The "Switch User" dropdown is hidden for roles where `canImpersonate` is false
- The "View Workspace" button is hidden via `canImpersonate` prop on `AgencyClientsView`

---

## 8. Agency Configurator (Runtime UI)

Location: `src/views/AgencyConfiguratorView.tsx`

4-tab UI for editing `agencyConfig` at runtime:

| Tab | What it edits |
|-----|--------------|
| Identity & Theme | `agencyConfig.identity` — name, tagline, logo, primary/secondary colours |
| Roles & Permissions | `agencyConfig.roles` — per-role accordion: display name, accent colour, capability flags, allowed views. Add/delete custom roles. |
| Feature Flags | `agencyConfig.features` — toggle switches for all 11 feature flags |
| Labels | `agencyConfig.labels` — rename all label keys app-wide. Reset-to-default buttons. |

**Draft-then-save pattern:** All edits held in local `draft` state. "Save Changes" calls `setAgencyConfig(draft)` which pushes to AppContext and propagates everywhere instantly. No page refresh needed.

Only accessible to roles with `canAccessConfigurator: true`.

---

## 9. What Is Complete

- [x] All components refactored into folders with `ui.ts` files
- [x] `uiMaster.ts` aggregating all UI configs
- [x] `agencyConfig.ts` as single fake database
- [x] `useRoleConfig` hook
- [x] `useTheme` hook + CSS custom property switcher variables
- [x] `agencyConfig` wired into AppContext as runtime state
- [x] `AgencyConfiguratorView` rebuilt (4 tabs, draft-then-save)
- [x] `hasPermission()` reads `agencyConfig.roles` — NOT hardcoded user.permissions arrays
- [x] Impersonation gated by `canImpersonate` in agencyConfig
- [x] Sidebar driven by agencyConfig (labels, role filtering, identity name as header)
- [x] Feature flag guards: `crm`, `website`, `aiAssistant`, `collaboration`, `resources`, `supportTickets`, `featureRequests`, `activityLogs`
- [x] Header title uses label resolver (not raw view ID string)
- [x] "Switch User" dropdown gated by `canCurrentUserImpersonate()`
- [x] "View Workspace" button hidden for non-impersonating roles
- [x] `isAgencyAdmin` / `isAgencyEmployee` / `isAgencyRole` derived from `agencyConfig` (not hardcoded role name strings)
- [x] `RoleBuilder` rewritten to read/write `agencyConfig.roles` via `setAgencyConfig` — uses `RoleConfig` shape, no longer touches `agencies[].roles`

---

## 10. What Is Still To Do

### Priority 1 — Adopt `useRoleConfig` / `useTheme` in View Components (Polish)

**Status: Optional / progressive**

The hooks exist and work but individual view components still have hardcoded strings for page headings and hardcoded Tailwind colour classes.

**Labels:** Views with headings like `<h1>Clients</h1>` should call `label('clients')` from `useRoleConfig()`. The sidebar already does this — it just hasn't been applied inside the views themselves yet.

**Colours:** Components using `bg-indigo-600` / `text-indigo-400` etc. can progressively adopt `useTheme()` or `var(--color-primary)` so the Configurator's primary colour change visually updates inside views too.

Pattern:
```tsx
// In any view component:
import { useRoleConfig } from '../../../hooks/useRoleConfig';
import { useTheme } from '../../../hooks/useTheme';

const { label } = useRoleConfig();
const theme = useTheme();

// <h1>{label('clients')}</h1>
// <div style={theme.primaryBgStyle} />
// <div style={{ color: 'var(--color-primary)' }} />
```

### Priority 2 — Dead Code Cleanup

- `AppUser.permissions[]` on each user in App.tsx seed data is now dead code — `hasPermission` reads `agencyConfig.roles` exclusively. Safe to remove from all user objects.
- `Client.permissions[]` on client seed data — same, no longer read.
- `agencies[].roles` (the old `CustomRole[]` arrays) — now unused. The `Agency` type still references them but nothing acts on them.

### Not Doing Yet — localStorage Persistence

User has explicitly deferred this. When ready: persist `agencyConfig` to `localStorage` so Configurator changes survive page refresh.

```typescript
// In App.tsx — initialise from localStorage:
const [agencyConfig, setAgencyConfig] = useState<AgencyConfig>(() => {
  const saved = localStorage.getItem('agencyConfig');
  return saved ? JSON.parse(saved) : defaultAgencyConfig;
});

// Watch for changes and persist:
useEffect(() => {
  localStorage.setItem('agencyConfig', JSON.stringify(agencyConfig));
}, [agencyConfig]);
```

---

## 11. Adding a New Role (Step-by-Step)

1. Open `src/config/agencyConfig.ts`
2. Add a new entry to the `roles` object:
```typescript
MyCustomRole: {
  displayName: 'Custom Role',
  accentColor: '#f59e0b',
  allowedViews: ['dashboard', 'project-hub', 'task-board'],
  canImpersonate: false,
  canManageUsers: false,
  canManageRoles: false,
  canAccessConfigurator: false,
  labelOverrides: {},
  isSystem: false,  // false = can be deleted via Configurator
},
```
3. Assign a user this role: set `user.role = 'MyCustomRole'` or `user.customRoleId = 'MyCustomRole'`
4. That user will now only see views listed in `allowedViews`, with the sidebar filtered accordingly.

---

## 12. Adding a New Feature Flag (Step-by-Step)

1. Add the key to `FeatureKey` union type in `agencyConfig.ts`:
```typescript
export type FeatureKey = 'crm' | 'website' | ... | 'myNewFeature';
```
2. Add default value to `agencyConfig.features`:
```typescript
myNewFeature: true,
```
3. Guard the view in App.tsx:
```tsx
{portalView === 'my-new-feature' && featureEnabled('myNewFeature') && (
  <MyNewFeatureView />
)}
```
4. The Configurator's Feature Flags tab will automatically show a toggle for it.

---

## 13. Colour System

All colours originate from `agencyConfig.identity.primaryColor` and `secondaryColor`.

A `useEffect` in App.tsx syncs them to CSS custom properties on `document.documentElement`:
- `--color-primary`
- `--color-secondary`

When these change (via Configurator), every element using them updates instantly.

**Three ways to use colours in components:**

```tsx
// 1. CSS custom property (inline style) — for dynamic values Tailwind can't handle
<div style={{ backgroundColor: 'var(--color-primary)' }} />

// 2. useTheme hook — typed tokens
const theme = useTheme();
<div style={theme.primaryBgStyle} />

// 3. useRoleConfig — per-role accent colour
const { accentColor } = useRoleConfig();
<div style={{ borderColor: accentColor }} />
```

Avoid hardcoding `#6366f1` or `indigo-600` in new components. Use the above patterns.

---

## 14. TypeScript Types Reference

Key types in `src/types.ts`:

- `AppUser` — `{ id, name, email, role, customRoleId?, permissions[], avatar, ... }`
- `Client` — `{ id, name, email, stage, permissions[], resources[], ... }`
- `PortalView` — union of all valid view strings
- `Agency` — `{ id, name, roles: CustomRole[], ... }` (old system — being superseded by agencyConfig)
- `CustomRole` — old role type, being phased out in favour of `RoleConfig` from agencyConfig
- `AgencyConfig` — full config shape (from `src/config/agencyConfig.ts`)
- `RoleConfig` — per-role shape within AgencyConfig
- `FeatureKey` / `LabelKey` — union types for type-safe config access

Note: `AppUser.permissions[]` and `Client.permissions[]` are dead code. `hasPermission()` now reads `agencyConfig.roles` exclusively.
