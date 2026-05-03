# Aqua agency dashboard (`02 felicias aqua portal work/src/app/aqua/`)

The cross-client agency surface — distinct from `/admin` (per-tenant
operator panel). Used by the agency owner to manage every client portal
in one place.

> Source: agent 2 sweep of `02 felicias aqua portal work/src/app/aqua/`.

## Route catalogue

| Route | File | Purpose |
|-------|------|---------|
| `/aqua` | `src/app/aqua/page.tsx` | Agency dashboard. Lists every client portal as a card; portfolio summary (active / trialing / total sites). |
| `/aqua/new` | `src/app/aqua/new/page.tsx` | New-portal flow. Preset selection + org name/slug/branding form. Creates org + first site. |
| `/aqua/example` | (seeded; reachable from `/aqua` link) | Demo "Example Co." portal pre-loaded with shop, homepage, sample product. |
| `/aqua/felicia` | `src/app/aqua/felicia/page.tsx` | Felicia-specific page (branded agency section). |
| `/aqua/[orgId]` | `src/app/aqua/[orgId]/page.tsx` | Per-org detail (likely redirects to marketplace or configure). |
| `/aqua/[orgId]/marketplace` | `src/app/aqua/[orgId]/marketplace/page.tsx` | Plugin install/configure scoped to that org (same UI as `/admin/marketplace`). |
| `/aqua/[orgId]/plugins/[pluginId]` | `src/app/aqua/[orgId]/plugins/[pluginId]/page.tsx` | Plugin detail / settings page for the org. |
| `/aqua/[orgId]/configure` | `src/app/aqua/[orgId]/configure/page.tsx` | Org-level settings (name, branding, team). |
| `/aqua/support` | `src/app/aqua/support/page.tsx` | Agency support hub. |
| `/aqua/support/billing` | `src/app/aqua/support/billing/page.tsx` | Agency billing / subscription info. |
| `/aqua/support/book-meeting` | `src/app/aqua/support/book-meeting/page.tsx` | Schedule support call. |
| `/aqua/support/feature-requests` | `src/app/aqua/support/feature-requests/page.tsx` | Submit feature requests. |
| `/aqua/support/resources` | `src/app/aqua/support/resources/page.tsx` | Documentation, tutorials, API reference. |

## Org-creation flow

```
operator clicks "+ New portal" on /aqua
  → /aqua/new loads preset list from GET /api/portal/presets
  → operator picks preset (empty / website / e-commerce / blog / SaaS / …)
  → fills form: org name (auto-slugged) · owner email · brand color · domain · logo URL
  → submit → POST /api/portal/orgs with the preset id
    → server applies the preset (installs the bundle of plugins)
    → returns the new org
  → client creates a site for the org (`createSite()`)
  → both org + site set active
  → redirect to /aqua/<orgId>/marketplace
  → operator installs/configures further plugins
  → "Open portal" → drops into /admin as that tenant
```

The presets list (16 in total per `_presets.ts`) covers: Empty / Website /
E-commerce (physical · digital · hybrid) / Blog / Marketing / SaaS /
Subscription SaaS / Charity / Bookings / Membership / Agency.

## Relationship to `/admin`

- `/aqua/<orgId>/marketplace` and `/admin/marketplace` use the same shared
  `<PluginMarketplace orgId>` component — install / configure / disable /
  uninstall flow is identical.
- The agency owner toggles between surfaces via the org switcher in the
  topbar: `/aqua` for the cross-client overview, `/admin?org=<id>` to
  drop into a specific tenant's panel.
- Setup wizards run for plugins that declare them (Stripe keys, Resend
  key, GitHub PAT, etc.) before installation completes.
