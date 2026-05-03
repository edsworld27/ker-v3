# CLAUDE.md — read first, every session

This file is the directive for any Claude session working on this repo.

## Rule of work

**Before doing any task, first update the development folder.**
Specifically, before writing code or making changes elsewhere in the
repo, update the relevant docs in `01 development/`:

- `context/` — the project's persistent memory, organised as a **context
  tree** (see `context/MASTER.md`). Read the master index first; open
  individual chapters as needed. When you learn something worth
  remembering, add it to the right chapter (or start a new one) AND
  update the chapter row in `MASTER.md`.
- `phases.md` — the high-level roadmap. Update when a phase advances.
- `tasks.md` — the granular to-do list. Add the task you're about to
  do, mark in-progress, then mark done when you finish.
- `ideas.md` — capture any new ideas surfaced during the work that
  aren't part of the active task.
- `eds requirments.md` — Ed's own project requirements. **Read it,
  don't edit it** unless he explicitly asks. This is his canonical
  spec for what the platform needs to do.

Only after the relevant docs reflect what you're about to do should you
continue with the task itself.

## Memory protocol — context tree

All durable memory lives in `01 development/context/`. Treat it like
a book:

- **Recall**: open `context/MASTER.md`, find the chapter row, open the
  chapter file.
- **Write**: drop a new chapter file *and* add a row in `MASTER.md`.
  Both steps, every time. A chapter without an index row is a lost
  learning.

Do not stash project memory anywhere else (not in CLAUDE.md, not
inline in code comments, not in your own scratch files). The context
tree is the single source of truth.

## Why

This project is being built out across many sessions. Context drifts,
and what feels obvious mid-session disappears between sessions. The
development folder is the persistent memory — keep it living and the
work stays coherent.

## What to ignore

- `01 development/old files/` — historical handoffs and architecture
  notes from earlier iterations. Reference if useful, but the active
  source of truth is the four planning docs above + the `context/`
  tree.

## Scope

The active build target is `04 the final portal/`. Everything in
`02 felicias aqua portal work/` and `03 old portal/` is reference
only — do not edit those folders unless the user explicitly asks.
