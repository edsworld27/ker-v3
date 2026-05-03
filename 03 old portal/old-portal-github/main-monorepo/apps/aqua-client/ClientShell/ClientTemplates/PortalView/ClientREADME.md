# PortalView

**Product:** AQUA Client  
**Section:** AQUA Client Portal

## What it does
The root view shell for the AQUA Client portal. Renders the client's personalised portal experience including their dashboard, navigation, and all enabled suite views. Driven by the client's `enabledSuiteIds` configuration set by the agency.

## Key features
- Agency-branded portal shell
- Dynamic suite rendering based on client config
- Client identity and session management
- Suite-gated navigation

## Files
| File | Purpose |
|------|---------|
| `PortalView.tsx` | Main component |
| `ui.ts` | UI class constants |
| `registry.tsx` | Mini-registry (id: `portal`) |
| `index.ts` | Barrel export |
| `logic/` | Portal hooks |
