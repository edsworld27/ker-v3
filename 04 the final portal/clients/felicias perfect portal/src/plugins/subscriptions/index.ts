// Subscriptions plugin — recurring billing on top of the E-commerce
// plugin. Tied to Stripe subscriptions; supports trial periods, plan
// changes, prorations, dunning emails, customer self-service portal.
//
// Required by the SaaS preset. Not bundled into the e-commerce
// preset by default since most physical-goods stores don't need it.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "subscriptions",
  name: "Subscriptions",
  version: "0.1.0",
  status: "alpha",
  category: "commerce",
  tagline: "Recurring billing — trial periods, plan changes, dunning, customer portal.",
  description: "Adds Stripe subscriptions on top of the E-commerce plugin. Supports plans (monthly/annual), free trials, proration, plan upgrades and downgrades, dunning emails for failed payments, and Stripe's hosted billing portal so customers can self-serve.",

  requires: ["ecommerce", "email"],

  setup: [
    {
      id: "stripe",
      title: "Stripe billing portal",
      description: "Subscriptions reuses your E-commerce Stripe keys; this step just enables the customer portal.",
      fields: [
        { id: "billingPortalEnabled", label: "Enable hosted billing portal", type: "boolean", required: false },
      ],
    },
  ],

  navItems: [
    { id: "subscriptions", label: "Subscriptions", href: "/admin/subscriptions", order: 0, panelId: "store" },
    { id: "plans",         label: "Plans",         href: "/admin/subscriptions/plans", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "trials",            label: "Free trial periods",         default: true },
    { id: "planSwitching",     label: "Mid-cycle plan changes",     default: true },
    { id: "proration",         label: "Proration",                  default: true },
    { id: "dunning",           label: "Dunning emails",             default: true },
    { id: "customerPortal",    label: "Stripe customer portal",     default: true },
    { id: "annualDiscount",    label: "Annual / monthly toggle",    default: true },
    { id: "metered",           label: "Metered usage billing",      default: false, plans: ["enterprise"] },
    { id: "multipleSeats",     label: "Per-seat pricing",           default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "trial",
        label: "Trial",
        fields: [
          { id: "defaultTrialDays", label: "Default trial length (days)", type: "number", default: 14 },
          { id: "requireCardForTrial", label: "Require card for trial", type: "boolean", default: false },
        ],
      },
      {
        id: "dunning",
        label: "Dunning",
        fields: [
          { id: "retryAttempts", label: "Retry attempts on failed payment", type: "number", default: 3 },
          { id: "graceDays",     label: "Grace period (days)",              type: "number", default: 7 },
        ],
      },
      {
        id: "portal",
        label: "Customer portal",
        fields: [
          { id: "portalReturnUrl", label: "Return URL after portal session", type: "url" },
        ],
      },
    ],
  },
};

export default plugin;
