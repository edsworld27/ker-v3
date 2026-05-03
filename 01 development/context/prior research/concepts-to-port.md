# Concepts to port forward to `04 the final portal/`

Synthesis of what's worth taking from `02` and `03`, ranked by leverage.

> Source: agents 5 + 6 synthesis.

## From `02 felicias aqua portal work/` (Aqua / Felicia portal)

These are the **production-grade** pieces — port directly, not concepts to
recreate.

| # | concept | location | priority |
|---|---------|----------|----------|
| 1 | **Plugin platform** — `_types.ts` / `_registry.ts` / `_runtime.ts` / `_presets.ts` / `_pathMapping.ts` / `_validate.ts` | `02/src/plugins/` | CRITICAL — foundation of `04` |
| 2 | **33 plugin manifests** — Brand · Website · E-commerce · Email · Forms · Analytics · Stripe · CRM · Webhooks · etc. Each is a single object | `02/src/plugins/<id>/` | HIGH — many are pre-vetted (esp. website + ecommerce) |
| 3 | **16 presets** — one-click bundles | `02/src/plugins/_presets.ts` | HIGH — drives the "select a phase" UX |
| 4 | **Server modules** — storage abstraction, eventBus, orgs, email, webhooks, automation, orders, pages, analytics, ... | `02/src/portal/server/` | CRITICAL |
| 5 | **Visual editor** — Live · Block · Code modes, complexity (Simple / Full / Pro), 58 blocks, BlockRenderer with split-test + theme overlay | `02/src/app/admin/editor/`, `02/src/components/editor/` | HIGH — pre-vetted plugin candidate |
| 6 | **Portal variants** — `PortalRole` + `isActivePortal` singleton, starter trees per role, preview route, customer-facing safety fallback | `02/src/app/admin/portals/`, `02/src/portal/server/pages.ts` | HIGH — directly maps to per-client login customisation |
| 7 | **Auth** — scrypt + HMAC sessions + timing-safe + dummy-hash + rate-limits + open-redirect guard + force-password-change | `02/src/lib/server/auth.ts`, `02/src/middleware.ts` | CRITICAL |
| 8 | **Security headers + CSP** | `02/next.config.ts` | HIGH |
| 9 | **Setup checklist + Help drawer + Ask Aqua AI assistant** | `02/src/components/admin/SetupChecklist.tsx`, `HelpButton.tsx`, `src/lib/admin/helpDocs.ts`, `/api/portal/help/ask` | MEDIUM |
| 10 | **Stripe webhook + checkout + billing portal** | `02/src/lib/stripe/server.ts`, `/api/stripe/*` | HIGH (when commerce needed) |
| 11 | **S3 backups (SigV4, no SDK)** + Vercel domain auto-attach | `02/src/lib/{s3,vercel}/server.ts` | MEDIUM |
| 12 | **`useContent()` 3-tier lookup** — portal published → localStorage admin → fallback | `02/src/lib/useContent.ts` | HIGH |
| 13 | **PortalEditOverlay** — in-context click-to-edit overlay, postMessage protocol with editor host | `02/src/components/PortalEditOverlay.tsx` | HIGH (part of editor plugin) |
| 14 | **Plugin marketplace UI** — install / configure / disable / uninstall + setup wizards | `02/src/components/admin/PluginMarketplace.tsx` | CRITICAL |

## From `03 old portal/` (Aqua Portal v9)

The patterns **missing from `02`** that we should recreate as new
plugins in `04`. Don't port code — port concepts.

