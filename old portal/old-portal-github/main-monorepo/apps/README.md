# `apps/` — The 7 Next.js sub-apps

Each app is a fully-independent Next.js application with its own port, routes, Prisma schema, and shell component. They communicate via the workspace `@aqua/bridge` package and (for the host) iframes + `postMessage`.

---

## The 7 apps at a glance

| App | Port | Shell | Files | Role |
| --- | --- | --- | --- | --- |
| [`aqua-host-shell`](./aqua-host-shell/) | 3001 | HostShell | ~97 | Orchestrator. Auth + login. Iframes the others. |
| [`aqua-client`](./aqua-client/) | 3002 | ClientShell | ~347 | Client portal. Largest app — 12 template modules. |
| [`aqua-crm`](./aqua-crm/) | 3003 | CRMShell | ~98 | CRM. Currently has Leads template only — others stubbed. |
| [`aqua-operations`](./aqua-operations/) | 3004 | OpsHubShell | ~97 | Operations hub. Enterprise context template. |
| [`aqua-ops-finance`](./aqua-ops-finance/) | 3005 | FinanceShell | ~98 | Finance Hub. Financial dashboard template. |
| [`aqua-ops-people`](./aqua-ops-people/) | 3006 | PeopleShell | ~99 | People (HR) Hub. HR + Support context templates. |
| [`aqua-ops-revenue`](./aqua-ops-revenue/) | 3007 | RevenueShell | ~98 | Revenue Hub. **Many widgets are placeholder fns — see polish list.** |

---

## The standard skeleton (every app has this)

Every sub-app — except `aqua-client` which is 3.5x bigger — shares this exact structure:

```
apps/aqua-X/
├── app/                           Next.js App Router routes
│   ├── (main)/                   "/" — main user-facing routes
│   │   ├── page.tsx              dynamically loads XApp via next/dynamic
│   │   └── layout.tsx            global wrap (ModalProvider, CSS imports)
│   ├── demo/[...view]/           catch-all for demo mode (no DB)
│   ├── user/[...view]/           catch-all for authed mode
│   ├── embed/[view]/             iframe-target route — consumed by host shell
│   └── api/
│       ├── bridge/
│       │   ├── auth/route.ts    auth handler
│       │   ├── provision/route.ts  client provisioning
│       │   └── state/route.ts   bridge state sync
│       └── sync/route.ts        general data sync
│
├── XShell/                        The shell component (X = Host/Client/CRM/etc.)
│   ├── XApp.tsx                  root React component
│   ├── AppFrame/                 main layout wrapper
│   ├── Sidebar/                  navigation sidebar (with components/)
│   ├── TopBar/                   header bar
│   ├── Renderer/                 dynamic view router
│   ├── XTemplates/               domain-specific template modules (varies per app)
│   ├── bridge/                   app-local bridge folder (extends Bridge package)
│   │   ├── XContext.tsx         react context
│   │   ├── XBridgeHub.tsx       provider wrapper
│   │   ├── XRegistration.ts     re-export of @aqua/bridge/registry
│   │   ├── XSuiteRegistry.ts    suite metadata
│   │   ├── Xapi.ts              http client for Bridge API
│   │   ├── Xevents.ts           cross-component events
│   │   ├── Xprovisioning.ts     onboarding logic
│   │   ├── XuiRegistration.ts   UI class registration
│   │   ├── XuseTemplateUI.ts    hook for template UI constants
│   │   ├── config/              agency config, constants, icon map
│   │   ├── data/                mock client data
│   │   ├── demo/                demo mode component overrides
│   │   ├── types/               shared types
│   │   └── utils/               misc utilities
│   ├── components/
│   │   ├── Auth/                Login, security check, welcome
│   │   ├── Modals/              modal overlays
│   │   ├── Settings/            settings views
│   │   ├── TemplateHub/         template browser
│   │   ├── BridgeControl/       dev/debug tools
│   │   ├── shared/              top-level chrome (TopBar, SubNavBar)
│   │   ├── design/              design primitives
│   │   └── ui/                  atomic UI library (Button, Card, Icon, Input, Select)
│   ├── hooks/
│   │   ├── useTheme.ts          color tokens
│   │   ├── useAutoSync.ts       interval-based sync
│   │   └── useSyncStore.ts      localStorage persistence
│   ├── logic/
│   │   ├── useXLogic.ts         facade orchestrator
│   │   ├── useCoreLogic.ts      data persistence
│   │   ├── useAuthLogic.ts      session/auth
│   │   └── useShellLogic.ts     shell state (portalView, sidebar)
│   ├── views/                   transitional view components (mostly CMS iframes)
│   ├── widgets/                 reusable widgets (DashboardWidget, AIChatbot)
│   └── XUI.css                  app-specific styles
│
├── prisma/                        SQLite (dev) / PostgreSQL (prod) schema
├── scripts/                       generateRegistry.js + similar build utilities
├── package.json                   workspace member, deps include @aqua/bridge
├── next.config.mjs               Next.js config (transpilePackages, CSP, externalDir)
├── tsconfig.json                  TypeScript config
├── postcss.config.mjs            CSS post-processor
├── payload.config.ts              ⚠️ Concept-only — Payload CMS removed; kept for reference
├── payload-types.ts               ⚠️ Generated Payload types — schema reference only
├── next-env.d.ts                  Next.js type definitions
├── index.ts                       entry point export
├── .env / .env.example            environment setup
└── README.md                      app-specific docs
```

