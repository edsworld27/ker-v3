# HANDOFF.md — Aqua Portal v9 archive

> **Read this first.** Everything inside `old-portal-github/` is the previous-generation Aqua Portal. It is frozen, content-complete, and intended as a reference for the next-generation portal being built at the repo root.
>
> If you are a fresh Claude session in a *different* repo where this folder has been vendored: this file plus the four files below give you full context.

---

## What this archive is

A complete Next.js + Prisma multi-tenant SaaS for digital agencies, fully redesigned to a unified kit, with a working plugin marketplace, an embedded Claude-powered AI assistant, and a production-ready security baseline.

The app boots as **a single Next.js process on port 3000** (`apps/aqua-host-shell/`) that resolves every "sub-app" (CRM / Finance / People / Revenue / Client / Operations) via the in-process `BridgeRegistry` plugin system. No iframes by default; iframe fallback retained behind `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1` for the legacy multi-port debug mode.

---

## Where to read what

In order, from short to long:

1. **`main-monorepo/SESSION_HANDOFF.md`** — current branch / PR / CI state. Status table at top.
2. **`main-monorepo/PROGRESS.md`** — chronological log of every session's work, newest first. Each entry includes file paths and merge commit SHAs.
3. **`main-monorepo/PLAN.md`** — what was on the roadmap. Most items shipped; a handful remain (P2 persistence, P3-2 Bridge concepts port, P3-3 Templates package, P4 cleanups).
4. **`main-monorepo/CLAUDE.md`** — durable architecture overview + "how to run" + repo conventions.
5. **`main-monorepo/dev-config.md`** — the original author's 84-section deep architecture doc. Many small file paths in it are stale post-split, but the *concepts* still apply. Use this when you need to know *why*, not *what*.
6. **`main-monorepo/Bridge/README.md`** — the cross-app glue package — registry, events, types, postMessage protocol.
7. **Per-app READMEs** — `main-monorepo/apps/<app>/README.md` for each of the 7 apps.

---

## Final state at archive time (commit `dae63ac`)

| Signal | Status |
| --- | --- |
| Open PRs | none |
| `tsc --noEmit` per app | 0 errors / 7 of 7 clean |
| ESLint | 0 errors / 183 warnings (cosmetic destructure noise) |
| Bridge unit tests | 37 / 37 passing (Vitest, ~2s) |
| `next build` per app | passes (verified by CI matrix on every PR) |
| Dev boot | host shell HTTP 200 on `/` after ~30s first compile |
| Visible-chrome kit migration | 100% complete |
| Marketplace | end-to-end install / uninstall / configure flow |
| AI chat | `/api/ai/chat` SSE-streamed, Claude Opus 4.7, prompt-cached system prompt; topbar "Ask AI" pill opens a slide-over panel |
| Security headers | full CSP + HSTS (prod) + Permissions-Policy + X-Frame-Options + Referrer-Policy |

---

## Architecture in one minute

```
┌─────────────────── apps/aqua-host-shell (port 3000) ────────────────────┐
│                                                                          │
│   <HostBridgeBootstrap />  ← dynamic-imports each sub-app's              │
│         │                    register*App() at first render               │
│         ▼                                                                │
│   BridgeRegistry.register(viewId, Component)                             │
│         │                                                                │
│         ▼                                                                │
│   <HostRegistryViewRenderer />  ← resolves viewId tolerantly             │
│   (literal → kebab → PascalCase → +'View' → suite default)               │
│                                                                          │
│   Globals mounted in HostBridgeHub:                                      │
│     <ModalProvider />, <InboxProvider />, <ModalEventBridge />,          │
│     <AIChatPanel /> (listens on aqua:open-chat CustomEvent)              │
│                                                                          │
│   API routes:                                                            │
│     /api/bridge/state, /api/bridge/auth, /api/bridge/provision           │
│     /api/sync, /api/ai/chat (SSE → Claude Opus 4.7)                      │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                          imports register*App() from
                                      │
                                      ▼
            apps/aqua-{crm,client,operations,ops-finance,
                       ops-people,ops-revenue}/  (plugin sources)
                                      │
                          all share types + helpers from
                                      │
                                      ▼
                     Bridge/  (workspace package: @aqua/bridge)
                       │
                       ├── ui/kit.tsx          ← Page, Card, Button, Modal, etc.
                       ├── ui/AppSidebar.tsx   ← shared sidebar (kit-styled)
                       ├── ui/AppMarketplace.tsx
                       ├── ui/AppSettings.tsx  ← 6 settings views as exports
                       ├── ui/DashboardWidget.tsx
                       ├── ui/AIChatPanel.tsx
                       ├── registry/           ← BridgeRegistry singleton
                       ├── events/             ← typed event bus
                       ├── types/              ← single canonical types index
                       ├── postMessage.ts      ← legacy iframe protocol
                       └── auth/, data/, api/, sync/, config/
```

---

## Tech stack

- **Next.js 16.2.2** with Turbopack
- **React 19**
- **TypeScript** — `typescript.ignoreBuildErrors: true` in each app's `next.config.mjs` because cross-tsconfig type checks across sub-app boundaries are infeasible. Per-app `npm run typecheck` runs in CI.
- **Prisma + SQLite** for local dev (PostgreSQL is the production target — see PLAN P2-2)
- **npm workspaces** — `apps/*`, `Bridge`, `Templates` are workspace members
- **Tailwind CSS** + the unified kit at `Bridge/ui/kit.tsx`
- **`@anthropic-ai/sdk`** for the AI chat route
- **No Payload CMS** at runtime — was excluded by user request. `withPayload` wrapper is kept on each `next.config.mjs` because removing it isn't load-bearing and the wrapper itself doesn't fail without Payload routes.

---

## How to run (locally)

