# `aqua-ops-revenue` — Revenue Hub

> **Port:** 3007
> **Shell:** `RevenueShell/`
> **Role:** Revenue analytics — sales metrics, forecasting, marketing performance.
> **⚠ Status:** **Largely placeholder.** Most widgets are stubs. See "Known incomplete pieces" below.

For the standard sub-app skeleton, see [`../README.md`](../README.md).

---

## What's distinctive

### Skeleton + Analytics template only

`RevenueShell/RevenueTemplates/` has the Analytics template registered. Beyond that, the SalesSuite and MarketingSuite widgets exist as files but their function bodies are placeholders.

### Path alias

`@RevenueShell/*`

---

## Folder anatomy

| Folder | Status |
| --- | --- |
| `RevenueShell/RevenueApp.tsx` | ✓ Functional shell |
| `RevenueShell/RevenueTemplates/Analytics/` | ✓ Implemented |
| `RevenueShell/RevenueTemplates/SalesSuite/` | ⚠ Shell only — see below |
| `RevenueShell/RevenueTemplates/MarketingSuite/` | ⚠ Shell only — see below |
| `RevenueShell/{AppFrame,Sidebar,TopBar,Renderer}/` | ✓ Standard |
| `RevenueShell/bridge/` | ✓ Standard |
| `RevenueShell/components/Settings/RevenueSettingsPlaceholder.tsx` | ⚠ 6 placeholder settings views |
| `RevenueShell/components/{Auth,Modals,TemplateHub,BridgeControl,shared,ui}/` | Standard |
| `RevenueShell/{logic,hooks,widgets,views}/` | Standard pattern |
| `app/` | Standard Next.js routes |
| `prisma/` | Revenue-specific schema |

---

## How to run

```bash
npm run dev:revenue      # http://localhost:3007
```

The shell loads, sidebar renders. Most clicks lead to placeholder views.

---

## Known incomplete pieces (most acknowledged in `dev-config.md`)

Per `dev-config.md` § "Known In-Progress / Coming Soon":

> "**RevenueSuite — SalesSuiteView**: Shell only. SalesHubOverview, SalesPipelineView, SalesCalendarView, CrmInboxWidget, ProposalsWidget, LeadTimelineWidget are placeholder functions — not yet implemented"
>
> "**RevenueSuite — MarketingSuiteView**: Shell only. All 7 marketing widgets are placeholders"

**Specific stub locations:**

| File | Lines | What's stubbed |
| --- | --- | --- |
| `RevenueShell/components/Settings/RevenueSettingsPlaceholder.tsx` | 34-56 | 6 stub fns: AgencyConfiguratorView, GlobalSettingsView, IntegrationsView, AgencyBuilderView, AllUsersView, DashboardView |
| `RevenueShell/RevenueTemplates/SalesSuite/widgets/*` | various | SalesHubOverview, SalesPipelineView, SalesCalendarView, CrmInboxWidget, ProposalsWidget, LeadTimelineWidget |
| `RevenueShell/RevenueTemplates/MarketingSuite/widgets/*` | various | 7 marketing widgets |

---

## Polish opportunities (HIGH priority — this app is the most incomplete)

1. **Implement Sales widgets** — Pipeline (kanban), Calendar (deal close dates), CrmInbox (recent leads), Proposals (sent/pending/accepted), LeadTimeline (per-lead activity)
2. **Implement Marketing widgets** — campaign tracker, channel performance, conversion funnel, etc.
3. **Wire Settings placeholder views** to real templates (AgencyConfigurator concept exists in `Bridge/concepts/AgencyConfigurator/` — could be ported)
4. **Add real data integrations** — these widgets currently have no data source. Need Prisma models + API endpoints.

---

## See also

- `../README.md` — standard skeleton
- `../../Bridge/concepts/AgencyConfigurator/` — reference UI for the placeholder Settings views to replace
- `../aqua-operations/README.md` — meta-ops hub that should aggregate revenue data once it exists
- Top-level `dev-config.md` § 19 — original notes on what's missing here
