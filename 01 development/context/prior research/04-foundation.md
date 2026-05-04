# `04 the final portal/portal/` — Foundation (T1)

The Round-1 foundation that T2 (fulfillment) and T3 (website-editor) ship
their plugin manifests against. Locks the chrome / plugin-runtime / auth
contracts so plugins land without any further negotiation.

> Built by T1 on 2026-05-04. Architecture source of truth:
> [04-architecture.md](04-architecture.md). When this chapter conflicts
> with the architecture, the architecture wins — flag the deviation in
> §"Deviations".

## 1. File tree (as built)

```
04 the final portal/portal/
├── package.json                 next 16.2.4 + react 19.2.4 + tailwind 4 (no other deps)
├── next.config.ts               security headers, turbopack.root pinned, no ignoreBuildErrors
├── tsconfig.json                strict, NO ignoreBuildErrors, paths {"@/*": "./src/*"}
├── tailwind.config.ts           brand-color CSS-var hooks
├── postcss.config.mjs
├── .env.example
├── .gitignore
└── src/
    ├── app/
    │   ├── layout.tsx           HTML shell + globals.css import
    │   ├── globals.css          tailwind base + default brand vars
    │   ├── page.tsx             public landing (Sign-in button)
    │   ├── login/
    │   │   ├── page.tsx
    │   │   └── LoginForm.tsx    "use client" — fetch /api/auth/login
    │   ├── embed/login/
    │   │   └── page.tsx         iframe-able · ?client=<id> for branding
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/route.ts    bootstraps first-run agency + owner
    │   │   │   ├── logout/route.ts   clears cookie · supports form POST
    │   │   │   └── me/route.ts
    │   │   └── tenants/seed/route.ts dev-only seed (Milesy + Felicia)
    │   └── portal/
    │       ├── layout.tsx       requires session → redirects to /login
    │       ├── page.tsx         role-aware redirect
    │       ├── agency/
    │       │   ├── layout.tsx   AGENCY_ROLES gate, agency brand chrome
    │       │   └── page.tsx     dashboard stub: clients + plugins
    │       ├── clients/
    │       │   ├── page.tsx     agency-side client list
    │       │   └── [clientId]/
    │       │       ├── layout.tsx   ALL_ROLES + tenant-scope match, client brand
    │       │       └── page.tsx     client home stub: phase + installed plugins
    │       └── customer/
    │           ├── layout.tsx   end-customer chrome, parent-client brand
    │           └── page.tsx     stub
    ├── plugins/                 (T2/T3 add their manifests here via _registry import)
    │   ├── _types.ts            AquaPlugin manifest contract
    │   ├── _registry.ts         empty PLUGINS array — T2/T3 add imports
    │   ├── _runtime.ts          install/uninstall/configure/applyPreset
    │   ├── _validate.ts         registration-time validator
    │   ├── _pathMapping.ts      /portal/agency/<plugin> + /portal/clients/<id>/<plugin>
    │   └── _presets.ts          empty (T2 owns phase presets)
    ├── server/
    │   ├── types.ts             Agency, Client, EndCustomer, Role, ServerUser,
    │   │                        SessionPayload, PluginInstall, PortalState
    │   ├── storage.ts           multi-backend: file (default), memory, kv stub, postgres stub
    │   ├── eventBus.ts          typed pub/sub, fire-and-forget
    │   ├── tenants.ts           three-level CRUD, every fn scoped by agencyId
    │   ├── users.ts             scrypt, role-aware createUser, timing-equalized verify
    │   ├── pluginInstalls.ts    composite-key install records
    │   ├── activity.ts          audit log (50k cap)
    │   └── phases.ts            read-only stub for T2
    ├── lib/
    │   ├── server/
    │   │   ├── auth.ts          HMAC cookie + getSession + requireRole + AuthError
    │   │   └── rateLimit.ts     in-memory token bucket
    │   └── chrome/
    │       ├── sidebarLayout.ts buildSidebar({role, scope, currentClient, installedPlugins})
    │       └── brandKit.ts      brandToStyleString → :root{--brand-…}
    ├── components/chrome/
    │   ├── Sidebar.tsx          server component, NavPanel[]-driven
    │   ├── Topbar.tsx           tenant title + role badge + sign-out
    │   └── ThemeInjector.tsx    `<style>` tag with CSS vars
    └── proxy.ts                 (Next 16: was `middleware.ts`) gates /portal/*,
                                 best-effort tenant-scope match on URL clientId
```