| # | concept | location in `03` | what it gives us | effort |
|---|---------|------------------|------------------|--------|
| 1 | **Client lifecycle stages** (Discovery → Design → Development → Onboarding → Live → Churned) | `Bridge/types/index.ts` ClientStage; `aqua-client/ClientShell/ClientTemplates/ClientDashboard/` 5 phase subviews | Structured workflow tracking; conditional UX per phase; clear feature gating | LOW |
| 2 | **Fulfillment briefs + deliverables pipeline** | `Bridge/data/schema.prisma` (FulfilmentBrief + FulfilmentDeliverable + BriefAssignment); `aqua-client/.../Fulfillment/ClientFulfillmentView.tsx` | Project work-order management; approval workflow; revision tracking | MEDIUM |
| 3 | **Per-client team assignments** (agency staff + freelancers) | `Client.assignedEmployeeIds`, `assignedFreelancers`; `BriefAssignment` junction | Enables permission scoping; tracks capacity | LOW |
| 4 | **Client resource library** (file/link hub per client) | `ClientResource` Prisma model; `aqua-client/.../ClientResources/` | Shared assets per client; reduces email/Slack | LOW |
| 5 | **Marketplace UI pattern** (search + filter + toggle + drawer + presets) | `aqua-host-shell/.../TemplateHub/HostTemplateHubView.tsx` | Polished UX for plugin install. Aqua already has this in `02` but the old version's polish exceeds it in some details | MEDIUM |
| 6 | **AI chat panel + CustomEvent dispatch + prompt cache** (Claude Opus 4.7 SSE, 1-hour ephemeral cache) | `Bridge/ui/AIChatPanel.tsx`, `aqua-host-shell/app/api/ai/chat/route.ts` | Real-time copilot; cross-app trigger via window event | MEDIUM |
| 7 | **Freelancer portal variant** (restricted role, fulfillment-only access) | `Bridge/auth/index.ts` resolveProductAccess; `Freelancer` role | Separate UX for contractors; self-serve deliverable submission | MEDIUM |
| 8 | **Activity log + timeline widget** | `Bridge/data/schema.prisma` ActivityLog model; widget pattern | Audit trail; user-facing history feed | LOW |
| 9 | **6-role hierarchy with productAccess gating** | `Bridge/types/index.ts` UserRole; `Bridge/config/index.ts` ROLE_PRODUCT_MAP; `Bridge/auth/index.ts` resolveProductAccess | Fine-grained access control; multi-tenant safety | LOW |
| 10 | **Bridge UI kit** (Page, Card, KpiCard, Button, Modal, Field, Input, Select, Badge, Avatar, DataTable, EmptyState, Toast — 480 LOC, zero deps) | `Bridge/ui/kit.tsx` | Consistent design language; no design-library lock-in | MEDIUM |
| 11 | **DynamicRenderer pattern** (config → mounted components by string name) | `Bridge/concepts/DynamicRenderer/`, `extras/vite-prototype/src/components/DynamicViewRenderer.tsx` | True plugin architecture; avoids module circular deps | LOW |
| 12 | **PageBuilder / RoleBuilder / AgencyConfigurator** (Vite-prototype patterns) | `Bridge/concepts/PageBuilder/`, `RoleBuilder/`, `AgencyConfigurator/` | Custom dashboard builder, role CRUD UI, real-time agency branding editor | MEDIUM-HIGH |

## Synthesis: what `04 the final portal/` needs

Architecture target: **Aqua's plugin model + old portal's tenancy model**.

```
Foundation (port from 02):
  - Next.js 16 + React 19 + plugin platform + server modules
  - Auth (scrypt + HMAC + force-password-change)
  - Visual editor + 58 blocks + portal variants
  - Storage abstraction (file / KV / Supabase / Postgres)
  - Stripe / S3 / Vercel integrations
  - Setup checklist + Help drawer + Ask Aqua

New plugins for 04 (recreate from 03 concepts):
  - client-lifecycle  (ClientStage on Org; phase-aware portal variants)
  - fulfillment       (briefs + deliverables + assignments + status pipeline)
  - client-resources  (file/link hub per client)
  - agency-hr         (staff directory, departments — port People Hub patterns)
  - agency-finance    (invoicing clients, expenses — re-design Finance Hub from scratch)
  - agency-marketing  (your funnel + campaigns — for the agency itself)
  - freelancer-portal (restricted role + portal variant)

Role hierarchy (extend 02's auth):
  agency-owner, agency-manager, agency-staff,
  client-owner, client-staff, freelancer,
  end-customer

URL surface:
  /                           public marketing site (Milesy Media)
  /portal                     operator login → routes by role
  /portal/agency/*            agency-internal (HR, Finance, fulfillment)
  /portal/clients/[orgId]/*   per-client admin (operator working IN a client)
  /admin                      per-client storefront admin (legacy / per-tenant)
  /account                    end-customer login (per client portal)
  ↑↑ The whole point: each client gets their own /admin and /account
     surfaces, branded and feature-gated by their installed plugins.
```

Recursive aspect (Ed's "portal to anywhere"): clients build their own
customer-facing portals via the website editor plugin. Their customers
log in with the client's branding (e.g. for ecommerce, memberships,
affiliates) — which is itself an iframe-embed surface served from this
portal. The same login + portal-variant + brand-kit machinery powers
every level.
