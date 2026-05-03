# T1 — Foundation Architect

You are Terminal 1 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/` inside the ker-v3 monorepo. Your role is the
foundation. The other two terminals are porting pre-vetted plugins
(website-editor and ecommerce) in parallel. They depend on the foundation
contract you produce.

## Your goal

Stand up `04 the final portal/portal/` as a fresh Next.js 16 + React 19 app
with the plugin platform from `02 felicias aqua portal work/` lifted in.
The shell should boot and serve a basic operator login + dashboard.
Plugin runtime ready to mount future plugins (T2's website-editor, T3's
ecommerce, eventually a `fulfillment` plugin).

## Coordination — read these first

In order:
1. `01 development/CLAUDE.md` — project directives.
2. `01 development/context/MASTER.md` — context tree contents page.
3. `01 development/context/prior research/aqua-plugin-system.md` — the
   plugin contract you're lifting.
4. `01 development/context/prior research/aqua-server-modules.md` — server
   modules; copy storage + eventBus + orgs at minimum.
5. `01 development/context/prior research/aqua-auth-middleware.md` — auth
   model to lift.
6. `01 development/context/prior research/old-portal-roles-tenancy.md` —
   the role hierarchy + multi-tenancy from `03` you're adopting.
7. `01 development/context/prior research/concepts-to-port.md` — the
   shopping list of what to lift vs recreate.
8. `01 development/eds requirments.md` if non-empty.

## Scope of work

Inside `04 the final portal/portal/` create:

```
portal/
├── package.json                next, react, react-dom (no other deps yet)
├── next.config.ts              CSP + HSTS + X-Content-Type-Options + Permissions-Policy from 02
├── tsconfig.json               strict (no ignoreBuildErrors)
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.example                document required env vars
├── src/
│   ├── app/
│   │   ├── layout.tsx          root layout (no CartProvider — keep minimal)
│   │   ├── page.tsx            public landing → "Sign in"
│   │   ├── globals.css
│   │   ├── login/page.tsx      operator login (lift simplified version from 02/src/app/login)
│   │   ├── api/
│   │   │   ├── auth/{login,logout,me,dev}/route.ts
│   │   │   └── portal/orgs/route.ts (list + create)
│   │   └── portal/             operator workspace (auth-gated)
│   │       ├── layout.tsx      sidebar + topbar + content slot
│   │       ├── page.tsx        landing → operator dashboard
│   │       └── (placeholder routes for marketplace, settings, team)
│   ├── plugins/                lifted from 02/src/plugins/
│   │   ├── _types.ts
│   │   ├── _registry.ts        keep array empty for now (T2 + T3 will add their plugins)
│   │   ├── _runtime.ts
│   │   ├── _presets.ts         keep array empty for now
│   │   ├── _pathMapping.ts
│   │   └── _validate.ts
│   ├── portal/server/
│   │   ├── storage.ts          file backend for dev, KV-ready
│   │   ├── eventBus.ts
│   │   ├── orgs.ts
│   │   ├── users.ts            scrypt + timing-safe + dummy-hash
│   │   ├── _types.ts
│   │   └── (deliberately minimal — other modules added when plugins need them)
│   ├── lib/server/
│   │   ├── auth.ts             HMAC-signed cookie + requireAdmin / requireRole
│   │   └── rateLimit.ts        per-IP + per-email
│   ├── lib/admin/
│   │   ├── sidebarLayout.ts    DEFAULT_LAYOUT + applyPluginContributions
│   │   └── installedPlugins.ts per-org install cache
│   ├── components/
│   │   ├── PluginRequired.tsx
│   │   └── PluginPageScaffold.tsx
│   └── middleware.ts           gate /portal/* on session cookie
└── README.md                   how to run + env vars
```

## Role hierarchy — extend `02`'s admin/operator model

In `lib/server/auth.ts`, define:

```ts
export type Role =
  | 'agency-owner'
  | 'agency-manager'
  | 'agency-staff'
  | 'client-owner'
  | 'client-staff'
  | 'freelancer'
  | 'end-customer';

export const ROLE_PRODUCT_MAP: Record<Role, ProductSurface[]> = {
  'agency-owner':   ['portal', 'agency', 'client-admin', 'storefront'],
  'agency-manager': ['portal', 'agency', 'client-admin'],
  'agency-staff':   ['portal', 'client-admin'],
  'client-owner':   ['client-admin', 'storefront'],
  'client-staff':   ['client-admin'],
  'freelancer':     ['fulfillment'],
  'end-customer':   ['storefront'],
};
```

`requireRole(role | role[])` helper that throws 403 if user's role isn't in the allowed set. Wire to the `/api/portal/*` routes.

## URL surface

```
/                          public marketing page (placeholder for now)
/login                     operator login (any role)
/portal                    role-aware home
/portal/agency/*           agency-internal (only agency-owner/manager/staff)
/portal/clients            client list (agency-staff sees only assigned)
/portal/clients/[orgId]/*  per-client admin scope
```

(For now, only stubs for `/portal/agency/*` — T2 / T3 plugins will land into the per-client scope later.)

## NOT in scope

- Don't port the website editor (T2's job).
- Don't port ecommerce (T3's job).
- Don't lift the visual-editor blocks library (T2 brings it).
- Don't add Stripe / Resend / S3 yet — minimal dependency footprint.
- Don't build the fulfillment plugin yet (next round).
- Don't write any plugin manifests inside `_registry.ts` — leave it empty.
  T2 + T3 will land their plugins in subsequent commits.
- Don't run `npm install` outside the new portal folder (don't touch
  `02 felicias aqua portal work/`).

## When done

1. Run `cd "04 the final portal/portal" && npm install && npm run dev`.
   Confirm it serves HTTP 200 on `/` and `/login`.
2. Confirm `tsc --noEmit` passes (no `ignoreBuildErrors`).
3. Add `01 development/context/prior research/04-foundation.md`
   documenting:
   - The folder layout you produced
   - Role hierarchy + role gating implementation
   - URL surface
   - The plugin contract surface (what T2 and T3 need to know to land plugins on top)
   - Any deviations from the brief, with reasoning
4. Add a row to `01 development/context/MASTER.md` for that new chapter.
5. Update `01 development/tasks.md` (mark T1 done, add follow-ups).
6. Commit + push:
   ```
   git -c commit.gpgsign=false commit -m "T1 foundation — 04 the final portal scaffold
   ...
   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
   ```

## If you get stuck

- The agent's output goes into the dev folder, not back to me directly.
- If you run into an architectural fork that can't be resolved without
  Ed, write your question into `01 development/tasks.md` under a
  "Blocked / needs Ed" section and stop. Don't guess.

Be terse in your output to Ed. Long-form decisions go in the chapter file,
not the chat.