```bash
cd old-portal-github/main-monorepo
npm install                  # one-time on fresh clone
bash scripts/setup-db.sh     # initialize SQLite DBs (dev only)
npm run dev                  # http://localhost:3000 — single port, plugin model
```

Login flow: pick `demo@aqua.portal` for the no-DB shortcut (returns `Bridge/auth/DEMO_SESSION`).

For the AI chat to work, set `ANTHROPIC_API_KEY` in the host shell env. Without it, the route returns a clean 500 explaining the missing key; the panel surfaces the error inline.

**Legacy multi-port mode** (only if needed for debugging a sub-app in isolation):

```bash
npm run dev:legacy:all       # boots all 7 on ports 3001–3007 + iframe topology
# or per-app: dev:legacy:host, dev:legacy:client, dev:legacy:crm, dev:legacy:operations,
#             dev:legacy:finance, dev:legacy:people, dev:legacy:revenue
```

To re-enable iframes inside the host shell during legacy mode, also set `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1`.

---

## Suites the portal ships

| Suite | Path | Status |
| --- | --- | --- |
| **Host shell** (sidebar + topbar + marketplace + settings) | `apps/aqua-host-shell/` | full kit, AI chat, CSP |
| **CRM** (Pipeline, Deals, Contacts, Activities, Reports, Leads) | `apps/aqua-crm/` | full kit; localStorage store; CRUD across all 5 templates |
| **Client portal** (PortalView + 5 phase dashboards + Resources, Management, AgencyClients, Fulfillment, WebStudio, PhasesHub) | `apps/aqua-client/` | full kit |
| **Finance Hub** (Dashboard, transactions, partners, payouts) | `apps/aqua-ops-finance/` | full kit; localStorage store |
| **People Hub** (HR with department filter, Post-role, View-profile editor) | `apps/aqua-ops-people/` | full kit; localStorage store |
| **Operations Hub** (cross-suite Overview) | `apps/aqua-operations/` | full kit |
| **Revenue Hub** (Sales: Hub, Pipeline, Calendar, Proposals, Lead Timeline, CRM Inbox; Marketing: Campaigns, Overview, Lead Funnel, Social, Channel, Email, Content Calendar) | `apps/aqua-ops-revenue/` | full kit; localStorage store |

---

## What's worth porting forward to the next portal

If the next-gen build wants to move quickly, these are the highest-leverage drop-ins:

1. **`Bridge/ui/kit.tsx`** — the single design-system file. Self-contained (no `lucide-react` import, no `motion` lib), CSS-only animations, indigo accent throughout. Drop it in and import `Page`/`PageHeader`/`Card`/`KpiCard`/`Button`/`Modal`/`Field`/`Input`/`Select`/`Badge`/`Avatar`/`DataTable`/`EmptyState`/`Toast`. ~480 LOC.
2. **`Bridge/ui/AIChatPanel.tsx` + `apps/aqua-host-shell/app/api/ai/chat/route.ts`** — Claude Opus 4.7 chat with adaptive thinking + prompt caching. Pair them and you have a working AI assistant in any Next.js app.
3. **`Bridge/ui/AppSidebar.tsx`, `AppMarketplace.tsx`, `AppSettings.tsx`, `DashboardWidget.tsx`** — shared kit-styled implementations. The per-app adapters under each `*Shell/{Sidebar,components/TemplateHub,components/Settings,widgets/DashboardWidget}/` show how to wire them to your own context.
4. **`apps/aqua-host-shell/HostShell/components/TemplateHub/HostTemplateHubView.tsx`** — full marketplace with config-drawer flow. Stand-alone enough to copy + adapt.
5. **`apps/aqua-host-shell/next.config.mjs`** — production CSP + security baseline. Worth lifting verbatim.

---

## What's deliberately *not* built (yet)

These are open items in `main-monorepo/PLAN.md`:

- **P2-1** — migrate localStorage suite stores to `/api/sync` (Postgres-backed)
- **P2-2** — switch Prisma schemas from SQLite → PostgreSQL
- **P2-3** — lift `typescript.ignoreBuildErrors: true` (requires unifying tsconfigs via project references)
- **P3-2** — port the `Bridge/concepts/AgencyConfigurator/` reference into the live AgencyConfigurator path
- **P3-3** — `Templates/` workspace package is a no-op stub (delete or wire up)
- **P3-4 follow-up** — 183 remaining ESLint warnings (scattered destructure noise)
- **P4** — suite descriptions / role-based marketplace visibility / audit logging

---

## How history is preserved

Everything was moved with `git mv`, so:

```bash
# See the full history of any file at its archive path
git log --follow old-portal-github/main-monorepo/Bridge/ui/kit.tsx

# See where a file used to live before the restructure
git log --follow --diff-filter=R old-portal-github/main-monorepo/<path>
```

The 1,536-file restructure (PR #9, commit `dae63ac`) is a single squash commit. PRs #5 → #8 carry the substantive work; the squash on `main` keeps a clean linear history.

---

## Related materials in this archive

- **`extras/vite-prototype/`** — the older Vite + React monolithic prototype that preceded the Next.js rewrite. Reference-only — don't import from it at runtime.
- **`extras/eds-old-portal-idea-fixed/`** — the same prototype with bug fixes + 15 per-folder READMEs documenting what each module did.
- **`main-monorepo/Bridge/concepts/`** — 7 reference patterns cherry-picked from the older Vite prototype (PageBuilder, RoleBuilder, AgencyConfigurator, collaboration widgets, DynamicRenderer, agencyConfig + templates references). Patterns to port forward; not wired in at runtime.

---

## License + attribution

Apache 2.0 (per the SPDX headers in every source file). All work was done in collaboration with Claude across the sessions logged in `main-monorepo/PROGRESS.md`.
