# ClientDashboardView

**Suite:** Experience Suite  
**Section:** AQUA Operations → Client Experience

## What it does
The primary dashboard shown to agency clients when they log into the portal. Displays a live overview of their project status, active tasks, open support tickets, assigned agency team members, and resource assets.

## Key features
- Project progress tracker with completion percentage
- Task board summary (done vs open)
- Support ticket counter with overdue flags
- Agency team roster (impersonation-ready)
- Stage lifecycle indicator (Discovery → Development → Live)

## Files
| File | Purpose |
|------|---------|
| `ClientDashboardView.tsx` | Main component |
| `ClientDashboardView.ui.ts` | UI class constants |
| `registry.tsx` | Mini-registry (id: `client-dashboard`) |
| `index.ts` | Barrel export |
| `logic/useClientDashboardLogic.ts` | Data hook |