`npm run build` clean (no warnings). `npx tsc --noEmit` clean. `npm run dev`
serves HTTP 200 on `/`, `/login`, `/embed/login`, `/portal/agency` (with
session), `/portal/clients`, and 307 → `/login` on `/portal/*` without one.

## 2. Plugin contract surface (T2 + T3 must conform)

Every plugin is an `AquaPlugin` exported from
`04 the final portal/plugins/<id>/index.ts` and imported into
`portal/src/plugins/_registry.ts`'s `PLUGINS` array. Validator runs at
module load; malformed manifests are filtered out with a `console.error`.

### Required fields

```ts
import type { AquaPlugin } from "@/plugins/_types";

const fulfillment: AquaPlugin = {
  id: "fulfillment",                     // /^[a-z][a-z0-9-]*$/
  name: "Fulfillment",
  version: "0.1.0",                      // semver
  status: "alpha",                       // stable | beta | alpha
  category: "fulfillment",               // core | content | commerce | marketing | support | ops | fulfillment
  scopePolicy: "either",                 // client | agency | either   — NEW vs 02
  tagline: "Phase engine + checklist + briefs.",
  description: "...",

  // Deps + lifecycle (all optional)
  requires: [],
  conflicts: [],
  onInstall:   async (ctx, setupAnswers) => {},
  onUninstall: async (ctx) => {},
  onEnable:    async (ctx) => {},
  onDisable:   async (ctx) => {},
  onConfigure: async (ctx) => {},

  // Sidebar contributions
  navItems: [
    {
      id: "briefs", label: "Briefs",
      href: "/portal/agency/fulfillment/briefs",   // agency-scoped
      // OR for client-scoped:
      // href: "/portal/clients/:clientId/fulfillment/briefs",  // ":clientId" auto-rewritten
      panelId: "fulfillment", order: 1,
      roles: ["agency-owner", "agency-manager"],   // optional role gate
    },
  ],

  // Mounted under /portal/<scope>/<plugin-id>/<page.path>
  pages: [{ path: "", component: () => import("./pages/Index"), title: "Briefs" }],

  // Mounted under /api/portal/<plugin-id>/<route.path>  (dispatcher TBD in round 2)
  api: [],

  // Auto-rendered settings form unless settings.customPage = true
  settings: { groups: [] },

  features: [
    { id: "phaseTransitions", label: "Auto plugin swap on phase change", default: true },
  ],
};

export default fulfillment;
```

### `PluginCtx` handed to lifecycle hooks

```ts
{
  agencyId: string;
  clientId?: string;             // undefined for agency-scoped installs
  install: PluginInstall;
  storage: {
    get<T>(key): Promise<T | undefined>;
    set<T>(key, value): Promise<void>;
    del(key): Promise<void>;
    list(prefix?): Promise<string[]>;
  };
}
```

Plugin storage is namespaced under `pluginData[install.id][key]`. Uninstall
wipes the slice cleanly.

### Adding a manifest

1. `mkdir 04 the final portal/plugins/<id>` and write `index.ts` exporting
   `default: AquaPlugin`.
2. In `04 the final portal/portal/src/plugins/_registry.ts`, import the
   manifest and append to `PLUGINS`.
3. The validator runs at module load; check the dev console for warnings.
4. Sidebar nav appears automatically once the plugin is installed for a
   tenant via `installPlugin()`.

### Scope policy (new vs 02)

`scopePolicy` is a required field. Enforced at install time:

| value     | install.clientId required | example                               |
|-----------|---------------------------|----------------------------------------|
| `client`  | yes                       | website-editor (per-client portal)     |
| `agency`  | no                        | agency-only HR plugin                  |
| `either`  | optional                  | fulfillment (agency wide + per-client) |

## 3. Auth API surface

