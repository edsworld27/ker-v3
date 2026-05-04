# CLAUDE.md — read first, every session

This file is the directive for any Claude session working on this repo.

## First — figure out which mode you're in

This project runs in **two operating modes**. Pick the one that matches
your runtime:

### Mode A — Mac terminal (Claude Code)

You're running on Ed's Mac with full shell + filesystem access, can spawn
subagents, can use `/loop` and `ScheduleWakeup`. **Multiple terminals run
in parallel** (T1 / T2 / T3 / chief commander). You coordinate via append-
only logs at `01 development/messages/`.

→ **Read `01 development/messages/README.md`** for the full autonomous-
mesh protocol. Then read the rest of this file.

### Mode B — Claude web (claude.ai with GitHub connector)

You're running in Ed's browser at work. **Single chat, single actor.** No
`/loop`, no parallel terminals. You're simultaneously orchestrator AND
worker. The autonomous mesh is OFF in this mode.

→ **Read `01 development/web.md`** for the full single-actor protocol.
Then read the rest of this file.

If you're not sure: do you have the `/loop` skill, `ScheduleWakeup` tool,
and shell `Bash` tool? If yes → Mode A. If no → Mode B.

## Rule of work — every session, both modes

Before any task:

1. `git pull --rebase` (Mac) or pull via the GitHub connector (web).
2. Read this file (`01 development/CLAUDE.md`).
3. Mode A: read `01 development/messages/README.md`. Mode B: read `01 development/web.md`.
4. Read `01 development/context/MASTER.md` (the context tree contents page).
5. Read `01 development/context/prior research/04-architecture.md` (the locked design).
6. Read `01 development/eds requirments.md` (Ed's spec).
7. Mode A — terminal: read your `messages/terminal-N/from-orchestrator.md` (any reply for you?) AND your `messages/terminal-N/to-orchestrator.md` (your last entry).
   Mode A — commander: read `messages/commander.md` AND every terminal's `to-orchestrator.md`.
   Mode B — web: read the recent `git log` + `tasks.md` to find current state.
8. Read `01 development/tasks.md` and `phases.md`.

While working:

- Update the relevant docs in `01 development/`:
  - `context/` — chapters covering durable learnings.
  - `phases.md` — high-level roadmap.
  - `tasks.md` — granular task list.
  - `ideas.md` — surfaced ideas not part of the active task.
  - Mode A terminal: append to your own `messages/terminal-N/to-orchestrator.md`.
  - Mode A commander: append to `messages/commander.md` and per-terminal `from-orchestrator.md`.
  - Mode B web: just commit clearly — git log is the audit trail.
- **Don't stop on questions.** If a reasonable assumption exists, log it as `Q-ASSUMED` (Mode A) or note it in your reply (Mode B), and keep going.
- **Only stop on `Q-BLOCKED`** when no reasonable assumption is possible.
- After every commit: `git pull --rebase && git push`. Append a `COMMIT` entry to your log (Mode A) or just commit cleanly (Mode B).

When done with a task:

- Append a `DONE` entry to your log (Mode A) or note completion in your reply (Mode B).
- Add or update a chapter in `01 development/context/prior research/`.
- Add a row to `01 development/context/MASTER.md` for any new chapter.
- Move row in `tasks.md` to "Done".
- Final commit + push.

## Memory protocol — context tree

All durable memory lives in `01 development/context/`. Treat it like a book:

- **Recall**: open `context/MASTER.md`, find the chapter row, open the chapter file.
- **Write**: drop a new chapter file *and* add a row in `MASTER.md`.

Never stash project memory anywhere else. The context tree is the single source of truth.

## What to ignore

- `01 development/old files/` — historical handoffs from earlier iterations. Reference if useful, but the active source of truth is the four planning docs above + the context tree + the architecture chapter.

## Scope

The active build target is `04 the final portal/`. Everything in
`02 felicias aqua portal work/` and `03 old portal/` is **reference only** —
do not edit those folders unless Ed explicitly asks.

## Authority boundaries

- **Mode A terminals (T1 / T2 / T3)** can: write code in their assigned folder, append to their own `to-orchestrator.md`, append to chapter files within their scope, update `tasks.md` rows for their own task, commit + push.
- **Mode A terminals must NOT**: write to another terminal's folder, write to `commander.md`, write to their own `from-orchestrator.md`, change `04-architecture.md`, modify `eds requirments.md`, modify the messages README/protocol.
- **Mode A chief commander** can: do anything terminals can + write to per-terminal `from-orchestrator.md` files, append to `commander.md`, edit prompts, edit architecture chapter (rare), edit messages README, plan next rounds.
- **Mode B web** can: edit any file, commit + push, write new chapters, draft new terminal prompts. Should NOT modify `eds requirments.md` or the messages mesh files (`messages/terminal-N/`, `commander.md`) — those are mesh-mode artefacts; in web mode, just commit cleanly.
- **Ed** is the only authority above all of the above. If Ed says something, it overrides everything in this file.
