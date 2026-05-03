# Old portal — Host Shell (`03 old portal/.../main-monorepo/apps/aqua-host-shell/`)

The single Next.js process (port 3000) that boots the entire portal,
bootstraps every sub-app's plugin registration, hosts the sidebar / topbar /
settings / marketplace, and mounts the AI chat panel.

> Source: agent 5 sweep.

## app/ — Next.js App Router

```
apps/aqua-host-shell/app/
├── layout.tsx           ← root layout, session provider, CSS reset
├── page.tsx             ← root (HostSmartRegistry or HostDemoShell)
├── embed/[viewId]/      ← legacy iframe fallback (HostIFrameView)
└── api/
    ├── bridge/
    │   ├── auth/route.ts        POST → authenticate(email)
    │   ├── state/route.ts       GET/POST bridge state mutate
    │   └── provision/route.ts   POST provisionClientWorkspace
    ├── sync/route.ts            POST cross-app sync hooks
    └── ai/chat/route.ts         POST SSE Claude Opus 4.7 stream
```

## API endpoints

| endpoint | method | purpose |
|----------|--------|---------|
| `/api/bridge/auth` | POST | `{ email, password? }` → `{ success, session }` |
| `/api/bridge/state` | GET / POST | Fetch / mutate global portal state |
| `/api/bridge/provision` | POST | Create client workspace |
| `/api/sync` | POST | Cross-app sync (used by iframes in legacy; in plugin mode, `BridgeEvents` is used directly) |
| `/api/ai/chat` | POST (SSE) | Stream Claude Opus 4.7 |

### `/api/ai/chat` — Claude Opus 4.7 + SSE + prompt cache

```
{
  model: 'claude-opus-4-7',
  max_tokens: 16000,
  thinking: { type: 'adaptive' },          ← extended reasoning
  output_config: { effort: 'high' },
  system: [
    { type: 'text', text: PORTAL_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    // optional second block: live UI state from client (also cached)
  ],
  messages: [...]
}
```

SSE event-stream:
```
data: { type: 'text', delta: string }
data: { type: 'done', stopReason, usage: { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens } }
data: { type: 'error', message, status? }
```

Prompt-cache benefit: system prompt (~384 tokens) is cached; first request pays
creation cost, subsequent requests within 1 hour read from cache (~0.1× cost).

## HostBridgeBootstrap.ts — plugin loader

`bootstrapBridge()` is called at first render in `HostSmartRegistry.tsx`. Iterates
`PLUGIN_LOADERS` (lines 26-57): 7 entries, each `{ id, key, load }`:

```ts
PLUGIN_LOADERS = [
  { id: 'aqua-client', key: 'registerClientApp', load: () => import('@ClientShell/ClientTemplates/Clientindex') },
  { id: 'aqua-crm', key: 'registerCrmApp', load: () => import('@CRMShell/...') },
  { id: 'aqua-operations', key: 'registerOpsHubApp', load: () => import(...) },
  { id: 'aqua-ops-finance', key: 'registerFinanceApp', load: () => import('@FinanceShell/FinanceTemplates/Financeindex') },
  { id: 'aqua-ops-people', key: 'registerPeopleApp', load: () => import(...) },
  { id: 'aqua-ops-revenue', key: 'registerRevenueApp', load: () => import(...) },
];
```

For each: dynamic-import → call exported `register*App()` → catches errors per-plugin → returns `PluginBootResult[]`. Stored on `window.__BRIDGE_BOOT_RESULTS__` for inspection.

A `register*App()` typically does three things:
```ts
export async function registerFinanceApp() {
  BridgeRegistry.registerSuite(FinanceSuiteRegistry);
  BridgeRegistry.registerProvider('finance-suite', FinanceProvider);
  BridgeRegistry.registerAll({
    'finance-dashboard': FinanceDashboardView,
    'finance-suite': FinanceDashboardView,  // alias for suite id
  });
}
```

