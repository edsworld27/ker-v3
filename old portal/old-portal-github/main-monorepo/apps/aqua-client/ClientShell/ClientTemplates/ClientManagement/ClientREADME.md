# ClientManagementView

**Suite:** Revenue Suite  
**Section:** AQUA Operations → Revenue Hub

## What it does
Detailed client relationship management panel. Manages the full client lifecycle from discovery through to live. Controls stage progression, resource uploads, CMS provisioning, employee assignments, and impersonation.

## Key features
- Client lifecycle stage selector
- CMS node configuration (GitHub owner/repo)
- Resource upload and management
- Employee assignment matrix
- Client portal impersonation

## Files
| File | Purpose |
|------|---------|
| `views/ClientManagementOverview.tsx` | Main component |
| `ClientManagementView.ui.ts` | UI class constants |
| `registry.tsx` | Mini-registry (id: `client-management`) |
| `index.ts` | Barrel export |
| `logic/useClientManagementViewLogic.ts` | Data hook |
| `logic/mockData.ts` | Sample clients |
