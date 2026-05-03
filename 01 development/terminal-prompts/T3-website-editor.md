# T3 — Plugin port: Website editor

You are Terminal 3 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/`. T1 scaffolds the foundation. T2 builds the
fulfillment plugin. Your role: port the website editor + 58 blocks +
portal variants from `02 felicias aqua portal work/` into a self-contained
plugin package at `04 the final portal/plugins/website-editor/`.

## Mandatory pre-read

1. `01 development/CLAUDE.md`
2. `01 development/context/prior research/04-architecture.md` — **locked design**. Read §2 (plugin model), §9 (folder layout), §12 (round 1 split).
3. `01 development/context/MASTER.md`
4. `01 development/context/prior research/aqua-plugin-system.md` — the manifest contract.
5. `01 development/context/prior research/aqua-visual-editor.md` — editor architecture.
6. `01 development/context/prior research/aqua-blocks.md` — 58-block catalogue.
7. `01 development/context/prior research/aqua-portal-variants.md` — `PortalRole` + `isActivePortal` + starter trees.
8. `01 development/eds requirments.md` if non-empty.

## Your goal

Faithfully extract the website editor + block library + portal-variants
admin from `02` into `04 the final portal/plugins/website-editor/` as a
self-contained plugin. Default-export an `AquaPlugin` manifest. T1's
foundation mounts the plugin once installed; T2's fulfillment plugin
applies starter variants from this plugin during phase transitions.

## Files to lift

### Editor surface
- `02/src/app/admin/editor/*` — page, three modes (Live · Block · Code), complexity (Simple / Full / Pro), outliner, properties, topbar, publish modal
- `02/src/app/admin/portals/*` — portal-variant admin (Login · Affiliates · Orders · Account tabs)
- `02/src/app/admin/pages/*` — page list / detail
- `02/src/app/admin/customise/*` — brand-kit editor
- `02/src/app/admin/sites/*` — site selector + settings
- `02/src/app/admin/themes/*`, `themes/page.tsx`, `theme/page.tsx`
- `02/src/app/admin/sections/*`, `assets/*`, `popup/*`

### Block library
- `02/src/components/editor/*` — entire folder (BlockRenderer, blockRegistry, all 58 block components)

### Storefront overlay
- `02/src/components/PortalEditOverlay.tsx`
- `02/src/components/PortalPageRenderer.tsx`
- `02/src/components/PreviewBar.tsx`
- `02/src/components/SiteResolver.tsx`, `SiteUX.tsx`, `SiteHead.tsx`
- `02/src/components/ThemeInjector.tsx` (rename to avoid clashing with T1's chrome ThemeInjector — call it `EditorThemeInjector` or similar)

### Server runtime
- `02/src/portal/server/pages.ts` (incl. portal-variant helpers `listVariantsForPortal`, `getActivePortalVariant`, `setActivePortalVariant`)
- `02/src/portal/server/themes.ts`
- `02/src/portal/server/content.ts`
- `02/src/portal/server/discovery.ts`
- `02/src/portal/server/embeds.ts`
- `02/src/portal/server/embedTheme.ts`
- `02/src/portal/server/preview.ts`

### Client-side libs
- `02/src/lib/admin/editorPages.ts`
- `02/src/lib/admin/portalStarters.ts`
- `02/src/lib/admin/editorMode.ts`
- `02/src/lib/admin/customPages.ts`
- `02/src/lib/admin/loginCustomisation.ts`
- `02/src/lib/admin/sites.ts`
- `02/src/lib/admin/theme.ts`, `themeVariants.ts`
- `02/src/lib/admin/content.ts`, `media.ts`
- `02/src/lib/admin/portalCache.ts`
- `02/src/lib/useContent.ts`, `useContentImage.ts`

### API routes
- `02/src/app/api/portal/pages/*`
- `02/src/app/api/portal/content/*`
- `02/src/app/api/portal/themes/*`
- `02/src/app/api/portal/assets/*`
- `02/src/app/api/portal/promote/*` (GitHub PR publish)
- `02/src/app/api/portal/embed-theme/*`
- `02/src/app/api/portal/discoveries/*`
- `02/src/app/api/portal/links/*`
- `02/src/app/api/portal/config/*`

### Portal config / starter content
- `02/src/portal/website/*`
- `02/portal.config.ts` — extract pattern (don't lift verbatim)

## Folder layout

```
04 the final portal/plugins/website-editor/
├── package.json              name: "@aqua/plugin-website-editor"
├── README.md                 manifest summary + contract
├── index.ts                  default-exported AquaPlugin manifest
├── src/
│   ├── pages/                admin pages (mounted under /portal/clients/[clientId]/...)
│   ├── api/                  api route handlers
│   ├── components/           editor surface + 58 blocks + storefront overlay
│   ├── server/               pages, themes, content, etc.
│   └── lib/                  client-side helpers
└── starter-trees/            login / affiliates / orders / account starter blocks
```

## Manifest contract

```ts
const websiteEditorPlugin: AquaPlugin = {
  id: 'website-editor',
  name: 'Website editor',
  version: '0.1.0',
  status: 'stable',
  category: 'content',
  tagline: 'Visual page builder + 58 blocks + portal variants',
  description: 'Full WYSIWYG editor with Live, Block, and Code modes. Edit any client portal as block trees.',
  requires: [],
  navItems: [
    { id: 'editor', label: 'Editor', href: '/portal/clients/[clientId]/editor', panelId: 'content' },
    { id: 'pages', label: 'Pages', href: '/portal/clients/[clientId]/pages', panelId: 'content' },
    { id: 'portals', label: 'Portals', href: '/portal/clients/[clientId]/portals', panelId: 'content' },
    { id: 'customise', label: 'Customise', href: '/portal/clients/[clientId]/customise', panelId: 'settings' },
    { id: 'themes', label: 'Themes', href: '/portal/clients/[clientId]/themes', panelId: 'settings' },
    { id: 'assets', label: 'Assets', href: '/portal/clients/[clientId]/assets', panelId: 'content' },
    { id: 'sections', label: 'Sections', href: '/portal/clients/[clientId]/sections', panelId: 'content' },
    { id: 'popups', label: 'Popups', href: '/portal/clients/[clientId]/popups', panelId: 'content' },
  ],
  pages: PluginPage[],         // every admin route the editor contributes
  api: PluginApiRoute[],       // every API route
  storefront: { blocks: BlockDescriptor[] },   // all 58 blocks registered
  settings: SettingsSchema,    // per-install: GitHub repo / theme variant / default starter
  features: [
    { id: 'simpleEditor', label: 'Simple editor', default: true },
    { id: 'advancedEditor', label: 'Block + code modes', default: true },
    { id: 'codeView', label: 'Raw JSON code mode', default: false, plans: ['enterprise'] },
    { id: 'templates', label: 'Page templates', default: true },
    { id: 'versionHistory', label: 'Version history', default: true },
    { id: 'customCSS', label: 'Custom CSS', default: false, plans: ['pro', 'enterprise'] },
    { id: 'headInjection', label: 'Custom <head> tags', default: false, plans: ['pro', 'enterprise'] },
    { id: 'customDomain', label: 'Custom domain', default: false, plans: ['pro', 'enterprise'] },
  ],
};
```

## API exposed to T2 (fulfillment)

Phase transitions need to apply starter portal-variant block trees. Expose:

```ts
// In src/server/portalVariants.ts
export async function applyStarterVariant(
  clientId: string,
  role: PortalRole,
  starterId: string
): Promise<EditorPage>;

// Available starters (from starter-trees/):
//   login-default, login-onboarding, login-design, ...
//   account-default, account-onboarding, ...
//   etc.
```

T2's `transitions.ts` calls this when advancing phases.

## Tenant scoping — IMPORTANT

`02`'s code uses `siteId` as the tenant identifier. In `04`, replace with
`clientId` (or `(agencyId, clientId)` where pluginInstall is scoped). Update
every `/api/portal/...` API route and every server-module function to scope
queries to the correct tenant. T1's `requireRole` helper gives you the cookie
context.

Don't break the tenant boundary. Every read: `WHERE clientId = ?`. Every
write: same. Use T1's `withTenantScope(query, session)` helper if it exists;
otherwise document a new helper you needed.

## NOT in scope

- Don't touch foundation (T1).
- Don't lift any auth / middleware / cookie code (T1 owns it).
- Don't lift `src/lib/admin/products.ts`, `collections.ts`, `marketing.ts`,
  `inventory.ts`, `reviews.ts`, `cart.ts`, `discounts.ts`, `giftCards.ts` —
  those belong to the ecommerce plugin (Round 2).
- Don't lift Stripe code.
- Don't lift the storefront pages (`02/src/app/(storefront)/...`) — they're
  customer-facing surfaces of the ecommerce plugin (Round 2).
- Don't refactor the editor's internals while porting; faithful copy first.
- Don't try to run the plugin standalone — it'll be mounted by T1's portal.
  Verify it builds (`tsc --noEmit`) inside its own folder.

## When done

1. `tsc --noEmit` clean inside `04 the final portal/plugins/website-editor/`.
2. Manifest exports correctly.
3. Verify the 58 blocks all import + render in isolation (write a quick smoke test).
4. Add `01 development/context/prior research/04-plugin-website-editor.md` documenting:
   - The manifest contract
   - The block catalogue (58 blocks — copy the table from `aqua-blocks.md` updated with any port-time tweaks)
   - The mount points (admin routes contributed)
   - The portal-variant API exposed to T2 (`applyStarterVariant` etc.)
   - Outstanding TODOs (especially: split-test resolution wiring, GitHub PR promote flow's Postgres migration, theme-token-system)
5. Add a MASTER.md row.
6. Update `tasks.md` (mark T3 done).
7. Commit + push.

If you find a file that genuinely belongs in T2's fulfillment scope or
T1's foundation, **don't guess**. Add a "Cross-team handoff" section in
your chapter listing the file + which terminal should own it.

Be terse to Ed.
