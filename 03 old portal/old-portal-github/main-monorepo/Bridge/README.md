# `Bridge/` — The shared workspace package

> **What this is:** The single shared package that every app in `apps/*` depends on via `@aqua/bridge`. It provides the cross-app type system, authentication, Prisma client, event bus, component registry, sync layer, and the `postMessage` protocol that lets the host shell communicate with sibling apps in iframes.
>
> **Architectural rule:** Bridge has NO business logic. It is pure infrastructure — types, auth resolution, db access, event plumbing. Anything domain-specific lives in the app that owns it.

---

## When to import from Bridge

Anywhere in the monorepo. Every `apps/*/package.json` has `@aqua/bridge` as a workspace dependency:

```ts
import {
  BridgeSession, BridgeAPI, BridgeEvents, BridgeRegistry,
  sendBridgeMessage, onBridgeMessage,
  type AppUser, type Client, type Agency,
} from '@aqua/bridge';
```

---

## Subfolder map

| Folder | Purpose |
| --- | --- |
| **`types/`** | Single monolithic `index.ts` containing every shared type: `AppUser`, `Client`, `Agency`, `BridgeSession`, `SuiteTemplate`, plus enums (`UserRole`, `PortalProduct`, `ClientStage`). Every app imports from here. |
| **`auth/`** | `authenticate(email)` returns `BridgeSession`. Includes the `DEMO_SESSION` constant for `demo@aqua.portal` bypass. Handles role → product mapping (Founder gets all, ClientOwner gets client only, etc.). |
| **`data/`** | Prisma singleton (`prisma.ts`) — used by every server-side caller. `seed.ts` runs the seed script. `seedData.ts` is client-safe static fallback data used when Prisma is unavailable. |
| **`api/`** | Server-side helpers wrapping common operations: `BridgeAPI.login()`, `getUsers()`, `getClients()`, `inviteUser()`, `getAgency()`, `syncData()`. Called by Next.js API route handlers in each app. |
| **`events/`** | Typed event bus (`BridgeEvents.on/emit/once`). Cross-cutting events: client lifecycle, fulfillment, user management, suite toggling. Avoids direct cross-product imports. |
| **`registry/`** | Component + suite registration store. `registerSuite()`, `resolve()`, `subscribe()`. Uses window globals (`__BRIDGE_COMPONENTS__`, `__BRIDGE_SUITES__`, `__BRIDGE_PROVIDERS__`) to survive HMR in dev. |
| **`sync/`** | Bidirectional client ↔ operations sync. `provisionClientWorkspace()`, `syncClientStage()`, fulfillment brief/deliverable handlers. Emits `BridgeEvents` so listening UIs auto-refresh. |
| **`ui/`** | UI variable registry for "Design Mode" / "Omega Editor". `BridgeUIRegistry.register()` stores per-view color/text/number configs that templates populate. |
| **`config/`** | **Empty.** Reserved for future shared constants. (Polish-list item #5.) |
| **`concepts/`** | Reference patterns ported from the older Vite prototype. Not wired into the monorepo runtime. See `concepts/README.md`. |

---

## Top-level files

### `index.ts`

The barrel. Re-exports everything from the subfolders. **This is the only file external code should import from** — never reach into `Bridge/auth/index.ts` directly, always use `import { authenticate } from '@aqua/bridge'`.

### `postMessage.ts`

The micro-frontend bridge protocol. **Critical file** — this is how the host shell talks to the iframed sibling apps.

```ts
type BridgeMessage =
  | { type: 'BRIDGE_AUTH', payload: BridgeSession }
  | { type: 'BRIDGE_NAVIGATE', payload: { view: string } }
  | { type: 'BRIDGE_THEME', payload: { primary: string, secondary: string } }
  | { type: 'BRIDGE_READY' }
  | { type: 'BRIDGE_STATE_UPDATED', payload: any }
  | { type: 'BRIDGE_SYNC' }
  | { type: 'BRIDGE_PING' };

sendBridgeMessage(target: Window, message: BridgeMessage, targetOrigin: string)
onBridgeMessage(handler: (message: BridgeMessage) => void)
```

Origin validation whitelist (dev): `http://localhost:3001|3002|3003|3004|3005|3006|3007`. **Production deployment requires updating this whitelist** to your real domains.

### `package.json`

Standard workspace package metadata. Name: `@aqua/bridge`. No build step — apps consume `.ts` files directly via `transpilePackages: ['@aqua/bridge']` in their `next.config.mjs`.

---

## How a new app would adopt Bridge

1. Add `@aqua/bridge: "*"` to its `package.json` dependencies
2. Add `transpilePackages: ['@aqua/bridge']` to its `next.config.mjs`
3. In its app shell, import:
   ```ts
   import { BridgeSession, authenticate, onBridgeMessage } from '@aqua/bridge';
   ```
4. Listen for `BRIDGE_AUTH` messages on mount to receive auth from host shell
5. Send `BRIDGE_READY` when its UI is mounted so host knows it's safe to navigate

---

## Common patterns

### Listening for auth

```tsx
useEffect(() => {
  const off = onBridgeMessage((msg) => {
    if (msg.type === 'BRIDGE_AUTH') setSession(msg.payload);
    if (msg.type === 'BRIDGE_NAVIGATE') router.push(`/embed/${msg.payload.view}`);
  });
  sendBridgeMessage(window.parent, { type: 'BRIDGE_READY' }, '*');
  return off;
}, []);
```

### Getting the current user

```ts
import { BridgeAPI } from '@aqua/bridge';
const session = await BridgeAPI.login(email);
const user = session.user;
```

### Reacting to an event

```ts
import { BridgeEvents } from '@aqua/bridge';
const off = BridgeEvents.on('client:created', (client) => { /* ... */ });
return off;
```

---

## Notable architectural decisions

- **No webpack/Vite plugin needed.** Bridge is consumed as TypeScript source, transpiled by each app's Next.js build via `transpilePackages`. Zero build step on Bridge itself.
- **Window-global registry.** `__BRIDGE_COMPONENTS__` etc. are intentional — they survive HMR. In production this is module-scoped state via the same indirection.
- **Demo mode shortcut.** `authenticate('demo@aqua.portal')` always returns `DEMO_SESSION` regardless of DB. Lets you boot any app without Prisma setup.
- **Offline fallback.** If `prisma` is unavailable (DB not initialized, network down), every Bridge call falls back to `seedData.ts` static arrays. The app stays usable.

---

## See also

- `Bridge/postMessage.ts` — read this fully if you're touching the host/sibling messaging
- `concepts/README.md` — reference patterns for builders, role config, collaboration widgets
- Top-level `dev-config.md` — original author's full architecture notes
