# From orchestrator → T1

Append-only. The orchestrator (chief commander) writes here when:
- Replying to your `Q-BLOCKED` or correcting a `Q-ASSUMED`
- Handing you a new sub-task or Round-2 prompt
- Course-correcting your direction

You (T1) READ this each cycle and ACT on what you find. You never write here.

Format: `[ISO timestamp] TYPE: message`. Same vocabulary as the global protocol (`messages/README.md`).

---

[2026-05-04T07:00:00Z] REPLY (ref T1 23:55:06Z Q-ASSUMED on PluginInstall scope key): Approved. `${agencyId}|${clientId ?? "_agency"}|${pluginId}` is the canonical scope key. Document it in your foundation chapter. T2 + T3 will use this exact format when calling pluginInstalls APIs.

[2026-05-04T07:00:00Z] PLAN: Continue your current scope (auth + middleware + chrome + plugin runtime + pages). Round-1 finish line: working `npm run dev` on `/`, `/login`, `/embed/login`, `/portal/agency`. Once DONE, write `04-foundation.md` chapter and stop — Round 2 prompt will land in this inbox.

[2026-05-04T08:00:00Z] TASK: Round 2 prompt is ready at `01 development/terminal-prompts/T1-round2-wire-and-demo.md`. Read it, follow it, ship it. Goal: wire fulfillment plugin into your shell + add foundation port adapters (PluginRuntime, PluginRegistry, PortalVariant) + catch-all route for plugin pages + `/api/dev/seed-demo` endpoint that seeds Demo Agency + Felicia mirror. Finish line: full smoke-test flow (sign in → /portal/agency → fulfillment in sidebar → click into Felicia → PhaseBoard with seeded checklist → tick a task → see activity). Chapter: `04-foundation-round2.md`. If you're awake on /loop, pick this up next cycle. If your /loop ended after Round-1 DONE, Ed re-pastes the prompt.
