# `aqua-host-shell` — The orchestrator app

> **Port:** 3001
> **Shell:** `HostShell/`
> **Role:** The thin orchestrator that authenticates users, then loads the other 6 sub-apps in iframes via `postMessage`. **Start here.** This is the entry point for the whole platform.

For the standard sub-app skeleton (which this app follows), see [`../README.md`](../README.md).

---

## What's distinctive about HostShell

### It's the only app users login through

`HostShell/components/Auth/` contains the hardcoded login flow:

- `WelcomeScreen.tsx` — entry view
- `LoginView.tsx` — email entry
- `SecurityCheckView.tsx` — 2FA / passcode

These live IN the host shell (not in iframes) for reliability — auth must work even if sibling apps fail.

After login, the host stores the `BridgeSession` (returned from `Bridge.authenticate()`) in `HostContext` and uses it to gate which sibling apps the user can navigate to.

### It uses iframes to load sibling apps

This is the entire orchestration mechanism. `HostShell/Renderer/HostIFrameViewRenderer.tsx`:

```ts
const APP_VIEW_MAP = {
  'agency-clients': { app: 'aqua-client', port: 3002 },
  'crm-dashboard':  { app: 'aqua-crm',    port: 3003 },
  'ops-overview':   { app: 'aqua-operations', port: 3004 },
  'finance-hub':    { app: 'aqua-ops-finance', port: 3005 },
  'people-hub':     { app: 'aqua-ops-people',  port: 3006 },
  'revenue-hub':    { app: 'aqua-ops-revenue', port: 3007 },
  // ...
};

function getEmbedUrl(viewId) {
  const { app, port } = APP_VIEW_MAP[viewId];
  return process.env.NEXT_PUBLIC_CLIENT_URL  // production
    || `http://localhost:${port}/embed/${viewId}`; // dev
}
```

When the user clicks a sidebar item:
1. `handleViewChange(viewId)` updates `portalView` in HostContext
2. `<HostIFrameViewRenderer viewId={portalView} />` re-mounts with new `src`
3. The iframe loads the sibling app's `/embed/[view]` route
4. Host sends `BRIDGE_AUTH` + `BRIDGE_THEME` via `sendBridgeMessage()`
5. Sibling responds with `BRIDGE_READY` once mounted
6. Subsequent navigation: host sends `BRIDGE_NAVIGATE` to change view inside iframe

Origin whitelist for postMessage validation lives in `Bridge/postMessage.ts` (currently dev-only — production needs domain updates).

### It owns the canonical user/agency/client database

Other apps have their own Prisma schemas, but `HostShell/prisma/schema.prisma` is the source of truth. The host's `api/bridge/*` routes are what every other app's `Bridge.api` calls hit:

- **Agency** — Tenant info (name, logo, primary color, isConfigured)
- **AgencySuite** — Which suites each agency enables
- **User** — Staff (email, role, customRoleId, agencyId, productAccess, joinedDate)
- **Client** — Customer entities (stage, brandColor, enabledSuiteIds, assignedEmployeeIds)
- **ClientResource** — Docs/URLs attached to clients
- **Session** — Auth tokens with expiry
- **FulfilmentBrief / BriefAssignment / FulfilmentDeliverable** — Project + task management
- **ActivityLog** — Audit trail
- **ApplicationState** — Key/value app config

### It has a real impersonation system

`HostShell/logic/useHostAuth.ts` exposes `handleImpersonate(clientId)` — when called, the next `BRIDGE_AUTH` message includes `impersonatingClientId`, and sibling apps render as if that client were viewing.

---

## Folder anatomy specifics

| Folder | What's inside |
| --- | --- |
| `HostShell/HostApp.tsx` | Root component — composes shell, sidebar, top bar, renderer |
| `HostShell/AppFrame/` | Fixed-position layout (sidebar, content, top bar) |
| `HostShell/Sidebar/HostSidebarContent.tsx` | Nav items: Client Portal, CRM Hub, Ops Hub, Finance, People, Revenue, Settings |
| `HostShell/Renderer/HostIFrameViewRenderer.tsx` | The iframe loader (above) |
| `HostShell/components/Auth/` | Login flow (hardcoded, not iframed) |
| `HostShell/components/TemplateHub/` | Browse + load templates |
| `HostShell/components/BridgeControl/` | Dev tools — view raw bridge state |
| `HostShell/components/Modals/HostModalManager.tsx` | Centralized modal mounter (mirrors prototype's pattern) |
| `HostShell/widgets/AIChatbot/` | Chat widget (placeholder) |
| `HostShell/widgets/DashboardWidget/` | Generic stat card |
| `HostShell/views/CMS/` | Payload CMS embed (Payload itself was excluded from this snapshot — see top-level README) |
| `HostShell/bridge/` | App-local bridge layer — see `apps/README.md` for the standard pattern |
| `prisma/schema.prisma` | The canonical DB schema (above) |

---

## How to run

```bash
# From repo root:
npm run setup        # one-time: initialize SQLite via Prisma
npm run dev:host     # http://localhost:3001
```

Login as `demo@aqua.portal` for a no-DB shortcut (returns `DEMO_SESSION` from `Bridge/auth/`).

---

## Known incomplete pieces

- `HostShell/components/Settings/` — placeholder views (consistent with the polish list — see top-level README)
- `HostShell/widgets/AIChatbot/` — chat shell, no LLM integration
- `next.config.mjs` has `typescript.ignoreBuildErrors: true` — known type drift between this app and Bridge package

---

## See also

- `../README.md` — apps overview + standard skeleton
- `../../Bridge/README.md` — the workspace package this app depends on
- `../../Bridge/postMessage.ts` — read this to understand how host talks to siblings
- `../../dev-config.md` — original architecture notes (host shell deep-dive in §§ 4-12)
