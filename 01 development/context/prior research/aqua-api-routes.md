# Aqua API surface (`02 felicias aqua portal work/src/app/api/`)

Every HTTP endpoint in the Aqua app, grouped by area. Most live under
`/api/portal/*`. The `/api/auth/*` group mints/clears sessions; `/api/admin/*`
hosts admin-only utilities; `/api/stripe/*` handles checkout + billing
webhooks; `/api/og/*` serves OG images.

> Source: agent 2 sweep of `02 felicias aqua portal work/src/app/api/`.

## /api/auth

| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/auth/login` | POST | Email + password → sets httpOnly session cookie; supports first-run bootstrap (empty user table) | Public; rate-limited (10/min/IP, 5/min/email) |
| `/api/auth/logout` | POST | Clears session cookie | Authenticated |
| `/api/auth/me` | GET | Returns current user (email, name, role, mustChangePassword) | Authenticated |
| `/api/auth/change-password` | POST | Update password; validates strength | Authenticated |
| `/api/auth/dev` | GET (dev only) | Dev bypass; signs session without creds | Dev only |

## /api/admin

| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/admin/export-code` | POST | Export portal code (HTML/CSS/JS) as zip | requireAdmin |
| `/api/admin/fonts` | GET | List available web fonts | Public |

## /api/portal — by feature

### Orgs + plugin management
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/orgs` | GET, POST | List orgs / create new org (applies preset) | requireAdmin |
| `/api/portal/orgs/[orgId]` | GET, PATCH, DELETE | Org detail / update / delete | requireAdmin |
| `/api/portal/orgs/[orgId]/plugins` | GET, POST | List installed plugins / install plugin | requireAdmin |
| `/api/portal/orgs/[orgId]/plugins/[pluginId]` | PATCH, DELETE | Update plugin settings / uninstall | requireAdmin |
| `/api/portal/orgs/[orgId]/presets` | GET | Presets applicable to org | requireAdmin |
| `/api/portal/plugins` | GET | All plugins in registry | Public |
| `/api/portal/presets` | GET | All preset bundles | Public |

### Content + pages
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/pages/[siteId]` | GET, POST | List pages / create | requireAdmin |
| `/api/portal/pages/[siteId]/[pageId]` | GET, PATCH, DELETE | Page detail / update / delete | requireAdmin |
| `/api/portal/pages/[siteId]/[pageId]/publish` | POST | Publish page to production | requireAdmin |
| `/api/portal/pages/[siteId]/[pageId]/revert` | POST | Revert to last published version | requireAdmin |
| `/api/portal/pages/[siteId]/by-slug` | GET | Fetch page by slug (storefront) | Public |
| `/api/portal/pages/[siteId]/portal-variants` | GET | Variant info for portal preview | Public |
| `/api/portal/content/[siteId]` | GET, PATCH | Site content tree / bulk update | requireAdmin |
| `/api/portal/content/[siteId]/publish` | POST | Publish all pending changes | requireAdmin |
| `/api/portal/content/[siteId]/discard` | POST | Discard all drafts | requireAdmin |
| `/api/portal/content/[siteId]/preview-token` | POST | Generate preview link token | requireAdmin |
| `/api/portal/content/[siteId]/revert` | POST | Snapshot rollback | requireAdmin |

### Products + e-commerce
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/products` | GET, POST | List / create | requireAdmin |
| `/api/portal/products/[slug]` | GET, PATCH, DELETE | Detail / update / delete | requireAdmin |
| `/api/portal/orders` | GET, POST | List / create (manual) | requireAdmin |
| `/api/portal/orders/[id]` | GET, PATCH, DELETE | Detail / update status / delete | requireAdmin |

### Affiliates + marketing
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/affiliates` | GET, POST | List / apply | requireAdmin + Public |
| `/api/portal/affiliates/[id]` | GET, PATCH, DELETE | Profile / update / remove | requireAdmin |
| `/api/portal/affiliates/apply` | POST | Customer applies to program | Public |
| `/api/portal/affiliates/stats` | GET | Conversion / commission / payout totals | requireAdmin |
| `/api/portal/affiliates/payouts` | GET, POST | Payout history / trigger payout | requireAdmin |
| `/api/portal/affiliates/track-click` | GET | Affiliate click pixel | Public; rate-limited |

### Memberships + subscriptions
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/memberships` | GET, POST | Program overview / create | requireAdmin |
| `/api/portal/memberships/tiers` | GET, POST | Tier list / create | requireAdmin |

### Donations
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/donations` | GET, POST | Campaigns / create | requireAdmin |
| `/api/donations/checkout` | POST | Donation checkout (Stripe) | Public |

