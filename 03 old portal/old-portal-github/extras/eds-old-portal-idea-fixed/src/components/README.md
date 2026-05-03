# `src/components/` — All React components

Where the UI lives. ~70 components total, organized by purpose.

## Top-level files

| File | Purpose |
| --- | --- |
| **`componentMap.ts`** | The string-keyed registry of every renderable component. The ONLY place components are imported by name for use by the dynamic renderer. |
| **`DynamicViewRenderer.tsx`** | Routes a `viewId` to either: (a) the role's `viewLayouts[viewId]` config rendered via `DynamicRenderer`, or (b) the full-page View component as fallback. |
| **`ModalManager.tsx`** | Reads every `show*Modal` boolean from `ModalContext` and conditionally mounts each modal component. |
| **`AIChatbot/`** | Gemini-powered chat assistant (folder — see its README). |

## Subfolders

| Folder | What it holds | README |
| --- | --- | --- |
| `auth/` | Pre-portal screens: `LoginView`, `SecurityCheckView`. Used by App.tsx during `'login'` and `'security'` steps. | (covered here) |
| `views/` | 41 full-page view components, one folder each. Listed in `componentMap` and rendered when DynamicViewRenderer falls back to the transitional path. | [README](./views/README.md) |
| `widgets/` | 18 composable cards. Referenced by `agencyConfig.viewLayouts[role][view].components` to assemble dashboards from config. | [README](./widgets/README.md) |
| `modals/` | 18 overlay modals. Mounted en masse by `ModalManager`, controlled via `ModalContext`. | [README](./modals/README.md) |
| `shared/` | Reusable primitives: `DashboardWidget`, `SidebarItem`, `RoleSwitcher`, `StageDropdown`. | [README](./shared/README.md) |
| `collaboration/` | Project collaboration widgets: `ProjectChat`, `ProjectTimeline`, `DesignConcepts`, `SyncCard`. Used inside `CollaborationView`. | [README](./collaboration/README.md) |
| `DynamicRenderer/` | The recursive renderer that turns a `viewLayouts` config object into mounted JSX. | [README](./DynamicRenderer/README.md) |
| `AIChatbot/` | Gemini chatbot widget. | [README](./AIChatbot/README.md) |

## auth/ — small enough to document inline

### `LoginView.tsx`

The first screen users see. Renders four "Login as X" buttons (Founder / Client / Operator / Employee) plus the role-switcher widget in the top-right. Each button calls `onQuickLogin(name, email, avatar)` from props, which `App.tsx` uses to set `userProfile` and advance `step` to `'portal'`.

There's no real auth — clicking a button picks a role and skips straight in.

### `SecurityCheckView.tsx`

A 4-digit code entry form (the `'security'` step). Reads `code` and `setCode` from props. Calls `onVerify` when all 4 digits are filled. There's no actual code verification — any 4 digits pass.

Both auth files are pure UI. Replace with real auth integration when porting.

## componentMap.ts — the registry pattern

Two import sections, two type unions:

```ts
export const componentMap = {
  // Widgets — composable, referenced by viewLayouts:
  DashboardWidget, AdminStatsWidget, ClientListWidget, /* ... */
  // Views — full-page, transitional fallback:
  CrmView, AgencyHubView, ProjectHubView, /* ... */
  AIChatbot,
} as const;

export type WidgetName = 'DashboardWidget' | 'AdminStatsWidget' | /* ... */;
export type ViewName   = 'CrmView' | 'AgencyHubView' | /* ... */;
```

To add a new component:
1. Import it at the top.
2. Add it to the map object.
3. Add its key to the appropriate type union.

Then `agencyConfig.viewLayouts[role][view].components` can reference it by string and `DynamicRenderer` will mount it.

> ⚠️ Currently has duplicate imports of `ProjectListWidget` and `TaskListWidget`. Tolerated by tsc with current settings; clean up before extracting.

## ModalManager.tsx

Pattern:

```tsx
const { showAddClientModal, showSettingsModal, /* ... */ } = useModalContext();

return (
  <>
    {showAddClientModal && <AddClientModal />}
    {showSettingsModal && <SettingsModal />}
    {/* ...18 modals */}
  </>
);
```

Each modal reads its own `setShow*Modal(false)` from context to dismiss itself. `ModalManager` doesn't pass props down — modals self-source data from `useAppContext()`.

## DynamicViewRenderer.tsx

Receives `viewId` and decides what to render:

```tsx
function DynamicViewRenderer({ viewId }) {
  const { agencyConfig, currentUser } = useAppContext();
  const roleId = currentUser?.customRoleId || currentUser?.role;
  const layout = agencyConfig.roles[roleId]?.viewLayouts?.[viewId];

  if (layout) {
    return <DynamicRenderer layout={layout} />;     // component-driven path
  }

  const ViewComponent = componentMap[viewIdToComponentName(viewId)];
  return ViewComponent ? <ViewComponent /> : <NotFound />;  // fallback
}
```

This is how the codebase progressively migrates views: an old monolithic View can be replaced piecemeal by adding a `viewLayouts` entry that decomposes it into widgets. As long as `viewLayouts[role][view]` exists, the View component for that view is bypassed.

## When extracting

- The **componentMap + DynamicRenderer + viewLayouts** triad is the single most reusable pattern in this codebase. Lift it as a unit.
- Individual widgets are mostly self-contained — see `widgets/README.md`.
- Individual views are usually heavy and tightly coupled to the codebase's contexts/types — extract whole-folder, not file-by-file.
