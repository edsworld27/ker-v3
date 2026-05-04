# Tasks

## In progress
- [ ] **T3 — Website-editor port** (waiting to launch). See `terminal-prompts/T3-website-editor.md`.

## Done — Round 1
- [x] **T1 — Foundation** — shipped. `04 the final portal/portal/` scaffolded
      on Next 16 + React 19 + Tailwind 4. Plugin runtime, three-level
      tenancy (Agency/Client/EndCustomer), HMAC cookie auth with role +
      tenant-scope gating, server-rendered chrome with brand-kit injector,
      file-backed storage abstraction. Working `/`, `/login`, `/embed/login`,
      `/portal/agency` after first-run bootstrap. `npm run build` and
      `npx tsc --noEmit` both clean. See
      `context/prior research/04-foundation.md`.
- [x] **T2 — Fulfillment plugin** — shipped. See `context/prior research/04-plugin-fulfillment.md`. tsc-clean standalone. Pending: foundation wires `PluginRuntimePort` + `PluginRegistryPort` (T1) and brokers `applyStarterVariant` adapter (T3 stubbed body, signature locked).

## Deferred
- [ ] NotebookLM setup — skipped for now. Revisit when we need outside research.

## Up next (Round 2, after Round 1 lands)
- [ ] Wire all three plugins into T1's shell — test install / uninstall / render.
- [ ] Port the **ecommerce plugin** from `02` → `04/plugins/ecommerce/`.
- [ ] Build the first phase-preset end-to-end (create client → pick
      Onboarding → fulfillment installs starter plugins → checklist appears
      → both sides tick → advance phase).
- [ ] Demo button on milesymedia.com — sandboxed agency with header toggle
      between agency POV and client POV.

## Done
- [x] Phase 0 — Prior research. 18 chapters in
      `01 development/context/prior research/`. Indexed in `MASTER.md`.
- [x] Architecture lock-in. `04-architecture.md` chapter covers:
      pool-model multi-tenancy, Aqua-manifest plugins, server-rendered
      chrome, single-cookie auth, phase lifecycle, brand kit per client.
      14 decisions logged.
- [x] Round 1 terminal prompts drafted (T1 / T2 / T3).
- [x] Vercel pinned to deploy only `04 the final portal/milesymedia website/`.
- [x] `eds requirments.md` populated. Drafted by Claude from conversation;
      Ed amends as needed.
