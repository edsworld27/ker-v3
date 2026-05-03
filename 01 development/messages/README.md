# Messages — autonomous comms hub

Three terminals (T1 / T2 / T3) and one chief commander operate
asynchronously on this repo. They coordinate by appending to log files in
this folder. The chief commander runs on a self-paced `/loop` that wakes
periodically, pulls the repo, reads the logs, responds, and re-schedules.

## Files

- `T1.md` — Terminal 1 (foundation) running log.
- `T2.md` — Terminal 2 (fulfillment plugin) running log.
- `T3.md` — Terminal 3 (website-editor port) running log.
- `commander.md` — Chief commander's running log: questions answered, prompt updates, plan changes.

All four are **append-only**. Never rewrite earlier entries; only add new ones at the bottom.

## Entry format

Every entry: `[ISO timestamp] TYPE: short message`

```
[2026-05-04T14:23:00Z] STARTED: lifting plugin runtime from 02
[2026-05-04T14:25:00Z] Q-ASSUMED: storage backend default = file (matches 02). Continuing.
[2026-05-04T14:30:00Z] PROGRESS: src/plugins/_types.ts + _registry.ts in place
[2026-05-04T14:45:00Z] COMMIT: a1b2c3d "T1 step 1: plugin runtime"
[2026-05-04T15:10:00Z] Q-BLOCKED: which session-cookie name should I use? STOPPING.
[2026-05-04T15:30:00Z] DONE: foundation scaffold complete · commit f4e5d6a
```

Type vocabulary:

| TYPE | meaning |
|------|---------|
| `STARTED` | beginning a new sub-task |
| `PROGRESS` | a milestone within a task is complete |
| `Q-ASSUMED` | hit a question, made a reasonable assumption (state it), continuing — non-blocking |
| `Q-BLOCKED` | hit a question, no reasonable assumption possible, stopped |
| `COMMIT` | wrote a commit (hash + one-line message) |
| `DONE` | task complete (chapter written, MASTER updated, tasks.md ticked) |
| `WARN` | something off but not blocking — flag it |
| `RESUMED` | resuming after a Q-BLOCKED was answered |
| `REPLY` | (commander only) replying to a Q-ASSUMED or Q-BLOCKED — reference timestamp of the question |

## Protocol — every terminal

### Before starting any task
1. `cd ~/Desktop/ker-v3 && git pull`
2. Read your own log file (`messages/T<N>.md`) to remember where you left off.
3. Read `messages/commander.md` for any commander replies addressed to you.
4. Read the latest `tasks.md`.

### While working
- **Don't stop on questions.** If a reasonable assumption exists, append a `Q-ASSUMED` entry stating the assumption + your reasoning, and keep going.
- **Only stop on `Q-BLOCKED`** when no reasonable assumption is possible AND continuing without an answer would damage architectural integrity.
- After every commit, `git pull --rebase` then `git push` (so concurrent terminals don't conflict).
- After every commit, append a `COMMIT` entry to your log with hash + one-line message.

### When done with a task
- Append a `DONE` entry.
- Update the relevant chapter file in `01 development/context/prior research/`.
- Update `01 development/context/MASTER.md` with the new chapter row.
- Move row in `tasks.md` to "Done".
- Final commit + push.

### When blocked
- Append `Q-BLOCKED` entry.
- Stop work.
- Wait. Commander will reply in `commander.md` within ~30 minutes.
- When commander replies, `git pull`, append `RESUMED` to your log, continue.

## Protocol — chief commander (this is the orchestrator's loop)

Every wakeup:
1. `git pull`.
2. Read all 4 log files (T1, T2, T3, commander).
3. Identify changes since commander's last entry:
   - `Q-BLOCKED` → answer immediately. Append `REPLY` entry to commander.md.
   - `Q-ASSUMED` with risky assumption → review; if wrong, post correction.
   - `DONE` → mark task done in `tasks.md`, draft next-round prompt if applicable.
   - `WARN` → assess and respond.
   - `PROGRESS` only → just note "T<N> progressing" in commander.md.
4. Append a status summary entry to `commander.md`.
5. Update `tasks.md` / `phases.md` / individual terminal prompts if priorities shifted.
6. `git add -A && git commit && git push`.
7. Schedule next wakeup based on activity:
   - Any `Q-BLOCKED` outstanding: 600s (10 min)
   - Active progress, no blockers: 1500s (25 min)
   - Quiet, no new entries: 1800s (30 min)
   - All terminals `DONE` and Round 2 ready: 1200s (20 min) to draft Round 2 prompts

## Why this works

- **No synchronous coordination.** Each terminal runs independently; the log is the only shared state.
- **Git is the message bus.** Pull-before-start + push-after-commit keeps everyone in sync.
- **Append-only** means no race-condition merges of conflicting edits to the same lines.
- **Chief commander is async.** Terminals don't wait for the commander except on `Q-BLOCKED`; everything else continues at full speed.
- **Ed watches from outside.** Anyone can `git log` to see exactly what every actor did.
