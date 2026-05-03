# Tasks

## In progress
- [ ] **T1 — Foundation** (waiting to launch). See `terminal-prompts/T1-foundation.md`.
- [ ] **T2 — Fulfillment plugin** (waiting to launch). See `terminal-prompts/T2-fulfillment.md`.
- [ ] **T3 — Website-editor port** (waiting to launch). See `terminal-prompts/T3-website-editor.md`.

## Blocked / needs Ed
- [ ] NotebookLM auth — Ed says "set up notebooklm" → I run `setup_auth` →
      Ed signs in via browser → creates "the aqua portal finalised" notebook
      in NotebookLM web UI → pastes share URL back here.
- [ ] `eds requirments.md` is empty. Ed populates it before terminals
      start (or terminals proceed on the architecture chapter as the spec).

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