`aqua-client` follows the same skeleton but adds **12 template modules** in `ClientShell/ClientTemplates/`, totaling ~250 extra files (see `aqua-client/README.md`).

---

## Naming conventions

- **App folder prefix:** `aqua-{name}` (e.g. `aqua-ops-finance`)
- **Shell folder:** `{Name}Shell` (e.g. `FinanceShell`)
- **Files inside shell:** prefixed with the app name (`FinanceApp.tsx`, `FinanceSidebar.tsx`)
- **Hooks:** `use{App}{Feature}Logic` (e.g. `useFinanceLogic`, `useClientCoreLogic`)
- **Path aliases:** `@{App}Shell/*` (e.g. `import { x } from '@FinanceShell/bridge/FinanceContext'`)

---

## How they communicate

1. **Workspace package:** Every app imports from `@aqua/bridge` for shared types, auth, registry, events, postMessage helpers.
2. **iframe + postMessage:** The host shell (3001) embeds the others via `<iframe src="http://localhost:300X/embed/viewId">` and sends `BRIDGE_AUTH`, `BRIDGE_NAVIGATE`, `BRIDGE_THEME` messages. Each sibling app listens via `onBridgeMessage()` and signals back `BRIDGE_READY`.
3. **HTTP API:** Each app exposes `api/bridge/*` endpoints that the host (or other apps) can call directly.

See `../Bridge/README.md` § "How a new app would adopt Bridge" for the integration pattern.

---

## Running individual apps

```bash
# From repo root:
npm run dev:host          # 3001 — start here
npm run dev:client        # 3002
npm run dev:crm           # 3003
npm run dev:operations    # 3004
npm run dev:finance       # 3005
npm run dev:people        # 3006
npm run dev:revenue       # 3007
npm run dev               # all 7 in parallel (heavy — ~8GB RAM)
```

The host shell can run without the others — it'll just show "Cannot connect to http://localhost:300X" inside iframes when you try to navigate to a sibling.

---

## Per-app READMEs

Each app has its own README in its folder. Read those for app-specific architecture, template modules, and known-incomplete pieces:

- [`aqua-host-shell/README.md`](./aqua-host-shell/README.md) — orchestrator details
- [`aqua-client/README.md`](./aqua-client/README.md) — 12 template modules + biggest codebase
- [`aqua-crm/README.md`](./aqua-crm/README.md) — CRM (mostly stub — see polish list)
- [`aqua-operations/README.md`](./aqua-operations/README.md)
- [`aqua-ops-finance/README.md`](./aqua-ops-finance/README.md)
- [`aqua-ops-people/README.md`](./aqua-ops-people/README.md)
- [`aqua-ops-revenue/README.md`](./aqua-ops-revenue/README.md) — placeholder widgets
