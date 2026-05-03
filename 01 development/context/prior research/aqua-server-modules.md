# Aqua server modules (`02 felicias aqua portal work/src/portal/server/`)

Modular monolith organised by domain. Each module persists state through a
pluggable backend (file JSON, Upstash Redis, Supabase, Postgres). Modules
communicate via the `eventBus` instead of importing each other directly,
which avoids circular deps and keeps plugins decoupled.

> Source: agent 1 sweep of `02 felicias aqua portal work/src/portal/server/`.

## Architectural foundations

### `storage.ts` — state persistence abstraction

The single layer every other module depends on. Pattern: **sync reads from
in-memory cache, async debounced writes** to the backend.

- `getState(): PortalState` — synchronous read of the cache
- `mutate(fn: (state) => void)` — queue a write, flushed every ~250ms
- `ensureHydrated(): Promise<void>` — populate cache from backend on cold start (awaited at route boundary)

Backend types: `file` (dev → `.data/portal-state.json`), `memory` (ephemeral),
`kv` (Upstash REST), `supabase`, `postgres`. Auto-promotes to `kv` if env vars
present.

`PortalState` is a single typed object (`_types.ts:30-53`) holding every
domain's state slice — heartbeats, configs, content, schemas, embeds, settings,
discoveries, activity, embedThemes, chatbots, orgs, users, pages, assets,
themes, featureRequests, meetings, invoices, splitTests, splitTestResults,
audits, auditQuotas. Domain modules reach in and slice what they need.

**Implication:** every module reads `getState()` as if it's free. Works at
single-tenant scale; for true multi-tenant a per-org cache would be needed.
Concurrent writes are last-write-wins.

### `eventBus.ts` — internal pub/sub

Decouples plugins. Orders emits `"order.created"`; Email subscribes. No direct
imports between feature modules.

- `on(name | "*", handler) → () => void` — subscribe, returns unsubscribe
- `emit(orgId, name, payload)` — fire (sync registration, async handler exec via microtask)
- `describeSubscribers()` — diagnostics

Handlers are fire-and-forget. Errors are logged, not re-thrown. Cannot await
side-effects from the emit site — handlers run independently of the request
that triggered them.

Event names (21 total): `order.{created,paid,refunded,fulfilled,shipped}`,
`form.submitted`, `newsletter.{subscribed,unsubscribed}`,
`subscription.{created,updated,cancelled,renewed,payment_failed}`,
`page.{published,reverted}`, `blog.post.published`,
`user.{signed_up,signed_in,password_reset}`,
`plugin.{installed,uninstalled,configured}`.

### `orgs.ts` — tenant store

Orgs are the unit of isolation. Every piece of user data is keyed to an org.
The plugin runtime can't install/uninstall without reading/writing
`org.plugins[]` here.

- `listOrgs()` — sorted (primary first)
- `getOrg(id)` / `getPrimaryOrg()`
- `createOrg(input)` — generates id from slug, dedups
- `updateOrg(id, patch)`
- `seedPrimaryIfMissing()` — auto-creates "agency" org on first read

Key field: `org.plugins: OrgPluginInstall[]` — the installed plugins + their
config/features for this org.

### `email.ts` — transactional email dispatcher

Used by every customer-facing flow (order confirmation, password reset,
form notify) and many plugins for async comms (drip campaigns, reminders).

`sendEmail(input)` resolves the Email plugin's config from the org, picks the
provider (Resend / Postmark / SMTP), dispatches, and logs to `emailLog[]`.
If Email isn't installed for the org, sends fail gracefully — but many
plugins assume it exists and silently no-op without it.

### `webhooks.ts` — outbound event dispatcher

Integration point for third-party systems. Operators paste URLs in
`/admin/webhooks`. The runtime subscribes `on("*", handler)` at boot;
matching events POST a JSON payload signed with HMAC-SHA256, with
exponential-backoff retries (max 3) and a delivery log.

Webhooks are org-scoped. No deduplication, no rate-limiting at the bus level
(delegated to per-receiver config).

## Domain module catalogue (41 files)

