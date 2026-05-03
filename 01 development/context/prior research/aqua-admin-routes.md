# Aqua admin routes (`02 felicias aqua portal work/src/app/admin/`)

The per-tenant operator panel. ~70 distinct route destinations grouped by
functional domain. Each plugin can contribute new routes via its manifest;
core routes live unconditionally.

> Source: agent 2 sweep of `02 felicias aqua portal work/src/app/admin/`.

## Route catalogue

| Route | File | Purpose | Plugin | Status |
|-------|------|---------|--------|--------|
| `/admin` | `src/app/admin/page.tsx` | Dashboard overview — 30d KPIs, recent orders, top products, revenue chart, source breakdown | core | full |
| `/admin/marketplace` | `src/app/admin/marketplace/page.tsx` | Per-tenant plugin install/configure/disable UI (mirrors `/aqua/[orgId]/marketplace`) | core | full |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Integrations overview (GitHub, Stripe, email provider status) | core | view + patch |
| `/admin/customise` | `src/app/admin/customise/page.tsx` | Brand kit editor (logo, colors, accent, fonts) | branding | full |
| `/admin/editor` | `src/app/admin/editor/page.tsx` | Visual page builder — Live · Block · Code modes | site-editor | full |
| `/admin/pages` + `/admin/pages/[id]` | `src/app/admin/pages/...` | Page list + detail; publish/discard drafts | site-editor | full |
| `/admin/blog` + `/admin/blog/[id]` | `src/app/admin/blog/...` | Post list + markdown/WYSIWYG editor | blog | full |
| `/admin/faq` | `src/app/admin/faq/page.tsx` | FAQ section CRUD | faq | full |
| `/admin/help` | `src/app/admin/help/page.tsx` | Help topics / KB portal | help | full |
| `/admin/wiki` + `/admin/wiki/history` | `src/app/admin/wiki/...` | Wiki list + revision history | wiki | full / view |
| `/admin/forum` + `/admin/forum/categories` + `/admin/forum/moderation` | `src/app/admin/forum/...` | Forum mod dashboard, categories, flag/ban | forum | view + moderate |
| `/admin/kb` + `/admin/kb/categories` | `src/app/admin/kb/...` | KB articles + categories | knowledge-base | full |
| `/admin/products` + `/admin/products/new` + `/admin/products/[slug]` + `/admin/products/[slug]/variants` | `src/app/admin/products/...` | Catalogue list, create, detail editor, variants CRUD | ecommerce | full |
| `/admin/collections` | `src/app/admin/collections/page.tsx` | Group products into collections | ecommerce | full |
| `/admin/orders` + `/admin/orders/[id]` + `/admin/orders/[id]/receipt` | `src/app/admin/orders/...` | Orders list, detail, printable receipt | ecommerce | view + update |
| `/admin/customers` + `/admin/customers/[email]` | `src/app/admin/customers/...` | Customer list + profile (orders, LTV, tags) | ecommerce | view + tag |
| `/admin/affiliates` + `/admin/affiliates/stats` + `/admin/affiliates/payouts` | `src/app/admin/affiliates/...` | Affiliate dashboard, conversion tracking, payout schedule | affiliates | full |
| `/admin/memberships` + `/admin/memberships/tiers` + `/admin/memberships/members` | `src/app/admin/memberships/...` | Membership program, tier CRUD, member list | memberships | full |
| `/admin/donations` + `/admin/donations/donors` + `/admin/donations/goals` | `src/app/admin/donations/...` | Donation dashboard, donor list, campaign goals | donations | full |
| `/admin/reservations` + `/admin/reservations/{calendar,services,staff,resources,external}` | `src/app/admin/reservations/...` | Booking system: calendar, service defs, staff, resources, iCal sync | reservations | full |
| `/admin/subscriptions` + `/admin/subscriptions/plans` | `src/app/admin/subscriptions/...` | Recurring subs + billing-plan editor | subscriptions | view + manage |
| `/admin/livechat` + `/admin/livechat/canned` | `src/app/admin/livechat/...` | Live chat queue + canned responses | livechat | view + respond |
| `/admin/reviews-v2` / `/admin/reviews` | `src/app/admin/reviews{,-v2}/page.tsx` | Product review moderation (v2 + legacy) | reviews | moderate |
| `/admin/email` | `src/app/admin/email/page.tsx` | Campaign / broadcast / template builder | email | full |
| `/admin/webhooks` + `/admin/webhooks/log` | `src/app/admin/webhooks/...` | Endpoint list + delivery log/retry | webhooks | full |
| `/admin/automation` + `/admin/automation/runs` | `src/app/admin/automation/...` | Trigger/action rule builder + execution history | automation | full |
| `/admin/funnels` | `src/app/admin/funnels/page.tsx` | Sales funnel builder + tracking | funnels | full |
| `/admin/split-test` + `/admin/split-tests` | `src/app/admin/split-test{,s}/...` | A/B test create + list/archive/results | split-test | full |
| `/admin/analytics` | `src/app/admin/analytics/page.tsx` | Traffic / conversion / revenue dashboard | analytics | view |
| `/admin/crm` + `/admin/crm/{contacts,deals,tasks}` | `src/app/admin/crm/...` | CRM dashboard, contacts, deal pipeline, tasks | crm | full |
| `/admin/team` | `src/app/admin/team/page.tsx` | Team member list + role permissions | team | full |
| `/admin/sites` + `/admin/sites/[siteId]` + `/admin/sites/[siteId]/pages` + `/admin/sites/[siteId]/editor/[pageId]` | `src/app/admin/sites/...` | Multi-site selector, site settings, scoped pages list, scoped editor | core | full |
| `/admin/orgs` | `src/app/admin/orgs/page.tsx` | Manage organization list (admin/agency view) | core | full |
| `/admin/portals` + `/admin/portals/preview/[id]` | `src/app/admin/portals/...` | Multi-portal view + live preview | core | view |
| `/admin/theme` + `/admin/themes` | `src/app/admin/theme{,s}/page.tsx` | Theme selector + library/upload | themes | view + edit |
| `/admin/assets` | `src/app/admin/assets/page.tsx` | Media library / CDN file manager | assets | full |
| `/admin/sections` | `src/app/admin/sections/page.tsx` | Reusable page sections | sections | full |
| `/admin/popup` | `src/app/admin/popup/page.tsx` | Popup / modal builder | popups | full |
| `/admin/website` + `/admin/website/[pageId]` + `/admin/website/media` | `src/app/admin/website/...` | Legacy site editor + page editor + media gallery | site-editor | full |
| `/admin/auditlog` | `src/app/admin/auditlog/page.tsx` | Audit trail (who, what, when) | compliance | view |
| `/admin/compliance` | `src/app/admin/compliance/page.tsx` | GDPR export / deletion / retention policies | compliance | manage |
| `/admin/backups` + `/admin/backups/restore` | `src/app/admin/backups/...` | Backup list / download / schedule + restore UI | backups | view + restore |
| `/admin/notifications` + `/admin/notifications/preferences` | `src/app/admin/notifications/...` | Notification overview + granular per-event prefs | notifications | view + edit |
| `/admin/i18n` + `/admin/i18n/locales` | `src/app/admin/i18n/...` | i18n config + locale CRUD | i18n | full |
| `/admin/billing` | `src/app/admin/billing/page.tsx` | Usage, invoices, plan (Stripe customer portal link) | billing | view |
| `/admin/activity` | `src/app/admin/activity/page.tsx` | Recent action feed (orders, publishes, etc.) | core | view |
| `/admin/repo` | `src/app/admin/repo/page.tsx` | GitHub repo browser; commit, file tree | repo | view + commit |
| `/admin/seo` | `src/app/admin/seo/page.tsx` | SEO audit; meta tag checker, sitemap | seo | view |
| `/admin/shipping` | `src/app/admin/shipping/page.tsx` | Shipping method + carrier config | shipping | full |
| `/admin/inventory` | `src/app/admin/inventory/page.tsx` | Stock-level management | inventory | full |
| `/admin/marketing` | `src/app/admin/marketing/page.tsx` | UTM tracking, referral links, discount codes | marketing | full |
| `/admin/features` | `src/app/admin/features/page.tsx` | Feature flag overview | core | view |
| `/admin/site-test` | `src/app/admin/site-test/page.tsx` | Site health check / smoke test results | core | view |
| `/admin/support` + `/admin/support/[id]` | `src/app/admin/support/...` | Support ticket list + detail (respond, close) | support | full |
| `/admin/plugin-health` | `src/app/admin/plugin-health/page.tsx` | Plugin status, errors, logs | core | view |
| `/admin/dashboards` | `src/app/admin/dashboards/page.tsx` | Custom dashboard builder | dashboards | full |
| `/admin/portal-settings` + `/admin/portal-settings/plugin-authoring` | `src/app/admin/portal-settings/...` | GitHub integration, webhook secret, API key + local plugin authoring mode | core | full |
| `/admin/tab/[id]` | `src/app/admin/tab/[id]/page.tsx` | Custom iframe tab (embedded external app) | core | view |
| `/admin/tooltips` | `src/app/admin/tooltips/page.tsx` | UI tooltip / help text customisation | core | full |

