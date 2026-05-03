# NEXT_STEPS.md — Production deployment guide for the AQUA Portal monorepo

> 7-app micro-frontend architecture. Updated 2026-05-02 for the current split (was previously a 4-app guide).

---

## Architecture overview

The portal is **7 independent Next.js applications** that talk to each other via iframes + `postMessage`:

| App | Port (dev) | Role | Source |
| --- | ---: | --- | --- |
| `aqua-host-shell` | 3001 | Orchestrator. Auth, app switching, sidebar. Iframes the other 6. | `apps/aqua-host-shell/` |
| `aqua-client` | 3002 | Client-facing portal (largest app — 12 template modules) | `apps/aqua-client/` |
| `aqua-crm` | 3003 | Sales / CRM | `apps/aqua-crm/` |
| `aqua-operations` | 3004 | Cross-functional ops landing | `apps/aqua-operations/` |
| `aqua-ops-finance` | 3005 | Finance hub | `apps/aqua-ops-finance/` |
| `aqua-ops-people` | 3006 | People (HR) hub | `apps/aqua-ops-people/` |
| `aqua-ops-revenue` | 3007 | Revenue analytics hub | `apps/aqua-ops-revenue/` |

Shared code lives in workspace packages:
- `@aqua/bridge` (`Bridge/`) — types, auth, registry, postMessage protocol, event bus
- `@aqua/templates` (`Templates/`) — currently a stub (no-op `register*App()` functions)

---

## 1. Environment configuration

Copy `.env.example` to `.env.local` in each app's directory (or use a centralized secrets manager).

### Required production variables

Per-app:
- `DATABASE_URL` — Postgres connection string in production (`file:./prisma/dev.db` for local dev with SQLite)
- `PAYLOAD_SECRET` — random 32+ char string (Payload CMS encryption key)
- `PAYLOAD_DATABASE_URL` — separate Postgres URL for Payload (its own DB)

Cross-app routing (set at the host shell at minimum):
- `NEXT_PUBLIC_HOST_URL` — e.g. `https://portal.yourdomain.com`
- `NEXT_PUBLIC_CLIENT_URL` — e.g. `https://client.yourdomain.com`
- `NEXT_PUBLIC_CRM_URL` — e.g. `https://crm.yourdomain.com`
- `NEXT_PUBLIC_OPS_URL` — e.g. `https://ops.yourdomain.com`
- `NEXT_PUBLIC_OPS_FINANCE_URL` — e.g. `https://finance.yourdomain.com`
- `NEXT_PUBLIC_OPS_PEOPLE_URL` — e.g. `https://people.yourdomain.com`
- `NEXT_PUBLIC_OPS_REVENUE_URL` — e.g. `https://revenue.yourdomain.com`
- `ALLOWED_BRIDGE_ORIGINS` — comma-separated list of all 7 URLs above

Optional (Payload S3 storage):
- `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_ENDPOINT` — if unset, files fall back to local `/media`.

---

## 2. Security hardening

The dev `next.config.mjs` of every sub-app sets a `Content-Security-Policy` header that allows `localhost:3001` as a frame ancestor. Before going to production:

1. Update each `next.config.mjs`'s `headers()` block — replace `http://localhost:3001` with the production host URL.
2. Update `Bridge/postMessage.ts` `ALLOWED_ORIGINS` — replace the localhost entries with production URLs (or read from `process.env.ALLOWED_BRIDGE_ORIGINS`).
3. Ensure SSL on every endpoint. The Bridge protocol is most secure over HTTPS.
4. Review the `getOriginForSource()` switch in `Bridge/postMessage.ts` — production URLs should map there too.

---

## 3. Build & deploy

Verify production builds work locally (CI runs the same):

```bash
cd main-monorepo
npm install
bash scripts/setup-db.sh        # Prisma generate is a hard build dep
npm run build --workspaces --if-present
```

### Deployment patterns

**Per-app on a PaaS (Vercel / Netlify / Render / Coolify):**

Each app deploys as its own project. Each project's root directory is `main-monorepo/apps/<app>`. Set the cross-app env vars (`NEXT_PUBLIC_*_URL`) on each project so they all know how to reach each other.