| file | domain | key exports | persists | emits | consumes |
|------|--------|-------------|----------|-------|----------|
| **activity.ts** | audit trail | `logActivity`, `listActivity` | `activity[]` | — | — |
| **affiliates.ts** | commerce | `Affiliate`, `recordClick`, `recordConversion`, `recordPayout` | `affiliates[]`, `referralEvents[]`, `payouts[]` | — | — |
| **analytics.ts** | marketing | `recordEvent`, `getPageviews`, `getHeatmapData` | `analyticsEvents[]` | — | — |
| **assets.ts** | media | `uploadAsset`, `listAssets` | `assets[]` | — | — |
| **audit.ts** | compliance | `logAuditEntry`, `getAuditLog` | `activity[]` (alias) | — | — |
| **automation.ts** | marketing | `createRule`, `executeRule` | `automationRules[]`, `automationRuns[]` | — | bus |
| **backups.ts** | ops | `createBackup`, `listBackups`, `restoreBackup` | `backups[]` | — | — |
| **billing.ts** | commerce | `getSubscription`, `upgradePlan` | `subscriptions[]` | — | — |
| **calendar.ts** | events | `createEvent`, `listEvents` | `calendarEvents[]` | — | — |
| **chatbot.ts** | support | `getChatbotConfig`, `setChatbotConfig` | `chatbots[]` | — | — |
| **compliance.ts** | legal | `getComplianceSettings` | nested in `orgs[]` | — | — |
| **content.ts** | editor | `getContentState`, `publishOverrides`, `revertPublish` | `content[]` | — | — |
| **crm.ts** | sales | `Contact`, `Deal`, `CrmTask`, `addNote` | `contacts[]`, `deals[]`, `crmTasks[]`, `contactNotes[]` | — | bus |
| **dashboards.ts** | ui | `listWidgets` | — | — | — |
| **discovery.ts** | editor | `recordDiscovery`, `getDiscoveries` | `discoveries[]` | — | — |
| **donations.ts** | commerce | `recordDonation`, `listDonations` | `donations[]`, `donationGoals[]` | — | — |
| **email.ts** | comms | `sendEmail` | `emailLog[]` | — | — |
| **embeds.ts** | ui | `listEmbeds` | `embeds[]` | — | — |
| **embedTheme.ts** | ui | `getEmbedTheme`, `setEmbedTheme` | `embedThemes[]` | — | — |
| **eventBus.ts** | infra | `on`, `emit` | — | (emits) | (consumes) |
| **formSubmissions.ts** | forms | `recordSubmission`, `listSubmissions` | `formSubmissions[]` | `form.submitted` | — |
| **forum.ts** | community | `createTopic`, `createReply`, `voteTopic` | `forumCategories[]`, `forumTopics[]`, `forumReplies[]` | — | — |
| **funnels.ts** | marketing | `createSplitTest`, `recordResult` | `splitTests[]`, `splitTestResults[]` | — | — |
| **github.ts** | integration | `getRepo`, `listFiles`, `readFile` | — | — | — |
| **healthchecks.ts** | ops | `runPluginHealthcheck`, `runAllHealthchecks` | — | — | — |
| **heartbeats.ts** | analytics | `recordHeartbeat` | `heartbeats[]` | — | — |
| **knowledgebase.ts** | support | `createArticle`, `recordVote` | `kbCategories[]`, `kbArticles[]` | — | — |
| **memberships.ts** | commerce | `listTiers`, `createMember`, `upgradeMember` | `membershipTiers[]`, `members[]` | — | — |
| **newsletter.ts** | email | `subscribe`, `unsubscribe`, `listSubscribers` | `subscribers[]` | `newsletter.{subscribed,unsubscribed}` | — |
| **notifications.ts** | ui | `createNotification`, `listNotifications` | `notifications[]` | — | bus |
| **orders.ts** | commerce | `createOrder`, `listOrders`, `updateOrderStatus` | `serverOrders[]` | `order.{created,paid,refunded,fulfilled,shipped}` | — |
| **orgs.ts** | tenants | `OrgRecord`, `listOrgs`, `getOrg`, `createOrg`, `updateOrg` | `orgs[]` | — | — |
| **pages.ts** | editor | `createPage`, `getPage`, `updatePage`, `publishPage` + portal-variant helpers | `pages[siteId][pageId]` | `page.{published,reverted}` | — |
| **preview.ts** | editor | `generatePreviewToken`, `verifyPreviewToken` | — | — | — |
| **promote.ts** | marketing | `createCampaign` | — | — | — |
| **reservations.ts** | commerce | `Resource`, `Service`, `Staff`, `Booking`, `checkAvailability` | `resources[]`, `services[]`, `staff[]`, `bookings[]` | — | — |
| **searchIndex.ts** | search | `indexDocument`, `search` | `searchDocs[]` | — | bus |
| **settings.ts** | config | `getSettings`, `updateSettings` | `settings` | — | — |
| **support.ts** | crm | `createFeatureRequest` | `featureRequests[]`, `meetings[]`, `invoices[]` | — | — |
| **themes.ts** | ui | `listThemes`, `createTheme`, `setActiveTheme` | `themes[siteId][themeId]` | — | — |
| **tracking.ts** | analytics | `setTrackers`, `getTrackers` (GA4, GTM, Meta, TikTok, Hotjar, Clarity, Plausible) | `configs[]` | — | — |
| **translations.ts** | i18n | `setTranslation`, `getTranslation`, `bulkImport` | `translations[orgId][locale][key]` | — | — |
| **users.ts** | auth | `ServerUser`, `createUser`, `verifyPassword`, `updateUser` | `users[]` | `user.{signed_up,signed_in,password_reset}` | — |
| **webhooks.ts** | integration | `createWebhook`, `onEvent` (subscribes "*") | `webhooks[]`, `webhookDeliveries[]` | — | bus |
| **wiki.ts** | editor | `upsertWikiPage`, `listWikiPages`, `getRevisions` | `wikiPages[]`, `wikiRevisions[]` | — | — |

## Why these five matter most

**`storage.ts`** because every module depends on it. Swap backends here → every module ports forward.

**`eventBus.ts`** because it's how plugins integrate without import cycles.

**`orgs.ts`** because it's the tenant boundary. The plugin runtime mutates `org.plugins[]` here.

**`email.ts`** because it's a hub: orders, subscriptions, forms, automation, password reset all dispatch through it.

**`webhooks.ts`** because it's the integration boundary outward. Anyone wiring Aqua to a third-party system goes through this.

## Conventions

- Every server file lives under `src/portal/server/` with `import "server-only"` at the top.
- Per-plugin storage uses `ctx.storage` (namespaced) — modules never poke
  `pluginData[orgId][pluginId]` directly.
- New events get added to the `AquaEvent` union; emit from the originating
  module, subscribe in the consuming module.
- State mutations: `mutate(state => { state.something.push(...) })` — never
  reach in and mutate `state` directly.
