# Ideas

## Operating model
- **Chief commander pattern** — this session orchestrates 3 parallel Claude
  Opus 4.7 (max-effort) terminals. Each terminal can spawn its own subagents.
  The commander writes self-contained prompts; each terminal reports back
  via the dev folder docs (so all sessions stay in sync via the context tree).
- Use the dev folder as the **shared bus**: each terminal reads
  `01 development/context/MASTER.md` + relevant chapters before starting,
  writes/updates chapters when finishing.

## Architecture / scalability
- "Portal to anywhere" framing: every level is built from the same
  primitives. Aqua hosts agency portal → which hosts client portals →
  which host end-customer portals. Same auth, same plugin runtime, same
  visual editor, same brand kit — just nested.
- Iframe-embed login for client's end customers (parallels `02`'s
  `/embed/login` route). Cookies scoped to portal origin; postMessage
  signals back to host site.
- Plugin marketplace per client gives the agency or the client themselves
  a simple toggle UX for features.

## UX
- Demo button on Milesy Media public site → drops user into a sandboxed
  demo agency with seed data (mirrors old portal's `DEMO_SESSION` pattern,
  but populated from a real, isolated demo org rather than a constant).
- "Phase preset" picker when creating a client: each preset bundles
  lifecycle stage + a starter set of plugins (similar to `02`'s 16 portal
  presets but tailored to the client lifecycle).

## Things to research / confirm
- NotebookLM integration once the notebook URL is available — use as
  outside-research surface (compliance, design references, competitor
  patterns).
- Whether the website editor plugin can be lifted from `02` cleanly or
  needs a partial rewrite to fit the new role hierarchy.
- Stripe Connect for affiliate payouts (currently TODO in `02`).
- Per-tenant database isolation (the `OrgRecord.database` config exists
  in `02` but routing layer doesn't pick at request time).
