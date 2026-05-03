# Terminal prompts — chief commander pattern

Ed runs three additional Claude terminals (Opus 4.7 max effort, with subagent
authority). This session acts as chief commander: writes self-contained
prompts for each terminal, integrates their output back into the dev folder.

## Working environment (every terminal)

- **Repo**: https://github.com/edsworld27/ker-v3
- **Local working directory**: `~/Desktop/ker-v3/`
- **Branch**: each terminal commits directly to `main` and pushes when done.
- **If a terminal doesn't have a clone yet**: `git clone https://github.com/edsworld27/ker-v3.git ~/Desktop/ker-v3 && cd ~/Desktop/ker-v3`
- **Folder names contain spaces** — quote paths in shell commands.

## How to use

1. Open a fresh Claude Code terminal in `~/Desktop/ker-v3/`.
2. Paste the contents of `T1-foundation.md` (or T2 / T3) at the prompt.
3. The terminal works the task, writes its outputs into the repo, updates
   the relevant chapter file in `01 development/context/prior research/`,
   updates `tasks.md`, commits + pushes.
4. When done, Ed reports back here ("T1 finished, see commit X"). The
   commander reads the diff + updated chapters, plans Round 2.

## Coordination protocol — every terminal must follow

Before any work:
1. Read `01 development/CLAUDE.md`.
2. Read `01 development/context/MASTER.md`.
3. Read `01 development/context/prior research/04-architecture.md` — **the locked design**.
4. Read the chapters relevant to the task (each prompt lists them).
5. Read `01 development/eds requirments.md` if non-empty.

While working:
- Update `01 development/tasks.md` (move row to in-progress, add follow-ups).

When done:
- Add or update a chapter in `01 development/context/prior research/`.
- Add a row to `01 development/context/MASTER.md` for any new chapter.
- Move row in `tasks.md` to "Done".
- Commit (`Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`).
- Push to `main`.

## Round 1 (now)

| Terminal | Prompt | Goal |
|----------|--------|------|
| **T1** | [T1-foundation.md](T1-foundation.md) | Scaffold `04 the final portal/portal/`. Plugin runtime + multi-tenant auth (Agency → Client → End-customer) + role hierarchy + chrome that mounts plugins from manifests. |
| **T2** | [T2-fulfillment.md](T2-fulfillment.md) | Build the **fulfillment plugin** at `04 the final portal/plugins/fulfillment/`. Phase engine (6 default phases as data), collaborative checklist (internal + client tasks), client CRUD, plugin marketplace UI. |
| **T3** | [T3-website-editor.md](T3-website-editor.md) | Port the **website-editor plugin** from `02` → `04 the final portal/plugins/website-editor/`. Editor + 58 blocks + portal variants admin. |

T2 and T3 don't depend on T1's runtime — they package code into new plugin
folders. T1's foundation needs to land before any plugin can be installed +
tested end-to-end. Once all three commits are on `main`, Round 2 wires
everything together.

## Round 2 (next, after Round 1 lands)

- Wire all three plugins into T1's shell (test install + uninstall + render).
- Port the **ecommerce plugin** (products / orders / cart / Stripe) from `02`.
- Build the first phase preset end-to-end (create client → pick Onboarding → fulfillment installs forms + brand + email → checklist appears → both sides tick → advance phase).
- Wire the demo button on milesymedia.com to a sandboxed agency.
