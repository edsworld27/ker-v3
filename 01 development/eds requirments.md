# Ed's requirements — Aqua Portal

> Living document. Ed edits this freely; every Claude session reads it
> before doing work. If a session is about to do something that contradicts
> a rule here, it stops and asks Ed first.
>
> Synthesised from conversation 2026-05-04. Ed: amend as needed.

## Mission

Build **Milesy Media's agency platform** — a single web app where:

- **My team** logs in and runs the agency.
- **Our clients** (Felicia is the first; more to come) log in and use a
  branded portal that's completely custom to them.
- **Our clients' end-customers** (Felicia's shoppers, members, affiliates)
  log in via an iframe embedded on the client's own website — same engine,
  same auth, but rendered with the client's branding.

The platform is called **Aqua portal** — "a portal to anywhere." Same
machinery powers every level. New features ship as plugins.

## The three audiences

| audience | who | logs in where | sees what |
|----------|-----|---------------|-----------|
| Agency team | Me + Milesy staff (Founder, Manager, Employee, Freelancer) | milesymedia.com/login | Agency-internal: HR / finance / fulfillment / client list. Role-gated. |
| Clients | Felicia, future clients (ClientOwner / ClientStaff) | milesymedia.com/login OR iframe on their own site | Branded portal scoped to them. Stage + installed plugins decide the surface. |
| End-customers | Felicia's shoppers / members / affiliates | iframe-embedded on Felicia's own website | Login + their account view, branded as Felicia's. Powered by THIS app under the hood. |

## Core flows that MUST work for v1

1. **Sign in** at milesymedia.com (or via iframe on a client's site). One cookie, role-routed.
2. **Team creates a client.** Picks a phase preset (Discovery / Design / Development / Onboarding / Live / Churned). Phase auto-installs starter plugins + applies a starter portal variant.
3. **Team installs plugins per client** from a marketplace UI (search + filter + presets).
4. **Team and client both work the checklist.** Each phase has internal tasks + client tasks. Both sides tick. Phase advances when complete (team confirms).
5. **Phase transition** auto-disables old phase's plugins (config preserved — reversible) and enables new phase's plugins.
6. **Client opens their branded portal.** Their logo, colours, fonts. Their installed plugins. Their phase's variant.
7. **Demo button** on the marketing site drops a visitor into a sandboxed agency with seed data, header toggle between agency POV and client POV.
8. **First two pre-vetted plugins ship**: website editor (port from `02`) + ecommerce (port from `02`).

## Hard constraints

- **Total customisation per client.** Brand kit (logo, colours, fonts), custom domains later, custom plugin set, custom portal variants — all per-client. Don't bake assumptions about "every client looks the same."
- **Plugin-based.** Every feature ships as a manifest in `04/plugins/`. Adding a feature = adding a plugin folder. Don't bake features into foundation.
- **Three-level recursion.** Agency → Client → End-customer. Whatever works for the agency must also work nested inside a client's own portal. The same login engine that signs in the agency owner also signs in Felicia's customer on luvandker.com.
- **Scalable.** Pool-model multi-tenancy on Postgres. Tens to thousands of agencies must be possible on one deployment.
- **Aqua = a portal to anywhere.** Whatever surface the client wants — login, ecommerce checkout, members area, affiliate dashboard, a custom dashboard with a custom plugin — the same engine renders it, branded to them.
- **No half-built features in production.** If something's stubbed, hide it behind a feature flag or don't ship it. Better to ship 5 working plugins than 20 stubs.

## Aesthetic & UX commitments

- **Felicia's portal is the design north star.** Whatever we build for
  v1 must look at least as polished as her storefront does.
- **Brand kit drives everything.** No hardcoded brand colours in any
  plugin or block. CSS variables only.
- **Fast.** Server-rendered, prompt-cached, lazy-loaded. Slow is worse
  than ugly.

## Future / not in scope for v1

- Real-time collaboration in the editor (CRDT / Yjs).
- AI page builder ("describe a page → block tree").
- Native mobile apps.
- Custom-domain provisioning per client (the code is in `02`, just not wired).
- Stripe Connect for affiliate payouts.
- Marketplace tiers / paid plugins / revenue share.
- Per-tenant database isolation.
- Client-side self-serve plugin install (v1 is team-only install).

## Operating preferences

- **Three Claude terminals + one chief commander session.** Commander
  drafts prompts; terminals execute; results flow through the dev folder.
- **Dev folder is the shared bus.** Phases / tasks / ideas / context
  tree all live in `01 development/`. Every session reads + writes there.
- **NotebookLM** as the outside-research surface. We query it for
  patterns, references, anything not in our codebase.
- **Don't run destructive commands.** No `rm -rf`, no force-pushes, no
  config deletions without explicit ok.

## Brand & identity

- Agency: **Milesy Media** (positioning: performance marketing agency for
  ambitious brands).
- Platform name: **Aqua portal**.
- First client (real): **Felicia / Luv & Ker / Odo by Felicia** (Ghanaian
  heritage skincare).
- Demo client (sandboxed): a Felicia mirror — clearly labelled "Demo".

## What I want to feel

- I should be able to **log in once** at milesymedia.com and run my agency
  for the day. HR, finance, marketing, fulfillment, client switching —
  all in one app.
- A new client should onboard in **minutes**, not days. Pick a phase, fill
  a form, plugins install themselves.
- A client should feel like the portal **belongs to them** — not a
  rebranded SaaS, but THEIR thing. Their logo. Their colour. Their
  vocabulary.
- Anything I want to add later — HR module, payroll, custom client widget
  — should be **a plugin**, not a refactor.

— Ed (synthesised by Claude on 2026-05-04 — edit freely)
