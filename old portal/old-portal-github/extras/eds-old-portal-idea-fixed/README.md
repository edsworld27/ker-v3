# Eds Old Portal Idea — Reference Codebase

> **Purpose of this folder:** A self-contained snapshot of an earlier multi-role agency portal/CRM prototype ("Aqua CRM"), preserved so individual elements (components, widgets, layout patterns, role/permission system, dynamic renderer) can be cherry-picked into a larger live SaaS application.
>
> **Read this whole document first.** Then drop into the per-folder READMEs (`src/*/README.md`) for the parts you actually want to reuse. Together they're designed to give an LLM or human enough context to extract pieces *without* loading every source file.

---

## 1. What this app actually is

Aqua CRM is a **single-page React app** that simulates an agency client portal. One codebase serves multiple roles:

| Role               | What they see                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| **Founder**        | Full agency-side view — admin dashboards, all clients, configurator, logs  |
| **AgencyManager**  | Agency operations — clients, projects, tasks, support, employees           |
| **AgencyEmployee** | Scoped to assigned clients/projects/tasks                                  |
| **ClientOwner**    | Client-side workspace — their projects, plan, support, resources           |
| **ClientEmployee** | Scoped client-side view                                                    |
| *(custom roles)*   | Any role created at runtime via the AgencyConfigurator                     |

Everything role-specific (which views are visible, what label is used, what layout each view uses) is driven from **one config object** (`src/config/agencyConfig.ts`) editable at runtime through the AgencyConfigurator UI.

There is **no backend**. All data is in-memory mock data (`src/data/mockData.ts`) loaded once into React state. State changes (creating clients, completing tasks, switching roles, impersonating users) live in `AppContext` and reset on page reload.

---

## 2. Tech stack

- **React 19** with hooks + Context (no Redux/Zustand)
- **TypeScript 5.8** (strict-ish — see `tsconfig.json`)
- **Vite 6** — dev server + build (port 3000)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` — uses CSS-first config in `src/index.css`)
- **motion** (formerly framer-motion) for animations
- **lucide-react** for icons
- **recharts** for chart widgets
- **@google/genai** for the AIChatbot widget (requires `GEMINI_API_KEY` in `.env.local`)
- **jszip + file-saver** for the "Download Backup" feature
- **express + tsx** present in deps but NOT used in dev/build — leftover from an aborted server attempt; safe to ignore

### Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # vite production build to /dist
npm run preview      # serve /dist locally
npm run lint         # tsc --noEmit (type-check only, no emit)
npm run clean        # rm -rf dist
```

The Gemini key is optional — the app boots without it; only the AI chatbot is dead.

---

## 3. The mental model — three layers of abstraction

This is the most important section. Almost every file in the codebase makes sense once you understand these three layers.

```
                  ┌─────────────────────────────────────────────────┐
                  │  LAYER 3 — Render                               │
                  │  componentMap.ts + DynamicViewRenderer          │
                  │  Looks up component by string, mounts it        │
                  └─────────────────────────────────────────────────┘
                                        ▲
                                        │ "render component named 'X'"
                                        │
                  ┌─────────────────────────────────────────────────┐
                  │  LAYER 2 — Configuration                        │
                  │  agencyConfig.ts (roles, viewLayouts, labels)   │
                  │  For role R viewing view V, render layout L     │
                  │  containing components [A, B, C]                │
                  └─────────────────────────────────────────────────┘
                                        ▲
                                        │ "current user wants to navigate to view V"
                                        │
                  ┌─────────────────────────────────────────────────┐
                  │  LAYER 1 — State                                │
                  │  AppContext + useAppLogic + mockData            │
                  │  Who is logged in, what view is active, all     │
                  │  domain data (clients, projects, tasks, etc.)   │
                  └─────────────────────────────────────────────────┘
```

### The flow when you click a sidebar item

1. **Click** triggers `handleViewChange(view)` from `useAppLogic`.
2. `setPortalView(view)` updates state in `App.tsx`.
3. `<DynamicViewRenderer viewId={portalView} />` re-renders.
4. DynamicViewRenderer asks: does `agencyConfig.roles[currentRole].viewLayouts[view]` exist?
   - **Yes** → render the configured layout (a `grid-cols-X` wrapper containing N components looked up via `componentMap`). This is the "component-driven" path — the new way.
   - **No** → fall back to the full-page View component for that view ID via `componentMap`. This is the "transitional" path — the old way, being phased out.
