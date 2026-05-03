# Old portal — roles + multi-tenancy

The role hierarchy and tenant model from `03 old portal/`. This is the part
of the old portal **most directly applicable to `04 the final portal/`** —
it solves the team-vs-client-vs-freelancer access problem cleanly.

> Source: agents 5 + 6.

## 6 roles (from `Bridge/types/index.ts`)

| role | productAccess (resolved by `Bridge/auth/index.ts:46-62`) | use case |
|------|----------------------------------------------------------|----------|
| **Founder** | `['operations','crm','client']` | Full agency admin (Ed) |
| **AgencyManager** | `['operations','crm','client']` | Team lead — same as Founder but no role-management |
| **AgencyEmployee** | `['operations','crm']` | Internal staff — not on client portal by default |
| **ClientOwner** | `['client']` | Client admin (Felicia for her portal) |
| **ClientEmployee** | `['client']` | Client team (Felicia's staff) |
| **Freelancer** | `['client']` (fulfillment only) | External contractor — restricted to deliverables |

`UserRole` is `string`-typed, so custom roles can be added (`customRoleId`
field on `User`). Hardcoded roles are the defaults.

`resolveProductAccess(role)` returns the array. If `user.productAccess` is
explicitly set (CSV stored in DB), that overrides the default mapping.

`ROLE_PRODUCT_MAP` constant in `Bridge/config/index.ts` is the broader version
including `host`/`finance`/`people`/`revenue` as products. The
`Bridge/auth/index.ts` resolution is for the legacy 3-product model.

## Portal tier

`PortalTier = 'agency' | 'client' | 'community'`.

Currently set on `AppUser.portalTier` but **not enforced** in routing. Intended
for future use:
- `agency` — internal team portal (Founder / AgencyManager / AgencyEmployee)
- `client` — customer-facing portal (ClientOwner / ClientEmployee / Freelancer)
- `community` — public-facing (unauthenticated)

## Client lifecycle

`ClientStage = 'lead' | 'discovery' | 'design' | 'development' | 'onboarding' | 'live' | 'churned'`.

Drives:
- Which dashboard subviews unlock (e.g. Onboarding clients can't see Design templates yet)
- Which fulfillment briefs are appropriate (`development` + `onboarding` only)
- Which resources the library shows (per-stage templates)
- Whether reports/analytics are available (only after `live`)

Stored on `Client.stage` in the Prisma schema. Updated via
`syncClientStage(clientId, newStage)` (emits `CLIENT_STAGE_CHANGED` event).

## Prisma schema for tenancy (`Bridge/data/schema.prisma`)

| model | role |
|-------|------|
| **Agency** | Top-level tenant. `id (cuid)`, `name`, `logo?`, `domain (unique)`, `primaryColor`, `isConfigured`, timestamps |
| **AgencySuite** | M:N agency↔suites. `agencyId`, `suiteId`, `enabled` — gates marketplace install per agency |
| **User** | All users (internal + client). `id (autoincrement)`, `email (unique)`, `name`, `role`, `customRoleId?`, `agencyId?`, `clientId?` (set when user belongs to a client), `avatar?`, `bio`, `department`, `status`, `locationType`, `baseSalaryCents`, `joinedDate`, `productAccess (CSV)` |
| **Session** | Auth token. `userId (fk)`, `token (unique)`, `expiresAt`. 7-day TTL |
| **Client** | Customer record. `agencyId (fk)`, `name`, `email`, `stage` (ClientStage), `logo?`, `websiteUrl?`, `brandColor?`, `portalName?`, `discoveryAnswers (JSON)`, `enabledSuiteIds (JSON)`, `assignedEmployeeIds (JSON)`, `assignedFreelancers (JSON)`, `githubOwner?/Repo?/FilePath?`, `cmsProvisioned` |
| **ClientResource** | Files / links per client. `clientId (fk)`, `name`, `url`, `type ('document'|'image'|'video'|'zip'|'link')`, `uploadedBy (User.id)`, `uploadedAt` |
| **FulfilmentBrief** | Project brief. `clientId (fk)`, `title`, `description`, `dueDate?`, `status` (DeliverableStatus) |
| **BriefAssignment** | M:N brief↔users. `briefId`, `userId`, unique on both — links agency staff + freelancers to a brief |
| **FulfilmentDeliverable** | Submission under a brief. `briefId (fk)`, `clientId`, `title`, `url?`, `notes?`, `revisionNotes?`, `submittedBy`, `submittedAt`, `approvedAt?`, `status` |
| **ActivityLog** | Audit trail. `agencyId?`, `clientId?`, `userId?`, `type`, `message`, `category`, `createdAt` |
| **ApplicationState** | Key-value persistence. `agencyId?`, `key`, `value (JSON)`, unique on `(agencyId, key)` — agency-level config blob |

## Multi-tenancy mechanics

- **Tenant boundary**: `Agency`. Every Client / User / FulfilmentBrief / etc. is keyed to an `agencyId`.
- **Per-client team**: each `Client` has `assignedEmployeeIds` (User.id JSON array) and `assignedFreelancers` (email JSON array) — captures _who works on this client_, distinct from _who works for the agency_.
- **Per-client suites**: `Client.enabledSuiteIds` JSON gates which features (CRM / Finance / Revenue / etc.) the client portal exposes.
- **Per-client branding**: `Client.logo`, `brandColor`, `bgColor`, `portalName` — used by Client portal chrome.
- **Per-agency suite gating**: `AgencySuite.enabled` — agency owner toggles whether a suite is even available for them to install on clients.

## Sync helpers (server-side, `Bridge/sync/`)

- `provisionClientWorkspace(client)` — Operations creates new client → upserts Client + emits `CLIENT_PROVISIONED`
- `syncClientStage(clientId, newStage)` — AQUA Client moves stage → updates DB + logs activity + emits `CLIENT_STAGE_CHANGED`
- `createBrief(clientId, title, description, dueDate, assignedTo)` — creates brief + assignment join + emits `BRIEF_CREATED`
- `submitDeliverable(briefId, clientId, title, url, notes, submittedBy)` — Freelancer submits → status `review` + emits `DELIVERABLE_SUBMITTED`
- `approveDeliverable(deliverableId, clientId)` — manager approves → status `approved` + emits `DELIVERABLE_APPROVED` + `INVOICE_TRIGGER`
- `getClientFulfilmentSummary(clientId)` — dashboard stats: open briefs, pending deliverables, approved counts

## Why this matters for `04`

The current Aqua at `02` has multi-tenancy at the **org** level (each tenant
gets its own `OrgRecord` with its own plugins), but no concept of:
- Agency vs client distinction (in 02 every org is equal)
- Per-client team / freelancer assignments
- Client lifecycle stages
- Fulfillment briefs / deliverables

The old portal models all of this cleanly. For `04` the final portal we
should:
- Keep Aqua's plugin architecture as the foundation
- Add the agency / client / staff / freelancer role hierarchy on top
- Add ClientStage to the org / client record
- Add the FulfilmentBrief + Deliverable + Assignment trio
- Per-client branding (already in Aqua via brand-kit plugin) extends naturally
