# SESSION_HANDOFF.md — Boot guide for the next Claude session

> Read this first if you're a fresh Claude session picking up where the previous one left off. This is the shortest possible summary to get oriented.
>
> Last updated: **2026-05-03 — repo archived under `old-portal-github/`**. The portal v9 monorepo described below has shipped a kit redesign + Aqua AI chat + production CSP and is now frozen as a reference for the next-generation portal build at the repo root.

---

## 0. Status

| Signal | Status |
| --- | --- |
| Active branch | none — **everything merged to `main`** |
| Open PRs | none |
| `main` head | commit `dae63ac` (PR #9 — repo restructure). Before that: `a275855` (P3-5 CSP, PR #8) → `ddd5c90` (P3-1+P3-4 AI chat + lint, PR #7) → `0828114` (PR #6 — full kit migration). |
| Repo layout | only `old-portal-github/` at the root; this monorepo lives at `old-portal-github/main-monorepo/`. |
| Vercel | the old `vercel.json` references `main-monorepo/apps/aqua-host-shell/.next` from the repo root; that path no longer exists at root. Either pause the Vercel project or reconfigure to point at `old-portal-github/main-monorepo/...` before the next deploy. |
| `tsc --noEmit` per app | **0 errors / all 7 clean** (verified at the last commit on each session) |
| ESLint | 0 errors / **183 warnings** (down from 854 noted in CLAUDE.md; further cleanup is diminishing-returns destructure noise) |
| Bridge unit tests | **37 / 37 passing** (Vitest, ~2s) |
| `next build` host shell | passes (verified by every PR's CI matrix × 7 builds) |
| Dev boot | host shell on port **3000** is the only Next.js process; loads every plugin via `BridgeRegistry`; HTTP 200 on `/`. |
| Marketplace | wired end-to-end, persists toggles + config (with demo-mode fallback when DB unavailable) |
| Plugin sidebar | dynamic — reads from `BridgeRegistry.getSuites()` |
| Per-suite stores | localStorage-backed `useSyncExternalStore` singletons in `apps/aqua-{crm,ops-finance,ops-people,ops-revenue}/.../store/*Store.ts` with full CRUD wired to every interactive view |
| UI kit | **100% migration across visible chrome.** Unified at `Bridge/ui/kit.tsx` + 4 shared modules: `AppSidebar.tsx`, `AppMarketplace.tsx`, `AppSettings.tsx`, `DashboardWidget.tsx`. Plus a slide-over `AIChatPanel.tsx` powered by Claude Opus 4.7 via `/api/ai/chat`. |

---

## 1. What this app is

**Aqua Portal v9** — a multi-tenant SaaS for digital agencies. Single Next.js app at `apps/aqua-host-shell/` (port 3000) that resolves every "sub-app" (CRM / Finance / People / Revenue / Client / Operations) via the `BridgeRegistry` plugin system. No iframes by default.

For the longer description, read `CLAUDE.md` at the repo root and `PROGRESS.md` for what's been built.

---

## 2. Branch + PR

- **No open PRs as of archive time.** Everything in flight has merged.
- **Recently merged PRs (in order):**
  - PR #5 — Phase 9 plugin model + per-suite stores + unified UI kit (session 4)
  - PR #6 — full kit redesign across every visible surface + 4 shared modules + dead-code removal (sessions 5a–5j)
  - PR #7 — P3-1 Aqua AI chat panel (Claude Opus 4.7) + P3-4 lint cleanup
  - PR #8 — P3-5 production CSP headers + security baseline
  - PR #9 — repo restructure under `old-portal-github/`
- **CI** (when running, before the restructure moved `.github/`): GitHub Actions in `.github/workflows/ci.yml` — install + Bridge tests + ESLint + tsc (matrix × 7) + next build (matrix × 7). All 18 checks green for PR #6 / #7 / #8.
- **CI now:** `.github/workflows/ci.yml` is at `old-portal-github/.github/workflows/ci.yml` after the restructure, so GitHub Actions does not pick it up. The new app at the repo root will need its own `.github/`.

If you arrive and CI is failing, read `PROGRESS.md` for the latest fix attempts. Common issues we've already hit and fixed (in order of past pain):

1. ❗ **Lockfile missing platform natives** — Linux x64 swc/oxide/lightningcss. Fixed via `optionalDependencies` in root `package.json`.
2. ❗ **`recharts` peer-dep `react-is`** — added to root deps.
3. ❗ **Per-app Prisma schema drift** — `setup-db.sh` runs `prisma generate` per app, last-one-wins for the shared `node_modules/.prisma/client/`. ALL 7 schemas must stay in sync for any model the host-shell uses (e.g. `AgencySuite`).
4. ❗ **Stale `.next` after dead-code removal** — local incremental tsc cache hid CI failures in session 5j. Always `find . -name "tsconfig.tsbuildinfo" -not -path "*/node_modules/*" -delete` after deleting source files.

If you arrive and CI is failing, read `PROGRESS.md` for the latest fix attempts. Common issues we've already hit and fixed (in order of past pain):

1. ❗ **Lockfile missing platform natives** — Linux x64 swc/oxide/lightningcss. Fixed via `optionalDependencies` in root `package.json`.
2. ❗ **`recharts` peer-dep `react-is`** — added to root deps.
3. ❗ **Per-app Prisma schema drift** — `setup-db.sh` runs `prisma generate` per app, last-one-wins for the shared `node_modules/.prisma/client/`. ALL 7 schemas must stay in sync for any model the host-shell uses (e.g. `AgencySuite`).

---

## 3. State of the codebase right now

| Signal | Status |
| --- | --- |
| `tsc --noEmit` per app | **0 errors / all 7 clean** (verified locally + in CI) |
| `eslint .` per app | 0 errors / ~854 warnings (cosmetic — unused destructured locals) |
| Bridge unit tests | **37 / 37 passing** (Vitest) |
| `next build` host shell | passes locally; Vercel preview rate-limited (resumes ~24h after session 4 hit) |
| Dev boot | host shell on port **3000** is the only Next.js process; loads every plugin via `BridgeRegistry` |
| Marketplace | wired end-to-end, persists toggles + config (with demo-mode fallback when DB unavailable) |
| Plugin sidebar | **dynamic in host shell** — reads from `BridgeRegistry.getSuites()`, no more hardcoded `app-client/app-crm/app-operations` entries |
| Per-suite stores | localStorage-backed `useSyncExternalStore` singletons in `apps/aqua-{crm,ops-finance,ops-people,ops-revenue}/.../store/*Store.ts` with full CRUD wired to every interactive view |
| UI kit | unified at `Bridge/ui/kit.tsx`. 6 views redesigned (Finance Dashboard, People HR, Operations Overview, CRM Pipeline / Deals / Contacts). Remaining views still use legacy per-app components — see PLAN.md P0/P1 for the migration list. |

---

## 4. What's done (8 phases)

See `PHASES.md` for full detail. One-liner per phase:

- **Phase 1** ✅ Marketplace nav + view routing + DB persistence
- **Phase 2** ✅ 5 CRM templates (Pipeline / Deals / Contacts / Activities / Reports)
- **Phase 3** ✅ Revenue Sales (6 widgets) + Marketing (7 widgets)
- **Phase 4** ✅ Real Settings UIs across all 7 apps
- **Phase 5** ✅ `useClientLogicStub` family — 4 stubs replaced with real handlers
- **Phase 6** ⏳ AI integration (queued)
- **Phase 7** ⏳ Production prep — Postgres + CSP + remaining test phases (queued)
- **Phase 8** ✅ Plugin model — `SuiteTemplate.configSchema`, dynamic sidebar, marketplace v2 with config drawer
- **Phase 9** ⏳ Plugin authoring contract — manifest discovery, sandboxing, etc. (deferred polish)

Plus structural work in earlier sessions: typecheck cleanup, lint setup, CI workflow, Vitest scaffold on Bridge, doc refresh (`SETUP.md` + `NEXT_STEPS.md` rewritten + `dev-config.md` staleness banner).

---

## 5. Where to pick up

### Highest-value next phase: **Phase 6 (AI integration)**

Why: every app already has an `AIChatbot` widget shell that does nothing. Wiring it to Claude Sonnet 4.6 unlocks a feature users will actually feel. Scope is bounded: 1 root dep + 7 API routes + 7 widget bodies.

Plan:
1. `npm install --save @anthropic-ai/sdk` (root)
2. Create `apps/<app>/app/api/chat/route.ts` for each app (7 routes, ~30 lines each)
3. Each app's `AIChatbot/` widget POSTs to its own `/api/chat`
4. Per-app system prompt scoped to its domain
5. Streaming response via SSE or fetch + ReadableStream

Recommend default model: `claude-sonnet-4-6`. For more complex reasoning, opt-in `claude-opus-4-7`.

### Alternative: **Phase 5b (BridgeAPI persistence)**

If you'd rather close out Phase 5 before starting Phase 6:
- Add `BridgeAPI.updateClient`, `uploadResource`, `inviteUser`, `removeUser` to `Clientapi.ts`
- Wire them into the handlers I just made real
- Add the missing API routes (`app/api/bridge/users/[id]/route.ts` etc.)

### Alternative: **Phase 7 (production prep)**

The biggest blocker to actual deployment. PostgreSQL migration, production CSP, env-var matrix.

---

## 6. Plumbing rules of thumb

- **Path aliases:** each app has `@<App>Shell/*` (e.g. `@FinanceShell/*`). Bridge is `@aqua/bridge`.
- **File naming:** files inside a shell are prefixed with the app name (`FinanceApp.tsx`, `FinanceSidebar.tsx`). Barrels are `index.ts` (host-shell pattern propagated to all apps).
- **Hook naming:** `use<App><Feature>Logic` (e.g. `useFinanceCore`, `useClientShellLogic`).
- **Component primitives:** each app has a `components/ui/` directory exporting `<App>Card`, `<App>Button`, `<App>Icon`, `<App>Input`, `<App>Select`. Use those, not raw HTML.
- **Theme variables:** `var(--<app-prefix>-widget-*)` — per-app prefix is `host` / `client` / `crm` / `opshub` / `finance` / `people` / `revenue`.
- **Type imports:** prefer `import type { SuiteTemplate } from '@aqua/bridge'` (canonical). Some legacy code imports from `@<App>Shell/bridge/types/<App>index` — that re-export drifts; the canonical is more reliable.
- **Plugin descriptions:** new suites should declare `category`, `description`, `pricing`, optionally `configSchema`. Without these, the marketplace renders generic placeholder text.

---

## 7. Common gotchas (learned the hard way)

| Symptom | Why | Fix |
| --- | --- | --- |
| `tsc --noEmit` clean locally but CI fails on Prisma type | All 7 schemas share a generated client — last app to `prisma generate` wins | Sync the model across all 7 schemas |
| `Cannot find native binding` on `@tailwindcss/oxide` / `lightningcss` / `@next/swc` | npm/cli#4828 — optional deps skipped | Listed in `optionalDependencies` of root `package.json`; should auto-install |
| `next build` fails on `react-is` | recharts peer-deps it | Already in root `dependencies` |
| Dev compile error after schema edit | Prisma client stale | Run `bash scripts/setup-db.sh` |
| Empty `Marketplace` view | Suites haven't been registered yet (timing issue) | The marketplace component subscribes to `BridgeRegistry`; registrations land async after `register*App()` resolves. Should auto-update. |
| Sidebar doesn't show plugins | Either `enabledSuiteIds` is empty (open marketplace) or the suite hasn't been registered | Check `BridgeRegistry.getSuites().map(s => s.id)` in console; check `bridgeSession.enabledSuiteIds` |

---

## 8. Verification before merging

Run these locally; CI runs the same:

```bash
cd main-monorepo
npm install                     # only first time
bash scripts/setup-db.sh        # always before tsc/build (Prisma generate)
npm test                        # Bridge Vitest (~3s)
npm run lint                    # all 7 apps (~30s)
npm run typecheck               # all 7 apps (~60s)
npm run build --workspace=aqua-host-shell    # one app's prod build (~60s)
npm run dev:host                # boot host shell — open localhost:3001
```

For the marketplace flow specifically:
1. Boot host shell
2. Login as `demo@aqua.portal`
3. Click "Marketplace" in sidebar
4. Toggle a plugin → reload → toggle persists
5. Click a plugin's "Configure" button → drawer opens with config schema → save → drawer closes

---

## 9. Open questions / decisions you may need

These are spots where I made a judgement call that the user may want to revisit:

1. **Prisma client sharing** — currently all 7 apps generate into one shared client. Could split per-app via `output` in each schema, but that complicates the build. Status quo is simpler.
2. **Plugin configSchema field types** — kept to 6 (string/number/boolean/select/multiselect/json + secret flag). Could add `date`, `color`, `file`. Defer until needed.
3. **BridgeUIRegistry lookup** — token-bag style registration works but lookups by view-id only return the first matching config. If a plugin has multiple sub-views with different tokens, there's no per-subview resolution yet.
4. **Marketplace empty state** — currently shows a friendly panel. Could instead pre-seed with the dev-config.md core suites for first-time agencies.
5. **`Bridge/concepts/` future** — still excluded from typecheck (it's the older Vite prototype). At some point, decide: port what's needed and delete the rest, or keep as ongoing reference.

---

## 10. Where to read more

- `CLAUDE.md` (repo root) — durable context for any Claude session
- `PHASES.md` — this work plan, with file paths + success criteria per phase
- `PROGRESS.md` — chronological commit log (every commit-worthy change since session 1)
- `TESTING.md` — Vitest scaffold + CI strategy + queued T1/T2/T3 (per-app smoke / marketplace integration / Playwright E2E)
- `SETUP.md` — fresh-clone bootstrap (4 commands)
- `NEXT_STEPS.md` — production deployment guide (env vars, CSP, Bridge handshake)
- `dev-config.md` — original 84-section architecture reference (file paths stale post-split, concepts still apply)
- `Bridge/README.md` — Bridge package architecture
- per-app `apps/<app>/README.md` — what each app owns

When in doubt, grep first, ask second.
