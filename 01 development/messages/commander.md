# Chief commander log

Append-only. Format: `[ISO timestamp] TYPE: message` (see `messages/README.md`).

Commander uses these types:
- `WAKEUP` — start of a wake cycle
- `READ` — read terminal logs (summary of what's new)
- `REPLY` — reply to a Q-ASSUMED or Q-BLOCKED (reference question's timestamp)
- `PLAN` — a planning decision (next round, priority shift)
- `SLEEP` — scheduling next wakeup with delay + reason
