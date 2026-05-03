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