```ts
// All from "@/lib/server/auth"

issueSession({ userId, email, role, agencyId, clientId? }): string
verifyToken(cookieValue): SessionPayload | null
getSession(): Promise<SessionPayload | null>          // reads cookies()
getSessionFromRequest(req): Promise<SessionPayload | null>
getCurrentUser(): Promise<ServerUser | null>          // session → DB user

requireSession(): Promise<SessionPayload>             // throws AuthError(401)
requireRole(role | role[]): Promise<SessionPayload>   // throws AuthError(401|403)
requireRoleForClient(role | role[], clientId): Promise<SessionPayload>
                                                      // additionally enforces tenant-scope match

class AuthError extends Error { status: 401 | 403 }
authErrorResponse(err): Response                      // helper for API routes

sessionCookie(token):    { name, value, options }     // set on Response.cookies
clearSessionCookie():    { name, value, options }     // for /api/auth/logout
```

### Cookie format

Name: `lk_session_v1`. HMAC-SHA256-signed `<base64url-payload>.<base64url-sig>`.
Secret: `PORTAL_SESSION_SECRET` (production MUST set; dev fallback warns).
Max age: 30 days. httpOnly + sameSite=lax + secure-in-prod.

### Session payload

```ts
{
  userId: string;
  email: string;
  role: "agency-owner" | "agency-manager" | "agency-staff" |
        "client-owner" | "client-staff" | "freelancer" | "end-customer";
  agencyId: string;
  clientId?: string;
  iat: number;       // unix seconds
  exp: number;
}
```

### URL → role gate (locked)

| Path                                    | Allowed roles                                                            |
|-----------------------------------------|--------------------------------------------------------------------------|
| `/portal/agency/*`                      | `AGENCY_ROLES` only                                                       |
| `/portal/clients/[clientId]/*`          | `AGENCY_ROLES` (any client) OR `client-*`/`freelancer` (matching clientId) |
| `/portal/customer/*`                    | `end-customer` (matching clientId)                                        |

The match is enforced in two places:

1. `proxy.ts` — best-effort, decoded-but-unverified payload check.
2. Page server component — full HMAC verification + `requireRoleForClient(...)`.

## 4. Chrome contract

### `buildSidebar(input): NavPanel[]`

```ts
// from "@/lib/chrome/sidebarLayout"

interface BuildSidebarInput {
  role: Role;
  scope: "agency" | "client" | "customer";
  currentClient?: Client;        // required when scope === "client" or "customer"
  installedPlugins: PluginInstall[];   // pre-filtered to (agencyId [, clientId])
}

interface NavPanel {
  id: PanelId;                   // main | fulfillment | store | content | marketing | settings | ops | tools
  label: string;
  order: number;
  items: NavItem[];
}
```

Default panels exist even with no plugin contributions — keeps the chrome
stable as plugins land.

Plugin nav items are merged onto the default tree by their declared
`panelId`. Items without `panelId` fall into `main`. Items with
`":clientId"` in the href are auto-rewritten with the current client id.

### `<ThemeInjector brand={brand} scope=... />`

Server component. Outputs `<style>:root{--brand-primary: …}</style>`.
Variables emitted: `--brand-primary`, `--brand-secondary`, `--brand-accent`,
`--brand-font-heading`, `--brand-font-body`, `--brand-radius`, `--brand-logo`
(when set). `brand.customCSS` is appended verbatim.

### `<Sidebar panels={...} tenantLabel currentPath />` & `<Topbar title subtitle role email />`

Server components. No client JS. Active nav highlighting via
`currentPath === item.href` or descendant prefix.

## 5. Server module surface

```ts
// All from "@/server/*"

// tenants.ts — three-level CRUD; every list/get scoped by agencyId
createAgency, getAgency, getAgencyBySlug, listAgencies, updateAgency
createClient(agencyId, ...), getClient, getClientForAgency(agencyId, id), listClients(agencyId), updateClient
getEndCustomer, listEndCustomers(clientId)

// users.ts — scrypt + role
createUser({ email, password, role, agencyId, clientId? })
getUser, getUserById, verifyPassword, updateUser
listUsersForAgency(agencyId), listUsersForClient(clientId)
setUserPassword, validatePassword

// pluginInstalls.ts — install records (composite key)
makeInstallId, getInstall(scope, pluginId), getInstallById
listInstalledFor(scope), listInstalledForClientOnly, listInstalledForAgencyOnly
upsertInstall, patchInstall, deleteInstall

// storage.ts
ensureHydrated, getState, mutate, reset, getBackendInfo

// eventBus.ts
on(name | "*", handler), emit({ agencyId, clientId? }, name, payload)

// activity.ts
logActivity, listActivity({ agencyId, clientId?, limit })

// phases.ts
phaseLabel(stage), listPhasesForAgency, getPhase
```

