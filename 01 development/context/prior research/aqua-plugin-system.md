# Aqua plugin system (`02 felicias aqua portal work/src/plugins/`)

Manifest-first plugin architecture. Every plugin is a single object exporting an
`AquaPlugin` manifest. The runtime mutates `OrgRecord.plugins[]` and runs
lifecycle hooks. 34 plugins registered, 16 presets bundle them for one-click
portal creation.

> Source: agent 1 sweep of `02 felicias aqua portal work/src/plugins/`.

## Contract — `_types.ts`

| Type | Purpose |
|------|---------|
| `AquaPlugin` | The manifest. Required: `id` (lowercase-kebab), `name`, `version` (semver), `status` (`stable`/`beta`/`alpha`), `category` (`core`/`content`/`commerce`/`marketing`/`support`/`ops`), `tagline`, `description`. Optional: `core` (auto-installed), `icon`, `plans` (PlanId[]), `requires`/`conflicts`, lifecycle hooks (`onInstall`/`onUninstall`/`onEnable`/`onDisable`/`onConfigure`), `setup` wizard, `navItems`, `pages`, `api`, `storefront`, `settings`, `features`, `healthcheck`. |
| `NavItem` | Sidebar contribution. `id`, `label`, `href`, `icon`, `badge`, `requiresFeature`, `order`, `panelId` (`main`/`store`/`marketing`/`content`/`settings`/`ops`/`tools`/`website`), `groupId`. |
| `PluginPage` | Lazy-loaded admin page. `path` (empty = index), `component` (dynamic import), `requiresFeature`, `title`. |
| `PluginApiRoute` | API route mounted under `/api/portal/<plugin>/<path>`. `path`, `methods`, `handler`, `requiresFeature`. |
| `SettingsSchema` / `SettingsGroup` / `SettingsField` | Declarative form. Field types: `text`/`password`/`url`/`email`/`number`/`select`/`boolean`/`textarea`/`color`. Supports `default`, `options`, `helpText`, `plans`. |
| `PluginFeature` | Granular toggle. `id`, `label`, `default`, `plans`, `requires` (feature deps). |
| `SetupStep` | Multi-step onboarding. `id`, `title`, `fields`, `validate?`, `optional`. |
| `BlockDescriptor` / `StorefrontRoute` / `HeadInjection` | Storefront contributions (editor blocks, public pages, head scripts). |
| `HealthStatus` | Plugin probe. `ok`, `message`, `components`. |
| `OrgPluginInstall` | Per-install state on `OrgRecord.plugins[]`. `pluginId`, `installedAt`, `installedBy`, `enabled`, `config`, `features`, `setupAnswers`, `health`. |

## Registry — `_registry.ts`

`PLUGIN_REGISTRY` is a strictly typed array, built at module-load time. 34 plugins. Validation runs at registration via `validatePlugin()`; malformed manifests are filtered out with descriptive console errors instead of crashing the layout.

Public API (`_registry.ts:130-170`):
- `registerPlugin(plugin)` — runtime registration (third-party / dev plugins)
- `listPlugins()` — all plugins
- `getPlugin(id)` — lookup
- `listCorePlugins()` — `core: true` plugins
- `listInstallablePlugins()` — non-core (marketplace candidates)
- `requirePlugin(id)` — get-or-throw

## Runtime — `_runtime.ts`

All functions return `{ ok, error }` — never throw. Storage is namespaced per plugin under `pluginData[orgId][pluginId][key]`; uninstall wipes only that plugin's namespace.

```
installPlugin(orgId, pluginId, options) →
  validate org · validate plugin · check not already installed
  · validate requires · validate conflicts
  · build OrgPluginInstall (defaultConfig + defaultFeatures)
  · push onto org.plugins[] · run plugin.onInstall(ctx, setupAnswers)
  · on hook error: rollback install · return { ok, install }

uninstallPlugin(orgId, pluginId) →
  check not core · check installed · check no reverse deps
  · run plugin.onUninstall(ctx) · wipe pluginData · remove from array

setPluginEnabled(orgId, pluginId, enabled) →
  flip install.enabled · run onEnable / onDisable

configurePlugin(orgId, pluginId, patch) →
  validate feature deps · merge config + features · onConfigure(ctx)

applyPreset(orgId, preset) →
  for each entry in preset.plugins:
    installPlugin with featureOverrides + configOverrides
    on failure → rollback all prior installs

ensureCorePluginsInstalled(orgId) →
  install every plugin with core:true silently with default config
```

## Presets — `_presets.ts`

16 one-click bundles, applied during org creation:

