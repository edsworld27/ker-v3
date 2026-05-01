// E-commerce plugin. The big one — products, variants, cart, checkout,
// Stripe, orders, reviews, discount codes, shipping, inventory.
// Supports BOTH physical and digital goods via feature toggles, plus
// subscriptions as a future opt-in.
//
// Setup: needs Stripe keys before installation completes.
// Dependencies: requires Website (storefront pages render via the
// editor). For digital products, also benefits from Email plugin
// for instant delivery — preset bundles them together.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "ecommerce",
  name: "E-commerce",
  version: "1.0.0",
  status: "stable",
  category: "commerce",
  tagline: "Products, variants, cart, Stripe checkout. Physical and digital goods.",
  description: "Full storefront commerce: product catalogue, colour/size variants, inventory, shipping rules, discount codes, Stripe checkout, order management, reviews. Toggle digital-product mode for downloads + license keys; toggle subscriptions for recurring billing.",

  requires: ["website"],

  setup: [
    {
      id: "stripe",
      title: "Stripe credentials",
      description: "Paste your Stripe API keys. Test keys are fine for staging — switch to live before launch.",
      fields: [
        { id: "publishableKey", label: "Publishable key (pk_…)", type: "text", required: true, placeholder: "pk_test_…" },
        { id: "secretKey", label: "Secret key (sk_…)", type: "password", required: true, placeholder: "sk_test_…" },
        { id: "webhookSecret", label: "Webhook signing secret (whsec_…)", type: "password", required: false, helpText: "Find this in Stripe → Developers → Webhooks after pointing the webhook at /api/stripe/webhook." },
      ],
    },
    {
      id: "currency",
      title: "Currency & tax",
      description: "Picks the storefront's primary currency and whether prices include tax.",
      optional: true,
      fields: [
        { id: "currency", label: "Currency", type: "select", required: true, options: [
          { value: "gbp", label: "GBP" }, { value: "usd", label: "USD" }, { value: "eur", label: "EUR" },
        ] },
        { id: "pricesIncludeTax", label: "Prices include tax (VAT-style)", type: "boolean" },
      ],
    },
  ],

  navItems: [
    { id: "products", label: "Products", href: "/admin/products", order: 0 },
    { id: "collections", label: "Collections", href: "/admin/collections", order: 1 },
    { id: "inventory", label: "Inventory", href: "/admin/inventory", order: 2, requiresFeature: "inventory" },
    { id: "orders", label: "Orders", href: "/admin/orders", order: 3 },
    { id: "customers", label: "Customers", href: "/admin/customers", order: 4 },
    { id: "shipping", label: "Shipping", href: "/admin/shipping", order: 5, requiresFeature: "shipping" },
    { id: "reviews", label: "Reviews", href: "/admin/reviews", order: 6, requiresFeature: "reviews" },
  ],

  pages: [],
  api: [],

  features: [
    { id: "physicalProducts", label: "Physical products", description: "Products that ship.", default: true },
    { id: "digitalProducts", label: "Digital products", description: "Files, downloads, license keys, courses.", default: false },
    { id: "variants", label: "Variants", description: "Colours, sizes, materials.", default: true },
    { id: "inventory", label: "Inventory tracking", default: true, requires: ["physicalProducts"] },
    { id: "shipping", label: "Shipping rules", default: true, requires: ["physicalProducts"] },
    { id: "discountCodes", label: "Discount codes", default: true },
    { id: "reviews", label: "Customer reviews", default: true },
    { id: "subscriptions", label: "Subscriptions", description: "Recurring billing for products. Pro+.", default: false, plans: ["pro", "enterprise"] },
    { id: "stripeCheckout", label: "Stripe checkout", default: true },
    { id: "downloadDelivery", label: "Download URL signing", description: "Time-limited signed URLs for digital goods.", default: false, requires: ["digitalProducts"] },
    { id: "licenseKeys", label: "License keys", description: "Auto-generate and email license keys on purchase.", default: false, requires: ["digitalProducts"] },
    { id: "multiCurrency", label: "Multi-currency", description: "Show prices in the visitor's local currency. Enterprise.", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "stripe",
        label: "Stripe",
        fields: [
          { id: "publishableKey", label: "Publishable key", type: "text" },
          { id: "secretKey", label: "Secret key", type: "password" },
          { id: "webhookSecret", label: "Webhook secret", type: "password" },
          { id: "stripeMode", label: "Mode", type: "select", default: "test", options: [
            { value: "test", label: "Test" }, { value: "live", label: "Live" },
          ] },
        ],
      },
      {
        id: "store",
        label: "Store",
        fields: [
          { id: "currency", label: "Currency", type: "select", default: "gbp", options: [
            { value: "gbp", label: "GBP" }, { value: "usd", label: "USD" }, { value: "eur", label: "EUR" },
          ] },
          { id: "pricesIncludeTax", label: "Prices include tax", type: "boolean", default: false },
          { id: "lowStockThreshold", label: "Low-stock threshold", type: "number", default: 5 },
        ],
      },
      {
        id: "digital",
        label: "Digital delivery",
        description: "Settings for digital products. Ignored unless Digital products is enabled.",
        fields: [
          { id: "downloadLinkExpiryHours", label: "Download link expiry (hours)", type: "number", default: 72 },
          { id: "maxDownloadsPerOrder", label: "Max downloads per order", type: "number", default: 5 },
          { id: "deliveryEmailTemplate", label: "Delivery email template id", type: "text", helpText: "Reference an Email plugin template by id." },
        ],
      },
    ],
  },
};

export default plugin;
