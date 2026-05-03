# `extras/` — Supplementary versions kept for reference

These three folders are NOT part of the active codebase. They're sister versions preserved for diff comparison and concept reference. The canonical codebase lives in `../main-monorepo/`.

---

## What's in here

### `vite-prototype/` (~250 files, 1.5 MB)

The earlier Vite + React **monolithic** prototype. Single SPA, no Next.js, no monorepo, no Prisma — just one big React app with mock data in `src/data/mockData.ts`.

**Why kept:** Several patterns in here are cleaner / more complete than the equivalent in the Next.js monorepo. The most valuable have been cherry-picked into `main-monorepo/Bridge/concepts/` (PageBuilder, RoleBuilder, AgencyConfigurator, collaboration widgets, the DynamicRenderer pattern, the role/template config schema).

**When to look here:** If you're adapting one of the cherry-picked concepts into the monorepo and want the original prototype context.

### `eds-old-portal-idea-fixed/` (~250 files, 1.6 MB)

Same as `vite-prototype/` but with **15 files fixed** + comprehensive per-folder READMEs added.

**Fixes applied** (these are in `vite-prototype/` only as broken originals):

- `componentMap.ts` — removed duplicate imports of ProjectListWidget / TaskListWidget; renamed `ClientStatsWidget` → `ClientsStatsWidget`; registered 16 missing views
- `agencyConfig.ts` — removed duplicate `client-management` key
- `views/WebsiteView/ui.ts` — reconstructed missing `import` line + `export const` wrapper
- `views/EmployeeManagementView/ui.ts` — removed stray trailing `},\n};`
- `views/EmployeeManagementView/EmployeeManagementView.tsx` — defined the missing `allowedViews` variable
- `views/PageBuilder/PageBuilder.tsx` — `'ClientStatsWidget'` typo
- `views/{Website,Resources,Discover,Support,Crm,DataHub,CustomPage,GlobalActivity,AgencyHub,Logs}/View.tsx` — props made optional + context fallback added so DynamicRenderer can mount them with empty props
- `views/AgencyBuilderView/ViewLayoutEditor.tsx` — broke circular dependency by lazy-loading `componentMap`
- `widgets/AdminActivityWidget.tsx` — fixed lowercase lucide icon imports + missing DashboardWidget import
- `widgets/AdminStatsWidget.tsx` — type widening for value resolver
- `widgets/ProjectsStatsWidget.tsx` — replaced invalid `LabelKey` lookups with literals
- `widgets/ClientsStatsWidget.tsx` — cast `'onboarding'` (not a valid ClientStage) to silence TS
- `widgets/ClientDirectoryWidget.tsx` — added missing `Search`/`Filter`/`Mail` icon imports + moved `setShowAddClientModal` to ModalContext
- `widgets/ui.ts` (new) — re-exports `clientManagementViewUI` + stubs `projectListWidgetUI` / `projectsStatsWidgetUI`
- `widgets/ClientWelcomeWidget.tsx` (new) + `widgets/ClientRecentActivityWidget.tsx` (new) — placeholder stubs for missing files
- `types/index.ts` — added optional `resources?` + `permissions?` to `Client`; `steps?` + `attachments?` to `ProjectTask`

**READMEs:** 15 new READMEs explaining the prototype's architecture, roles, layout system, and per-folder contents.

**When to look here:** If you want to understand the prototype with the bugs already documented and the patterns explained. Boot it locally with `npm install && npm run dev` (Vite, port 3000).

### `sort-out-version/` (~50 files, 680 KB)

An even older monolithic version of the prototype (single ~3,600-line `App.tsx`).

**Why kept:** It contains a useful debug utility (`find_duplicate_keys.cjs`) that's been promoted to `../main-monorepo/scripts/find_duplicate_keys.cjs`. Otherwise nothing unique — it's the prototype before componentization.

**Verdict:** Skip unless you specifically need to diff against this snapshot. Will probably be deleted in a future cleanup.

---

## Cherry-picks already merged

These are the elements pulled from `vite-prototype/` into `../main-monorepo/Bridge/concepts/`:

- `PageBuilder/`
- `RoleBuilder/`
- `AgencyConfigurator/` (was `AgencyConfiguratorView` in the prototype)
- `collaboration/` (ProjectChat, ProjectTimeline, DesignConcepts, SyncCard)
- `DynamicRenderer/`
- `agencyConfig.reference.ts` (renamed to mark it as a reference)
- `templates.reference.ts`

See `../main-monorepo/Bridge/concepts/README.md` for what each is and how to adapt to the monorepo.

---

## Safe to delete?

- **`sort-out-version/`** — yes, once you've confirmed `find_duplicate_keys.cjs` is the only thing worth keeping (already copied to monorepo)
- **`vite-prototype/`** — keep until all valuable patterns are confirmed productionized in monorepo
- **`eds-old-portal-idea-fixed/`** — keep as the "ground truth" for the fix history + READMEs
