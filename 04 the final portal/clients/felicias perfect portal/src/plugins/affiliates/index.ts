// Affiliates plugin — referral codes + commission tracking.
//
// Affiliates sign up via a public form, get a unique code, share
// links with that code in the URL. The system tracks clicks,
// conversions and accrued commission; the operator approves and
// pays out via the Email plugin (link to manual transfer) or
// Stripe Connect (when wired).

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "affiliates",
  name: "Affiliates",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Referral codes, commission tracking, payout management.",
  description: "Affiliate program for the storefront. Each affiliate gets a unique referral code; the system tracks their link clicks and resulting conversions. Commission rates configurable per-affiliate or sitewide. Operator approves payouts via the admin; manual transfer or Stripe Connect (when configured).",

  requires: ["website", "ecommerce"],

  navItems: [
    { id: "affiliates",        label: "Affiliates", href: "/admin/affiliates",      order: 0, panelId: "store", groupId: "members-group" },
    { id: "affiliate-payouts", label: "Payouts",    href: "/admin/affiliates/payouts", order: 1 },
    { id: "affiliate-stats",   label: "Stats",      href: "/admin/affiliates/stats",   order: 2 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "publicSignup",     label: "Public affiliate signup form",     default: true },
    { id: "uniqueCodes",      label: "Auto-generated unique codes",      default: true },
    { id: "cookieAttribution", label: "30-day cookie attribution",       default: true },
    { id: "tieredRates",      label: "Per-affiliate commission rates",   default: false, plans: ["pro", "enterprise"] },
    { id: "stripeConnect",    label: "Stripe Connect payouts",           default: false, plans: ["enterprise"] },
    { id: "twoTier",          label: "Two-tier (affiliate-of-affiliate)", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "commission",
        label: "Default commission",
        fields: [
          { id: "rate", label: "Default commission %", type: "number", default: 10 },
          { id: "minimumPayout", label: "Minimum payout amount", type: "number", default: 50 },
          { id: "cookieDays",  label: "Attribution cookie length (days)", type: "number", default: 30 },
        ],
      },
      {
        id: "signup",
        label: "Affiliate signup",
        fields: [
          { id: "signupPath", label: "Signup URL path", type: "text", default: "/affiliates" },
          { id: "approvalRequired", label: "Manual approval required", type: "boolean", default: true },
          { id: "termsHtml", label: "Affiliate terms (HTML)", type: "textarea" },
        ],
      },
    ],
  },
};

export default plugin;
