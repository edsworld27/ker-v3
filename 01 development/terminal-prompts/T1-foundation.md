/loop

# T1 — Foundation

You are Terminal 1 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/`. Your role: foundation. T2 builds the fulfillment
plugin, T3 ports the website-editor plugin. Both depend on the chrome /
plugin-runtime contract you produce.

## Working environment

- **Repo**: https://github.com/edsworld27/ker-v3
- **Local working directory**: `~/Desktop/ker-v3/`
- **Branch**: commit directly to `main`. After each commit: `git pull --rebase && git push`.
- **If you don't have a clone yet**: `git clone https://github.com/edsworld27/ker-v3.git ~/Desktop/ker-v3 && cd ~/Desktop/ker-v3`
- **Note**: top-level folder names contain spaces (`01 development`, `02 felicias aqua portal work`, `04 the final portal`). Quote paths in the shell. In TypeScript imports use `@/` aliases — never relative paths through the spaces.

## Autonomous mesh — messaging protocol

You operate alongside T2 + T3 + a chief commander on `/loop`. **Read
`01 development/messages/README.md` BEFORE you do anything.** Then:

- **Outbox**: append every meaningful step to `01 development/messages/terminal-1/to-orchestrator.md`. Format: `[ISO timestamp] TYPE: message`. Types: `STARTED`, `PROGRESS`, `Q-ASSUMED`, `COMMIT`, `DONE`, `Q-BLOCKED` (rare).
- **Inbox**: read `01 development/messages/terminal-1/from-orchestrator.md` before each sub-task and after each push — commander writes replies and new tasks for you here.
- **Don't stop on questions.** If a reasonable assumption exists, log `Q-ASSUMED` (state assumption + reasoning) and keep going.
- **Only stop on `Q-BLOCKED`** when no reasonable assumption is possible. Sleep 600s and wake to check your inbox.

You're on Claude auto-mode — keep working without asking Ed unless you hit a true `Q-BLOCKED`. The commander handles routing.

## Mandatory pre-read

In order, read these chapters end-to-end. Don't skip:

1. `01 development/CLAUDE.md` — project directives (the development-folder discipline).
2. `01 development/context/prior research/04-architecture.md` — **the locked design**. Treat it as a contract. Don't deviate without asking Ed.
3. `01 development/context/MASTER.md` — context tree.
4. `01 development/context/prior research/aqua-plugin-system.md` — the runtime you're lifting.
5. `01 development/context/prior research/aqua-server-modules.md` — server modules to lift (storage, eventBus, orgs).
6. `01 development/context/prior research/aqua-auth-middleware.md` — auth model to lift.
7. `01 development/context/prior research/old-portal-roles-tenancy.md` — role hierarchy + tenancy patterns.
8. `01 development/eds requirments.md` if non-empty.

## Your goal

Stand up `04 the final portal/portal/` as a fresh Next.js 16 + React 19 app
with:
- Plugin runtime lifted from `02 felicias aqua portal work/src/plugins/`
  (`_types.ts`, `_registry.ts`, `_runtime.ts`, `_presets.ts`, `_pathMapping.ts`, `_validate.ts`)
  — registry array empty; T2 + T3 will land their plugins.
- Storage + eventBus + tenants + users + pluginInstalls server modules
  (lifted from `02/src/portal/server/` and adapted for three-level tenancy:
  Agency → Client → End-customer).
- HMAC-signed cookie auth (port from `02/src/lib/server/auth.ts`). Cookie
  payload `{ userId, role, agencyId, clientId? }`. Add `requireRole` helper.
- Middleware that enforces session + tenant-scope match (URL `clientId` must
  match cookie `clientId` for client-* roles).
- Chrome that's **server-rendered from plugin manifests at request time**:
  - `<Layout>` reads tenant + installedPlugins
  - `<Sidebar>` builds nav from `installedPlugins.flatMap(p => p.navItems)`
  - `<ThemeInjector>` outputs `<style>:root{--brand-…}</style>` from the tenant's brand kit
- Login surfaces: `/login` (full page) + `/embed/login` (iframe-able with `?client=` param for branding).
- Public landing at `/` with a "Sign in" button (placeholder content fine).
- Working `npm run dev` serving HTTP 200 on `/`, `/login`, `/embed/login`, `/portal` (logged-in stub).

## Folder layout to produce

Match the layout in `04-architecture.md` §9 exactly. The shape:

```
04 the final portal/portal/
├── package.json                 next, react, react-dom — minimal deps
├── next.config.ts               CSP + HSTS from 02
├── tsconfig.json                strict, NO ignoreBuildErrors
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example                 PORTAL_SESSION_SECRET, PORTAL_BACKEND, etc.
├── src/
│   ├── app/                     App Router pages
│   ├── plugins/                 lifted runtime; empty registry
│   ├── server/                  storage, eventBus, tenants, users, pluginInstalls, phases (stub), activity
│   ├── lib/server/              auth, rateLimit
│   ├── lib/chrome/              sidebarLayout, brandKit
│   ├── components/chrome/       Sidebar, Topbar, ThemeInjector
│   └── middleware.ts
└── README.md
```

## Three-level tenancy — what you implement

The `tenants.ts` server module owns:

