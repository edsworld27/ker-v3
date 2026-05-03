// Per-route help docs for the admin shell.
//
// Structured rather than markdown so authoring is type-checked and we
// don't have to ship a parser. Keys match the admin route's
// `usePathname()` value; the lookup also strips trailing dynamic
// segments so /admin/customers/[email] reuses the /admin/customers
// doc when no per-detail doc exists.
//
// Adding a doc for a new page: drop a record into HELP_DOCS keyed by
// the route. The HelpButton in the admin layout picks it up.

export interface HelpSection {
  heading: string;
  body: string;
  bullets?: string[];
  link?: { label: string; href: string };
}

export interface HelpDoc {
  title: string;
  intro?: string;
  sections: HelpSection[];
}

export const HELP_DOCS: Record<string, HelpDoc> = {
  "/admin": {
    title: "Your dashboard",
    intro: "Everything happens from here. The setup checklist at the top tells you what to wire up next; the KPI cards summarise the last 30 days once orders start coming in.",
    sections: [
      {
        heading: "First-time setup",
        body: "If you haven't sold anything yet, the cyan welcome card and the amber setup checklist guide you through the basics — install plugins, add a product, edit your home page.",
      },
      {
        heading: "Once you're live",
        body: "The KPI strip shows revenue, orders, fulfilment status, low stock, and customer count. Recent orders appear below — click any to drill into the detail.",
      },
      {
        heading: "If you're stuck",
        body: "Most admin pages have this Help button (the ? in the top right). Click it on any page for a short explainer of what that page does.",
      },
    ],
  },

  "/admin/products": {
    title: "Products",
    intro: "Your catalog. Each row is a product visitors can buy. Click a product to edit details, variants, images, and pricing.",
    sections: [
      {
        heading: "Adding a product",
        body: "Hit + New product (top right). Fill in the name, description, price, image — the bare minimum to be sellable. You can come back and add variants, SEO and inventory later.",
        link: { label: "Add a product →", href: "/admin/products/new" },
      },
      {
        heading: "Variants vs. options",
        body: "A variant is a sellable SKU (e.g. 'Lavender 100g'). Options are the dimensions a customer picks (size, scent). One product can have many variants; each variant has its own stock count.",
      },
      {
        heading: "Stock + inventory",
        body: "Stock counts are per-variant. The dashboard's 'Low stock' KPI counts variants below their reorder threshold. Set the threshold on the variant row.",
      },
    ],
  },

  "/admin/orders": {
    title: "Orders",
    intro: "Every purchase across your store. Filter by status, search by customer email or order id.",
    sections: [
      {
        heading: "Status flow",
        body: "Orders go: pending → paid → fulfilled → shipped. Pending = card not yet charged (rare; means Stripe webhook hasn't landed). Paid = money received, you owe the goods. Fulfilled = packed. Shipped = on its way.",
      },
      {
        heading: "Marking shipped",
        body: "Open the order, paste the tracking number, hit Mark shipped. The customer gets an email automatically (if your email plugin is configured).",
      },
      {
        heading: "Refunds",
        body: "Refund inside Stripe directly — that's the source of truth. The order status here updates from the Stripe webhook within seconds.",
      },
    ],
  },

  "/admin/customers": {
    title: "Customers",
    intro: "Everyone who's bought something or signed up. Click a customer to see their order history, addresses, and notes.",
    sections: [
      {
        heading: "Where customers come from",
        body: "Anyone who completes checkout becomes a customer. You can also import customers from a CSV or add them manually. Newsletter signups get logged separately under Marketing.",
      },
      {
        heading: "Notes",
        body: "Add internal notes to a customer profile — preferences, conversations, anything you want to remember next time. Notes never appear to the customer.",
      },
    ],
  },

  "/admin/blog": {
    title: "Blog",
    intro: "Long-form content. Each post has a title, an excerpt, a body, and an optional featured image.",
    sections: [
      {
        heading: "Drafts vs. published",
        body: "New posts start as drafts. Hit Publish when ready — published posts appear on the storefront's /blog page and the home-page blog block.",
      },
      {
        heading: "Scheduling",
        body: "You can schedule a post for a future date — it stays as a draft until that timestamp, then auto-publishes.",
      },
    ],
  },

  "/admin/email": {
    title: "Email",
    intro: "Order confirmations, password resets, marketing — every email your portal sends is logged and configured here.",
    sections: [
      {
        heading: "Connecting a sender",
        body: "Pick Resend or Postmark, paste their API key in the plugin settings, send a test. Without this, every transactional email silently fails.",
        link: { label: "Plugin settings →", href: "/aqua" },
      },
      {
        heading: "Templates",
        body: "Six bundled templates (order confirmation, shipping, welcome, etc.). Override subject + HTML + text per-org under the Templates tab.",
      },
      {
        heading: "Compose tab",
        body: "Send a one-off email to anyone — useful for personal follow-ups. Logged alongside transactional sends so you have one source of truth.",
      },
      {
        heading: "Log",
        body: "Every send (success and failure) lands here with timestamp, recipient, subject, and provider response. Use it to debug undelivered email.",
      },
    ],
  },

  "/admin/sites": {
    title: "Sites",
    intro: "You can run multiple storefronts from one admin. Each site has its own brand, domains, and content but shares the product catalog.",
    sections: [
      {
        heading: "Adding a domain",
        body: "Type your domain, hit Add. Then point its DNS at your hosting provider (instructions appear inline). 'Add + attach to Vercel' wires it up automatically when VERCEL_TOKEN is set on the server.",
      },
      {
        heading: "DNS check",
        body: "Click 'Check DNS' on a domain row to see whether it currently resolves to a host that looks like Vercel. Saves you guessing whether you've propagated yet.",
      },
    ],
  },

  "/admin/editor": {
    title: "Visual editor",
    intro: "Edit pages three ways — Live (click to edit on the real page), Block (drag-drop blocks into a tree), or Code (raw JSON for power users).",
    sections: [
      {
        heading: "Three modes",
        body: "Live = WYSIWYG. Block = drag-drop. Code = JSON. Switch via the topbar tabs. The same page renders the same way in all three; pick whichever feels natural.",
      },
      {
        heading: "Simple / Full / Pro",
        body: "Top-right complexity selector. Simple hides everything but the canvas (perfect for one-off copy tweaks). Full is the default. Pro adds page-settings shortcuts (theme override, layout, custom CSS).",
      },
      {
        heading: "Publishing",
        body: "Hit Publish (top right) to push a draft live. With GitHub configured, this opens a PR with the diff for review. Without it, the page goes live immediately.",
      },
    ],
  },

  "/admin/memberships": {
    title: "Memberships",
    intro: "Tiers + members. Define the tiers visitors can join, manage who's on which tier.",
    sections: [
      {
        heading: "Tiers vs. members",
        body: "Tiers are the things visitors join (Free, Premium, etc.). Members are the people who've joined a tier. Configure tiers first, then members appear as people sign up.",
        link: { label: "Configure tiers →", href: "/admin/memberships/tiers" },
      },
      {
        heading: "Paid tiers",
        body: "Set a Stripe price id on a tier to make it paid. The Subscriptions plugin handles the recurring billing once the customer joins.",
      },
    ],
  },

  "/admin/affiliates": {
    title: "Affiliates",
    intro: "Affiliates apply, get a referral code, and earn commission on every sale they drive.",
    sections: [
      {
        heading: "Approving applicants",
        body: "Pending applications surface at the top. Approve to give them an active referral code; reject to suspend the application.",
      },
      {
        heading: "Tracking + commission",
        body: "When a visitor with ?ref=CODE in the URL buys, the system credits commission to that affiliate. View per-affiliate stats under Stats; settle balances under Payouts.",
        link: { label: "Open Payouts →", href: "/admin/affiliates/payouts" },
      },
    ],
  },

  "/admin/donations": {
    title: "Donations",
    intro: "One-off + recurring donations via Stripe Checkout. Track totals, donor recognition preferences, and Gift Aid status.",
    sections: [
      {
        heading: "Goals",
        body: "Define a fundraising goal with a target amount and an end date. The storefront's donation block can show progress towards it.",
        link: { label: "Manage goals →", href: "/admin/donations/goals" },
      },
      {
        heading: "Gift Aid",
        body: "Donors can opt in to Gift Aid (UK tax reclaim). The Donors directory shows lifetime totals and Gift Aid eligibility — export as CSV for your HMRC claim.",
      },
    ],
  },

  "/admin/backups": {
    title: "Backups",
    intro: "Snapshots of your full portal state — orgs, users, pages, content, plugin configs. Each backup is restorable from /admin/backups/restore.",
    sections: [
      {
        heading: "Take one now",
        body: "Click 'Backup now' to capture the current state. Useful before any risky change — restoring rolls everything back in seconds.",
      },
      {
        heading: "Storage",
        body: "Default adapter writes to disk (.data/backups/). For production you'll want S3 — set it on the Backups plugin config with bucket + region + access keys. Works with AWS, R2, Spaces, MinIO.",
      },
      {
        heading: "Scheduling",
        body: "Point a cron at POST /api/portal/backups for daily/weekly snapshots. Vercel cron, GitHub Actions, or system crontab — anything that can hit a URL on a schedule.",
      },
    ],
  },

  "/admin/auditlog": {
    title: "Audit log",
    intro: "Every admin-side mutation: tier changes, payouts, plugin installs, content publishes, password changes. Required for SOC 2 + HIPAA compliance modes.",
    sections: [
      {
        heading: "What's logged",
        body: "Anything operators do that changes data. Each entry has actor (who), timestamp (when), category, action description, and a before/after diff where one was supplied.",
      },
      {
        heading: "Retention",
        body: "Default 365 days. SOC 2 doesn't require a specific window; HIPAA needs 6 years (2190 days). Set under the AuditLog plugin's settings.",
      },
      {
        heading: "Export",
        body: "Filter the log, hit Export CSV for an offline copy. Useful for audits or feeding into a SIEM.",
      },
    ],
  },

  "/admin/team": {
    title: "Team",
    intro: "Invite teammates, assign roles, manage permissions.",
    sections: [
      {
        heading: "Roles",
        body: "Built-in roles: Owner (everything), Admin (most), Editor (content + storefront), Viewer (read-only). Customise role permissions under the Roles tab.",
      },
      {
        heading: "Invites",
        body: "Inviting someone sends them an email with a temp password. They're flagged as needing to change it on first sign-in (force-password-change flow).",
      },
    ],
  },

  "/admin/marketplace": {
    title: "Marketplace",
    intro: "Browse, install, and configure the plugins available for your portal. Each plugin contributes admin pages, storefront blocks, or background runtime.",
    sections: [
      {
        heading: "Categories",
        body: "Plugins group by category — Commerce, Content, Marketing, Support, Ops. Use the filter bar to narrow down.",
      },
      {
        heading: "Setup wizards",
        body: "Plugins that need credentials (Stripe, GitHub, etc.) walk you through a setup wizard the first time you install. You can re-run setup any time from the plugin's config page.",
      },
    ],
  },

  "/admin/customise": {
    title: "Customise",
    intro: "The look + feel of your admin panel and your storefront's brand chrome. Logo, colours, panel name, login page, sidebar customisations.",
    sections: [
      {
        heading: "Branding",
        body: "Upload a logo, set the panel name (shown in the sidebar header), pick an accent colour. These flow through to the admin chrome and the storefront brand-kit blocks.",
      },
      {
        heading: "Sidebar customisations",
        body: "Reorder + group the navigation under the Sidebar tab. Plugin-contributed items (declared in the plugin manifest) auto-appear; you can drag them into different panels.",
      },
      {
        heading: "Login customisation",
        body: "The Login tab affects the customer-facing /login page. For the new block-tree variant editor (lets you design /login as a full page in the visual editor), use /admin/portals → Login → New variant instead.",
        link: { label: "Open portal designer →", href: "/admin/portals" },
      },
    ],
  },

  "/admin/portal-settings": {
    title: "Portal settings",
    intro: "Cross-cutting platform config: GitHub integration, database backend, deployment options, third-party integration keys (Vercel, PageSpeed, Anthropic).",
    sections: [
      {
        heading: "GitHub",
        body: "Set the repo URL + paste a Personal Access Token. The Publish button in the editor uses these to open PRs against your repo. Without GitHub, edits are saved to the portal but never make it to your codebase.",
      },
      {
        heading: "Database backend",
        body: "Pick where portal state lives — file (dev), KV (Upstash Redis, recommended for production), Supabase, or Postgres. The active backend's key fields appear when you pick it.",
      },
      {
        heading: "Integrations",
        body: "Vercel token (for custom-domain auto-attach), PageSpeed key (for /admin/site-test audits), Anthropic key (for AI-formatted audit reports). Each is optional; the plugin shows what's configured.",
      },
    ],
  },

  "/admin/plugin-health": {
    title: "Plugin health",
    intro: "Per-plugin status check. For plugins that declare a healthcheck (most do), this page surfaces 'connected' / 'misconfigured' / 'down' so you can tell at a glance whether anything needs attention.",
    sections: [
      {
        heading: "What 'green' means",
        body: "The plugin's healthcheck function returned ok. For Stripe: keys present and the API responded. For Email: SMTP / API credentials accepted by the provider. For GitHub: repo URL + PAT accepted.",
      },
      {
        heading: "What 'red' means",
        body: "Healthcheck returned an error. The error message is shown verbatim — usually 'API key invalid', 'rate-limited', 'timeout'. Click into the plugin's config to fix.",
      },
      {
        heading: "Refresh all",
        body: "Top-right button re-runs every plugin's healthcheck. Useful after pasting a new key — shouldn't need to wait for the periodic refresh.",
      },
    ],
  },

  "/aqua": {
    title: "Agency dashboard",
    intro: "Cross-client overview when you run multiple portals (your own clients, white-label setups). Lists every org you own, their plan, status, recent activity.",
    sections: [
      {
        heading: "+ New portal",
        body: "Spin up a new client portal in seconds. Pick a preset (Empty / Website / E-commerce / Blog / SaaS / Membership / Charity / …) and the new org boots with the right plugins pre-installed.",
        link: { label: "+ New portal →", href: "/aqua/new" },
      },
      {
        heading: "Switching into a client",
        body: "Click 'Open portal' on any row to drop into /admin scoped to that org. The org switcher in the sidebar always brings you back.",
      },
      {
        heading: "Cross-client analytics",
        body: "Portfolio-level stats: total revenue, active orgs, plugins-installed-most. Useful for invoicing or quarterly reviews.",
      },
    ],
  },

  "/admin/customers/[email]": {
    title: "Customer profile",
    intro: "Everything we know about one customer — order history, addresses, notes, membership status, total spent.",
    sections: [
      {
        heading: "Quick actions",
        body: "Send a password-reset link, send the Stripe billing portal link (subscriptions plugin), trigger a manual order-status email. All actions are recorded in the audit log.",
      },
      {
        heading: "Notes",
        body: "Internal notes — preferences, conversations, special instructions. Never shown to the customer. Plain text; mentions/links don't render.",
      },
    ],
  },

  "/admin/email/log": {
    title: "Email log",
    intro: "Every email your portal has sent (transactional + marketing + manual compose). Each row shows recipient, subject, provider, status, and the provider's response.",
    sections: [
      {
        heading: "Failed sends",
        body: "If you suspect emails are being silently dropped, this is the first place to check. Look for status='failed' rows — the provider response usually points at the specific issue (bounced address, rate limit, invalid API key).",
      },
      {
        heading: "Resending",
        body: "Open a failed row → Resend. Useful for transient failures (provider downtime). For persistent failures (bad address) you'll need to fix the data first.",
      },
    ],
  },

  "/admin/inventory": {
    title: "Inventory",
    intro: "Stock levels across every product variant. Low-stock alerts on the dashboard come from here — set the reorder threshold per variant and you'll get a heads-up before anything sells out.",
    sections: [
      {
        heading: "Adjusting stock",
        body: "Edit the count inline on a row. The change persists immediately and the dashboard's Low-stock KPI re-counts within seconds.",
      },
      {
        heading: "Reorder thresholds",
        body: "Set a low-water-mark per variant. When stock drops below it, that variant counts towards Low stock and surfaces in alerts. Set to 0 to suppress alerts for a variant you're winding down.",
      },
      {
        heading: "Where stock comes from",
        body: "Stock counts are decremented on order completion (Stripe webhook). Manual adjustments from this page are the right way to record stocktakes, returns, or supplier deliveries.",
      },
    ],
  },

  "/admin/shipping": {
    title: "Shipping",
    intro: "Rates, regions, and packaging. Customers see your rates at checkout — get this right or you're either eating shipping cost or scaring off carts.",
    sections: [
      {
        heading: "Rates",
        body: "Define shipping zones (UK, EU, US, …) and a rate per zone. The cart picks the rate matching the delivery address. Free-over thresholds (\"free over £50\") are configurable per zone.",
      },
      {
        heading: "Carriers + tracking",
        body: "When you mark an order shipped, paste a tracking number — it goes into the customer's shipping confirmation email automatically. Carrier list is editable.",
      },
    ],
  },

  "/admin/seo": {
    title: "SEO",
    intro: "Site-wide SEO settings — site title pattern, default meta description, OG image, structured data, sitemap controls.",
    sections: [
      {
        heading: "Title pattern",
        body: "Pattern like '{page} | {site}' produces 'About | Felicia' in the browser tab. Per-page SEO overrides set under Page settings (Pro mode in the editor) take precedence.",
      },
      {
        heading: "Sitemap",
        body: "Auto-generated at /sitemap.xml from your published pages, blog posts, products. Pages flagged as `noindex` or `excludeFromSitemap` are skipped.",
      },
      {
        heading: "Robots.txt",
        body: "Auto-served at /robots.txt. Editable here when you need crawler-specific rules.",
      },
    ],
  },

  "/admin/analytics": {
    title: "Analytics",
    intro: "Pageviews, top pages, referrers, and conversion events for every site. First-party — no Google Analytics required (though you can wire that on top).",
    sections: [
      {
        heading: "How it works",
        body: "A tiny tracker auto-mounted on every site emits pageview + custom-event pings. They're aggregated server-side and rendered here. No third-party cookies, no consent banner triggered.",
      },
      {
        heading: "Heatmaps",
        body: "Click density and scroll depth per page when the Analytics plugin's Heatmaps feature is on. Useful for spotting dead zones on landing pages.",
      },
      {
        heading: "Conversions",
        body: "Define a conversion event (e.g. 'checkout-completed') and the dashboard shows funnel rates from view → conversion. Wired up in the storefront via the tracker's `track()` API.",
      },
    ],
  },

  "/admin/marketing": {
    title: "Marketing",
    intro: "Discount codes, marketing sources, attribution. Tie revenue back to specific campaigns, codes, and channels.",
    sections: [
      {
        heading: "Discount codes",
        body: "Create codes (e.g. WELCOME10) with percent or fixed discount, optional minimum order, optional expiry. Customers enter the code at checkout; usage tracked here.",
      },
      {
        heading: "Sources",
        body: "Marketing sources tag where an order came from (e.g. Instagram, Email blast). Order detail shows the source so you can attribute revenue to channels.",
      },
    ],
  },

  "/admin/orgs": {
    title: "Organisations",
    intro: "Multi-tenant management. Each org is a separate portal with its own data, plugins, settings, sites. Switch active org from the sidebar org-switcher.",
    sections: [
      {
        heading: "Adding an org",
        body: "Better to use /aqua → + New portal — that walks you through preset selection. This page is for managing existing orgs and editing their metadata.",
      },
      {
        heading: "Per-org database",
        body: "Each org can be pinned to its own storage backend (file / KV / Supabase). Useful for data residency / compliance — set under the org's settings.",
      },
    ],
  },

  "/admin/popup": {
    title: "Discount popup",
    intro: "The on-storefront popup that offers visitors a discount in exchange for their email. Configure when it triggers, what it offers, and how it looks.",
    sections: [
      {
        heading: "Triggers",
        body: "Time-on-page, scroll depth, exit intent, or first visit. Pick the trigger that matches the campaign — exit intent for cart abandoners, time-on-page for blog readers.",
      },
      {
        heading: "Frequency cap",
        body: "Don't show to the same visitor more than every N days (cookie-based). 30 is a safe default — annoying customers loses more than the discount earns.",
      },
    ],
  },

  "/admin/automation": {
    title: "Automation",
    intro: "If-this-then-that rules + drip campaigns. React to events (order placed, customer signed up) without writing code.",
    sections: [
      {
        heading: "Rules",
        body: "When event X happens, do action Y. e.g. 'When a customer places their 3rd order, add them to the VIP segment'. Built on the same event bus the Webhooks plugin uses.",
      },
      {
        heading: "Drip campaigns",
        body: "Multi-step email sequences triggered by signup or purchase. Each step has a delay (e.g. 'send 3 days after signup'). Performance lands under /admin/automation/runs.",
      },
    ],
  },

  "/admin/themes": {
    title: "Themes",
    intro: "Pre-built design themes for the storefront. Pick one as the base; customise per-site colours and fonts under /admin/customise → Branding.",
    sections: [
      {
        heading: "Picking a theme",
        body: "Each theme defines a default colour palette, typography, and component styling. Click Apply to switch — your content stays the same, the chrome flips.",
      },
      {
        heading: "Custom themes",
        body: "Pro-mode operators can override individual theme tokens per site or per page. The visual editor's Page Settings → Pro section exposes the override surface.",
      },
    ],
  },

  "/admin/webhooks": {
    title: "Webhooks",
    intro: "HMAC-signed outbound webhooks. Subscribe an external service (Zapier, your own backend, n8n) to portal events — order placed, page published, etc.",
    sections: [
      {
        heading: "Adding a webhook",
        body: "Pick the events you care about, paste the URL, optional shared secret. Every dispatch is signed with HMAC-SHA256 in the X-Aqua-Signature header so the receiver can verify it came from you.",
      },
      {
        heading: "Retries",
        body: "Failed deliveries (non-2xx response) auto-retry with exponential backoff up to 5 times. After that they're marked failed in the log.",
      },
      {
        heading: "Debugging",
        body: "/admin/webhooks/log shows every dispatch with status, response, and timing. Click a row to see the full request body.",
      },
    ],
  },

  "/admin/funnels": {
    title: "Funnels",
    intro: "Multi-step conversion flows — landing → upsell → checkout, etc. Built in the visual editor as a chain of pages with conditional next-steps.",
    sections: [
      {
        heading: "Building a funnel",
        body: "Open the editor's outliner → Funnels tab → + New funnel. Each step is a page; reorder by drag, set conditional branches in the step settings.",
      },
      {
        heading: "Stats",
        body: "Per-step view, drop-off, and conversion. Surfaces the exact step where visitors leak so you know where to optimise.",
      },
    ],
  },

  "/admin/notifications": {
    title: "Notifications",
    intro: "In-app notifications for operators (low stock, failed payment, support ticket). Configure who gets which notification on /admin/notifications/preferences.",
    sections: [
      {
        heading: "Bell icon",
        body: "The bell in the admin topbar shows unread notifications. Click any to jump to the related entity.",
      },
      {
        heading: "Preferences",
        body: "Per-team-member: which categories trigger a bell ping vs an email vs both. Set under /admin/notifications/preferences.",
      },
    ],
  },

  "/admin/subscriptions": {
    title: "Subscriptions",
    intro: "Recurring billing on top of E-commerce. Stripe-backed subscriptions with trials, plan changes, dunning emails.",
    sections: [
      {
        heading: "Plans",
        body: "Define plans with price + interval (monthly/yearly) on /admin/subscriptions/plans. Each plan corresponds to a Stripe product + price; create those in Stripe first, then paste the price IDs here.",
      },
      {
        heading: "Customer portal",
        body: "Hand customers a Stripe-hosted portal URL where they can change plans, swap card, cancel — without you rebuilding any of it. Use the 'Open portal' card on this page to send a portal link to any customer by email.",
      },
    ],
  },

  "/admin/reviews": {
    title: "Reviews",
    intro: "Customer reviews on products. Moderate, reply, and feature reviews on the storefront.",
    sections: [
      {
        heading: "Moderation",
        body: "Reviews land in Pending until you Approve or Reject. Approved reviews appear on the product page; rejected ones stay hidden but stay in the log.",
      },
      {
        heading: "Featured reviews",
        body: "Star-mark a review to feature it on the home page or in marketing emails. The block library has a 'Featured reviews' block that pulls these.",
      },
    ],
  },

  "/admin/i18n": {
    title: "Translations",
    intro: "Multi-language storefront. Define locales, translate strings, route visitors to their language.",
    sections: [
      {
        heading: "Adding a locale",
        body: "Add the locale code (e.g. 'fr', 'es') under /admin/i18n/locales. The storefront auto-includes a language switcher in the navbar.",
      },
      {
        heading: "Translating",
        body: "Every translatable string surfaces here. Edit inline; save commits the change. Untranslated strings fall back to the default locale.",
      },
    ],
  },

  "/admin/crm": {
    title: "CRM",
    intro: "Customer-relationship management — contacts, deals, tasks. Auto-imports anyone who signs up, places an order, or submits a form.",
    sections: [
      {
        heading: "Contacts vs. customers",
        body: "Customers are people who bought something; contacts are anyone the system has captured (form submission, newsletter signup). All customers are contacts; not all contacts are customers.",
      },
      {
        heading: "Deals",
        body: "Pipeline view of in-progress sales (B2B / wholesale / consultations). Stages and probabilities track conversion rates. Use this when commerce is more relationship-driven than one-click checkout.",
      },
      {
        heading: "Tasks",
        body: "To-dos tied to a contact or deal — 'follow up with X', 'send proposal'. Notifications fire when due dates approach.",
      },
    ],
  },

  "/admin/repo": {
    title: "Repo browser",
    intro: "Browse + edit your GitHub repo from inside the admin. Every save opens a PR rather than committing directly, so you always get review.",
    sections: [
      {
        heading: "Setup",
        body: "Needs the GitHub plugin configured with a Personal Access Token (under /admin/portal-settings). Without it, this page can't read or write.",
      },
      {
        heading: "What you can edit",
        body: "Anything in the connected repo — pages, blocks, server code. Best used for small typo fixes; bigger changes belong in your local editor.",
      },
    ],
  },

  "/admin/support": {
    title: "Support",
    intro: "Inbound support tickets from customers. Reply, assign, mark resolved.",
    sections: [
      {
        heading: "Where tickets come from",
        body: "Customer-submitted forms tagged as support, emails to your configured support address (when SMTP/Postmark inbound is wired), and the storefront's contact form.",
      },
      {
        heading: "Replying",
        body: "Inline thread view per ticket. Replies go via the configured email plugin and are logged on the ticket. Customer sees a normal email reply from your support address.",
      },
    ],
  },

  "/admin/automation/runs": {
    title: "Automation runs",
    intro: "Per-execution log for every automation rule + drip campaign step. Useful for debugging when something didn't fire as expected.",
    sections: [
      {
        heading: "What's logged",
        body: "Every rule trigger (with the matched event), every drip-step send (success/failure), every action attempted. Filter by automation, status, date range.",
      },
      {
        heading: "Re-running",
        body: "Failed runs can be re-attempted from the row menu. Useful for transient provider failures (Stripe blip, email rate limit).",
      },
    ],
  },

  "/admin/faq": {
    title: "FAQ",
    intro: "Storefront FAQ section — questions, answers, categories. Renders on /faq and on the help/support pages.",
    sections: [
      {
        heading: "Adding a question",
        body: "Hit + New, type the question + answer, optionally tag with a category. Long answers support markdown.",
      },
      {
        heading: "Ordering",
        body: "Drag rows to reorder. The storefront renders in the same order so put the most-asked first.",
      },
    ],
  },

  "/admin/forum": {
    title: "Forum",
    intro: "Community discussion forum on the storefront. Categories, threads, posts, moderation.",
    sections: [
      {
        heading: "Categories",
        body: "Top-level groupings (e.g. 'General', 'Help', 'Showcase'). Configure under /admin/forum/categories. Can be public, members-only, or moderator-only.",
      },
      {
        heading: "Moderation",
        body: "Reported posts surface under /admin/forum/moderation. Hide / delete / ban from the row menu. Auto-flagging via spam-keyword list configurable in plugin settings.",
      },
    ],
  },

  "/admin/wiki": {
    title: "Wiki",
    intro: "Operator-maintained knowledge base for your team or users. Markdown pages with links between them; full-text searchable.",
    sections: [
      {
        heading: "Adding a page",
        body: "Hit + New, give it a title + path (e.g. /wiki/onboarding), write markdown. [[Wiki link]] syntax auto-links to other wiki pages.",
      },
      {
        heading: "History",
        body: "Every edit is versioned under /admin/wiki/history. Click an entry to view the diff or revert.",
      },
    ],
  },

  "/admin/kb": {
    title: "Knowledge base",
    intro: "Customer-facing help articles served at /help. Categorized articles with markdown content; search bar on the storefront /help page.",
    sections: [
      {
        heading: "Articles vs FAQ",
        body: "FAQ is short Q&A pairs (one paragraph each). KB articles are longer how-tos with steps, screenshots, headings. Use the right tool for the question complexity.",
      },
      {
        heading: "Categories",
        body: "Group articles under /admin/kb/categories so the /help page renders them in sections (e.g. 'Getting started', 'Billing', 'Troubleshooting').",
      },
    ],
  },

  "/admin/orders/[id]": {
    title: "Order detail",
    intro: "Everything about one order — line items, customer, addresses, payment status, fulfilment, tracking.",
    sections: [
      {
        heading: "Status flow",
        body: "Pending → Paid (Stripe webhook fires) → Fulfilled (you mark when packed) → Shipped (you mark with tracking number). Each transition triggers the matching customer email.",
      },
      {
        heading: "Tracking",
        body: "Pick a carrier, paste a tracking number, hit Mark shipped. The customer's shipping confirmation email goes out automatically with the tracking link.",
      },
      {
        heading: "Refunds",
        body: "Refund inside Stripe directly — that's the source of truth. Webhook updates the order status here within seconds.",
      },
    ],
  },
};

// Look up a doc for the current pathname. Falls back through
// progressively shorter prefixes so /admin/customers/foo@bar reuses
// the /admin/customers doc.
export function getHelpDoc(pathname: string | null): HelpDoc | null {
  if (!pathname) return null;
  // Direct hit
  if (HELP_DOCS[pathname]) return HELP_DOCS[pathname];
  // Strip trailing segments one at a time
  const parts = pathname.split("/").filter(Boolean);
  while (parts.length > 1) {
    parts.pop();
    const candidate = "/" + parts.join("/");
    if (HELP_DOCS[candidate]) return HELP_DOCS[candidate];
  }
  return null;
}
