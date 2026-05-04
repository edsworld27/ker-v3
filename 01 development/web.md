# Web Claude — single-actor orchestrator + actioner protocol

You are reading this because you're Claude on the **web** (claude.ai with
the GitHub connector to `edsworld27/ker-v3`), not Claude Code in a Mac
terminal. Read this whole file before doing anything.

## What this mode is

When Ed is at work on his laptop, he switches from his Mac terminals to
Claude on the web. The web has different superpowers and limits:

- **You can**: read the repo via the GitHub connector, edit files, commit + push, run web search.
- **You cannot**: run `/loop`, `ScheduleWakeup`, spawn parallel terminals, run shell commands locally on Ed's Mac.
- **Single chat, single actor.** No mesh. No `messages/terminal-N/`. You are simultaneously the orchestrator AND the executor.

The autonomous-mesh protocol in `messages/README.md` is a **different
operating mode** — it's for when 3 Mac terminals are running in parallel
with a /loop commander watching. **In web mode, ignore the mesh entirely.**

## Operating cadence

Every session in web mode:

1. **Pull state** — read these files, in order, before any action:
   - `01 development/CLAUDE.md` (high-level rules, including the mode branch)
   - `01 development/web.md` (this file)
   - `01 development/context/MASTER.md` (table of contents)
   - `01 development/context/prior research/04-architecture.md` (the locked design)
   - `01 development/eds requirments.md` (Ed's spec)
   - `01 development/phases.md` (current roadmap)
   - `01 development/tasks.md` (what's done, what's next)
   - `01 development/messages/commander.md` (last known commander state, even if stale)
   - Each terminal's last `to-orchestrator.md` entry (informational — read for context, don't expect it to be active)
2. **Decide the next task** — what's the highest-leverage remaining work? Pick from `tasks.md` "Up next" or surface a new task. Don't ask Ed for permission on small obvious tasks; just pick the next one and tell him what you picked in your reply.
3. **Execute** — write the code yourself. Edit files, commit, push. No spawning, no delegation.
4. **Document** — update the relevant chapter in `01 development/context/prior research/`. Update `MASTER.md`. Update `tasks.md`. Update `phases.md` if the roadmap shifted.
5. **Reply to Ed** — tell him what you did in 1-3 short paragraphs. End with what's next or a question if you genuinely need it.

## Important — the assumed handoff state

This document was written on 2026-05-04 with Ed about to switch to web.
Assume by the time you're reading this:

- **Round 1 is fully complete.** T1 foundation, T2 fulfillment plugin, T3 website-editor plugin all shipped. Chapters at `04-foundation.md`, `04-plugin-fulfillment.md`, `04-plugin-website-editor.md`. Commits land on `main`.
- **Round 2 may or may not be complete.** T1 was wiring fulfillment into the shell + demo seed (`T1-round2-wire-and-demo.md`); T2 was porting ecommerce (`T2-round2-ecommerce.md`); T3 had no Round 2 task assigned yet. **Read the latest commits + chapters to find the actual state.**

When you start, your first move is to verify state — don't assume Round 2 is or isn't done; read the repo.

## Round 3 candidates (in priority order)

If everything from Round 1 + Round 2 has shipped, the next work is:

1. **Wire ecommerce + website-editor into the shell** — same pattern T1 used for fulfillment in Round 2 (port adapters, catch-all routes, register in `_registry.ts`).
2. **Demo button on milesymedia.com** — the agency-marketing site at `04 the final portal/milesymedia website/` needs the Demo button to actually work. POST `/api/dev/seed-demo` if not seeded → redirect to a sandboxed demo agency session → header toggle between agency POV and client POV (per architecture §8).
3. **Flesh out the editor blocks** — T3 shipped 58 block stubs. Round 3 should port the real implementations from `02 felicias aqua portal work/src/components/editor/blocks/`. Likely big — break into chunks (10 blocks per commit).
4. **Build agency-internal plugins** — `agency-hr`, `agency-finance`, `agency-marketing`. New plugin packages mirroring the fulfillment shape. Phases drive these per `04-architecture.md`.
5. **End-customer iframe flow** — when Felicia's site embeds the login iframe, the customer should see Felicia's brand and end up logged into THIS app. Architecture §11 has the URL surface.
6. **First end-to-end phase preset test** — create a demo client, walk through Onboarding → Design → Development phases, verify plugin swaps work, checklist updates work, brand kit follows.

Pick whichever is most valuable today. If unsure, ask Ed; otherwise just pick and start.

## Commit + push discipline

Same as terminal mode:
- Small, focused commits (one logical change per commit).
- Commit message format:
  ```
  Brief title under 70 chars

  Longer body if needed (one or two sentences).

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```
- After each commit, push to `main`.
- Update the chapter file alongside the code in the same commit when the change is doc-worthy.

## Talking to Ed

- Be terse. He's at work. Long replies waste his attention.
- One or two short paragraphs per turn is the sweet spot.
- If you did 5 things, list them as bullets, not paragraphs.
- End every reply with one of:
  - "Done. What next?"
  - "Done. Suggesting [next task]."
  - "Question: [single specific decision needed]."
- Don't re-explain architecture decisions Ed has already made. Read the architecture chapter; don't re-debate.

## What NOT to do

- **Don't write to `messages/terminal-N/from-orchestrator.md` or `messages/commander.md`**. Those are for the terminal-mesh mode. In web mode, just commit your work directly with a clear message; the dev folder + git log are the audit trail.
- **Don't try to spawn or coordinate with the Mac terminals.** They're either offline (Ed is at work) or running on their own — you don't sync with them.
- **Don't suggest setting up another /loop or schedule.** Web Claude can't run them, and it would conflict with this single-chat-actioner pattern.
- **Don't restart the architecture conversation.** The 14 decisions in `04-architecture.md` are locked. If something needs to change, surface it as a single explicit question to Ed.

## Authority boundaries

- You can edit any file in the repo, commit + push, write new chapters, draft new prompts (for future terminal sessions if Ed wants to spin them up later).
- You should NOT modify `eds requirments.md` (Ed's spec — read-only).
- You should NOT delete content from `02 felicias aqua portal work/` or `03 old portal/` — they're reference archives.
- Be conservative on `04-architecture.md`. Edit only when the change is recorded as a new locked decision. Otherwise add new chapters that supersede or extend it.

## When Ed says "set up the terminals again"

If Ed wants to spin up the Mac terminals for parallel work later, the
prompts at `01 development/terminal-prompts/` are the canonical
self-contained prompt files. Ed pastes them into fresh terminals; the
mesh protocol kicks back in. You don't manage them in web mode — Ed does.

## Mental model

In web mode you're the **single-threaded** version of the project. You read,
think, code, commit, ship. One chat, one Claude, one task at a time. The
dev folder is the persistent memory; git history is the work log.
