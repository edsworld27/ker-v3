# CLAUDE.md — read first, every session

This file is the directive for any Claude session working on this repo.

## Operating mode — autonomous mesh

The Aqua portal build runs as **four parallel sessions**:

- **T1** — Foundation (scaffolds `04 the final portal/portal/`)
- **T2** — Fulfillment plugin
- **T3** — Website-editor port
- **Chief commander** — orchestrates on a self-paced `/loop`

All four communicate **asynchronously** via append-only logs at
`01 development/messages/`:

```
messages/
├── README.md                  ← protocol (read this!)
├── commander.md               ← commander's running log
├── terminal-1/
│   ├── to-orchestrator.md     ← T1 writes here
│   └── from-orchestrator.md   ← commander writes here for T1
├── terminal-2/  (same shape)
└── terminal-3/  (same shape)
```

**Read `01 development/messages/README.md` before doing anything.** It defines
the entry format, the directionality, and the cadence.

## Rule of work — every session

Before any task:

1. `cd ~/Desktop/ker-v3 && git pull --rebase`
2. Read `01 development/CLAUDE.md` (this file).
3. Read `01 development/messages/README.md` (the comms protocol).
4. Read `01 development/context/MASTER.md` (the context tree contents page).
5. Read `01 development/context/prior research/04-architecture.md` (the locked design).
6. Read `01 development/eds requirments.md` (Ed's spec).
7. Read your own folder's files:
   - Terminal N: `messages/terminal-N/from-orchestrator.md` (any reply/task for you?) AND `messages/terminal-N/to-orchestrator.md` (your last entry — figure out where you left off).
   - Commander: `messages/commander.md` (your last cycle entry) AND every terminal's `to-orchestrator.md` (what's new since).

While working:

- Update the relevant docs in `01 development/`:
  - `context/` — chapters covering durable learnings.
  - `phases.md` — high-level roadmap.
  - `tasks.md` — granular task list.
  - `ideas.md` — surfaced ideas not part of the active task.
  - For terminals: append to your own `messages/terminal-N/to-orchestrator.md`.
  - For commander: append to `messages/commander.md` AND write replies into per-terminal `from-orchestrator.md` files.
- **Don't stop on questions.** If a reasonable assumption exists, log it as `Q-ASSUMED`, state the assumption + reasoning, and keep going.
- **Only stop on `Q-BLOCKED`** when no reasonable assumption is possible.
- After every commit: `git pull --rebase && git push`. Append a `COMMIT` entry to your log.

When done with a task:

- Append a `DONE` entry to your log.
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

- **Terminals (T1 / T2 / T3)** can: write code in their assigned folder, append to their own `to-orchestrator.md`, append to chapter files within their scope, update `tasks.md` rows for their own task, commit + push.
- **Terminals must NOT**: write to another terminal's folder, write to `commander.md`, write to their own `from-orchestrator.md`, change `04-architecture.md`, modify `eds requirments.md`, modify the messages README/protocol.
- **Chief commander** can: do anything terminals can + write to per-terminal `from-orchestrator.md` files, append to `commander.md`, edit prompts, edit architecture chapter (rare), edit messages README, plan next rounds.
- **Ed** is the only authority above the chief commander. If Ed says something, it overrides everything in this file.
