# Old portal — extras (`03 old portal/.../extras/`)

Three reference implementations preserved as siblings to `main-monorepo/`. Not
wired into production. Useful for pattern-mining.

> Source: agent 6.

## vite-prototype/ (~250 files, ~1.5 MB)

Older **Vite + React monolithic SPA** — predecessor to the Next.js monorepo.
Single `App.tsx` entry, mock data at `src/data/mockData.ts`, no Next.js, no
Prisma, no workspaces.

**Patterns NOT in the Next.js monorepo (worth porting forward to 04):**

1. **PageBuilder** (`src/views/PageBuilder/`) — drag-drop layout editor with live preview. Pick widget from registry, place in grid, configure props. Production-quality.
2. **RoleBuilder** (`src/views/RoleBuilder/`) — custom role CRUD with permission matrix (rows: roles, columns: permissions per entity).
3. **AgencyConfigurator** (`src/views/AgencyConfiguratorView.tsx`) — real-time agency branding editor (logo, color picker, domain config, theme preview).
4. **Collaboration widgets** (`src/components/widgets/`):
   - `ProjectChat.tsx` — team chat
   - `ProjectTimeline.tsx` — milestone timeline
   - `DesignConcepts.tsx` — concept board for client review
   - `SyncCard.tsx` — next-sync-meeting card
5. **DynamicRenderer** (`src/components/DynamicViewRenderer.tsx`) — 26-line generic config-to-JSX renderer. Cleaner than monorepo equivalents.
6. **ModalContext** (`src/context/ModalContext.tsx`) — global modal state + `useModal()` hook. Replaces per-component `[isOpen,setIsOpen]`.
7. **AppContext** (`src/context/AppContext.tsx`) — single root context for user / agency / currentClient / theme. Less prop-drilling.

**Verdict**: cherry-pick patterns into `04`. `Bridge/concepts/` already has
copies of #1-#5; #6 + #7 are still orphaned.

## eds-old-portal-idea-fixed/ (~250 files, ~1.6 MB)

Same prototype + 15 bug fixes + 15 per-folder READMEs.

**Bug fixes**:
- Removed duplicate component imports in `componentMap.ts`
- Reconstructed missing imports in `WebsiteView`
- Fixed typo: `ClientStatsWidget` → `ClientsStatsWidget`
- Made component props optional + added context fallbacks
- Fixed circular imports (lazy-loaded `componentMap` in `ViewLayoutEditor`)
- Fixed lucide icon casing (PascalCase, not lowercase)
- Removed stray syntax errors

**Per-folder READMEs**: 15 new READMEs explaining purpose, key exports, integration points, known gotchas.

**Verdict**: this is the **fixed ground truth** of the prototype. Better
reference than `vite-prototype/` for understanding intent.

## sort-out-version/ (~50 files, ~680 KB)

Older monolithic snapshot — single ~3,600-line `App.tsx`. Same mock data
+ context providers, less organised.

**Unique content**: `find_duplicate_keys.cjs` debug utility (already
cherry-picked to `main-monorepo/scripts/`).

**Verdict**: **delete-safe**. Nothing unique remains.
