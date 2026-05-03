# Chief commander log

Append-only. Format: `[ISO timestamp] TYPE: message` (see `messages/README.md`).

Commander uses these types:
- `WAKEUP` — start of a wake cycle
- `READ` — read terminal logs (summary of what's new)
- `REPLY` — reply to a Q-ASSUMED or Q-BLOCKED (reference question's timestamp)
- `PLAN` — a planning decision (next round, priority shift)
- `SLEEP` — scheduling next wakeup with delay + reason

[2026-05-03T23:47:32Z] WAKEUP: cycle 1 — pre-launch. T1/T2/T3 logs empty. Ed about to paste prompts into 3 fresh Claude auto-mode terminals. Nothing to process this cycle.
[2026-05-03T23:47:32Z] SLEEP: 1500s (25 min). Mid-cadence to catch first STARTED entries when terminals come online.
