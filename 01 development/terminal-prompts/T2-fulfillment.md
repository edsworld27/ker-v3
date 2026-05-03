# T2 — Fulfillment plugin

You are Terminal 2 of three parallel Claude Opus 4.7 sessions building
`04 the final portal/`. T1 is scaffolding the portal foundation. T3 is
porting the website-editor plugin. Your role: build the **fulfillment plugin**
— the killer first feature.

The fulfillment plugin is the agency-side workspace where the team:
- Creates clients
- Picks a phase preset for a new client (which auto-installs starter plugins + applies a starter portal variant)
- Tracks the collaborative checklist for each phase (internal + client tasks)
- Advances clients through phases (auto-disabling old plugins, enabling new ones, swapping portal variants)
- Browses the plugin marketplace and installs additional plugins per-client

## Mandatory pre-read

1. `01 development/CLAUDE.md`
2. `01 development/context/prior research/04-architecture.md` — **the locked design**. Read sections 7 (phases), 9 (folder layout), 10 (request flow), 12 (round 1 split), 14 (decisions log).
3. `01 development/context/MASTER.md`
4. `01 development/context/prior research/aqua-plugin-system.md` — the manifest contract you're producing.
5. `01 development/context/prior research/old-portal-suites.md` — `aqua-client/.../Fulfillment/` is the design template (UI complete, business logic stubbed in `03`).
6. `01 development/context/prior research/old-portal-roles-tenancy.md` — `FulfilmentBrief` + `FulfilmentDeliverable` + `BriefAssignment` Prisma schema lives here.
7. `01 development/eds requirments.md` if non-empty.

## Your goal

Build `04 the final portal/plugins/fulfillment/` as a self-contained plugin
package. Default-export an `AquaPlugin` manifest. T1's foundation will mount
this plugin once installed for an agency.

## Folder layout

```
04 the final portal/plugins/fulfillment/
├── package.json              name: "@aqua/plugin-fulfillment"
├── README.md                 manifest summary + contract
├── index.ts                  default-exported AquaPlugin manifest
├── src/
│   ├── pages/                admin pages (agency-side + client-side)
│   ├── api/                  api route handlers
│   ├── server/               domain logic
│   │   ├── phases.ts         CRUD for phase definitions
│   │   ├── checklist.ts      tasks (internal + client)
│   │   ├── transitions.ts    advance-phase logic (disable old plugins, enable new)
│   │   └── presets.ts        seeded 6 defaults
│   ├── components/           UI components (PhaseBoard, ClientList, MarketplaceUI, ChecklistWidget)
│   └── lib/                  helpers
└── starters/                 starter portal-variant block trees per phase
```

## Manifest contract

```ts
const fulfillmentPlugin: AquaPlugin = {
  id: 'fulfillment',
  name: 'Fulfillment',
  version: '0.1.0',
  status: 'beta',
  category: 'core',
  tagline: 'Phase lifecycle + collaborative checklist',
  description: 'The agency workspace for onboarding and managing clients through their lifecycle.',
  core: true,                  // auto-installed for every agency
  requires: [],
  navItems: [
    { id: 'fulfillment', label: 'Fulfillment', href: '/portal/agency/fulfillment', panelId: 'main' },
    { id: 'fulfillment-clients', label: 'Clients', href: '/portal/agency/fulfillment/clients', panelId: 'main', parent: 'fulfillment' },
    { id: 'fulfillment-phases', label: 'Phases', href: '/portal/agency/fulfillment/phases', panelId: 'settings' },
    { id: 'fulfillment-marketplace', label: 'Plugin Marketplace', href: '/portal/agency/fulfillment/marketplace', panelId: 'settings' },
    // client-side nav (visible to client-* roles when fulfillment is installed for that client)
    { id: 'fulfillment-checklist', label: 'Your checklist', href: '/portal/clients/[clientId]/checklist', panelId: 'main', visibleToRoles: ['client-owner', 'client-staff'] },
  ],
  pages: [...],
  api: [...],
  settings: SettingsSchema,
  features: [...],
};
```

## What the agency-side UX does

### Client list (`/portal/agency/fulfillment/clients`)
- Card per client showing: name, logo, current phase (badge), checklist progress, last activity.
- "+ New client" button → modal:
  - Name, email, brand colour, logo
  - **Pick a phase preset** (dropdown of the 6 defaults: Discovery / Design / Development / Onboarding / Live / Churned). Each preset shows a tooltip with what plugins will install + the starter checklist.
