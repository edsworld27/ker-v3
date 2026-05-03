# ker-v3 — Agency Platform Workspace

Top-level organisation for the agency platform build. Everything is grouped
into four numbered folders; this README is the orientation page.

## Layout

```
ker-v3/
├── 01 development/                  ← project docs, plans, handoffs
├── 02 felicias aqua portal work/    ← original Aqua / Felicia Next.js app
│                                      (admin panel + visual editor + 33 plugins)
├── 03 old portal/                   ← Aqua Portal v9 archive (HR, Finance,
│                                      CRM, Revenue suites — reference only)
├── 04 the final portal/             ← the next-gen agency platform
│   ├── milesymedia website/         ← Milesy Media public marketing site
│   ├── portal/                      ← (placeholder) operator portal app
│   ├── plugins/                     ← (placeholder) plugin registry
│   └── clients/
│       └── felicias perfect portal/ ← reference snapshot of Felicia's site
└── README.md                        ← you are here
```

## The vision

- **Milesy Media website** (`04/milesymedia website/`) is the agency's
  public face. The login + **Admin access** button on it drops the
  agency owner into the operator portal.
- **The operator portal** (`04/portal/`) is where Ed runs the agency
  day-to-day — HR, Finance, Marketing, client management. Employees
  log in here and see only what their role grants.
- **Client portals** (per-client, branded — Felicia is the reference
  in `04/clients/felicias perfect portal/`) let each client log into
  their own dashboard, edit their site, see fulfilment status.
- **Plugins** (`04/plugins/`) are the modular features that get
  toggled per client / per role from the operator portal.

## Where the historical work lives

- **`02 felicias aqua portal work/`** — the original Next.js monorepo
  where the Aqua admin panel + visual editor + plugin platform were
  built on top of Felicia's storefront. Boot it with
  `cd "02 felicias aqua portal work" && npm install && npm run dev`.
  Useful as a feature reference (visual editor, portal variants,
  plugin marketplace, /felicias-login route).
- **`03 old portal/old-portal-github/`** — the v9 monorepo with the
  6-suite agency dashboard (Operations / CRM / Finance / People /
  Revenue / Client). Reference patterns only — most business logic
  is stubbed.
- **`04 the final portal/clients/felicias perfect portal/`** — file
  snapshot of Felicia's site at the point we shipped it to her.

## What's next

The next-gen agency platform gets built inside `04 the final portal/`.
Cherry-pick concepts from `02` and `03` as needed; document decisions
in `01 development/`. Nothing in `02` or `03` is deleted — both stay
as living references for as long as they're useful.

— Last updated alongside the four-folder reorganisation commit.
