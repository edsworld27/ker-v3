# SETUP.md — Fresh-clone bootstrap for the Aqua Portal monorepo

> Read this first if you've just cloned the repo.

---

## Prerequisites

- **Node.js 22.x** (matches CI; 20.x also works)
- **npm 10+** (ships with Node 22)
- ~2 GB disk for `node_modules/`, ~500 MB more for per-app `.next/` build caches
- macOS, Linux, or Windows — all three are CI-tested

If you're on Apple Silicon, Linux x64, or Windows x64, the right native SWC + Tailwind oxide + lightningcss binaries are pulled automatically by `npm install` (the lockfile pins all platform optional deps).

---

## First-time setup (4 commands)

```bash
cd main-monorepo
npm install                  # ~60s
npm run setup                # initializes SQLite Prisma DBs for all 7 apps
npm test                     # Bridge Vitest sanity check (~2s, 37 tests)
npm run dev:host             # http://localhost:3001
```

Then open `http://localhost:3001` and log in with email `demo@aqua.portal` for the no-DB demo session.

---

## Working with the 7 apps

Each app has its own port and `dev:` script:

| App | Port | Script |
| --- | ---: | --- |
| `aqua-host-shell` | 3001 | `npm run dev:host` |
| `aqua-client` | 3002 | `npm run dev:client` |
| `aqua-crm` | 3003 | `npm run dev:crm` |
| `aqua-operations` | 3004 | `npm run dev:operations` |
| `aqua-ops-finance` | 3005 | `npm run dev:finance` |
| `aqua-ops-people` | 3006 | `npm run dev:people` |
| `aqua-ops-revenue` | 3007 | `npm run dev:revenue` |

Boot all 7 in parallel: `npm run dev` (heavy — ~6-8 GB RAM).

The host shell at `:3001` is the orchestrator — it iframes the others. Start there.

---

## Verifying a change

The four signals that CI also enforces:

```bash
npm test                                # Bridge Vitest
npm run lint                            # ESLint across all 7 apps
npm run typecheck                       # tsc --noEmit per app
npm run build --workspace=aqua-host-shell   # Production build (per app)
```

For UI changes, also boot the relevant app and curl-verify:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001/
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3002/embed/dashboard
```

---

## Useful one-offs

```bash
# Wipe a specific app's build cache (e.g. after dependency upgrades)
rm -rf apps/aqua-host-shell/.next

# Re-generate Prisma clients after schema changes
bash scripts/setup-db.sh

# Open Prisma Studio for one app's SQLite DB
cd apps/aqua-host-shell && npx prisma studio

# Run Bridge tests in watch mode while editing
cd Bridge && npx vitest

# Lint a single app
cd apps/aqua-client && npx eslint .
```

---

## What to read next

- `README.md` — high-level architecture overview (still being maintained)
- `CLAUDE.md` — context for future Claude sessions (durable hand-off)
- `PLAN.md` — productionization backlog (P0-P3)
- `TESTING.md` — testing strategy + status (Vitest is live, Playwright is queued as T3)
- `PROGRESS.md` — running log of every commit-worthy change
- `dev-config.md` — the original 84-section architecture reference. **Stale on file paths/topology** (describes the older single-`(Live Application)` layout, not the current 7-app split) but the conceptual content (registry pattern, role system, login flow, BridgeSession shape) still applies.
- `NEXT_STEPS.md` — production deployment guide (env vars + CSP + Bridge handshake)
- `Bridge/README.md` — the cross-app glue layer
- per-app `apps/<app>/README.md` — what each app owns

---

## CI

Every PR runs `.github/workflows/ci.yml`:

1. Install (npm cache hits typically <10s after the first run)
2. Bridge Vitest
3. ESLint across all 7 apps
4. `tsc --noEmit` matrixed across 7 apps
5. `next build` matrixed across 7 apps (gated on the above passing)

Build is gated behind the cheaper checks so a failing typecheck doesn't waste 7 parallel build minutes.
