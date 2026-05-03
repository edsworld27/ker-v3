# TESTING.md — Testing audit + recommended strategy for the AQUA Portal monorepo

> **Status as of 2026-05-02:** Phase **T0 (Vitest scaffold on Bridge/)** and **T4 (GitHub Actions CI)** are **landed**. T1, T2, T3, T5 are still queued.
>
> Run tests: `cd main-monorepo && npm test` → 5 files, 37 tests, ~2s.
> CI: `.github/workflows/ci.yml` runs install + test + lint + typecheck (matrixed across 7 apps) + build (matrixed) on every PR.
>
> Original audit and the rest of the phased plan follow.

---

## Audit summary

| Category | Status |
| --- | --- |
| Test framework configs (jest / vitest / playwright / cypress) | None — repo-wide |
| Test files (`*.test.*`, `*.spec.*`, `__tests__/`) | Zero |
| Test scripts in any `package.json` | None — root, all 7 apps, `Bridge/`, `Templates/` |
| Test deps (jest, vitest, @testing-library/*, mocha, chai) | None in any `package.json` |
| CI workflows (`.github/workflows/*`) | No `.github/` directory exists |
| Testing mentions in docs (`README.md`, `CLAUDE.md`, `PLAN.md`, `PROGRESS.md`, `dev-config.md`) | None |

What exists instead:
- `typescript.ignoreBuildErrors: true` is set in every app's `next.config.mjs` (intentional, due to known type drift between Finance/People widgets and `Bridge/types/`)
- Manual verification protocol in `CLAUDE.md` § "How to verify a change works": `npx tsc --noEmit` + boot the app + `curl` the port
- Each app has `next lint` (lint only, no tests)

---

## Why this matters

- The product is a multi-tenant SaaS (per-agency suite enable/disable in the marketplace). Regression risk grows with every stub-to-real conversion in `PLAN.md` § P2.
- Cross-app communication is iframe + `postMessage` (`Bridge/postMessage.ts`). This is exactly the kind of seam that silently rots without contract tests.
- `typescript.ignoreBuildErrors: true` means the type system isn't catching drift today. Removing that flag (PLAN P3-1) will be much safer with tests as a backstop.
- `Bridge/` is pure logic (registry, events, auth, postMessage protocol) — easiest, highest-value place to start.

---

## Recommended phased plan

### T0 — Vitest scaffold on `Bridge/`

**Goal:** one passing unit test in CI before touching app code.

- Add Vitest at the workspace root (`main-monorepo/package.json`) as a dev dep
- Add `Bridge/vitest.config.ts` with the jsdom or node environment
- Write tests for the lowest-risk pure modules first:
  - `Bridge/registry/` — suite + component registration
  - `Bridge/events/` — typed event bus (subscribe / emit / unsubscribe)
  - `Bridge/postMessage.ts` — `BridgeMessage` shape validation
  - `Bridge/auth/` — `authenticate(email)` returns `DEMO_SESSION` for `demo@aqua.portal`
  - `Bridge/config/` — constants (`APP_PORTS`, `ROLE_PRODUCT_MAP`, `BRIDGE_LS_KEYS`) snapshot
- Add `"test": "vitest run"` script to `Bridge/package.json` and root
- Acceptance: `npm test --workspace=@aqua/bridge` runs and passes

### T1 — App smoke tests (boot + key route)

**Goal:** catch the "blank page after refactor" class of bug that `CLAUDE.md` § "If something boots blank" describes.

- For each of the 7 apps, one Vitest test that imports the root layout/page module and asserts it renders without throwing
- Plus a smoke test that imports the suite registry and asserts the expected suite IDs are present (catches lucide-casing typos and circular deps at import time)
- Acceptance: `npm run test:apps` from root runs all 7 in series and passes

### T2 — Marketplace integration test

**Goal:** lock down the headline feature before P0-3 (DB persistence).

- React Testing Library test for `apps/aqua-host-shell/HostShell/components/TemplateHub/HostTemplateHubView.tsx`
  - Renders all suite cards
  - Toggling a suite calls the toggle handler with the right suite ID
  - Search filter narrows the visible cards
  - Category filter narrows the visible cards
- Once P0-3 lands (DB persistence): add an API-route test for `app/api/bridge/state/route.ts` that POSTs a toggle and reads back `AgencySuite.enabled`
- Acceptance: marketplace test suite green; toggle persists across reload (asserted via direct Prisma read in the test)

### T3 — Playwright cross-iframe E2E

**Goal:** prove the host-shell-iframes-children architecture works end to end.

- Add `playwright.config.ts` at `main-monorepo/` root with the `webServer` block booting `npm run dev` (or just host + finance for the first test)
- One test:
  - Visit `http://localhost:3001/`, log in as `demo@aqua.portal`
  - Click the Finance Hub sidebar item
  - Wait for the iframe with `src` matching `localhost:3005/embed/`
  - Assert the `BRIDGE_AUTH` → `BRIDGE_READY` `postMessage` handshake completes (via a `page.on('console')` or test bridge hook)
- Acceptance: `npm run test:e2e` boots host + finance and the test passes

### T4 — GitHub Actions CI

**Goal:** prevent regressions on PR.

- Add `.github/workflows/ci.yml`:
  - Trigger: `pull_request` and `push` to `main`
  - Job 1: `npm ci` + `npx tsc --noEmit` per workspace (acknowledging `ignoreBuildErrors` is build-time only — `tsc --noEmit` still runs)
  - Job 2: `npm test` (Vitest, T0 + T1 + T2)
  - Job 3 (optional, after T3): Playwright job with `actions/setup-node` + browser install
- Acceptance: PR shows three green checks before merge

### T5 — Type drift cleanup (paired with PLAN P3-1)

Once T0–T2 are green, removing `typescript.ignoreBuildErrors: true` per app becomes a safe, mechanical task. Tests catch any behavior regression while the type fixes happen.

---

## Suggested deps

For `main-monorepo/package.json` (root) `devDependencies`:

```
vitest
@vitest/ui
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
jsdom
@playwright/test    # T3 only
```

Pin these in one PR so the lockfile churn is isolated.

---

## What this doc does NOT do

- Does **not** add any test files yet — that's T0+ work, gated on user approval
- Does **not** modify `package.json` or install deps
- Does **not** create `.github/workflows/`
- Does **not** change any app code

This is purely the strategy doc. Each phase (T0–T5) should land as its own PR.

---

## Open questions for Ed

1. Vitest vs Jest? Vitest is faster, native-ESM, and matches the Next 16 + Turbopack stack better. Jest has more StackOverflow answers. Recommendation: **Vitest**.
2. Playwright vs Cypress? Playwright handles multi-origin (iframes across ports) much more cleanly — critical for this architecture. Recommendation: **Playwright**.
3. Should `extras/` be tested? Recommendation: **no** — it's reference-only per `extras/README.md`.
4. Coverage thresholds? Suggest deferring until T2 lands — no point in a threshold against zero tests.

---

## Cross-references

- `CLAUDE.md` § "How to verify a change works" — current manual protocol, retain as fallback
- `PLAN.md` § P3-1 — pairs naturally with T5
- `Bridge/README.md` — describes the modules T0 will test first
- `Bridge/postMessage.ts` — protocol surface for T3