| id | bundle |
|----|--------|
| `empty` | Brand kit only |
| `website-scratch` | Brand · Website · Forms · SEO · Analytics · Compliance |
| `website-existing` | Same + Repo (codeView on) for adopting existing GitHub repos |
| `ecommerce-physical` | Website · E-commerce (physical/shipping/inventory on) · Forms · SEO · Analytics · Compliance |
| `ecommerce-digital` | Website · E-commerce (digital, license keys, downloads) · Email · Forms · SEO · Analytics · Compliance |
| `ecommerce-hybrid` | Both physical + digital |
| `blog` | Website · Blog (scheduling, tags, RSS on) · Forms · SEO · Analytics · Compliance |
| `marketing` | Website · Funnels (splitTests on) · Forms · Chatbot · SEO · Analytics · Compliance |
| `saas` | Website · Funnels · Forms · Email · Chatbot · Support · SEO · Analytics · Compliance |
| `subscription-saas` | Subscriptions + Memberships layered on saas + AuditLog |
| `charity` | Donations (goals on) + Memberships + Blog |
| `bookings` | Reservations (calendar/reminders on) + Email + Notifications |
| `membership-site` | Subscriptions + Memberships (free + paid tiers) + Blog |
| `service-business` | Reservations (services/staff/reminders) for salons/clinics |
| `agency` | Everything (CRM, Affiliates, Webhooks, AuditLog, all hubs) |

Each preset entry can override `featureOverrides` and `configOverrides` per-plugin.

## Path mapping — `_pathMapping.ts`

`pluginIdForPath(pathname)` resolves which plugin owns an `/admin/*` path. Algorithm: iterate all plugins' navItems, find longest-prefix match on `href`. Used by sidebar (filter nav items per install), layout (show install hint), and route shells (permission check).

## Validator — `_validate.ts`

Runs at registration. Returns `{ ok, errors[], warnings[] }`. Checks:

- `id` matches `/^[a-z][a-z0-9-]*$/`
- name/tagline/description non-empty strings
- version is semver
- status ∈ `stable | beta | alpha`
- category ∈ `core | content | commerce | marketing | support | ops`
- `plans` ⊆ `free | starter | pro | enterprise`
- `requires`/`conflicts` arrays don't include own id
- navItems unique ids; href starts with `/`
- features unique ids
- settings.groups unique; fields valid type

Cross-plugin checks: duplicate ids, missing requires, missing conflicts.

## Plugin catalogue (34 plugins)

