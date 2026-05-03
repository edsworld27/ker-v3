# Old portal — Bridge package (`03 old portal/.../main-monorepo/Bridge/`)

The shared workspace package `@aqua/bridge` glues the 7 apps together. Holds
shared types, auth, Prisma schema + client, event bus, registry, UI kit,
postMessage protocol, config constants, and a `concepts/` folder of
cherry-picked patterns from the Vite prototype.

> Source: agent 5 sweep.

## index.ts — barrel exports

Re-exports everything safe-for-everywhere (types) and gates server-only
modules (auth, data, sync, api) behind `import "server-only"`.

Public surface:
- **Types**: `PortalProduct`, `UserRole`, `Agency`, `AppUser`, `Client`, `ClientResource`, `FulfilmentBrief`, `FulfilmentDeliverable`, `AppNotification`, `LogEntry`, `BridgeSession`, `SuiteTemplate`, `SuiteSubItem`, `PluginConfigField`, `PluginLifecycleContext`, ...
- **Registry**: `BridgeRegistry`
- **Events**: `BridgeEvents` (typed bus)
- **UI Registry**: `BridgeUIRegistry`, `UIVariable`, `UIViewConfig`
- **Auth (server)**: `authenticate()`, `validateSession()`, `DEMO_EMAIL`, `DEMO_SESSION`
- **API (server)**: `BridgeAPI`
- **Sync (server)**: `provisionClientWorkspace`, `syncClientStage`, `createBrief`, `submitDeliverable`, `approveDeliverable`, `getClientFulfilmentSummary`
- **postMessage**: full iframe protocol
- **Config**: `APP_PORTS`, `APP_LABELS`, `APP_DEV_URLS`, `BRIDGE_LS_KEYS`, `ROLE_PRODUCT_MAP`, `BRIDGE_MESSAGE_TYPES`, `DEFAULT_THEME`, `SESSION_TTL_MS`

## types/index.ts

```ts
PortalProduct = 'operations' | 'client' | 'crm'
PortalTier    = 'agency' | 'client' | 'community'
ClientStage   = 'lead' | 'discovery' | 'design' | 'development' | 'onboarding' | 'live' | 'churned'
UserRole      = 'Founder' | 'AgencyManager' | 'AgencyEmployee' | 'ClientOwner' | 'ClientEmployee' | 'Freelancer' | string
DeliverableStatus = 'brief' | 'in-progress' | 'review' | 'approved' | 'revision' | 'complete'
PluginCategory = 'Sales' | 'Marketing' | 'Finance' | 'People' | 'Operations' | 'Content' | 'Integrations' | 'Analytics' | 'Other'

interface Agency { id, name, logo?, domain?, primaryColor, isConfigured, theme, createdAt, updatedAt }
interface AppUser { id, name, email, role, customRoleId?, agencyId?, clientId?, avatar?, bio, joinedDate, department, managerId, skills, status, locationType, workingHours, baseSalaryCents, portalTier, taxProfile, productAccess }
interface Client { id, agencyId, name, email, stage, logo?, websiteUrl?, brandColor?, bgColor?, portalName?, discoveryAnswers, assignedEmployees, assignedFreelancers, resources, enabledSuiteIds, permissions, githubOwner?, githubRepo?, githubFilePath?, cmsProvisioned, timestamps }
interface ClientResource { id, name, url, type: 'document'|'image'|'video'|'zip'|'link', uploadedBy, uploadedAt }
interface FulfilmentBrief { id, clientId, title, description, attachments, assignedTo, dueDate?, status, timestamps }
interface FulfilmentDeliverable { id, briefId, clientId, title, url?, notes?, submittedBy, submittedAt, approvedAt?, revisionNotes?, status }
interface AppNotification { id, userId, title, message, type, read, link, createdAt }
interface LogEntry { id, type, message, category, clientId?, userId?, timestamp }

interface BridgeSession {
  user: AppUser
  agency: Agency
  enabledSuiteIds: string[]
  productAccess: PortalProduct[]
  isDemo?: boolean
}

interface SuiteTemplate {
  id, label, icon, component, section, requiredSuites?, defaultView,
  subItems: SuiteSubItem[], description?, category?, configSchema?,
  pricing?, requiredPermissions?,
  // lifecycle hooks
  onInstall?, onUninstall?, onConfigChange?
}
```

## auth/index.ts

`authenticate(email, password?)` returns `{ success, session } | { success: false, error }`.

- If `email === 'demo@aqua.portal'` or `'demo'` → return `DEMO_SESSION` (no DB hit, all suites, Founder role)
- Otherwise Prisma `User.findUnique({ where: { email }, include: { agency: { include: { suiteAccess } } } })`
- Derive `productAccess` from role via `ROLE_PRODUCT_MAP`, or from `user.productAccess` field if set
- Resolve agency theme + enabled suite IDs from `AgencySuite.enabled` join
- Return hydrated `BridgeSession`

