# `Bridge/config/` — Shared cross-app constants

> Was previously empty. Now populated with the constants that 2+ apps need to agree on.

## What's in `index.ts`

| Export | Purpose |
| --- | --- |
| `APP_PORTS` | Single source of truth for which dev port each app runs on (3001-3007). |
| `APP_LABELS` | Display name per app — for sidebar / nav labels. |
| `APP_DEV_URLS` | `http://localhost:300X` per app, derived from `APP_PORTS`. |
| `BRIDGE_LS_KEYS` | All `localStorage` keys used by any app. Centralized so a "clear state" function can iterate. |
| `ROLE_PRODUCT_MAP` | Role → list of `AppName`s the role can access. Used by `Bridge/auth/` to compute `BridgeSession.products`. |
| `DEMO_EMAIL` | The magic `demo@aqua.portal` email that bypasses authentication. |
| `BRIDGE_MESSAGE_TYPES` | Type union of `postMessage` message types (mirrored from `postMessage.ts` for non-message imports). |
| `DEFAULT_THEME` | Fallback `primary` / `secondary` colors when no agency branding is configured. |
| `SESSION_TTL_MS` | Session token expiry (7 days). |

## How to use

```ts
import { APP_PORTS, ROLE_PRODUCT_MAP, BRIDGE_LS_KEYS, DEMO_EMAIL } from '@aqua/bridge';

// In Bridge/postMessage.ts — origin whitelist:
const ALLOWED_ORIGINS = Object.values(APP_PORTS).map(p => `http://localhost:${p}`);

// In Bridge/auth/index.ts — derive products from role:
const products = ROLE_PRODUCT_MAP[user.role];

// In any app — bulk-clear localStorage:
Object.values(BRIDGE_LS_KEYS).forEach(k => localStorage.removeItem(k));
```

## Migration note

Before this file existed, each app hardcoded its own port number, role-product mapping, and localStorage keys. Anywhere that has hardcoded `'http://localhost:3002'` or `'aqua_portal_state'` should be migrated to import from here.

A grep target: `grep -rn "http://localhost:300" apps/` will find legacy hardcoded ports.