## HostRegistryViewRenderer.tsx — tolerant view resolution

Props: `{ viewId, suiteId?, sharedProps? }`.

Resolution chain (`resolveTolerant()`, lines 73-134):
1. Literal id — `BridgeRegistry.resolve(viewId)`
2. Kebab-case — convert PascalCase → kebab, try
3. PascalCase — convert kebab → pascal, try
4. PascalCase + `'View'` (e.g., `agency-clients` → `AgencyClientsView`)
5. Kebab + `'-view'` (e.g., `client-dashboard` → `client-dashboard-view`)
6. Suite fallback — walk registered suites; find one matching `suiteId` or any subItem matching `viewId`; resolve its `defaultView` or first subItem
7. If suite metadata has direct `.component` field, use that

Output:
- Resolved → `<Provider><Suspense><Component /></Suspense></Provider>`
- Not resolved → `<NotInstalled viewId={...} tried={[...]} />` (lists every attempted id — excellent debug UX)

## HostSidebar / HostTopBar / HostSmartRegistry

**HostSidebar** (`HostShell/Sidebar/HostSidebarContent.tsx`):
- Lists all registered suites from `BridgeRegistry.getSuites()`
- Per-suite shows subItems as nested nav
- Click → updates `viewId` state → triggers re-render
- Role-based filtering: only suites whose `requiredPermissions` match user

**HostTopBar** (`HostShell/TopBar/HostTopBar.tsx`):
- Logo + brand-color theming
- User dropdown
- Impersonation banner (when Founder impersonates client)
- Notification bell + settings icon + logout
- AI chat button (Sparkles icon) — dispatches `aqua:open-chat` CustomEvent
- Mobile menu toggle

**HostSmartRegistry** (root):
1. Calls `bootstrapBridge()` on mount (once, via `useEffect`)
2. Renders root context providers
3. Renders sidebar / topbar / `HostRegistryViewRenderer`
4. Loading state during bootstrap

## HostTemplateHubView — marketplace UI

Location: `HostShell/components/TemplateHub/HostTemplateHubView.tsx`.

- Lists every registered suite (cards with icon / name / description / category badge / "System Linked" or "Operational" status / toggle switch)
- Search + category filter pills (Sales / Finance / People / etc.)
- Toggle updates `AgencySuite.enabled` (currently local state — DB persistence is `PLAN.md` task #1)
- Click card → drawer expands `suite.configSchema`
- Filter by tier (agency / client / community)
- Sort by popularity / name / recently added

Visually complete; needs DB wiring + role-based visibility.

## useClientLogicStub — handler stubs

Location: `apps/aqua-client/ClientShell/logic/ClientuseClientLogic.ts` (filename has typo `Clientuse`).

Implemented (lines 21-97), but **persists only to localStorage** — not BridgeAPI:
- `handleUpdateClientStage`
- `handleEditClient`
- `handleUploadClientResource`
- `handleUpdateClientSettings`
- `handleAddClientUser`
- `handleRemoveClientUser`
- `handleSaveLayout` / `handleDeleteLayout`
- `handleSaveCustomPage`
- `handleCompleteSetup`
- `handleDeleteUser`

Auto-save effect (`savePersistedState()`) commits to localStorage on every change. Real backend persistence is a follow-up.

## AI chat integration pattern

UI entry: Sparkles button in HostTopBar dispatches `aqua:open-chat`.

```ts
// In a sub-app:
window.dispatchEvent(new CustomEvent('aqua:open-chat', { detail: { context: 'some-view-id' } }));

// In AIChatPanel (mounted in HostShell root):
useEffect(() => {
  const handler = (e: Event) => setOpen(true);
  window.addEventListener('aqua:open-chat', handler);
  return () => window.removeEventListener('aqua:open-chat', handler);
}, []);
```

The `detail.context` (current view id, etc.) gets passed to the `/api/ai/chat`
endpoint as the optional second cached system block, grounding the model
in what the user is currently looking at.