`validateSession(token)` looks up `Session` record, checks expiration, re-authenticates user.

`resolveProductAccess(role)` (lines 46-62):
```
Founder              → ['operations', 'crm', 'client']
AgencyManager        → ['operations', 'crm', 'client']
AgencyEmployee       → ['operations', 'crm']
ClientOwner          → ['client']
ClientEmployee       → ['client']
Freelancer           → ['client']    (fulfillment subset only)
```

## data/ — Prisma schema

| model | purpose | key fields |
|-------|---------|-----------|
| `Agency` | Tenant | id (cuid), name, logo?, domain (unique), primaryColor, isConfigured |
| `AgencySuite` | M:N agency↔suites | agencyId, suiteId, enabled — gates marketplace install |
| `User` | All users (internal + client) | id (autoincrement), email (unique), name, role, customRoleId?, agencyId?, clientId?, avatar?, bio, department, status, locationType, baseSalaryCents, joinedDate, productAccess (CSV) |
| `Session` | Token → user | userId (fk), token (unique), expiresAt — 7-day TTL |
| `Client` | Customer record | id (cuid), agencyId (fk), name, email, stage (ClientStage), logo?, websiteUrl?, brandColor?, portalName?, discoveryAnswers (JSON), enabledSuiteIds (JSON array), assignedEmployeeIds (JSON), assignedFreelancers (JSON), githubOwner/Repo/FilePath?, cmsProvisioned, timestamps |
| `ClientResource` | File/link attachments per client | clientId (fk), name, url, type, uploadedBy (User.id), uploadedAt |
| `FulfilmentBrief` | Project brief | clientId (fk), title, description, dueDate?, status |
| `BriefAssignment` | M:N brief↔users | briefId (fk), userId (fk), unique on both — links agency staff + freelancers to a brief |
| `FulfilmentDeliverable` | Submission under brief | briefId (fk), clientId, title, url?, notes?, revisionNotes?, submittedBy, submittedAt, approvedAt?, status |
| `ActivityLog` | Audit trail | agencyId?, clientId?, userId?, type, message, category, createdAt |
| `ApplicationState` | Key-value persistence | agencyId?, key, value (JSON), unique on (agencyId, key) — agency-level config blob |

`prisma.ts` exports a singleton client. `seed.ts` populates demo users when DB is fresh.

## events/index.ts — typed event bus

`BridgeEventMap` (lines 18-40):
```
CLIENT_PROVISIONED, CLIENT_STAGE_CHANGED,
BRIEF_CREATED, DELIVERABLE_SUBMITTED, DELIVERABLE_APPROVED, DELIVERABLE_REVISION,
INVOICE_TRIGGER,
USER_INVITED, USER_DEACTIVATED,
PAYROLL_PROCESSED,
SUITE_ENABLED, SUITE_DISABLED
```

`BridgeEventBus` class:
- `on<K>(event, callback) → unsubscribe`
- `emit<K>(event, data)` — fires sync (registration), async (handler exec)
- `once<K>(event, callback)` — one-time listener

Safe to import on client + server. Handlers in window globals during SSR.

## registry/index.ts — singleton component + suite registry

Singleton maps:
- `__BRIDGE_COMPONENTS__` — viewId → React component
- `__BRIDGE_SUITES__` — suiteId → SuiteTemplate metadata
- `__BRIDGE_PROVIDERS__` — suiteId → context Provider component

API:
- `register(id, component)` — auto-aliases kebab-case
- `registerAll(components: Record<string, Component>)` — batch
- `resolve(id) → Component | null`
- `getRegisteredIds() → string[]`
- `registerSuite(metadata)` / `getSuites()` / `getSuite(id)`
- `registerProvider(suiteId, provider)` / `resolveProvider(suiteId)`
- `subscribe(listener) → unsubscribe` — HMR support

## sync/index.ts — cross-app sync helpers

```
provisionClientWorkspace(client) → upserts Client + emits CLIENT_PROVISIONED
syncClientStage(clientId, newStage) → updates Client.stage + logs activity + emits CLIENT_STAGE_CHANGED
createBrief(clientId, title, description, dueDate?, assignedTo[]) → creates FulfilmentBrief + BriefAssignment + emits BRIEF_CREATED
submitDeliverable(briefId, clientId, title, url, notes, submittedBy) → creates FulfilmentDeliverable status=review + emits DELIVERABLE_SUBMITTED
approveDeliverable(deliverableId, clientId) → status=approved, approvedAt=now + emits DELIVERABLE_APPROVED + INVOICE_TRIGGER
getClientFulfilmentSummary(clientId) → { briefs_open, deliverables_pending, deliverables_approved, ... }
```