5. The mounted component reads whatever it needs from `useAppContext()` and renders.

This split (components driven by config vs. monolithic views) is the **central architectural idea** of the codebase, and what makes individual pieces extractable.

---

## 4. Authentication & multi-step entry

`App.tsx` is a state machine over `step: 'setup' | 'login' | 'security' | 'portal'`:

- `'login'` → renders `<LoginView>` (`src/components/auth/LoginView.tsx`). Four "Login as X" buttons quick-select a mock user. Real-world this would be SSO/OAuth.
- `'security'` → renders `<SecurityCheckView>` (4-digit code, no actual verification).
- `'portal'` → renders the full sidebar + header + main shell.

There is no real authentication. The "user" is just a mock `AppUser` selected at login, stored in `userProfile` and looked up against `users` (mock list).

---

## 5. Impersonation

A first-class feature. Two independent kinds:

| Kind                  | Triggered by                  | What it changes                                                                                 |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| **User impersonation** | Profile dropdown → "Switch User" | Sets `impersonatedUserEmail`. Permissions and view layouts now resolve through THAT user's role. |
| **Client workspace**   | Agency Hub → click a client    | Sets `impersonatingClientId`. The portal flips to client-portal view of that specific client.   |

Banners at the top of the portal show which mode is active and offer a "switch back" button. All controlled via `App.tsx` lines ~470–510.

---

## 6. Branding / theming

Two CSS custom properties drive the entire visual identity:

```ts
// App.tsx, the ONLY place colors are applied:
useEffect(() => {
  root.style.setProperty('--color-primary',   agencyConfig.identity.primaryColor);
  root.style.setProperty('--color-secondary', agencyConfig.identity.secondaryColor);
}, [agencyConfig.identity.primaryColor, agencyConfig.identity.secondaryColor]);
```

Every component uses `var(--color-primary)` / `var(--color-secondary)` instead of hardcoded hex. Change colors in the AgencyConfigurator UI → entire app re-themes instantly.

`useTheme()` (`src/hooks/useTheme.ts`) is a tiny helper that reads these from agencyConfig for use in JS expressions (e.g. inline styles).

---

## 7. Folder map (top level)

| Path                         | What lives there                                                            | README        |
| ---------------------------- | --------------------------------------------------------------------------- | ------------- |
| `src/`                       | All app source                                                               | [src/README](./src/README.md) |
| `src/types/`                 | All shared TypeScript interfaces and union types                             | [README](./src/types/README.md) |
| `src/context/`               | React contexts: `AppContext`, `ModalContext`, `InboxContext`                 | [README](./src/context/README.md) |
| `src/config/`                | Static config: `agencyConfig`, `masterConfig`, `sidebar`                     | [README](./src/config/README.md) |
| `src/hooks/`                 | Custom hooks: `useAppLogic`, `useTheme`, `useRoleConfig`                     | [README](./src/hooks/README.md) |
| `src/data/`                  | Mock seed data + AI scripted prompts                                         | [README](./src/data/README.md) |
| `src/components/`            | All React components (auth, views, widgets, modals, etc.)                    | [README](./src/components/README.md) |
| `src/components/auth/`       | Login + security-check screens                                               | (see components README) |
| `src/components/views/`      | Full-page views — one folder per portal view (41 of them)                    | [README](./src/components/views/README.md) |
| `src/components/widgets/`    | Composable dashboard widgets referenced by viewLayouts                       | [README](./src/components/widgets/README.md) |
| `src/components/modals/`     | Overlay modals — managed by `ModalContext`/`ModalManager`                    | [README](./src/components/modals/README.md) |
| `src/components/shared/`     | Reusable building blocks: `DashboardWidget`, `SidebarItem`, `RoleSwitcher`   | [README](./src/components/shared/README.md) |
| `src/components/collaboration/` | Project collaboration widgets (chat, timeline, design concepts, sync card) | [README](./src/components/collaboration/README.md) |
| `src/components/AIChatbot/`  | Gemini-powered chatbot                                                       | [README](./src/components/AIChatbot/README.md) |
| `src/components/DynamicRenderer/` | The recursive renderer that turns a viewLayout config into mounted JSX  | [README](./src/components/DynamicRenderer/README.md) |
| `index.html`                 | Vite entry — only mounts `<div id="root">` and loads `/src/main.tsx`         | — |
| `vite.config.ts`             | Vite config — react plugin + tailwind plugin                                 | — |
| `tsconfig.json`              | TypeScript config — bundler resolution, jsx-react                            | — |
| `dev-config.md`              | Original author's development notes (kept verbatim)                          | — |
| `package.json`               | npm metadata — `name: eds-old-portal-idea`                                   | — |

