# Context — Master Index

This folder is the project's persistent memory, organised as a **context
tree** (fractal book metaphor):

```
context/
├── MASTER.md          ← the contents page (you are here)
├── prior research/    ← chapter files mapping `02` and `03` codebases
└── *.md               ← future top-level chapter files
```

`MASTER.md` is the table of contents. Every chapter on the shelf gets a row
here with a one-line summary. Each chapter is its own markdown file that
goes deep on a single topic.

---

## How it works

### Reading (recall)
1. Open `MASTER.md` (this file).
2. Scan the chapter table for the topic you need.
3. Open the corresponding chapter file for the full detail.

### Writing (a new learning)
1. Decide which topic the new knowledge belongs to.
2. Either:
   - **Existing topic** → open the chapter, add to it. Update the row's
     one-line summary if it shifted.
   - **New topic** → create a new file `chapter-name.md` AND add a new row.
3. Keep the table sorted; pick the next free number.

### Naming
- Lowercase-kebab-case filenames (`aqua-plugin-system.md`).
- One topic per chapter. Split when a chapter exceeds ~300 lines or covers
  two distinct things.

### Granularity rule of thumb
A chapter is right-sized when one paragraph in `MASTER.md` can't capture
what's in it.

---

## Chapters — Prior research (Phase 0)

Mapping of `02 felicias aqua portal work/` and `03 old portal/` codebases.
Synthesised from 6 parallel explore agents.

### From `02 felicias aqua portal work/` (Aqua / Felicia portal)

| # | Title | File | Summary |
|---|-------|------|---------|
| 01 | Plugin system | [prior research/aqua-plugin-system.md](prior%20research/aqua-plugin-system.md) | 34 plugins, contract types, runtime install/uninstall flow, 16 presets, path mapping, validator. |
| 02 | Server modules | [prior research/aqua-server-modules.md](prior%20research/aqua-server-modules.md) | 41 domain modules. Storage abstraction, eventBus, orgs, email, webhooks. The five most architecturally critical. |
| 03 | Admin routes | [prior research/aqua-admin-routes.md](prior%20research/aqua-admin-routes.md) | ~70 admin destinations grouped by domain. Plugin contributions + shared chrome (AdminTabs / PluginPageScaffold / SetupChecklist / Ask Aqua). |
| 04 | Aqua dashboard routes | [prior research/aqua-aqua-routes.md](prior%20research/aqua-aqua-routes.md) | Cross-client agency surface — `/aqua` + `/aqua/[orgId]/marketplace` + new-portal flow + support hub. |
| 05 | API surface | [prior research/aqua-api-routes.md](prior%20research/aqua-api-routes.md) | Every HTTP endpoint by area: `/api/auth`, `/api/admin`, `/api/portal/*`, `/api/stripe`, `/api/og`. |
| 06 | Visual editor | [prior research/aqua-visual-editor.md](prior%20research/aqua-visual-editor.md) | Live · Block · Code modes. Simple / Full / Pro complexity. Outliner + properties + topbar. Publish + GitHub PR flow. |
| 07 | Block library | [prior research/aqua-blocks.md](prior%20research/aqua-blocks.md) | 58 storefront blocks catalogue. BlockRenderer mechanics (split-test, theme overlay, responsive CSS, animations). |
| 08 | Portal variants | [prior research/aqua-portal-variants.md](prior%20research/aqua-portal-variants.md) | `PortalRole` + `isActivePortal` singleton. Server helpers. Admin UI. Starter trees. Customer-facing safety fallback. |
| 09 | Storefront | [prior research/aqua-storefront.md](prior%20research/aqua-storefront.md) | Public routes, customer components (Navbar, Footer, ProductDetail, CartDrawer, ChatBot, …), CartContext. |
| 10 | Auth + middleware + admin libs | [prior research/aqua-auth-middleware.md](prior%20research/aqua-auth-middleware.md) | Sessions (HMAC), scrypt, rate limits, CSP, dev-bypass modes, `/api/auth/*` endpoints, force-password-change, `src/lib/admin/` helpers. |

### From `03 old portal/` (Aqua Portal v9 archive)

| # | Title | File | Summary |
|---|-------|------|---------|
| 11 | Overview | [prior research/old-portal-overview.md](prior%20research/old-portal-overview.md) | 7-app monorepo, Phase-9 plugin migration, how to run, archive state. 70% architecturally sound, 40% functionally complete. |
| 12 | Bridge package | [prior research/old-portal-bridge.md](prior%20research/old-portal-bridge.md) | `@aqua/bridge` shared package. Types, auth, Prisma schema, eventBus, registry, sync helpers, UI kit (480 LOC), postMessage protocol, concepts/. |
| 13 | Host shell | [prior research/old-portal-host-shell.md](prior%20research/old-portal-host-shell.md) | `aqua-host-shell` — bootstrap loader, tolerant view resolver, sidebar/topbar, marketplace, AI chat (Claude Opus 4.7 SSE + prompt cache). |
| 14 | Sub-apps | [prior research/old-portal-suites.md](prior%20research/old-portal-suites.md) | The 6 sub-apps (Client / CRM / Finance / People / Revenue / Operations). What's wired vs stubbed per template. |
| 15 | Roles + multi-tenancy | [prior research/old-portal-roles-tenancy.md](prior%20research/old-portal-roles-tenancy.md) | 6 roles, Prisma models (Agency, User, Client, FulfilmentBrief, etc.), ClientStage, sync helpers. The most directly applicable to `04`. |
| 16 | Extras folder | [prior research/old-portal-extras.md](prior%20research/old-portal-extras.md) | `vite-prototype/` and `eds-old-portal-idea-fixed/` reference patterns (PageBuilder / RoleBuilder / AgencyConfigurator / collaboration widgets / DynamicRenderer). `sort-out-version/` is delete-safe. |

### Synthesis

| # | Title | File | Summary |
|---|-------|------|---------|
| 17 | Concepts to port | [prior research/concepts-to-port.md](prior%20research/concepts-to-port.md) | Ranked list: from `02` (port directly), from `03` (recreate as plugins). Architecture target for `04`. |
| 18 | Anti-patterns | [prior research/anti-patterns.md](prior%20research/anti-patterns.md) | 20 specific things from `02` and `03` we should NOT replicate in `04`. |

---

## Discipline

- Update this index **before** you finish any task. If a session ends
  without a chapter row, the learning is lost.
- Don't write speculative chapters — only write what's been verified in
  the codebase or confirmed by the user.
- When a chapter goes stale, mark its row with `(stale — superseded by #NN)`
  rather than deleting. The history of decisions matters.
