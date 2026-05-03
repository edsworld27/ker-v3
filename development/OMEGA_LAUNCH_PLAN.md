# Omega Launch Plan

> **Vision:** an agency platform where Felicia, and clients like her, plug their websites into one portal. Same codebase that ships *her* storefront also ships *your* agency dashboard — Felicia logs in via your agency website, via a future portal app, or directly on her own site. Every client's portal is themed and feature-gated independently. CRM, operations, marketing, and other modules slot in over time.
>
> **Right now:** Felicia's website + admin panel are the proving ground. Everything we polish on her site becomes the template the agency platform deploys to every future client. Get the storefront and e-commerce flow tight, *then* layer the agency model on top.

---

## Where we are today (snapshot, ~23 commits in on `claude/nested-custom-links-zq6Vn`)

### Shipped & solid
- **5-level nested admin sidebar** with custom-link tree
- **Portal architecture, fully cloud-architected**
  - Phase A · single-tag handshake + heartbeats + connected-site indicator
  - Phase B · tracking aggregator (GA4, GTM, Meta, TikTok, Hotjar, Clarity, Plausible)
  - Phase C · declared content overrides + auto-discovery
  - D-1 · `portal.config.ts` manifest pattern
  - D-2 · draft/publish workflow + preview links + revertable history
  - D-3 · GitHub PR promotion (`portal.overrides.json`)
  - D-4 · pluggable backend (file / KV / Supabase) with auto-migration
  - D-5 · embed registry (chatbots, calendars, video, custom HTML)
- **Compliance modes** — None / GDPR / HIPAA / SOC 2 with provider gates + retention purge
- **Cloud audit log** with retention driven by compliance mode
- **Customer Edit alternative** to impersonation; auto-stop on mode flip
- **Vercel + GitHub auto-discovery** on first heartbeat
- **Quick setup mode** + setup checklist
- **Sync DB button** (Supabase Management API) + AI prompt for other DBs
- **Existing/New site setup mode picker** with AI Convert prompt
- **Inject Portal tag** PR button
- **Iframe login embed** — chatbot-style loader (`/portal/embed.js`) + self-contained `/embed/login`
- **G-1 · Per-site embed customisation** — colours, logo, copy, admin-access link
- **Dev bypass** is now `NEXT_PUBLIC_PORTAL_DEV_BYPASS=1` opt-in (off by default)

### Partially shipped (works but rough)
- Storefront content is dual-run (legacy CMS + portal overrides) — only ~20 keys in `portal.config.ts`; the rest of the site still reads localStorage
- Cookie banner exists (`CookiePreferencesModal`) but isn't tied to compliance mode
- Chatbot exists (`ChatBot.tsx`) but per-site provider config + welcome script aren't wired
- SEO via `SiteHead.tsx` works but no scoring / suggestions
- Self-host vs Vercel deploy paths exist but aren't documented in admin
- Repo zip download exists at `/api/admin/export-code` but the button is buried

### Not started
- **G-2** Org / tenant model above Site
- **G-3** Per-tenant feature flags wired to Stripe products
- **G-4** Customisable per-tenant dashboards
- **G-5** Real auth + role hierarchy
- Visual in-place website editor
- CRM / Operations / Email modules

---

## Tier 1 — Felicia launch polish (current focus)

Order is roughly highest impact first, with effort shown for honesty. Each item lands in its own commit.

