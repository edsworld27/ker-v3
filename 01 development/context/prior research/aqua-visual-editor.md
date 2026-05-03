# Aqua visual editor (`02 felicias aqua portal work/src/app/admin/editor/`)

Wix/GoHighLevel-style visual page builder. Hosts the storefront in an iframe
and wraps it with a host chrome that lets operators edit blocks, swap modes,
preview on devices, and publish drafts.

> Source: agent 3 sweep of `02 felicias aqua portal work/src/app/admin/editor/` and adjacent files.

## Page architecture (`page.tsx`)

Client-side React component. Key state:

- **`EditorTarget`** — `{ kind: "page", id: string }` or `{ kind: "funnel", id: string }`. Drives whether you're editing a portal page or a funnel.
- **`EditorMode`** — `"live" | "block" | "code"`. Three editing paradigms.
- **Edit / View toggle** — when "edit", the iframe overlay intercepts clicks; when "view", clicks pass through.
- **Complexity mode** — `"simple" | "full" | "pro"`, persisted via `getEditorComplexity()` (`src/lib/admin/editorMode.ts`).
- **Device state** — viewport presets (responsive / mobile / tablet / desktop) with zoom + rotation, persisted per operator.
- **History API** — Block-mode `EditorBlockStage` registers an undo/redo ref so the topbar's Cmd+Z/Shift+Z keys flow into it.

Deep-link: `?page=<id>` consumed once on first mount, ignored on site switches.

### Iframe message contract

The overlay running inside the iframe (`PortalEditOverlay`) posts messages to the host:
- `{ source: "portal-edit-overlay", type: "ready" | "select" | "unsaved" | "saved", … }`

Host responds with:
- `{ source: "editor-host", type: "set-mode" | "patch" | "save" | "revert", … }`

## Three modes

### Live (iframe + click-to-edit)

Renders the storefront page inside a sandboxed iframe at `${slug}?portal_edit=1&editor_host=1`. Click any `[data-portal-edit]` element in the iframe → sends a `select` message with the key + current value → host opens the **EditorPropertiesSidebar** on the right. Operator types, save commits via the override store.

Device preview bar above the iframe (only in non-simple mode). Reload button refreshes the iframe without a full page reload.

### Block (drag-drop builder)

Inline editor (not iframe-based). Three-pane layout — left block library, centre canvas, right properties. Only works for editor-managed pages (`page.source === "editor"`); site-managed pages show an error.

Has its own undo/redo internals; exposes a `registerHistory` callback to the topbar so keyboard shortcuts work.

Saves are instant — no separate publish step in this mode.

### Code (raw JSON)

Text area showing the page's `blocks` array as formatted JSON (`CodeStage`, `page.tsx:539-646`). Save = parse JSON + PATCH with array validation. Editor-managed pages only.

## Complexity modes

Stored in localStorage. Topbar segmented control flips between three:

- **Simple** — outliner hidden (full-width canvas), Live mode only, no undo/redo, no page-settings gear. Click blocks inline in the iframe to edit copy. For non-technical operators (Felicia mode).
- **Full** — all three modes visible, outliner on left (search + expand/collapse persisted), right properties sidebar, undo/redo in topbar.
- **Pro** — Full + the `⚙ Page settings` gear in topbar (custom CSS, theme override, layout overrides via `PageSettingsModal`).

Switching is instantaneous; switching to Simple while in Block/Code flips back to Live.

## Outliner (left rail, `EditorOutliner.tsx`)

Lists pages and funnels for the active site. State persisted at localStorage key `lk_editor_outliner_v1`.

- **Pages section** — collapsible, title + slug hint. Badge "src" on site-managed pages (live-mode-only editing).
- **Funnels section** — collapsible, step count, status dot (emerald = active, amber = paused, neutral = draft).
- **Search** — filters both sections; forces sections open when query is non-empty.
- **Hover actions** — page settings (⚙), delete (×) on editor-managed pages.
- **Site settings** — topbar button opens `SiteSettingsModal` for editing site name, domains, custom head/body scripts.