- On submit:
  - Create `Client` row (T1's `tenants.ts`).
  - Apply phase preset: install plugins listed in preset (call T1's `pluginInstalls.installPlugin`).
  - Apply portal variant starter (write to client's portal-variant store — coordinate with T3 for the variant data shape).
  - Create checklist tasks (split into `internal` + `client` lists).
  - Activity-log the creation.

### Phase board (`/portal/agency/fulfillment/[clientId]`)
- Two-column workspace:
  - Left: **Internal tasks** — agency staff tick these.
  - Right: **Client tasks** — display-only here, but show progress (X of Y done).
- "Advance phase" button → enabled when all required tasks complete. Confirms with "advancing will disable plugins X, Y, Z and enable A, B, C — your work is preserved." Click → run phase transition.
- Activity feed below.

### Phases settings (`/portal/agency/fulfillment/phases`)
- List the 6 default phases. Edit name, order, plugin preset, starter variant, checklist template. Add new phase. Reorder. Archive.
- Each phase definition is a row in `phases.ts` keyed by `(agencyId, phaseId)`.

### Plugin marketplace (`/portal/agency/fulfillment/marketplace?client=<clientId>`)
- Lists every plugin from T1's registry.
- Search + category filter (lift the UX pattern from `03/HostTemplateHubView.tsx` chapter — see `old-portal-host-shell.md`).
- Per-plugin card: install / configure / disable / uninstall.
- Operates on the `clientId` query param — installs scoped to that client.

## What the client-side UX does

`/portal/clients/[clientId]/checklist` — the client's view of their checklist:
- Shows only `client`-tagged tasks for the client's current phase.
- Tickable.
- Progress bar.
- Optional notes / file uploads per task (out of scope for v1 — stub).

When the client ticks a task → activity-log entry → agency phase board reflects in real time (or at least on next render).

## Phase transition logic — `transitions.ts`

```ts
async function advancePhase({ clientId, fromPhase, toPhase, actor }) {
  // 1. Disable old phase's plugins (config preserved)
  for (const pluginId of fromPhase.pluginPreset) {
    await pluginInstalls.setEnabled({ clientId, pluginId, enabled: false });
  }
  // 2. Enable / install new phase's plugins
  for (const pluginId of toPhase.pluginPreset) {
    const existing = await pluginInstalls.findFor({ clientId, pluginId });
    if (existing) await pluginInstalls.setEnabled({ ...existing, enabled: true });
    else await pluginInstalls.installPlugin({ pluginId, clientId, installedBy: actor });
  }
  // 3. Apply new phase's portal-variant starter (coordinate with T3 — see TODO below)
  // 4. Update client.stage = toPhase.id
  // 5. Activity log entry
  // 6. Emit 'phase.advanced' on the eventBus (other plugins may react)
}
```

## TODO — coordinate with T3

The portal-variant data model (block trees keyed by role + status) is owned by
T3's website-editor plugin. You need:
- The shape of a "starter block tree" so each phase can carry one.
- A way to apply a starter variant to a client (call into T3's API or a server module).

T3 exposes this via the `04-plugin-website-editor.md` chapter. Read that (it'll
land alongside this work). If T3 hasn't shipped yet when you start, leave a
clean TODO in `phases.ts` and `transitions.ts` calling out exactly what you
need from T3. The chief commander (Ed's session) will broker the integration.

## Seeded 6 default phases

When an agency first installs fulfillment, seed these 6 phase definitions.
Customisable later (see `04-architecture.md` §7).

| id | label | description | plugin preset | checklist (internal) | checklist (client) |
|----|-------|-------------|---------------|----------------------|---------------------|
| `discovery` | Discovery | Initial consultation, scoping, kick-off | `brand`, `forms` | "Schedule kickoff call", "Send discovery doc", "Note budget + timeline" | "Complete discovery questionnaire", "Provide brand assets" |
| `design` | Design | Mood-boards, wireframes, design proposal | `brand`, `website-editor` (preview-only access for client) | "Build mood-board", "Wireframe 3 versions", "Internal review" | "Approve mood-board", "Pick wireframe variant" |
| `development` | Development | Build the site / portal / app | `website-editor`, `forms`, `email` | "Convert design to blocks", "Wire forms", "QA on staging" | "Provide content (copy + images)", "Test staging URL" |
| `onboarding` | Onboarding | Pre-launch training + plugin config | `website-editor`, `email`, `analytics`, plus any client-specific (e.g. `ecommerce`) | "Set up Stripe", "Configure email provider", "Train client" | "Provide payment processor details", "Invite team members" |
| `live` | Live | Site is live, ongoing optimisation | + `analytics`, `seo`, `support` | "Weekly performance review", "Monthly audit" | "Submit support tickets via portal", "Review monthly reports" |
| `churned` | Churned | Engagement ended | (all plugins disabled, config preserved) | "Archive deliverables", "Final invoice", "Offboard team" | "Receive deliverables export" |

Phase definitions live as data in `phases.ts` (keyed by `agencyId`). On agency
creation, seed these defaults. Agency owners can edit/add later.

## NOT in scope

- Don't touch foundation (T1's job).
- Don't touch the website editor or blocks (T3's job).
- Don't lift Stripe, Resend, S3 — fulfillment doesn't need them.
- Don't build ecommerce plugin (Round 2).
- Don't try to run T1's portal — your plugin manifest validates standalone (`tsc --noEmit` inside the plugin folder).
- Don't hardcode the 6 phases as an enum — they're seeded data, agency-customisable.

## When done

1. `tsc --noEmit` clean inside `04 the final portal/plugins/fulfillment/`.
2. Manifest exports correctly (default export of `AquaPlugin`).
3. Add `01 development/context/prior research/04-plugin-fulfillment.md` documenting:
   - The manifest contract (id, navItems, pages, api, settings, features)
   - The phase data model + 6 seed defaults
   - The transition algorithm + what `eventBus` events it emits
   - The marketplace UX flow
   - The collaborative-checklist UX (internal vs client tasks)
   - The TODO list of integration points with T1 (auth, plugin runtime) and T3 (portal-variant starter trees)
4. Add a MASTER.md row.
5. Update `tasks.md` (mark T2 done).
6. Commit + push.

If blocked on T1 or T3, write into `tasks.md` under "Blocked / needs Ed" and stop. Don't guess.

Be terse to Ed.
