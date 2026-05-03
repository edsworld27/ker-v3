# Aqua portal variants (`02 felicias aqua portal work/src/app/admin/portals/`)

A role-based multi-variant system for customer-facing portal pages. Each
`EditorPage` can be tagged with a `portalRole` (`"login" | "affiliates" |
"orders" | "account"`); exactly one variant per (siteId, role) is the
"active" one customers see at the public route.

> Source: agent 3 sweep of `02 felicias aqua portal work/src/app/admin/portals/` and `src/portal/server/pages.ts`.

## PortalRole + isActivePortal

`PortalRole` is a literal union: `"login" | "affiliates" | "orders" | "account"`.

Each `EditorPage` carries:
- `portalRole?: PortalRole` — opt-in tag making the page eligible as a variant
- `isActivePortal?: boolean` — singleton-enforced; exactly zero or one variant per (siteId, role) has it

## Server helpers — `src/portal/server/pages.ts`

```ts
listVariantsForPortal(siteId: string, role: PortalRole): EditorPage[]
  // returns all pages for the role, sorted with active first

getActivePortalVariant(siteId: string, role: PortalRole): EditorPage | null
  // returns the single active variant or null

setActivePortalVariant(siteId: string, role: PortalRole, pageId: string | null): boolean
  // singleton enforcement: first pass clears isActivePortal on all variants
  // of the role, second pass sets it on the chosen one (or clears all if null)
```

(Lines 148-190 in `pages.ts`.)

## Admin UI — `/admin/portals/page.tsx`

Tabbed by role. The `ROLES` array (lines 30-70) defines metadata:
- `id` — PortalRole
- `label` — display name
- `eyebrow` / `description` — help text
- `defaultPath` — variant slug prefix (`/portal/login`, etc.)
- `publicHref` — where customers see active variant (`/account`, `/affiliates`, etc.)

For each role, the page lists every variant with:
- **Make active** — calls `setActivePortalVariant(siteId, role, pageId)`
- **Edit in editor** — deep-links `/admin/editor?page=<pageId>`
- **Duplicate** — server-side copy
- **Delete** — DELETE endpoint
- **View live ↗** — opens `publicHref` (only for active variant)
- **Preview ↗** — opens `/admin/portals/preview/<id>` (works for any variant)

Tab strip shows a cyan dot when that role has an active variant.

The active-by-role map (lines 95-97, 113-124) reloads whenever pages change.

## Starter trees — `src/lib/admin/portalStarters.ts`

When creating a variant, `starterForRole(role)` returns a pre-filled `Block[]`
so operators don't start blank. Each block gets a deterministic id for clean
diffs.

| role | starter blocks |
|------|----------------|
| `login` | Section → Heading + Text + LoginFormBlock (action: `/api/auth/login`) |
| `affiliates` | Section → Heading + StatsBar + LoginFormBlock (signup-href customised) |
| `orders` | Section → Heading + Text + Banner (support CTA). The route's default fallback renders the actual order data when this variant has no orders-list block. |
| `account` | Section → Heading + CardGrid (Orders, Profile, Affiliates, Preferences) |

## Preview route — `/admin/portals/preview/[id]/page.tsx`

Renders any variant with the storefront chrome (Navbar + Footer) but with a
sticky cyan banner indicating "Previewing variant". Fetches via `getPage(siteId, id)`.

Works for unsaved drafts, inactive variants, and active variants. Lets
operators A/B between candidates without flipping the live one.

## Customer-facing consumption

Each public route resolves via:

```ts
const variant = await getActivePortalVariant(site.id, role);
const renderableBlocks = variant?.publishedBlocks ?? variant?.blocks ?? [];
const useVariant = variant && renderableBlocks.length > 0;
```

**Empty-variant safety fallback**: if no variant exists, or it's empty (no
blocks), or it has only drafts (no `publishedBlocks`), render the route's
built-in default page. Prevents the public route going blank when an
operator accidentally activates an empty variant.

| route | role | active variant renders | fallback |
|-------|------|------------------------|----------|
| `/account` (logged out) | login | `<BlockRenderer>` of variant | `<AuthForm>` + `LoginCustomisation` form |
| `/affiliates` | affiliates | `<BlockRenderer>` of variant | `<DefaultAffiliatesLanding>` |
| `/account/orders` (index) | orders | `<BlockRenderer>` of variant | live orders list |
| `/account` (logged in) | account | `<BlockRenderer>` of variant | dashboard with tabs |

## Bridge with legacy form-based fallback

`/admin/customise → Login` tab now shows a "New" callout pointing operators at
`/admin/portals?role=login` for full block-tree control. The form-based
fallback fields (`LoginCustomisation`) are preserved for the no-variant case.
