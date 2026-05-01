# Ker-v3 — App Status

> Last updated: 2026-05-01

## Overview

**Luv & Ker** is a Ghanaian heritage skincare e-commerce store built on Next.js 15 (App Router), Tailwind CSS v4, and a localStorage-backed data layer. The goal is a fully headless, multi-site commerce platform — we're roughly at Phase 4 of 7.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + CSS variable runtime theming |
| Data | localStorage (no DB yet — see constraints) |
| Auth | Custom session system (`src/lib/auth.ts`) |
| Fonts | Google Fonts via ThemeInjector |
| Portal API | `/api/portal/*` (Node.js HTTP, typed client) |

---

## Shipped Features

### Storefront
- Product catalogue (static seed, slugs, variants)
- Cart (context-backed, persists to localStorage)
- Checkout flow
- Customer account page with login/register
- Discount popup (4 trigger modes: delay, scroll, exit-intent, always)
- A/B test runner (`ABTestRunner`)
- Chatbot (`ChatBot`, feature-gated)
- Purple side scroller (feature-gated)
- Preview bar for draft content

### Admin Panel (`/admin`)
| Page | Status |
|---|---|
| Dashboard | ✅ Live |
| Orders | ✅ Live — list + status changes |
| Customers | ✅ Live — list + detail panel |
| Products | ✅ Live — list + editor |
| Marketing | ✅ Live |
| Website / Content | ✅ Live |
| Blog | ✅ Live |
| Pages | ✅ Live |
| Theme editor | ✅ Live — colors, typography, backgrounds, animations, border radius |
| Theme variants | ✅ Live — dark, light, midnight, sand + custom |
| Feature flags | ✅ Live — per-user overrides |
| Shipping | ✅ Live |
| Split testing | ✅ Live |
| Funnels | ✅ Live |
| Reviews | ✅ Live |
| Inventory | ✅ Live |
| Team | ✅ Live |
| Support | ✅ Live |
| Settings | ✅ Live |
| Customise (login) | ✅ Live — 3 layouts, custom copy, CSS injection |
| Tooltips editor | ✅ Live — override any tooltip text in the UI |
| Activity log | ✅ Live — capped 500 entries, per-category |
| Sites manager | ✅ Live — CRUD, domains, theme variant per site |
| Popup editor | ✅ Live — trigger, copy, visibility, path targeting |
| Custom tabs | ✅ Live — embed external URLs in sidebar |
| Command palette | ✅ Live — Cmd+K, fuzzy match, nav + customers + orders + products |

### Multi-Site Support
- Register multiple storefronts (e.g. luvandker.com + felicia.com)
- Each site maps to multiple domains; one primary domain shown in the UI
- `resolveSiteByHost()` routes any hostname to the correct site
- Per-site theme variant — each storefront can have its own look
- Per-admin active site — each admin's selected site is independent
- `SiteResolver` sets `<html data-site="…">` + `window.__site` on every page load

### Portal Layer (`src/portal/`)
- `ecommerce/` — orders, inventory, customers, products, collections, reviews, shipping, stats, discounts, gift cards, referral codes
- `website/` — content, pages, blog, sections, theme, theme variants, popup, login customisation, consent
- `auth/` — auth + team management
- `operate/` — feature flags, activity, tooltips, admin config, marketing, sites
- `client.ts` — `PortalClient` typed HTTP client (`health()`, `listProducts()`, `getProduct()`)
- `/api/portal/health` — capability map
- `/api/portal/products` — GET with range/format/includeHidden filters

---

## Architecture

```
src/
├── app/                  Next.js App Router pages
│   ├── admin/            All admin pages
│   └── api/portal/       Headless Portal API endpoints
├── components/           Shared UI components
│   └── admin/            Admin-only components
├── context/              React context (Cart)
├── lib/
│   └── admin/            Data layer modules (localStorage)
└── portal/               Re-export aggregator for headless extraction
    ├── ecommerce/
    ├── website/
    ├── auth/
    ├── operate/
    ├── index.ts
    └── client.ts
```

---

## Known Constraints

- **No database.** All data lives in `localStorage`. This is intentional for now — the portal layer is being built first so a DB swap is a single-layer change.
- **Single-tenant data.** Content (blog, pages, popup, login customisation) is not yet scoped per-site. Adding `_${siteId}` key suffixes is the planned migration path.
- **No server-side persistence.** Orders, customers, and products created in the admin do not survive a fresh browser session (except the static product seed).
- **Product catalogue is static seed.** `getProducts()` returns a hardcoded list; no admin product-create flow yet writes back to a persistent store.

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | Admin panel hardening (activity, tooltips, popup, command palette) | ✅ Done |
| 2 | Login customisation + customer detail panel | ✅ Done |
| 3 | Portal folder architecture | ✅ Done |
| 4 | Portal HTTP API + typed client + multi-site | ✅ Done |
| 5 | Admin panel as standalone deployable app | 🔲 Not started |
| 6 | Git-backed content publishing | 🔲 Not started |
| 7 | Full headless completion (DB, real API, webhooks) | 🔲 Not started |

### Immediate next steps (pre-Phase 5)
- Scope content keys per-site (`popup`, `loginCustomisation`, `pages`, `blog`)
- Product create/edit writes to persistent (non-seed) store
- Orders and customers survive page reload (IndexedDB or server route)

---

## Impersonation / Preview

- Admins can impersonate any customer via the customer detail panel → **Preview as customer**
- `ImpersonationBar` is always mounted and shows a banner + exit button when active
- Draft content preview via `PreviewBar` (toggled in the content editor)
