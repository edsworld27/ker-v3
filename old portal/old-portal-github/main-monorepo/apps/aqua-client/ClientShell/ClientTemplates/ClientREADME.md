# AQUA Client

**Product:** AQUA Client Portal

## What it does
The client-facing product portal. Delivered to end clients of the agency. Provides a white-labelled, agency-branded experience where clients can track their projects, access documents, communicate with the agency, and manage their account.

## Architecture
AQUA Client is one of three Aqua products:
- **AQUA Operations** — Internal agency OS (staff-facing)
- **AQUA Client** — Client delivery portal (client-facing)
- **AQUA CRM** — Acquisition and lead management

## Sub-modules
| Module | Description |
|--------|-------------|
| `PortalView` | Main portal shell for client navigation |

## Files
| File | Purpose |
|------|---------|
| `AquaClient.ui.ts` | UI class constants |
| `registry.tsx` | Master registry for client portal |
