# `aqua-ops-finance` — Finance Hub

> **Port:** 3005
> **Shell:** `FinanceShell/`
> **Role:** Financial operations. Revenue tracking, expense management, financial dashboards, billing/invoicing context.

For the standard sub-app skeleton, see [`../README.md`](../README.md).

---

## What's distinctive

### Has a Finance dashboard template

`FinanceShell/FinanceTemplates/` contains the Dashboard template — the primary financial overview view.

### Path alias

`@FinanceShell/*` (e.g. `import x from '@FinanceShell/bridge/FinanceContext'`).

---

## Folder anatomy

| Folder | Notes |
| --- | --- |
| `FinanceShell/FinanceApp.tsx` | ✓ Functional shell |
| `FinanceShell/FinanceTemplates/Dashboard/` | ✓ Implemented — financial dashboard view |
| `FinanceShell/{AppFrame,Sidebar,TopBar,Renderer}/` | ✓ Standard pattern |
| `FinanceShell/bridge/` | ✓ Standard (FinanceContext, FinanceBridgeHub, etc.) |
| `FinanceShell/components/` | Standard component groups (Auth, Modals, Settings, TemplateHub, BridgeControl, shared, ui) |
| `FinanceShell/{logic,hooks,widgets,views}/` | Standard |
| `app/` | Standard Next.js routes |
| `prisma/` | Finance-specific schema |

---

## How to run

```bash
npm run dev:finance       # http://localhost:3005
```

Verified booting via `curl http://localhost:3005/` → HTTP 200 in this snapshot.

---

## Known incomplete pieces

Per `dev-config.md` § "Known In-Progress / Coming Soon":

> "Finance/People TS errors: Some domain type mismatches in FinanceSuite and PeopleSuite widgets (field name divergence). Non-blocking but tracked for cleanup."

That's why `next.config.mjs` ships with `typescript.ignoreBuildErrors: true`. Removing that flag would surface the field-name divergence errors that need cleanup.

---

## Polish opportunities

1. **Resolve the field-name divergence** between Finance widget types and the canonical Bridge types — then remove `ignoreBuildErrors: true`
2. **Build out additional Finance templates** beyond the single Dashboard (e.g. Invoicing, Expenses, Reports)
3. **Migrate from `experimental.serverComponentsExternalPackages`** to top-level `serverExternalPackages` (deprecated config)

---

## See also

- `../README.md` — standard skeleton
- `../aqua-ops-people/README.md` — sister HR Hub (similar shape)
- `../aqua-operations/README.md` — meta-ops hub that aggregates data from here
- `../../Bridge/README.md` — workspace package