---

## 8. The "files you must understand to extract anything" list

If you want to lift a single widget cleanly into another app, these are the upstream dependencies you need to know exist:

1. **`src/types/index.ts`** — the type system. Almost every component imports from here. Most reusable pieces depend on `Client`, `Project`, `ProjectTask`, `AppUser`, `AppTicket`, `LogEntry`, or `PortalView`.
2. **`src/context/AppContext.tsx`** — `useAppContext()` is how components read domain data. If you extract a widget, you'll either need to provide an equivalent context or pass the data in as props.
3. **`src/config/agencyConfig.ts`** — defines roles and permissions. `useRoleConfig()` and `hasPermission()` derive from this.
4. **`src/hooks/useTheme.ts`** — most components call this for `var(--color-primary)` access.
5. **`src/index.css`** — the Tailwind base + custom utility classes (`glass-card`, `bg-glow`, `custom-scrollbar`). Without this CSS, copied components will look unstyled.

---

## 9. Naming conventions

- **Views** — full-page components, `PascalCaseView.tsx`, one per route (`PortalView` ID)
- **Widgets** — composable cards, `PascalCaseWidget.tsx`, registered in `componentMap`
- **Modals** — overlay components, `PascalCaseModal.tsx`, opened via `ModalContext` setters
- **Shared** — reusable primitives in `src/components/shared/`
- **`ui.ts` files** — co-located with their parent component, contain ALL Tailwind class strings + icon refs as a config object. The component imports `<componentName>UI as ui` and uses `ui.headerClass`, `ui.button.icon`, etc. Pattern is consistent: never inline class strings, always read from the `ui` object. Makes restyling a single-file edit.

---

## 10. Known issues / gotchas (read before extracting)

- **`agencyConfig.ts` has a duplicate `client-management` key** — Vite warns about it on every build. Harmless but noisy.
- **`componentMap.ts` has duplicate imports** of `ProjectListWidget` and `TaskListWidget` (lines ~58–62). TypeScript may complain depending on settings; doesn't break the runtime.
- **Several widgets were originally missing or broken** — fixed in this snapshot:
  - `ClientWelcomeWidget.tsx` and `ClientRecentActivityWidget.tsx` are minimal stubs (placeholder UI). Replace if you actually need them.
  - `widgets/ui.ts` provides stub `projectListWidgetUI` and `projectsStatsWidgetUI` configs (the originals were missing). They render functionally but the styling is best-guess.
  - `views/WebsiteView/ui.ts` was reconstructed from partial fragments — the visible result matches the original component's expectations but the exact original Tailwind classes can't be verified.
- **Express is in deps but unused.** `package.json` shows it; nothing imports it. Don't carry it over.
- **There is no real authentication and no backend.** Don't try to extract the auth flow as-is; treat it as a prototype.
- **`mockData.ts` is the only data source.** All "API calls" are just synchronous reads/writes against React state seeded from this file.

---

## 11. License

`Apache-2.0` — `@license SPDX-License-Identifier: Apache-2.0` headers appear on most source files. Keep them when copying.

---

## 12. Where to look next

- For an architecture deep-dive → keep reading the per-folder READMEs starting with [`src/README.md`](./src/README.md).
- For "I just want a working dashboard widget" → [`src/components/widgets/README.md`](./src/components/widgets/README.md) lists all 18 with one-line summaries.
- For "I want to copy the role/permission system" → read [`src/config/README.md`](./src/config/README.md) + [`src/hooks/README.md`](./src/hooks/README.md) (`useRoleConfig`).
- For "I want the dynamic-renderer pattern" → [`src/components/DynamicRenderer/README.md`](./src/components/DynamicRenderer/README.md).