## ui/kit.tsx — unified UI kit (~480 LOC)

Self-contained design system. **Zero external deps** (no lucide, no motion in
the kit itself; apps import lucide separately for their own icons).

Exports:
- **Layout**: `Page`, `PageHeader`, `Section`
- **Cards**: `Card`, `KpiCard`
- **Inputs**: `Input`, `Textarea`, `Select`, `SearchInput`, `Field`
- **Buttons**: `Button` (variants: primary / secondary / ghost / danger / outline; sizes: sm / md / lg; supports `icon`, `iconRight`, `loading`)
- **Modal**: `Modal` (sizes: sm / md / lg / xl, backdrop scrim, slide-up, esc + click-outside close)
- **Status**: `Badge` (tones: neutral / success / warning / danger / info / indigo / amber)
- **Data**: `DataTable<T>` (typed columns, striped, hover, empty state), `EmptyState`, `Avatar` (gradient bg from name hash)
- **Toast**: `Toast` (fixed bottom-center, semantic color)

Color tokens: indigo (primary), emerald (success), rose (danger), amber (warning), sky (info), dark base (#0a0a0c, #0e0e10), slate grays (100-600).

Companion files in `Bridge/ui/`:
- `AppSidebar.tsx`, `AppMarketplace.tsx`, `AppSettings.tsx`, `DashboardWidget.tsx` — shared kit-styled implementations of the major chrome surfaces
- `AIChatPanel.tsx` — slide-over chat panel (the host shell mounts it globally; sub-apps trigger it via `aqua:open-chat` CustomEvent)

## postMessage.ts — legacy iframe protocol

`BridgeMessageType`: `BRIDGE_AUTH`, `BRIDGE_NAVIGATE`, `BRIDGE_SYNC`, `BRIDGE_STATE_UPDATED`, `BRIDGE_THEME`, `BRIDGE_READY`, `BRIDGE_PING`.

`BridgeMessage` shape:
```
{ type, payload, source: 'aqua-host' | 'aqua-client' | ..., timestamp }
```

`ALLOWED_ORIGINS` hardcodes localhost ports 3001-3007. Production domains can be added.

`sendBridgeMessage(target, type, payload, source, targetOrigin?)` posts with
origin validation.

## config/index.ts — shared constants

```
APP_PORTS = { host:3001, client:3002, crm:3003, operations:3004, finance:3005, people:3006, revenue:3007 }
APP_LABELS = { ... } (human labels per app)
APP_DEV_URLS = auto-generated from ports
BRIDGE_LS_KEYS = {
  PORTAL_STATE: 'aqua_portal_state',
  SESSION: 'aqua_session',
  THEME: 'aqua_theme',
  RECENT_VIEWS: 'aqua_recent_views',
  AGENCY_CONFIG: 'aqua_agency_config'
}
ROLE_PRODUCT_MAP = {
  Founder | AgencyManager → ['host','client','crm','operations','finance','people','revenue']
  AgencyEmployee → ['host','client','crm','operations']
  ClientOwner | ClientEmployee → ['client']
}
DEFAULT_THEME = { primary: '#6366f1', secondary: '#10b981' }
SESSION_TTL_MS = 7 days
```

## concepts/ — Vite-prototype reference patterns (NOT wired in)

7 reference patterns preserved in `Bridge/concepts/` for future productionisation.
None imported at runtime by the monorepo.

| pattern | what it is | port-forward verdict |
|---------|-----------|---------------------|
| `PageBuilder/` | Drag-drop layout editor (pick widget, place in grid, configure props) | YES — production-quality; map prototype's `componentMap` to `BridgeRegistry.resolve()` |
| `RoleBuilder/` | Custom role CRUD UI with permission matrix | YES — schema already supports `customRoleId`; persist to Prisma `Role` model |
| `AgencyConfigurator/` | Real-time agency identity editor (logo, brand colour, feature flags, label overrides) | YES — wire to `BridgeAPI.updateAgency()`; CSS-var theming applies immediately |
| `collaboration/` | ProjectChat, ProjectTimeline, DesignConcepts, SyncCard widgets | YES — cleaner than scattered current versions; integrate with `aqua-client/ClientShell/bridge/ClientInboxContext` |
| `DynamicRenderer/` | 26-line generic renderer (config → mounted components by string name) | YES — already production-quality; drop into any app's `Renderer/` folder |
| `agencyConfig.reference.ts` | Canonical role/permission schema | YES — current monorepo splits this across 3+ files (drifting); unify here |
| `templates.reference.ts` | Agency template presets ("Web Design Agency", "Marketing Agency", etc.) | YES — should become Prisma records, applied via admin UI |
