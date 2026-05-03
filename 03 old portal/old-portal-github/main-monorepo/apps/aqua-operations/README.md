# `aqua-operations` — Operations Hub

> **Port:** 3004
> **Shell:** `OpsHubShell/`
> **Role:** General agency operations dashboard. Acts as an "ops landing" — links to Finance / People / Revenue sub-apps + general ops widgets.

For the standard sub-app skeleton, see [`../README.md`](../README.md).

---

## What's distinctive

### Enterprise context template

`OpsHubShell/OpsTemplates/` contains the "Enterprise Context" template — the central ops orchestration view that aggregates data from finance/people/revenue.

### Acts as a meta-hub

Unlike Finance/People/Revenue (which are domain-specific), this app is the cross-functional ops landing. It's where you'd build:
- Cross-domain reporting (finance + people + revenue together)
- Org-level alerts/notifications
- Multi-suite admin workflows

Currently mostly skeleton — the expectation is that templates will be added here over time.

### Path alias

`@OpsHubShell/*`

---

## Folder anatomy

| Folder | Notes |
| --- | --- |
| `OpsHubShell/OpsHubApp.tsx` | ✓ Functional shell |
| `OpsHubShell/OpsTemplates/` | Enterprise context template + room for more |
| `OpsHubShell/{AppFrame,Sidebar,TopBar,Renderer}/` | ✓ Standard pattern |
| `OpsHubShell/bridge/` | ✓ Standard pattern (OpsHubContext, OpsHubBridgeHub, etc.) |
| `OpsHubShell/components/{Auth,Modals,Settings,TemplateHub,BridgeControl,shared,ui}/` | ✓ Standard pattern |
| `OpsHubShell/{logic,hooks,widgets,views}/` | ✓ Standard pattern |
| `app/` Next.js routes | ✓ Standard pattern |
| `prisma/` | Ops-specific schema |

---

## How to run

```bash
npm run dev:operations    # http://localhost:3004
```

---

## Relationship to Finance / People / Revenue

This app is intentionally separate from finance/people/revenue (each runs on its own port). The host shell sidebar navigates between them all individually. Operations Hub is the **cross-cutting** view that pulls aggregate data.

If you find yourself building the same widget in two of finance/people/revenue, consider promoting it here instead.

---

## Polish opportunities

- Add cross-suite reporting templates
- Connect ops dashboard widgets to data from finance/people/revenue (currently unwired)
- Fix `typescript.ignoreBuildErrors: true`

---

## See also

- `../README.md` — standard skeleton
- `../aqua-ops-finance/README.md`, `../aqua-ops-people/README.md`, `../aqua-ops-revenue/README.md` — the domain-specific ops sub-apps
