# Phases

## Phase 0 — Prior research ✅
Mapped every file in `02 felicias aqua portal work/` and `03 old portal/`.
Output: 18 chapters in `01 development/context/prior research/` indexed in
`MASTER.md`. The next session can load both codebases off-by-heart from the
chapters alone.

## Phase 1 — Architecture for `04 the final portal/` (in progress)
Lock in the architecture: audience tiers, URL surface, role hierarchy,
folder layout. Decide what gets ported from `02` (directly), what's
recreated from `03` (as plugins), and what's net-new.

**Locked decisions** (from Ed's directive 2026-05-04):
- Build `04 the final portal/portal/` as the new app — Next.js + plugin model from `02`.
- **Pre-vetted plugins to drop in from `02`**: website editor + ecommerce.
- Build by plugins (so future features = new plugin folders in `04 the final portal/plugins/`).
- Three audiences: agency staff (Ed's team), clients (Felicia-style), end customers (per-client storefronts + iframe-embedded login).
- Total customisation per client: brand kit, plugin set, portal variants — all per-client.
- Recursive: each client's portal can itself host customer-facing portals (iframe-embedded, branded). Same machinery at every level.
- First feature slice: **fulfillment** — team creates client → selects phase preset (Discovery / Design / Onboarding / Live etc.) → installs plugins per client.
- Final UX: Milesy Media website hosts a login + Demo button → drops operator into the portal.

## Phase 2 — Foundation
Auth + role hierarchy + multi-tenancy schema in `04/portal/`. Plugin scaffold.
First runnable shell.

## Phase 3 — Fulfillment slice
Team-side: create client + pick phase preset + install plugins per client.
Recreate `03`'s `FulfilmentBrief` + `FulfilmentDeliverable` + `BriefAssignment`
as a `fulfillment` plugin in `04`.

## Phase 4 — Pre-vetted plugins
Port the **website editor** + **ecommerce** plugins from `02` into `04/plugins/`.

## Phase 5 — Client portal customisation
Per-client brand kit + portal variants (login / dashboard / orders / etc.) drive
the client-facing experience. Stage + role + installed plugins decide what's
shown.

## Phase 6 — Recursive portals (clients' customers)
Iframe-embed-style login + portal for each client's end customers, branded
to the client. Same portal-variant + brand-kit machinery as the client portal,
nested one level.

## Phase 7+ — Feature plugins (one per phase)
agency-hr / agency-finance / agency-marketing / client-resources / freelancer-portal /
memberships / affiliates / etc. — each slots in as a new plugin.

## Operating mode (chief commander pattern)
Ed runs 3 additional Claude terminals on Opus 4.7 max effort (each can deploy
its own subagents). I (this session) act as chief commander — carve up the
work, write self-contained prompts for each terminal, and integrate their
output back into the dev folder.
