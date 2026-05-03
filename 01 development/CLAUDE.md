# CLAUDE.md — read first, every session

This file is the directive for any Claude session working on this repo.

## Rule of work

**Before doing any task, first update the development folder.**
Specifically, before writing code or making changes elsewhere in the
repo, update the relevant docs in `01 development/`:

- `context.md` — what you've learned about the current state, decisions
  made, anything a fresh session would need to load up.
- `phases.md` — the high-level roadmap. Update when a phase advances.
- `tasks.md` — the granular to-do list. Add the task you're about to
  do, mark in-progress, then mark done when you finish.
- `ideas.md` — capture any new ideas surfaced during the work that
  aren't part of the active task.

Only after the relevant docs reflect what you're about to do should you
continue with the task itself.

## Why

This project is being built out across many sessions. Context drifts,
and what feels obvious mid-session disappears between sessions. The
development folder is the persistent memory — keep it living and the
work stays coherent.

## What to ignore

- `01 development/old files/` — historical handoffs and architecture
  notes from earlier iterations. Reference if useful, but the active
  source of truth is the four files above (`context.md`, `phases.md`,
  `tasks.md`, `ideas.md`).

## Scope

The active build target is `04 the final portal/`. Everything in
`02 felicias aqua portal work/` and `03 old portal/` is reference
only — do not edit those folders unless the user explicitly asks.
