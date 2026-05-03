# Old portal overview (`03 old portal/old-portal-github/`)

The previous-generation Aqua Portal v9 — a Next.js + Prisma 7-app monorepo
for digital agencies. **Frozen / archived**; reference-only. Most concepts
shaped the current Aqua at `02`; some (HR, Finance, lifecycle stages,
fulfillment briefs) are still missing from `02` and worth porting forward
to `04`.

> Source: agents 5 + 6 sweep of `03 old portal/old-portal-github/`.

## Top-level layout

```
03 old portal/old-portal-github/
├── HANDOFF.md                  ← archive overview
├── CLAUDE.md                   ← original CLAUDE notes
├── CLOUD_HANDOFF.md            ← cloud-deploy notes
├── README.md
├── HELLO-ED.md
├── package.json (root)
├── vercel.json
├── main-monorepo/              ← THE canonical codebase
│   ├── README.md
│   ├── PLAN.md                 ← prioritised backlog (most done in this archive)
│   ├── PROGRESS.md             ← chronological session log
│   ├── SESSION_HANDOFF.md      ← latest branch / PR / CI state
│   ├── dev-config.md           ← original 84-section architecture deep-dive
│   ├── NEXT_STEPS.md           ← deployment guide
│   ├── package.json (workspaces root)
│   ├── apps/                   ← 7 sub-apps
│   │   ├── aqua-host-shell/    (port 3000 — orchestrator)
│   │   ├── aqua-client/        (port 3002 legacy — client portal)
│   │   ├── aqua-crm/           (port 3003 legacy — CRM)
│   │   ├── aqua-operations/    (port 3004 legacy — ops hub)
│   │   ├── aqua-ops-finance/   (port 3005 legacy — Finance Hub)
│   │   ├── aqua-ops-people/    (port 3006 legacy — People Hub)
│   │   └── aqua-ops-revenue/   (port 3007 legacy — Sales+Marketing)
│   ├── Bridge/                 ← shared workspace package @aqua/bridge
│   │   ├── ui/kit.tsx          ← unified UI kit (~480 LOC)
│   │   ├── auth/, data/, registry/, events/, sync/, api/
│   │   ├── postMessage.ts      ← legacy iframe protocol
│   │   ├── config/, types/
│   │   └── concepts/           ← cherry-picked Vite-prototype patterns
│   ├── Templates/              ← stub workspace (no-op register*App stubs)
│   └── scripts/
└── extras/                     ← reference-only
    ├── vite-prototype/         ← older Vite + React monolith
    ├── eds-old-portal-idea-fixed/  ← same with 15 bug fixes + per-folder READMEs
    └── sort-out-version/       ← even older monolith (delete-safe)
```

## Phase-9 migration

Original topology was 7 ports with iframe + postMessage RPC. Phase 9
migrated to **single-domain plugin model**: `aqua-host-shell` on port 3000
boots, dynamically imports each sub-app's `register*App()` function, which
calls `BridgeRegistry.register(viewId, Component)`. `HostRegistryViewRenderer`
resolves view IDs against that registry and renders components in-process.

Iframe fallback retained behind `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1` for
debugging.

## How to run

```bash
cd "03 old portal/old-portal-github/main-monorepo"
npm install
bash scripts/setup-db.sh   # initialise SQLite DBs (dev only)
npm run dev                # http://localhost:3000

# Demo session: log in as demo@aqua.portal — returns DEMO_SESSION (all suites unlocked)
```

For the AI chat, set `ANTHROPIC_API_KEY` (otherwise the route surfaces a clean
"Connect Anthropic" error).

Legacy multi-port: `npm run dev:legacy:all` boots all 7 apps on 3001-3007 and
re-enables iframe topology when paired with `NEXT_PUBLIC_BRIDGE_IFRAME_FALLBACK=1`.

## Final state at archive (commit `dae63ac`)

| Signal | Status |
|--------|--------|
| Open PRs | none |
| `tsc --noEmit` per app | 0 errors / 7 of 7 clean (with `ignoreBuildErrors: true`) |
| ESLint | 0 errors / 183 warnings |
| Bridge unit tests | 37 / 37 passing (Vitest, ~2s) |
| `next build` per app | passes (CI matrix) |
| Visible-chrome kit migration | 100% complete |
| Marketplace | end-to-end install / uninstall / configure flow (DB persistence stubbed) |
| AI chat | Claude Opus 4.7 SSE-streamed, prompt-cached system prompt |
| Security headers | full CSP + HSTS + Permissions-Policy + X-Frame-Options + Referrer-Policy |

## Headline assessment

**70% architecturally sound, 40% functionally complete.**
- The plugin / registry / event-bus skeleton is solid.
- Roles, multi-tenancy, lifecycle stages, fulfillment briefs are well-modeled.
- Most _business logic_ is stubbed (only Leads in CRM, only Dashboard in Finance,
  only HR in People, all Revenue widgets show mock data).
- localStorage is the de-facto persistence layer for per-suite stores; DB sync
  is `PLAN.md` task #1.

The codebase is in better shape than its TODO list suggests; "thousands of bugs"
is more accurately "lots of stub functions waiting for real implementations."