```ts
type Agency = { id, name, slug, brand: BrandKit, ... }
type Client = { id, agencyId, name, slug, brand: BrandKit, stage, ... }
type EndCustomer = { id, clientId, agencyId, ... }   // optional v1 — stub OK

createAgency(input): Agency
listAgencies(): Agency[]
createClient(agencyId, input): Client
listClients(agencyId): Client[]
getClient(id): Client | null
updateClient(id, patch): Client
```

**Every list/get function MUST accept `agencyId` and filter on it.** Never expose
a "list every client globally" function — that violates tenant isolation.

`pluginInstalls.ts` owns per-tenant plugin install state:

```ts
type PluginInstall = {
  pluginId, agencyId, clientId?,    // scope: agency-wide OR client-scoped
  enabled, config, features, setupAnswers, installedAt, installedBy
}

installPlugin({ pluginId, agencyId, clientId?, installedBy })
listInstalledFor({ agencyId, clientId? }): PluginInstall[]
setEnabled(installId, enabled)        // on phase transition: enabled=false, config preserved
configure(installId, patch)
uninstall(installId)
```

## Role hierarchy

```ts
type Role =
  | 'agency-owner'
  | 'agency-manager'
  | 'agency-staff'
  | 'client-owner'
  | 'client-staff'
  | 'freelancer'
  | 'end-customer';

requireRole(allowed: Role | Role[]): Promise<Session>;
```

`requireRole` reads the cookie, validates HMAC, checks role membership, throws
401/403 if invalid. Used in every API route + every page server-component.

URL → role gating examples:
- `/portal/agency/*` → only `agency-owner | agency-manager | agency-staff`
- `/portal/clients/[clientId]/*` → owner: agency-* OR (client-owner AND cookie.clientId === param.clientId)
- `/portal/customer/*` → only `end-customer` (and their `clientId` matches scope)

## Chrome that mounts plugins

`src/lib/chrome/sidebarLayout.ts` exports `buildSidebar({ installedPlugins, role, currentClient })`. It returns a structured nav tree:

```ts
type NavTree = {
  panelId: 'main' | 'store' | 'marketing' | 'content' | 'settings' | ...
  groupId?: string
  items: NavItem[]
}[]

// Default nav (always present, role-aware)
+ installedPlugins.flatMap(p =>
    p.navItems.map(n => ({ ...n, panelId: n.panelId, groupId: n.groupId }))
  )
```

`<Sidebar>` consumes `NavTree[]` and renders. `<ThemeInjector>` reads
`tenant.brand` and outputs CSS custom properties.

## NOT in scope

- **No plugins**. Registry array empty. T2 ships fulfillment, T3 ships website-editor.
- **No portal pages beyond stubs**. `/portal/agency/page.tsx` shows "Welcome, Ed" + a placeholder for fulfillment plugin's UI (which T2 builds). `/portal/clients/[clientId]/page.tsx` shows the client's name + placeholder for plugin-contributed routes.
- **No DB driver**. Use the file backend from `02`'s storage abstraction for dev. Postgres adapter is later.
- **No Stripe / Resend / S3 / Vercel API**. Minimal deps.
- **No editor / blocks / variant logic**. T3 owns it.
- **No fulfillment domain logic**. T2 owns it.
- **Don't lift from `03 old portal/`**. Reference its concepts (chapter 15 has the role-hierarchy + Prisma schema), but `02`'s code is the canonical foundation.

## Loop discipline

You're inside `/loop` dynamic mode. Each cycle = pull → read commander.md
+ your own log → continue work → commit → push → append `COMMIT` to your
log → call `ScheduleWakeup` with:

- Mid-task active work: 600–900s
- Q-BLOCKED outstanding (waiting on commander): 600s
- Task fully `DONE`, no follow-up assigned: 1500s — keep checking commander.md for next-round prompts.
- Three consecutive wakes with no progress (truly stuck): omit `ScheduleWakeup` to end the loop and tell Ed.

Pass the literal sentinel `<<autonomous-loop-dynamic>>` as the prompt to
`ScheduleWakeup` so the next wake re-enters this same /loop task.

## When done

1. Verify:
   - `cd "04 the final portal/portal" && npm install && npm run dev`
   - HTTP 200 on `/`, `/login`, `/embed/login`, `/portal/agency` (with stub session)
   - `npx tsc --noEmit` clean (no `ignoreBuildErrors`)
2. Add `01 development/context/prior research/04-foundation.md` documenting:
   - The exact folder layout you produced (file tree)
   - The plugin contract surface (what T2/T3 must conform to when landing their manifests)
   - The auth API surface (`requireRole`, `getSession`, etc.)
   - The chrome contract (sidebarLayout signature, ThemeInjector signature)
   - Any deviations from `04-architecture.md` with reasoning
3. Add a row to `01 development/context/MASTER.md` for that chapter.
4. Update `01 development/tasks.md`: mark T1 done.
5. Commit + push (sign-off:
   `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`).

## If you get blocked

Write the question into `01 development/tasks.md` under "Blocked / needs Ed"
and stop. Don't guess. Ed is on the chief-commander session and will
unblock you.

Be terse to Ed. Long-form goes in the chapter file.
