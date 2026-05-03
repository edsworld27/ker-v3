# `Bridge/concepts/` — Reference patterns ported from earlier prototype

> **What this folder is:** Standalone reference implementations of design patterns that were prototyped in an earlier Vite + React version of the portal (now living at `extras/vite-prototype/` outside the monorepo). They are **not wired into the live monorepo**. They live here as concept references for future work — clean, single-file (or single-folder) implementations of ideas the team intended to bring into production.
>
> **Why they're here:** Each pattern below was either (a) more complete in the prototype than in any current monorepo app, or (b) a self-contained implementation of an idea that's currently scattered or stubbed across the monorepo apps.
>
> **Use them as inspiration**, not as drop-in code. The prototype's runtime is Vite + a single AppContext; the monorepo's runtime is Next.js + Bridge package + iframe orchestration. Direct ports require adapting context access, type imports, and routing.

---

## What's in here

### `PageBuilder/` — Drag-and-drop layout editor

A real visual builder for assembling custom dashboard pages from composable widgets. User picks widgets from a registry, places them into a grid layout, configures per-widget props.

- **Why useful:** The monorepo has no real page builder — `aqua-client` has placeholder views. This is a working pattern.
- **To productionize:** Replace the prototype's `componentMap` import with the monorepo's `BridgeRegistry.resolve()`. Replace `useAppContext` with `useClientContext` (or whichever app is hosting the builder). Persist layouts via `BridgeAPI.syncData()` instead of local state.

### `RoleBuilder/` — Custom role CRUD

Full role-creation UI: define `displayName`, `accentColor`, `allowedViews[]`, `canImpersonate`, `canManageUsers`, `canManageRoles`, `canAccessConfigurator`, `labelOverrides{}`. Roles created here become available throughout the app's permission system.

- **Why useful:** The monorepo's `Bridge/auth/` has hardcoded role strings (`Founder`, `AgencyManager`, `ClientOwner`, etc.). This is a UI for creating new roles at runtime.
- **To productionize:** Persist via Prisma. The `RoleConfig` shape maps cleanly to a `Role` Prisma model.

### `AgencyConfigurator/` — Real-time agency identity editor

Edit agency name, logo, primary/secondary brand colors, feature flags, label overrides — all changes take effect immediately via the CSS variable theming layer (`--color-primary`, `--color-secondary`).

- **Why useful:** The monorepo's `apps/aqua-host-shell/HostShell/components/Settings/` is a stub. This is what it should look like.
- **To productionize:** Wire `setAgencyConfig()` to `BridgeAPI.updateAgency()` (Prisma `Agency` table). Persist colors as Agency model fields.

### `collaboration/` — Project collaboration widgets

Four widgets used inside the prototype's `CollaborationView`:

- **`ProjectChat/`** — Real-time-style chat panel for a project
- **`ProjectTimeline/`** — Vertical timeline of project milestones
- **`DesignConcepts/`** — Grid of concept thumbnails for client review
- **`SyncCard/`** — "Next sync meeting" card

- **Why useful:** The monorepo has these scattered across `aqua-client/ClientShell/ClientTemplates/ClientFulfillment/`. The prototype's versions are cleaner standalone components.
- **To productionize:** Replace prototype's `InboxContext` with the monorepo's `aqua-client/ClientShell/bridge/ClientInboxContext.tsx`.

### `DynamicRenderer/` — String → component runtime

26-line generic renderer that takes a config array `[{ component: 'X', props: {} }]` and mounts components by string name via `componentMap` lookup.

- **Why useful:** The monorepo has its own version (`apps/aqua-host-shell/HostShell/Renderer/`) which is iframe-based; this version is for in-process composition (better for widgets within a single app).
- **To productionize:** Already production-quality. Drop into any app's `Renderer/` folder, swap `componentMap` import for the app's local component registry.

### `agencyConfig.reference.ts` — Config-driven role/permission system

Single-file canonical implementation of the role + view-layout config pattern. Defines `RoleConfig`, `ViewLayout`, `LabelKey`, `FeatureKey` types plus a complete `agencyConfig` object showing how Founder / AgencyManager / AgencyEmployee / ClientOwner / ClientEmployee roles are structured.

- **Why useful:** The monorepo's auth/role system is split across `Bridge/auth/`, `Bridge/types/`, and per-app `bridge/config/agencyConfig.ts` files (each app has its own copy that drifts). This single file shows the intended shape.
- **To productionize:** This is the "schema" the runtime config should match. Use it as the type contract for `Bridge/auth/types.ts`.

### `templates.reference.ts` — Agency template presets

Complete `AgencyTemplate` definitions for "Web Design Agency", "Marketing Agency", etc. — each template is a full role+layout+sidebar preset that can be applied to reset an agency to a starter state.

- **Why useful:** The monorepo's `Templates/` package is a stub (no-op registration functions). This shows what the template system should produce.
- **To productionize:** These should become Prisma `AgencyTemplate` records, applied via an admin UI.

---

## Status flag

These files are **NOT** imported by any monorepo app. They are pure reference. Adding them to your IDE shouldn't affect builds (they're outside any app's `app/` directory and aren't transpiled).

If you decide to productionize one, the recommended pattern:

1. Identify the target app (e.g. `aqua-host-shell` for an admin-only builder)
2. Copy the folder into that app's appropriate location (`apps/X/XShell/components/` or `templates/`)
3. Adapt context imports, type imports, and theming to match the target app
4. Delete from `concepts/` once the productionized version is in place