### Email + comms
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/email` | GET, POST | Campaign list / create | requireAdmin |
| `/api/portal/email/templates` | GET, POST | Template library | requireAdmin |
| `/api/portal/email/send` | POST | Send email or batch | requireAdmin |
| `/api/portal/email/test` | POST | Send test email | requireAdmin |
| `/api/portal/email/log` | GET | Delivery history (opens, clicks, bounces) | requireAdmin |
| `/api/portal/newsletter/subscribe` | POST | Customer subscribes | Public |

### Webhooks + automation
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/webhooks` | GET, POST | List / create | requireAdmin |
| `/api/portal/webhooks/[id]` | PATCH, DELETE | Update / delete | requireAdmin |
| `/api/portal/webhooks/deliveries` | GET | Delivery log; filter, retry | requireAdmin |
| `/api/portal/automation/rules` | GET, POST | Rules list / create | requireAdmin |
| `/api/portal/automation/rules/[id]` | PATCH, DELETE | Update / delete | requireAdmin |

### Forms + contact
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/forms` | GET, POST | Form list / create | requireAdmin |
| `/api/portal/forms/submit` | POST | Customer submits form | Public |

### Analytics + tracking
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/analytics` | GET | Dashboard | requireAdmin |
| `/api/portal/analytics/[orgId]` | GET | Org-level analytics | requireAdmin |
| `/api/portal/analytics/track` | POST | Client-side event tracking | Public; rate-limited |

### KB + help
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/kb` | GET, POST | Article list / create | requireAdmin |
| `/api/portal/kb/[id]` | GET, PATCH, DELETE | Detail / update / delete | requireAdmin |
| `/api/portal/kb/[id]/publish` | POST | Publish | requireAdmin |
| `/api/portal/kb/categories` | GET, POST | Categories | requireAdmin |
| `/api/portal/help/ask` | POST | Query Ask Aqua AI panel | Authenticated |

### CRM + support
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/crm/contacts` | GET, POST | Contact list / create | requireAdmin |
| `/api/portal/crm/deals` | GET, POST | Deal list / create | requireAdmin |
| `/api/portal/crm/tasks` | GET, POST | Task list / create | requireAdmin |
| `/api/portal/support` | GET, POST | Ticket list / create | requireAdmin |
| `/api/portal/support/feature-requests` | GET, POST | Feature requests / submit | requireAdmin + Public |
| `/api/portal/support/feature-requests/[id]` | PATCH, DELETE | Update / delete | requireAdmin |
| `/api/portal/support/meetings` | GET, POST | Meeting list / book | requireAdmin + Public |
| `/api/portal/support/meetings/[id]` | GET, PATCH | Detail / update | requireAdmin |

### Links + redirects
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/links/[siteId]` | GET, POST | Short-link list / create (also `?check=1` for broken-link checker) | requireAdmin |
| `/api/portal/promote/[siteId]` | POST | Bundle → GitHub PR (publish flow) | requireAdmin |

### Themes + assets
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/themes` | GET, POST | Library / upload | requireAdmin |
| `/api/portal/themes/[siteId]` | GET, PATCH | Site theme / update | requireAdmin |
| `/api/portal/themes/[siteId]/[themeId]` | GET | Theme detail | requireAdmin |
| `/api/portal/assets` | GET, POST | Media library / upload | requireAdmin |
| `/api/portal/assets/[id]` | DELETE | Delete file | requireAdmin |
| `/api/portal/embed-theme/[siteId]` | GET | CSS for storefront embed | Public |

### Config + meta
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/config/[siteId]` | GET, PATCH | Site config (domain, SEO, favicon) | requireAdmin (PATCH) / Public (GET) |
| `/api/portal/settings` | GET, PATCH | Portal-wide settings (GitHub, Stripe) | requireAdmin |
| `/api/portal/health/[orgId]` | GET | Plugin health status | requireAdmin |
| `/api/portal/heartbeat` + `/heartbeats` | GET | Health check / multi-heartbeat | Public |
| `/api/portal/i18n` | GET, PATCH | Localisation config | requireAdmin |
| `/api/portal/schema/[siteId]` | GET | JSON schema for site content | Public |

### Backups + migration
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/backups` | GET, POST | Backup list / create on-demand | requireAdmin |
| `/api/portal/backups/[id]` | DELETE | Delete | requireAdmin |
| `/api/portal/backups/[id]/restore` | POST | Restore | requireAdmin |
| `/api/portal/migrate` | POST | Data migration / import | requireAdmin |