### Composite install id

`PluginInstall.id = "${agencyId}|${clientId ?? '_agency'}|${pluginId}"`

One row per install regardless of agency-vs-client scope. `pluginData` is
keyed by install id, so `deleteInstall` can wipe the slice in one shot.

### Storage backends

| `PORTAL_BACKEND` | persistence                | notes                       |
|------------------|----------------------------|------------------------------|
| `file` (default) | `.data/portal-state.json`  | dev / single-VM              |
| `memory`         | none                       | tests, ephemeral             |
| `kv`             | stub                       | foundation throws on use     |
| `postgres`       | stub                       | foundation throws on use     |

Cache pattern lifted from 02: sync `getState()`, async debounced flush
(250 ms), `await ensureHydrated()` once at the top of every route handler
+ page server component.

## 6. Bootstrap flow

`POST /api/auth/login` with `{email, password}` does first-run bootstrap
when both `agencies` and `users` are empty:

1. Creates agency `Milesy Media` (slug `milesy-media`) with the supplied
   email as owner.
2. Creates the user as `agency-owner` of that agency.
3. Issues a session cookie. Returns `{ ok: true, bootstrap: true }`.

After bootstrap the endpoint becomes a regular verify+sign-in. There's
also `POST /api/tenants/seed` (dev) that additionally seeds Felicia (Luv &
Ker) as a client and a `client-owner` user.

## 7. Deviations from `04-architecture.md`

| Topic                | Architecture said             | Foundation chose                                 | Why |
|----------------------|--------------------------------|---------------------------------------------------|-----|
| Plugin scope policy  | (not specified)                | Required `scopePolicy: "client"\|"agency"\|"either"` field on every manifest | Architecture §2 implies per-tenant + agency-wide installs; making the policy explicit lets the runtime refuse mis-scoped installs. T2/T3 must declare it. |
| Install record id    | (not specified)                | Composite `${agencyId}\|${clientId ?? '_agency'}\|${pluginId}` | Single flat keyed map; uninstall is one delete; cross-tenant queries are cheap filter scans. |
| Plugin nav href shape| (not specified)                | Plugins author with `:clientId` placeholder; chrome rewrites | Lets a single manifest serve both agency-scoped and client-scoped paint without runtime branching. |
| Middleware filename  | `middleware.ts`                | `proxy.ts`                                        | Next 16 deprecated `middleware.ts` → `proxy.ts`. Same behaviour. |
| ClientStage enum     | 6 stages (Discovery → Churned) | 7 stages (added `lead`)                          | `03/old-portal-roles-tenancy.md` ships `lead` and the fulfillment plugin (T2) likely needs it for pre-discovery prospects. Reversible — T2 can drop it. |
| `next.config.ts`     | "CSP + HSTS from 02"           | Same headers + `frame-ancestors 'self' https:`    | `/embed/login` must be iframe-able from client domains. Architecture §3 implies it; this is the explicit header. |

None invalidate the architecture. If T2 or T3 disagrees with any choice,
flag in commander.md before working around it.

## 8. Smoke-test commands

```bash
cd "04 the final portal/portal"
npm install                                        # one-time
PORTAL_SESSION_SECRET=dev-secret-32-chars-long-enough npm run dev

# In another terminal:
curl -i http://localhost:3030/                                          # 200
curl -i http://localhost:3030/login                                     # 200
curl -i http://localhost:3030/embed/login                               # 200
curl -i http://localhost:3030/portal                                    # 307 → /login

curl -X POST -c /tmp/cookie.txt -H 'content-type: application/json' \
     -d '{"email":"ed@milesymedia.com","password":"dev-pass-123"}' \
     http://localhost:3030/api/auth/login                                # bootstrap

curl -i -b /tmp/cookie.txt http://localhost:3030/portal/agency           # 200

PORTAL_SESSION_SECRET=... npm run build                                  # clean
npx tsc --noEmit                                                         # clean
```