| # | Item | Why it matters | Effort |
|---|---|---|---|
| 1 | **Deployment options polish** — Vercel / self-host / managed-host guidance + prominent "Download repo zip" + per-mode env-var copy panel | "Self-host vs Vercel" was an explicit ask. Removes the friction between *this works in dev* and *this is live*. | 2–3h |
| 2 | **Cookie popup polish** — wire to compliance mode, per-site theme, GDPR-correct decline flow, granular consent persistence | GDPR is real-money risk, and the popup shows on every page load — first impression. | 3–4h |
| 3 | **Chatbot per-site configuration** — provider picker (Crisp/Intercom/Tidio/custom GPT), welcome message, position; surface in admin embed flow | We already have the embed registry; chatbots just need the per-site UX wired and a sensible default. | 2–3h |
| 4 | **Blog UX polish** — editor (markdown + featured image + scheduling), storefront blog list + post page, RSS | Content marketing is the long-term traffic source for any e-commerce site. | ½ day |
| 5 | **SEO addons polish** — sitemap.xml, robots.txt, OG image generator, structured data validation, per-page SEO score | Currently meta tags are set but there's no sitemap, no scoring, no OG image. | ½ day |
| 6 | **Performance audit** — Lighthouse pass on Felicia's site, image optimisation, font subsetting, JS bundle audit | Core Web Vitals affects search ranking + conversion. | ½ day |
| 7 | **E-commerce flow audit** — cart, checkout, Stripe webhook idempotency, order confirmation email, inventory deduction, abandoned cart | This is the actual money path. One broken edge here = lost revenue. | 1 day |
| 8 | **Visual website editor (in-place)** — admin clicks any text/image with `data-portal-edit` attribute, edits inline, saves. Same draft/publish workflow. | The user has been asking for "the actual website editor" since early on. Big UX win. | 1–1.5 days |
| 9 | **Head tracker stability** — error boundaries, rate limiting, telemetry sampling, fallback when portal is down | Tag runs on every host page; one bug breaks the customer site. | ½ day |
| 10 | **Sites admin polish** — favicon upload UI, theme variant per site picker UX, domain DNS-check helper | The Sites tab is the agency control room; it should feel finished. | ½ day |

**Tier 1 total estimate:** ~7–8 working days.

---

## Tier 2 — Agency platform (G phases)

Tackled after Felicia's site is launched and stable. Each G phase deserves its own multi-turn conversation; rough sizing for planning.

| Phase | What it delivers | Effort |
|---|---|---|
| **G-2** | **Organisation model** above Site. Agency owns N orgs (one per client), each org owns N sites + has its own settings/billing/branding. Storage migration: every existing per-site map gains an `orgId` scope. New `/admin/orgs` page; tenant switcher in admin chrome. | 1.5 days |
| **G-3** | **Stripe-billed feature flags.** Each feature (inventory, marketing, blog, etc.) can be tied to a Stripe product. "Press a button" → Stripe checkout → webhook flips the flag → tenant sees the new module. | 1 day |
| **G-4** | **Customisable per-tenant dashboards.** Affiliate dash, orders dash, etc. as composable widgets the agency owner can show/hide/reorder per tenant. Each widget is feature-flagged. | 1.5–2 days |
| **G-5** | **Real auth + role hierarchy.** Replaces the dev-bypass. Roles: `agency-admin` (you), `tenant-admin` (Felicia), `tenant-staff`, `customer`. Session scoping, permission matrix, sign-up flow for new tenants. | 1–1.5 days |

**Tier 2 total:** ~5–6 working days. Sequencing: G-2 → G-5 → G-3 → G-4 (auth before billing before dashboards).

---

## Tier 3 — Future modules (post-launch)

These aren't urgent but they're the "unlimited potential" the user described. Each is a self-contained module that plugs into G-2's tenant scope and G-3's feature-flag system.

- **CRM sidebar** — customer notes, tags, lifetime value, communication log
- **Operations** — tasks, SOPs, SLAs, incident tracking
- **Email marketing** — broadcast campaigns + drip sequences (Resend / Postmark integration)
- **SMS marketing** — Twilio / MessageBird integration
- **Multi-language** — content overrides become locale-aware
- **A/B testing UI** — wired to the existing `ABTestRunner.tsx` infrastructure
- **Analytics dashboard** — pulls from the tracking aggregator's beacon stream

---

## Working agreement

1. **One Tier 1 item per turn.** Each ships as its own commit on `claude/nested-custom-links-zq6Vn`.
2. **Type-check + push every turn.** Never leave broken code on the branch.
3. **Honest scope.** If an item turns out bigger than estimated, we ship the meaningful slice and keep the rest as a follow-up rather than rushing.
4. **No new dependencies without flagging.** Every npm package we add is a maintenance + security cost.
5. **G phases happen sequentially after Tier 1 is done.** No interleaving. Felicia's site ships first, agency platform builds on the now-stable foundation.
6. **The PR opens** when Tier 1 + at least G-2 are landed — that's a coherent shippable agency v1.

---

## Status legend (used in subsequent turn summaries)

- ✅ Done & landed
- 🟡 In progress (current turn)
- ⏳ Up next
- ⬜ Queued
- 🔴 Blocked / needs decision