### Audit + compliance
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/audit/[siteId]` | GET | Audit log | requireAdmin |
| `/api/portal/audit/quota` | GET | Storage quota / usage | requireAdmin |
| `/api/portal/audit/report` | GET, POST | Generate report | requireAdmin |
| `/api/portal/audit/report/[id]` | GET | Report detail / download | requireAdmin |
| `/api/portal/compliance` | GET, PATCH | GDPR settings, retention | requireAdmin |

### Repos + code
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/repo/tree` | GET | GitHub file tree | requireAdmin |
| `/api/portal/repo/file` | GET, POST | Read / commit | requireAdmin |

### A/B testing + funnels
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/split-tests` | GET, POST | Test list / create | requireAdmin |
| `/api/portal/split-tests/[id]` | PATCH, DELETE | Update / delete | requireAdmin |
| `/api/portal/split-tests/[id]/results` | GET | Results, significance | requireAdmin |
| `/api/portal/split-tests/[id]/exposure` | POST | Log exposure | Public |
| `/api/portal/split-tests/[id]/conversion` | POST | Log conversion | Public |
| `/api/portal/funnels` | GET, POST | List / create | requireAdmin |
| `/api/portal/funnels/[id]` | PATCH, DELETE | Update / delete | requireAdmin |
| `/api/portal/funnels/[id]/stats` | GET | Conversion metrics | requireAdmin |

### Misc
| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/portal/activity` | GET, DELETE | Activity feed (mutating endpoints record events here) | requireAdmin |
| `/api/portal/chatbot/[siteId]` | GET, POST | Chatbot config / train | requireAdmin |
| `/api/portal/discoveries` | GET | Trending content / insights | Public |
| `/api/portal/dashboard/[orgId]` | GET | Org dashboard stats | requireAdmin |
| `/api/portal/domains/verify` | POST | Verify custom domain CNAME | requireAdmin |
| `/api/portal/example` | GET | Example portal seed data | Public |
| `/api/portal/inject-tag` | POST | Inject tracking tag into storefront | Public |
| `/api/portal/notifications/[id]` | PATCH | Dismiss notification | Authenticated |
| `/api/portal/search` | GET | Full-text search across content | Public |
| `/api/portal/setup-status` | GET | First-run checklist completion % | requireAdmin |
| `/api/portal/storage-info` | GET | Storage usage / quota | requireAdmin |
| `/api/portal/forum/categories` + `/api/portal/forum/topics` | GET, POST | Forum category / topic CRUD | requireAdmin + Public |

## /api/stripe

| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/stripe/webhook` | POST | Event handler (checkout.session.completed, charge.refunded) — persists orders + sends confirmation emails + emits events | Stripe signature verification |
| `/api/stripe/checkout` | POST | Create checkout session | Public |
| `/api/stripe/billing-portal` | POST | Redirect to Stripe customer portal (dual-mode customer + admin) | Authenticated |

## /api/og

| Endpoint | Methods | Purpose | Auth |
|----------|---------|---------|------|
| `/api/og/...` | GET | Open Graph image generator for social sharing | Public |

## Cross-cutting concerns

- **`requireAdmin()`** honours `NEXT_PUBLIC_PORTAL_DEV_BYPASS` so local prototyping is friction-free; production deploys must not set it.
- Public mutating endpoints (form submissions, newsletter, donation checkout, analytics ingest, affiliate click tracking) are rate-limited per-IP via `src/lib/server/rateLimit.ts`.
- The broken-link checker on `/api/portal/links/[siteId]?check=1` is admin-gated AND SSRF-guarded (blocks RFC1918, cloud metadata, IPv6-loopback).
- `recordAdminAction(actor, …)` is invoked from every mutating endpoint to populate `/admin/auditlog`.

## Middleware

`src/middleware.ts` is lightweight and edge-optimised. Behaviour by env var:

- `NEXT_PUBLIC_PORTAL_SECURITY=true` / `"strict"` — `/admin/*` requires the `lk_session_v1` cookie. Unsigned requests redirect to `/login?next=<original-path>`.
- Unset / `"dev"` / `"false"` / `"off"` — dev bypass; no auth required.
- Legacy: `NEXT_PUBLIC_PORTAL_DEV_BYPASS=1` also disables auth.

Full session validation (signature, expiry, role) happens server-side per API call via `getCurrentUser()` / `requireAdmin()`. Middleware only gates UX rendering of admin chrome. Matcher: `/admin/:path*`.