**Docker Compose with a reverse proxy:**

```yaml
# docker-compose.yml (sketch)
services:
  host-shell:
    build: { context: ., dockerfile: apps/aqua-host-shell/Dockerfile }
    environment:
      - NEXT_PUBLIC_CLIENT_URL=https://client.yourdomain.com
      # ... other NEXT_PUBLIC_*_URL vars
  client:
    build: { context: ., dockerfile: apps/aqua-client/Dockerfile }
  # ...one service per app
  nginx:
    image: nginx:alpine
    ports: ["443:443"]
    # subdomain routing: portal.* → host-shell:3001, client.* → client:3002, etc.
```

Subdomain routing is more iframe-friendly than path-based routing because the CSP `frame-ancestors` and the postMessage origin checks both work cleanly per-origin.

---

## 4. State synchronization

Cross-app state moves via the **Bridge protocol** (`Bridge/postMessage.ts`):

- **Session persistence** — each child app saves state to its own `localStorage` (key `aqua_portal_state`). Refreshing an iframe restores its own view + auth.
- **Auth handshake** — host sends `BRIDGE_AUTH` to each child after it sends `BRIDGE_READY`. The child uses the auth payload to construct its `BridgeSession`.
- **Theme sync** — host sends `BRIDGE_THEME` whenever `agencyConfig.theme` changes. Children update CSS custom properties in real time.
- **Notifications & state updates** — children emit `BRIDGE_STATE_UPDATED` to the host, which can re-broadcast to other children if needed.
- **Navigation** — children emit `BRIDGE_NAVIGATE` to ask the host to switch the active sidebar item.

The full set of message types and payload shapes is in `Bridge/postMessage.ts`. The `Bridge` package is shared at the workspace level (`@aqua/bridge`) so all 7 apps see the exact same protocol definitions.

---

## 5. Database setup (production)

Local dev uses SQLite (one `prisma/dev.db` per app). Production target is PostgreSQL.

```bash
# In each app's prisma/schema.prisma, switch the datasource:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# Then in CI/deploy:
npx prisma migrate deploy   # apply pending migrations
npx prisma generate         # regenerate the typed client
```

PLAN.md task **P3-3** tracks this migration; until it lands, treat this section as the target-state guide.

---

## 6. Troubleshooting

| Symptom | Cause + fix |
| --- | --- |
| **"Refused to display in a frame"** | The child's `Content-Security-Policy: frame-ancestors` header doesn't include the host URL. Update the child's `next.config.mjs` `headers()` block. |
| **Bridge messages silently dropped** | Sender's `source` value isn't in the receiver's `ALLOWED_ORIGINS` (`Bridge/postMessage.ts`). All 7 apps must be in the allowlist. |
| **Login loop** | The child app isn't receiving `BRIDGE_AUTH`, or its handler isn't running. Check the browser console for `[Bridge] Security Alert` and for `BRIDGE_READY` being emitted by the child. |
| **`@prisma/client did not initialize`** | Forgot `bash scripts/setup-db.sh` (or `prisma generate` per app). |
| **`Cannot find native binding` (Tailwind oxide / lightningcss / Next SWC)** | Resolved as of 2026-05-02 — the lockfile pins all 7 platform optional deps. If you hit this anyway, run `npm ci` (clean install) to refresh. |
| **`next build` fails on type errors that `tsc --noEmit` didn't catch** | Bridge files imported by an app via `transpilePackages` are typechecked by Next during build but may not be in that app's `tsconfig.json` `include` glob. Either widen the include glob or run `tsc --noEmit` from inside `Bridge/` separately. |

---

## See also

- `SETUP.md` — fresh-clone bootstrap (4 commands)
- `dev-config.md` — original 84-section architecture reference (file paths stale; concepts still apply)
- `Bridge/README.md` — Bridge package architecture
- `TESTING.md` — testing strategy + Vitest/CI status
- `PLAN.md` — feature backlog (P0-P3)
- `PROGRESS.md` — commit-by-commit history