| id | name | category | tagline | key features | requires |
|----|------|----------|---------|--------------|----------|
| **brand** | Brand Kit | core | Logo, palette, fonts | logoUpload, paletteEditor, fontPicker, faviconUpload, darkLightVariants | (core, auto-installed) |
| **website** | Website | content | 33 blocks, themes, SEO | simpleEditor, advancedEditor, codeView (ent), templates, versionHistory, customCSS (pro), customDomain (pro) | — |
| **ecommerce** | E-commerce | commerce | Products, variants, Stripe, orders | physicalProducts, digitalProducts, variants, inventory, shipping, discountCodes, reviews, subscriptions (pro), stripeCheckout, downloadDelivery, licenseKeys, multiCurrency (ent) | website |
| **inventory** | Inventory (advanced) | commerce | Multi-warehouse, batches, suppliers | multiWarehouse, suppliers, purchaseOrders, batchTracking (pro), autoReorder (pro), barcodeScanning (ent), stockTransfers | ecommerce |
| **subscriptions** | Subscriptions | commerce | Recurring billing, trials, dunning | trials, planSwitching, proration, dunning, customerPortal, annualDiscount, metered (ent), multipleSeats (ent) | ecommerce, email |
| **blog** | Blog | content | Posts, scheduling, RSS, tags | scheduling, featuredImage, tags, rss, comments (pro), newsletter | website |
| **wiki** | Wiki / docs | content | Collaborative docs, revisions | publicEdit, memberEdit, revisionHistory, sidebarNav, internalLinks, tableOfContents | website |
| **knowledgebase** | Knowledge base | support | Public help centre, search, voting | categories, search, voting, chatbotQuotes (pro), tableOfContents | website |
| **forum** | Forum / community | support | Threaded discussion, voting, mod | voting, mentions, moderation, memberOnly, richText, topicSubscriptions, trustLevels (ent) | website |
| **memberships** | Memberships | content | Member-only content, tiers | freeTier, paidTiers, memberDirectory, memberOnlyBlocks, welcomeEmail, memberCommunity (pro) | website |
| **reservations** | Reservations | commerce | Time-slot bookings, calendar | calendarView, groupBookings, depositPayments (pro), reminders, smsReminders (ent), waitlist, recurring (pro) | website, email |
| **donations** | Donations | commerce | One-off + recurring donations | oneOff, recurring, goals, donorWall, anonymousOption, giftAid (UK), matchedGiving (ent) | website, ecommerce |
| **email** | Email | marketing | Transactional, templates, newsletter | transactional, templates, newsletter (pro), segments (ent), automations (ent) | — |
| **forms** | Forms | content | Login, signup, contact forms | loginForm, signupForm, socialAuth (pro), customForms, webhooks (pro), turnstile, honeypot | website |
| **chatbot** | Chatbot | support | AI chatbot widget | claudeProvider, openaiProvider, customPrompt, quickReplies, theming, transcript (pro), humanHandoff (ent) | — |
| **livechat** | Live Chat | support | Real-time human messaging | widget, cannedReplies, attachments (pro), afterHoursAutoresponder, unreadBadge, audioNotification | — |
| **seo** | SEO | marketing | Sitemap, OG images, meta editor | sitemap, robots, ogImages, metaEditor, seoScore, structuredData, redirects (pro), canonicalDomains (ent) | website |
| **social** | Social | marketing | Share buttons + feed embeds | shareButtons, instagramFeed, twitterFeed, tiktokEmbed, openGraphTags, twitterCardTags | website |
| **analytics** | Analytics | marketing | Self-hosted pageviews, events, heatmaps | pageviews, events, scrollTracking, heatmaps (pro), sessionRecording (ent), funnelTracking, googleAnalytics, posthog, gdprMode | — |
| **funnels** | Funnels & A/B | marketing | Multi-step funnels, split tests | splitTests, funnels, conversionGoals, multivariate (pro), geoTargeting (ent) | website |
| **affiliates** | Affiliates | marketing | Referral codes, commission tracking | publicSignup, uniqueCodes, cookieAttribution, tieredRates (pro), stripeConnect (ent), twoTier (ent) | website, ecommerce |
| **crm** | CRM / Contacts | marketing | Contacts, deals, tasks | contacts, deals, tasks, notes, tags, autoImport, csvExport, leadScoring (pro), emailIntegration (ent) | website |
| **automation** | Marketing automation | marketing | Drip campaigns, IFTTT | dripCampaigns, ifThenThat, delayedActions, branchingLogic (pro), smsActions (ent), abPath (ent) | website, email |
| **search** | Search | content | Site-wide search | indexPages, indexProducts, indexBlog, indexKB, fuzzy, trending (pro), synonyms (ent) | website |
| **reviews-v2** | Reviews (universal) | marketing | Generic reviews | photos, verifiedBuyer, replyThreads, moderation, structuredData, averageWidget, anonymous | — |
| **compliance** | Compliance | support | GDPR cookie banner, privacy policy | cookiePopup, gdprMode, privacyPolicy, termsGenerator, dsar (pro), ccpa (ent) | — |
| **support** | Support hub | support | Feature requests, meetings, invoices | featureRequests, meetings, invoices, resources, ticketing (pro), slackBridge (ent) | — |
| **auditor** | Site Auditor | ops | PageSpeed Insights + Claude reports | pagespeed, claudeReports, scheduledRuns (pro), competitorAudit (ent) | website |
| **auditlog** | Audit log | ops | Compliance-grade activity log | adminActions, loginAttempts, dataExports, configChanges, diffViewer (pro), siemExport (ent) | — |
| **backups** | Backups | ops | Scheduled org snapshots | scheduled, manualBackup, downloadZip, s3Compatible (pro), encryptedAtRest (ent), pointInTimeRestore (ent) | — |
| **webhooks** | Webhooks | ops | Outbound HMAC-signed events | hmacSigning, retries, filters, transformations (pro), rateLimiting (ent) | — |
| **notifications** | Notifications | ops | In-app, email, browser-push | inApp, emailDigest, browserPush (pro), smsAlerts (ent), perUserPrefs, soundEffects | — |
| **repo** | Repo Browser | ops | Browse + edit GitHub repo | browse, viewFile, editFile (pro), triggerDeploy (pro) | — |
| **i18n** | i18n / Translations | content | Multi-language storefront, RTL | localePrefix, cookieLocale, autoDetect, rtlSupport, machineTranslate (pro), perLocaleSEO | website |

## Adding a plugin

1. Create `src/plugins/<plugin-id>/index.ts` exporting an `AquaPlugin` object.
2. Add the import to `src/plugins/_registry.ts`.
3. If it contributes admin pages, add them to the manifest's `pages[]` (lazy-loaded via `dynamic()`).
4. If it contributes API routes, add them to `api[]` — they mount under `/api/portal/<plugin-id>/...`.
5. If it contributes editor blocks, add them to `storefront.blocks[]`.
6. Plug-in's storage is automatically namespaced; use the `ctx.storage` API in lifecycle hooks.

## Conventions

- **No global side-effects on import** — manifests are data only.
- **Per-plugin storage** uses `ctx.storage` (namespaced) — never poke `pluginData` directly.
- **Events flow via the bus** — when something interesting happens, `emit(orgId, name, payload)`.
- **Plan-gating** declared on the manifest (`features[].plans`).
- **Admin pages** wrap with `<PluginRequired plugin="x" feature="y">` for unconfigured-empty-state.
- **Sidebar placement** declared via `navItem.panelId` + optional `groupId` — no need to edit `DEFAULT_LAYOUT`.
