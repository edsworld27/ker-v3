# `src/hooks/` — Custom hooks

Three hooks. The first is huge; the other two are tiny but called from almost every component.

## Files

### `useAppLogic.ts` — The state factory (~300+ lines)

The single hook that owns all of the app's state and exposes all of the action handlers. Called once, in `App.tsx`. Its return value is destructured and forwarded to `<AppProvider>`.

Roughly, `useAppLogic` does four things:

1. **Declares all `useState` slots** — `step`, `portalView`, `users`, `clients`, `projects`, `projectTasks`, `tickets`, `activityLogs`, `customPages`, `agencyConfig`, etc. All seeded from `initialX` exports in `data/mockData.ts` and `config/`.
2. **Computes derived state** — `currentUser` (lookup against users by email), `currentAgency` (lookup against agencies), `isAgencyAdmin`, `isAgencyEmployee`.
3. **Defines action handlers** — `handleViewChange`, `handleImpersonate`, `handleStopImpersonating`, `handleEditClient`, `handleUpdateClientStage`, `handleDeleteUser`, `addLog`, `canCurrentUserImpersonate`. These usually update state and append a `LogEntry` to `activityLogs`.
4. **Returns one giant object** with everything above.

> **If you're extracting the state architecture:** treat `useAppLogic` as the template. The pattern (one hook = all app state + all handlers, then forwarded into a context) is portable. You may want to split it into smaller hooks (`useUsers`, `useProjects`, etc.) for a real app — this version monoliths it for prototype simplicity.

### `useTheme.ts` — Color/branding tokens

Tiny accessor hook that reads `agencyConfig.identity` and exposes typed tokens.

```ts
const theme = useTheme();
theme.primary;        // '#6366f1' — raw hex, use in style={{ }}
theme.secondary;
theme.agencyName;
theme.tagline;
theme.logo;
```

Why bother instead of reading `agencyConfig` directly:

- Type-safe.
- Survives rename/refactor of `agencyConfig.identity` shape.
- Pairs naturally with the `--color-primary` CSS var pattern (App.tsx writes the var, `useTheme` reads the same source for JS-side use).

### `useRoleConfig.ts` — Role-aware helpers

Returns a resolved config for the current user's role, with helper methods.

```ts
const { canView, canDo, label, feature, accentColor, agencyName } = useRoleConfig();

if (!canView('crm')) return null;            // permission gate
if (!feature('analytics')) return null;      // feature flag gate
<h1>{label('clients')}</h1>                  // localized/overridden label
if (canDo('manageUsers')) {
  <button>Add User</button>
}
```

How it resolves:

1. Reads `currentUser.customRoleId || currentUser.role` from AppContext.
2. Looks up `agencyConfig.roles[roleId]`.
3. Wraps the raw `RoleConfig` with the helpers above.
4. `label(key)` checks `roleConfig.labelOverrides[key]` first, then falls back to `agencyConfig.labels[key]`, then to the raw key string.

This hook is the canonical way to do permission/label/feature checks. Don't read `agencyConfig` directly in components — go through this hook.

## When extracting

- **`useTheme` and `useRoleConfig` are tiny and self-contained.** Lift them with their dependencies (`agencyConfig`, `AppContext`).
- **`useAppLogic` is monolithic on purpose.** Don't lift the whole thing — pick out the handlers you need (`addLog`, `handleImpersonate`, etc.) and the state slots that go with them.
- The pattern of "state hook → forwarded context → component-side hook" is a common React idiom that scales well as long as you split contexts when state slices stop sharing subscribers (see `context/README.md`).