## Properties panel (right, `EditorPropertiesSidebar.tsx`)

Opens when an element is selected in the iframe. Data shape:

```ts
interface SelectedElement {
  key: string;            // data-portal-edit id
  type: "text" | "html" | "image-src" | "href";
  value: string;
  rect?: { x, y, width, height };
  label?: string;
}
```

Field selection by type:
- **Short text** → `<input type="text" />`
- **Long text (html)** → `<textarea rows={12} className="font-mono" />`
- **Images** → `<input type="url" />` with image preview
- **URLs** → plain `<input />`

**Live patching**: as the operator types, `onPatch(key, draft)` posts a `patch` message to the iframe → overlay updates the DOM in real time. Save commits via `onSave` (a `save` message).

## Topbar (`EditorTopBar.tsx`)

Left → right:

1. **Back chip** — link to `/admin`.
2. **Site picker** — dropdown, always visible.
3. **Page picker** — visible when `target.kind === "page"`. Wide select.
4. **Portal-role badge** — when `currentPage.portalRole` is set, shows e.g. `"⤷ login portal"`.
5. **Mode switcher** — segmented control (live / block / code). Hidden in simple.
6. **Edit / View toggle** — Live mode only, posts `set-mode` message.
7. **Reload** — refreshes iframe.
8. **Status** — unsaved counter or `Saved` indicator + connection dot.
9. **Complexity selector** — segmented control (right side).
10. **Undo / Redo** — hidden in simple.
11. **Page settings gear** — Pro mode only. Opens `PageSettingsModal` (Pro-only fields: custom CSS, theme override, layout overrides).
12. **Publish button** — opens `PublishModal`.

## Publish + GitHub PR flow

`PublishModal` (`page.tsx:649-925`) is a three-step chain:

1. **Publish content drafts** — `POST /api/portal/content/<siteId>/publish`. Moves draft overrides → published. 409 (no changes) treated as OK.
2. **Publish active editor page** (best-effort) — `POST /api/portal/pages/<siteId>/<pageId>/publish`. Converts `blocks` → `publishedBlocks`. Skipped if page doesn't exist.
3. **Open GitHub PR** — `POST /api/portal/promote/<siteId>`. Bundles three files:
   - `portal.overrides.json` (content overrides)
   - `portal.pages.json` (editor pages)
   - `portal.site.json` (site metadata)
   Returns `{ ok: true, prUrl, prNumber, files }`.

Preview diff before publishing: fetches `/api/portal/content/<siteId>?admin=1` to compare draft vs published, lists every page with unpublished blocks.

Cmd+S triggers publish modal. Cmd+Z / Cmd+Shift+Z trigger block-mode undo/redo.

## Funnel mode

When `target.kind === "funnel"`, the editor swaps to `EditorFunnelStage`. Funnels aren't pages — they're sequences of page paths with glob support (`/products/*`). Funnel editor has auto-save and shows step count in the footer.

## Theme + brand kit (`src/portal/website/`)

Re-exports from `src/lib/admin/theme.ts`. Tokens become CSS variables available
to all blocks via `ThemeInjector.tsx`:

```css
--theme-primary, --theme-secondary
--theme-radius, --theme-border
--theme-surface, --theme-surface-alt
--theme-ink, --theme-ink-muted
--font-playfair, --font-sans
--brand-orange, --brand-cream, …
```

The injector reads the site's theme config (colours, fonts, spacing) and outputs a `<style>` tag with `:root { --var: value; }`, available to every block and the storefront chrome.

Per-page theme override: `EditorPage.themeId` field. `BlockRenderer` receives `themeId` prop; each block's `themeStyles` override base `styles` for that theme. Pro-mode `PageSettingsModal` exposes a theme dropdown.
