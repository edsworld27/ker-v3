# Aqua

Plugin-driven multi-tenant platform for spinning up client portals fast.

One repo, many tenants. Each client gets their own org with isolated branding,
sites, settings, and a marketplace of plugins to install or remove. Felicia's
storefront ([Luv & Ker](https://luvandker.com)) is the first portal running on
top — see the `/p/[slug]` and `/admin` routes for the customer-facing and
operator-facing surfaces.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Default opens to Felicia's storefront. Other entry points:

| Route | What it is |
|---|---|
| `/`                          | Felicia's storefront |
| `/admin`                     | Per-tenant admin (org-aware) |
| `/aqua`                      | Agency dashboard (multi-tenant overview) |
| `/aqua/<orgId>/marketplace`  | Plugin browser per org |
| `/login`                     | Operator sign-in |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind ·
Stripe checkout + webhooks · Anthropic SDK (audit reports) · cloud-routable
storage backend (file / KV / Supabase / Postgres).

## Structure

```
src/
  app/                  – routes
    (storefront)        – Felicia's site (/, /shop, /blog, /help, …)
    admin/              – per-tenant operator panel
    aqua/               – agency-level marketplace + new-org flow
    api/portal/         – plugin + tenant API
  plugins/              – 33 plugin manifests + shared registry / runtime
  portal/server/        – server modules (orders, email, analytics, …)
  components/           – shared UI + 57 editor blocks
  lib/                  – client-side helpers
public/                 – static assets served at URL root
media-storage/          – tidy bucket for non-served images
                         (felicia/, aqua/, misc/)
```

## Plans + state

See [CLAUDE.md](./CLAUDE.md) for the architecture deep-dive, where we
are, and what's next.

## Deploy

Pushed to `main` → Vercel auto-deploys. Set
`NEXT_PUBLIC_PORTAL_SECURITY=true` in the Vercel project to lock the
admin behind credentials in production. Plugin-specific secrets
(Stripe, Resend, Anthropic, etc.) are configured via the marketplace
setup wizards on a per-org basis.