## Shared admin chrome

- **`<AdminTabs>`** — top-level section tabs (e.g. MARKETPLACE_TABS on `/admin/marketplace`, SETTINGS_TABS on `/admin/settings`). Defined in `src/lib/admin/tabSets.ts`.
- **`<PluginPageScaffold>`** — wraps plugin-contributed pages; renders setup checklist if not installed.
- **`<PluginRequired plugin="x" feature="y">`** — guards a route; shows install/upgrade empty state when the plugin isn't active.
- **`<SetupChecklist>`** — first-run onboarding card on the dashboard; links to marketplace, product creation, editor, GitHub.
- **`<HelpButton>` (Ask Aqua)** — floating AI assistant on every admin page (Claude Opus 4.7 grounded in `src/lib/admin/helpDocs.ts`).
- **Cmd+K command palette** — searches help docs, customers, orders, products.
- **Topbar** — org switcher, site switcher, session user, notification bell, theme toggle.
- **Sidebar** — built dynamically from `getSidebarLayout()` + `applyPluginContributions()`. Plugins inject nav items via their manifests' `navItems[]` (with optional `panelId` and `groupId`).

## Conventions

- Every plugin nav item lands on a real page; no 404s. Newer scaffolds use `<PluginPageScaffold>` for consistent chrome.
- Detail pages (e.g. `/admin/products/[slug]`) typically expose a tab strip linking to sibling detail surfaces (`/variants`, etc.).
- `friendlyError(code, fallback)` (`src/lib/admin/friendlyError.ts`) translates API error codes to operator-readable strings on 12+ surfaces.
- `tip` props on `Field` helpers render `<Tip>` nodes next to labels for inline help on high-traffic pages.
