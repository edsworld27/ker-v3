# `src/` — All app source

This is the entire codebase. ~17,300 lines of TypeScript across the directories below.

## Entry points

```
index.html              ← Vite HTML, mounts <div id="root">
└── src/main.tsx        ← createRoot, wraps <App> in <ModalProvider>
    └── src/App.tsx     ← Root component: state machine + sidebar + header + main
```

`App.tsx` (~600 lines) is intentionally a single big component. It owns:

- The 4-step state machine (`'login' | 'security' | 'portal' | 'setup'`)
- The sidebar and header layout (chrome around the dynamic content area)
- The impersonation banners
- The CSS-variable theming side-effect (`useEffect` writing `--color-primary`)
- The wiring of `useAppLogic` → `<AppProvider>` (passing every state slot down)
- An `iconMap` export — string → lucide icon component (used by sidebar config and other config-driven icon lookups)

The actual VIEW content (everything below the header) is rendered by `<DynamicViewRenderer viewId={portalView} />` — see `src/components/DynamicRenderer/`.

## Directory map

```
src/
├── App.tsx                       App shell: login flow, sidebar, header, main mount point
├── main.tsx                      React 19 createRoot entry
├── index.css                     Tailwind v4 + custom utilities (.glass-card, .bg-glow, .custom-scrollbar)
│
├── types/                        Shared TypeScript interfaces and unions
├── context/                      React contexts (AppContext, ModalContext, InboxContext)
├── config/                       Static config (agencyConfig, masterConfig, sidebar, uiMaster)
├── hooks/                        Custom hooks (useAppLogic, useTheme, useRoleConfig)
├── data/                         Mock seed data + AI scripted prompts
└── components/                   All React components
    ├── auth/                     LoginView + SecurityCheckView
    ├── views/                    41 full-page view components (one folder each)
    ├── widgets/                  18 composable dashboard widgets
    ├── modals/                   18 overlay modals
    ├── shared/                   DashboardWidget, SidebarItem, RoleSwitcher, StageDropdown
    ├── collaboration/            ProjectChat, ProjectTimeline, DesignConcepts, SyncCard
    ├── AIChatbot/                Gemini-powered chatbot
    ├── DynamicRenderer/          The viewLayout → JSX renderer
    ├── DynamicViewRenderer.tsx   The view router (viewId → mounted component)
    ├── ModalManager.tsx          Mounts every modal and reads ModalContext to show/hide
    └── componentMap.ts           String → component dictionary used by viewLayouts
```

## Reading order if you've never seen this codebase

1. `types/index.ts` — defines the entire domain
2. `App.tsx` — see how everything is wired
3. `hooks/useAppLogic.ts` — all state setup and handlers
4. `context/AppContext.tsx` — the bag passed to every component
5. `config/agencyConfig.ts` — roles, permissions, view layouts
6. `components/componentMap.ts` — what's renderable by name
7. `components/DynamicRenderer/DynamicRenderer.tsx` — how a layout config becomes JSX
8. `components/DynamicViewRenderer.tsx` — how a viewId picks between layout-driven and full-view fallback

## Conventions you'll see everywhere

| Convention | Example | Why |
| --- | --- | --- |
| Co-located `ui.ts` per component | `views/CrmView/ui.ts` | All Tailwind classes live here as `crmViewUI` object. Component imports `crmViewUI as ui` and reads `ui.someClass`. |
| `index.ts` re-exports | `views/CrmView/index.ts` | Allows `import { CrmView } from '../views/CrmView'` (folder import). |
| `iconName` strings in config | `{ iconName: 'Users' }` | Looked up against `iconMap` from `App.tsx` to get the actual lucide component. Lets icons live in JSON-like config. |
| `var(--color-primary)` everywhere | `style={{ color: 'var(--color-primary)' }}` | Single source of truth for branding. Set once by `App.tsx` from `agencyConfig.identity`. |
| `useAppContext()` for domain data | `const { clients, projects } = useAppContext()` | Universal data access — no prop drilling. |

## What lives where (cheat sheet)

| If you're looking for... | It's in... |
| --- | --- |
| The list of all role types | `types/index.ts` (`UserRole` union) |
| All view IDs that exist | `types/index.ts` (`PortalView` union) |
| Who can see what | `config/agencyConfig.ts` (`roles[X].allowedViews`) |
| What labels appear in the UI | `config/agencyConfig.ts` (`labels` + per-role `labelOverrides`) |
| The sidebar structure for a given role | `config/sidebar.ts` (`getSidebarItems()`) |
| The mock customers/projects/tasks | `data/mockData.ts` |
| Pre-baked agency presets | `data/templates.ts` |
| All modal toggles | `context/ModalContext.tsx` |
| The chat/inbox channels | `context/InboxContext.tsx` |
| How a viewLayout becomes JSX | `components/DynamicRenderer/DynamicRenderer.tsx` |
