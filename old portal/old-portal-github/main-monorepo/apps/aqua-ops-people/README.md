# `aqua-ops-people` — People (HR) Hub

> **Port:** 3006
> **Shell:** `PeopleShell/`
> **Role:** Human resources & support. Employee management, org chart, support context.

For the standard sub-app skeleton, see [`../README.md`](../README.md).

---

## What's distinctive

### Has TWO context templates

`PeopleShell/PeopleTemplates/` contains:
- **HR context template** — employee management, org structure
- **Support context template** — support ticket / case management

### Path alias

`@PeopleShell/*`

---

## Folder anatomy

| Folder | Notes |
| --- | --- |
| `PeopleShell/PeopleApp.tsx` | ✓ Functional shell |
| `PeopleShell/PeopleTemplates/HR/` | ✓ HR template module |
| `PeopleShell/PeopleTemplates/Support/` | ✓ Support template module |
| `PeopleShell/{AppFrame,Sidebar,TopBar,Renderer}/` | ✓ Standard pattern |
| `PeopleShell/bridge/` | ✓ Standard (PeopleContext, PeopleBridgeHub, etc.) |
| `PeopleShell/components/` | Standard component groups |
| `PeopleShell/{logic,hooks,widgets,views}/` | Standard |
| `app/` | Standard Next.js routes |
| `prisma/` | People-specific schema |

---

## How to run

```bash
npm run dev:people       # http://localhost:3006
```

---

## Known incomplete pieces

Same as Finance — type field-name divergence between People widgets and Bridge types, hidden by `typescript.ignoreBuildErrors: true`.

---

## Polish opportunities

1. **Fix People widget type drift** vs Bridge canonical types
2. **Wire HR template to actual `User` records** from Bridge (currently uses local mock)
3. **Build Support template features**:
   - Ticket list / kanban
   - SLA timer
   - Customer satisfaction scoring
   - Knowledge base (could pull from `apps/aqua-client/ClientShell/ClientTemplates/ClientResources`)
4. **Migrate deprecated `experimental.serverComponentsExternalPackages`** to top-level

---

## See also

- `../README.md` — standard skeleton
- `../aqua-ops-finance/README.md` — sister Finance Hub (same shape)
- `../aqua-client/README.md` — has client-facing support views that could share patterns
