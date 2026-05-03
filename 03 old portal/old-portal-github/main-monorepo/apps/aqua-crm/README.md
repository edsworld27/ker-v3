# `aqua-crm` — CRM app

> **Port:** 3003
> **Shell:** `CRMShell/`
> **Role:** Sales / CRM functionality. Lead management, prospect tracking, deal pipeline.

For the standard sub-app skeleton, see [`../README.md`](../README.md).

---

## What's distinctive

### Mostly stubbed — see polish list

Per `dev-config.md` § "Known In-Progress / Coming Soon":
> "AQUA CRM product: `Templates/AQUA CRM/` folder exists, not yet populated"

What IS here:
- `CRMShell/CRMTemplates/Leads/` — lead management module (functional)
- Standard shell (CRMApp.tsx, AppFrame, Sidebar, TopBar, Renderer)
- Standard bridge layer (CRMContext, CRMBridgeHub, CRMRegistration, etc.)
- Standard atomic UI library (`components/ui/`)

What's MISSING (from prototype + dev-config refs):
- Pipeline view
- Deal/opportunity tracking
- Contact management
- CRM-specific dashboards
- Activity timeline per lead/deal
- Reporting

### Path alias

`@CRMShell/*` maps to `CRMShell/*`.

---

## Folder anatomy

| Folder | Status |
| --- | --- |
| `CRMShell/CRMApp.tsx` | ✓ Functional shell |
| `CRMShell/CRMTemplates/Leads/` | ✓ Implemented |
| `CRMShell/CRMTemplates/` (other modules) | ⚠ Empty — need to populate |
| `CRMShell/{AppFrame,Sidebar,TopBar,Renderer}/` | ✓ Standard pattern |
| `CRMShell/bridge/` | ✓ Standard pattern (CRMContext, CRMBridgeHub, etc.) |
| `CRMShell/components/{Auth,Modals,Settings,TemplateHub,BridgeControl,shared,ui}/` | ✓ Standard pattern |
| `CRMShell/{logic,hooks,widgets,views}/` | ✓ Standard pattern |
| `app/` Next.js routes | ✓ Standard `(main)`, `embed`, `demo`, `user`, `api/bridge`, `api/sync` |
| `prisma/` | ✓ CRM-specific schema |

---

## How to run

```bash
npm run dev:crm        # http://localhost:3003
```

---

## Polish opportunities

1. **Build the missing CRM templates** (Pipeline, Deals, Contacts, Activities, Reports) — see polish list item #2
2. **Resolve `typescript.ignoreBuildErrors: true`** in `next.config.mjs`
3. **Migrate from `experimental.serverComponentsExternalPackages`** to top-level `serverExternalPackages` (deprecated config)

---

## See also

- `../README.md` — standard skeleton
- `../../Bridge/concepts/RoleBuilder/` — could host a CRM-specific role variant
- `../../dev-config.md` — original architecture notes
