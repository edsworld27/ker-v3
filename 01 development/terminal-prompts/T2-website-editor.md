# T2 — Plugin Porter: Website Editor

You are Terminal 2 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/`. T1 is scaffolding the portal foundation. T3 is
porting the ecommerce plugin. Your job: extract the website editor +
58 blocks from `02 felicias aqua portal work/` into a self-contained
plugin package at `04 the final portal/plugins/website-editor/`.

## Your goal

The website-editor is one of two pre-vetted plugins that drop into the new
agency platform. By end-of-task, the plugin folder should be self-contained,
have a manifest exporting an `AquaPlugin`, and be ready for T1's portal to
mount it once T1's foundation lands.

## Coordination — read these first

1. `01 development/CLAUDE.md`
2. `01 development/context/MASTER.md`
3. `01 development/context/prior research/aqua-plugin-system.md` — plugin contract.
4. `01 development/context/prior research/aqua-visual-editor.md` — editor architecture.
5. `01 development/context/prior research/aqua-blocks.md` — block library catalogue.
6. `01 development/context/prior research/aqua-portal-variants.md` — portal-variant subsystem.
7. `01 development/eds requirments.md` if non-empty.

## Scope of work — files to lift

From `02 felicias aqua portal work/` into `04 the final portal/plugins/website-editor/`:

### Editor surface
- `src/app/admin/editor/*` — the editor page (Live · Block · Code modes, complexity Simple / Full / Pro, outliner, properties, topbar, publish modal)
- `src/app/admin/portals/*` — portal-variant admin (Login · Affiliates · Orders · Account tabs)
- `src/app/admin/pages/*` — page list / detail
- `src/app/admin/customise/*` — brand-kit editor
- `src/app/admin/sites/*` — site selector + settings
- `src/app/admin/themes/*`, `themes/page.tsx`, `theme/page.tsx`
- `src/app/admin/sections/*`, `assets/*`, `popup/*`

### Block library
- `src/components/editor/*` — entire folder (BlockRenderer, blockRegistry, all 58 block components)

### Storefront overlay
- `src/components/PortalEditOverlay.tsx`
- `src/components/PortalPageRenderer.tsx`
- `src/components/PreviewBar.tsx`
- `src/components/SiteResolver.tsx`, `SiteUX.tsx`, `SiteHead.tsx`
- `src/components/ThemeInjector.tsx`, `ThemeSwitcher.tsx`, `AdminThemeInjector.tsx`

### Server runtime
- `src/portal/server/pages.ts` (incl. portal-variant helpers)
- `src/portal/server/themes.ts`
- `src/portal/server/content.ts`
- `src/portal/server/discovery.ts`
- `src/portal/server/embeds.ts`
- `src/portal/server/embedTheme.ts`
- `src/portal/server/preview.ts`

### Client-side libs
- `src/lib/admin/editorPages.ts`
- `src/lib/admin/portalStarters.ts`
- `src/lib/admin/editorMode.ts`
- `src/lib/admin/customPages.ts`
- `src/lib/admin/loginCustomisation.ts`
- `src/lib/admin/sites.ts`
- `src/lib/admin/theme.ts`, `themeVariants.ts`
- `src/lib/admin/content.ts`, `media.ts`
- `src/lib/admin/portalCache.ts`
- `src/lib/admin/tabSets.ts` (the CONTENT_TABS slice)
- `src/lib/useContent.ts`, `useContentImage.ts`

### API routes
- `src/app/api/portal/pages/*`
- `src/app/api/portal/content/*`
- `src/app/api/portal/themes/*`
- `src/app/api/portal/assets/*`
- `src/app/api/portal/promote/*` (GitHub PR publish)
- `src/app/api/portal/embed-theme/*`
- `src/app/api/portal/discoveries/*`
- `src/app/api/portal/links/*`
- `src/app/api/portal/config/*` (GET/PATCH)

### Portal config / starter content
- `src/portal/website/*`
- `src/portal/client/*` (if relevant for editor — verify before lifting)
- `portal.config.ts` schema reference (don't lift verbatim — extract pattern)

## Required output structure

```
04 the final portal/plugins/website-editor/
├── package.json              name: "@aqua/plugin-website-editor", main: "./index.ts"
├── README.md                 what the plugin does + how to mount
├── index.ts                  manifest — exports default AquaPlugin
├── manifest.ts               (optional) shared manifest data
├── src/
│   ├── pages/                admin pages (mounted under /admin/<plugin-mount-point>/...)
│   ├── api/                  api route handlers (auto-mounted by runtime)
│   ├── components/           editor + 58 blocks
│   ├── server/               pages, themes, content, etc.
│   └── lib/                  client-side helpers
└── starter-trees/            login / affiliates / orders / account starter blocks (lift from portalStarters.ts)
```

The plugin manifest (`index.ts`) must export an `AquaPlugin` with:
- `id: 'website-editor'`
- `name`, `version`, `status: 'stable'`, `category: 'content'`
- `tagline`, `description`
- `requires: []` (foundation only — no other plugins)
- `pages: PluginPage[]` — every admin route the editor contributes
- `api: PluginApiRoute[]` — every API route the editor contributes
- `storefront: { blocks: BlockDescriptor[] }` — all 58 blocks registered
- `settings: SettingsSchema` — site default / theme variant / GitHub repo / etc.
- `features: PluginFeature[]` — simpleEditor, advancedEditor, codeView, templates, versionHistory, customCSS, headInjection, customDomain (mark plan-gated as in `02`)
- Lifecycle hooks (`onInstall`, etc.) only if needed

## NOT in scope

- Don't touch the foundation work (T1's responsibility).
- Don't port ecommerce (T3's job — even if files seem related to products).
- Don't refactor the editor's internals while porting; faithful copy first,
  cleanup later.
- Don't lift any auth or middleware code (T1 owns that).
- Don't lift `src/lib/admin/products.ts`, `collections.ts`, `marketing.ts`,
  `inventory.ts`, `reviews.ts` — those belong to T3.
- Don't try to run the plugin standalone — it'll be mounted by T1's portal.
  Verify it builds (`tsc --noEmit`) inside its own folder.
- If you find a file that's used by both website-editor and ecommerce,
  prefer leaving it in T1's foundation (e.g. `friendlyError.ts`,
  `helpDocs.ts` — these are shared admin helpers, not plugin-specific).

## When done

1. Verify `tsc --noEmit` is clean inside `04 the final portal/plugins/website-editor/`.
2. Verify `node -e "console.log(require('./index.ts'))"` (or equivalent
   ts-node check) prints the manifest with all expected fields.
3. Add `01 development/context/prior research/04-plugin-website-editor.md`
   documenting:
   - The plugin's manifest contract (id, features, settings, plan gating)
   - The mount points (which admin routes it contributes, which APIs)
   - Any blocks that needed adaptation (vs straight copy)
   - Outstanding TODOs (e.g. a feature that's plan-gated to "ent" — note
     where the plan check needs to live)
4. Add a row to `01 development/context/MASTER.md`.
5. Update `01 development/tasks.md` (mark T2 done).
6. Commit + push (sign-off as in T1).

If a file you need belongs to T3's scope or T1's foundation, **don't guess**.
Add a "Cross-team handoff" section in your chapter listing the file +
which terminal should own it.
