# Terminal prompts — chief commander pattern

Ed runs three additional Claude terminals (Opus 4.7 max effort, with subagent
authority). This session acts as chief commander: writes self-contained prompts
for each terminal, integrates their output back into the dev folder.

## How to use

1. Open a fresh Claude Code terminal in `~/Desktop/ker-v3/`.
2. Paste the contents of `T1-foundation.md` (or T2 / T3) at the prompt.
3. The terminal works the task, writes its outputs into the repo, updates
   the relevant chapter file in `01 development/context/prior research/`,
   updates `tasks.md`, commits + pushes.
4. When done, Ed reports back here ("T1 finished, see commit X"). The
   commander reads the diff + updated chapters, plans Round 2.

## Coordination protocol (every terminal follows this)

Before doing anything, every terminal MUST:
1. Read `01 development/CLAUDE.md` (project directives).
2. Read `01 development/context/MASTER.md` (table of contents).
3. Read the chapters relevant to its task.
4. Read `01 development/eds requirments.md` if non-empty.

While working, every terminal MUST:
- Update `01 development/tasks.md` (move its row to in-progress).
- Add new tasks under "Up next" if it discovers them.

When done, every terminal MUST:
- Add or update a chapter file in `01 development/context/prior research/`
  documenting what it built (so future sessions can load it off-by-heart).
- Add a row to `01 development/context/MASTER.md` for any new chapter.
- Move its task in `tasks.md` to "Done".
- Commit with `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Push to `main`.

## Round 1 (now)

| Terminal | Prompt file | Goal |
|----------|-------------|------|
| T1 | [T1-foundation.md](T1-foundation.md) | Scaffold `04 the final portal/portal/` with the plugin runtime, auth, and shell lifted from `02`. Make `npm run dev` work. |
| T2 | [T2-website-editor.md](T2-website-editor.md) | Port the website editor + 58 blocks from `02` into `04 the final portal/plugins/website-editor/` as a self-contained plugin. |
| T3 | [T3-ecommerce.md](T3-ecommerce.md) | Port the ecommerce plugin (products / orders / cart / Stripe) from `02` into `04 the final portal/plugins/ecommerce/`. |

T2 + T3 do not depend on T1's output — they extract code from `02` into
new plugin folders. T1's foundation needs to land before any plugin can be
installed and tested end-to-end, but the porting work itself parallels
fine.

## Round 2 (next, after Round 1 lands)

- Wire ported plugins into T1's shell (test install + uninstall + render)
- Build the `fulfillment` plugin (briefs + deliverables + assignments — based on `03`'s schema)
- Build client-creation flow (team picks phase preset → installs plugins per client)
