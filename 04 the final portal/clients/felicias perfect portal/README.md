# Felicia's Perfect Portal — Reference Snapshot

A frozen, file-level snapshot of Felicia's website (Luv & Ker · Odo by
Felicia) at the point we shipped it. **Do not edit files in this folder
during normal development** — this is a reference copy for future
portal work.

## Why it exists

When Felicia's standalone repo (`felicias-final-website`) was published,
the `/account` login surface was swapped for a placeholder iframe to
google.com pending the real portal embed. This folder preserves the
original working login UI (email/password + Google sign-in + admin
access link) so we always have a reference of how the "perfect" portal
should behave.

## What's preserved

- Full `src/` tree — storefront pages, customer account flows, admin
  shell, plugin runtime, visual editor, all 33 plugins.
- Original `src/app/account/page.tsx` with the **AuthForm + Admin
  Access** button intact (this is the bit the live Felicia repo
  replaced with the iframe).
- All public assets, Tailwind theme, `portal.config.ts` schema.

## How to view the live login at this state

The same login UI is mirrored in the ker-v3 dev server at:

```
/felicias-login
```

Navigate there with `npm run dev` running and you'll see the original
working login page (Navbar + AuthForm + Admin Access link + Footer),
exactly as it worked before the iframe swap.

## Do not run from this folder

This is a file reference only. Do not `npm install` or boot a Next.js
dev server inside `felicias perfect portal/` — the routes won't pick
up here, and any local edits could drift from the canonical `src/`
tree at the repo root.
