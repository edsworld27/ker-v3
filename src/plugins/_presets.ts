// Aqua presets — one-click bundles of plugins for common use cases.
//
// Operator picks "E-commerce store (digital goods)" on the new-org flow,
// the runtime applies the preset, and the org boots with Website +
// E-commerce + Forms + SEO + Analytics + Compliance pre-installed and
// pre-configured (digital products on, shipping off, inventory off, …).
//
// Presets are pure data — no logic. They're applied via
// `applyPreset(orgId, preset)` from `_runtime.ts`.
//
// Naming convention: <vertical>-<variant>. Each preset's `plugins` list
// is ordered by dependency (Website before E-commerce, etc.) so the
// runtime can install in sequence.

import type { AquaPreset } from "./_types";

// ─── Preset: empty ─────────────────────────────────────────────────────────
// Applied to every new org regardless of choice — gives Brand Kit only.
// The operator can install everything else manually from the marketplace.

const EMPTY: AquaPreset = {
  id: "empty",
  name: "Just brand kit",
  tagline: "Logo + palette + fonts. Nothing else. Pick plugins from the marketplace as you need them.",
  description: "Best when the client's needs are still being scoped, or when you want full control over what gets installed.",
  plugins: [
    { pluginId: "brand" },
  ],
};

// ─── Preset: marketing site (no commerce) ──────────────────────────────────

const WEBSITE_SCRATCH: AquaPreset = {
  id: "website-scratch",
  name: "Website (from scratch)",
  tagline: "Brochure / portfolio / agency-style site, built fresh in the editor.",
  description: "Includes Website, Forms, SEO, Analytics and Compliance. No commerce, no blog. Add Blog or Funnels from the marketplace if needed later.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website", features: { simpleEditor: true, advancedEditor: true, codeView: false, templates: true } },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

const WEBSITE_EXISTING: AquaPreset = {
  id: "website-existing",
  name: "Website (connect existing repo)",
  tagline: "Adopt an existing site — connect the GitHub repo, then layer Aqua features on top.",
  description: "Same as Website (from scratch) but adds the Repo Browser plugin for connecting and editing the existing codebase.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website", features: { simpleEditor: true, advancedEditor: true, codeView: true, templates: false } },
    { pluginId: "repo" },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: e-commerce (physical goods) ───────────────────────────────────

const ECOMMERCE_PHYSICAL: AquaPreset = {
  id: "ecommerce-physical",
  name: "E-commerce store (physical goods)",
  tagline: "Sell physical products with variants, inventory and shipping.",
  description: "Website + E-commerce (physical mode) + Forms + SEO + Analytics + Compliance. Stripe checkout enabled by default; reviews on; subscriptions off (install separately if needed).",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    {
      pluginId: "ecommerce",
      features: {
        physicalProducts: true,
        digitalProducts: false,
        variants: true,
        inventory: true,
        shipping: true,
        discountCodes: true,
        reviews: true,
        subscriptions: false,
        stripeCheckout: true,
      },
    },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: e-commerce (digital goods) ────────────────────────────────────
//
// Notable differences from physical: shipping/inventory off, digital
// product support on, Email plugin pre-installed for delivery of
// download links + license keys.

const ECOMMERCE_DIGITAL: AquaPreset = {
  id: "ecommerce-digital",
  name: "Digital store (downloads / licenses)",
  tagline: "Sell digital goods — files, downloads, license keys, courses.",
  description: "Website + E-commerce (digital mode) + Email + Forms + SEO + Analytics + Compliance. Download URL signing on, license-key generation on, no shipping or inventory. Email plugin pre-installed for instant-delivery on purchase.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    {
      pluginId: "ecommerce",
      features: {
        physicalProducts: false,
        digitalProducts: true,
        variants: false,
        inventory: false,
        shipping: false,
        discountCodes: true,
        reviews: true,
        subscriptions: false,
        stripeCheckout: true,
        downloadDelivery: true,
        licenseKeys: true,
      },
    },
    { pluginId: "email" },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: e-commerce (hybrid — physical AND digital) ────────────────────

const ECOMMERCE_HYBRID: AquaPreset = {
  id: "ecommerce-hybrid",
  name: "Mixed store (physical + digital)",
  tagline: "Sell both physical and digital products from the same store.",
  description: "Everything from the physical preset plus digital-product support and the Email plugin for download delivery.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    {
      pluginId: "ecommerce",
      features: {
        physicalProducts: true,
        digitalProducts: true,
        variants: true,
        inventory: true,
        shipping: true,
        discountCodes: true,
        reviews: true,
        subscriptions: false,
        stripeCheckout: true,
        downloadDelivery: true,
        licenseKeys: true,
      },
    },
    { pluginId: "email" },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: blog / content site ───────────────────────────────────────────

const BLOG: AquaPreset = {
  id: "blog",
  name: "Blog / publication",
  tagline: "Content-first site — posts, RSS, comments, tag pages.",
  description: "Website + Blog + SEO + Analytics + Compliance + Forms (for newsletter signups).",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    { pluginId: "blog", features: { scheduling: true, featuredImage: true, tags: true, rss: true, comments: false } },
    { pluginId: "forms" },
    { pluginId: "seo" },
    { pluginId: "analytics" },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: marketing / funnels ───────────────────────────────────────────

const MARKETING: AquaPreset = {
  id: "marketing",
  name: "Marketing site (with funnels)",
  tagline: "Lead-gen first — funnels, A/B tests, forms, conversion tracking.",
  description: "Website + Funnels & A/B + Forms + SEO + Analytics + Compliance + Chatbot. Built for landing pages and lead capture, not commerce.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    { pluginId: "funnels", features: { splitTests: true, funnels: true, conversionGoals: true } },
    { pluginId: "forms" },
    { pluginId: "chatbot" },
    { pluginId: "seo" },
    { pluginId: "analytics", features: { pageviews: true, events: true, heatmaps: true, funnelTracking: true } },
    { pluginId: "compliance" },
  ],
};

// ─── Preset: SaaS marketing site ───────────────────────────────────────────

const SAAS: AquaPreset = {
  id: "saas",
  name: "SaaS / app landing",
  tagline: "Product-led marketing site for a software product.",
  description: "Website + Funnels + Forms + Email + Chatbot + SEO + Analytics + Compliance + Support hub. Built for free-trial signups and product demos.",
  plugins: [
    { pluginId: "brand" },
    { pluginId: "website" },
    { pluginId: "funnels", features: { splitTests: true, funnels: true, conversionGoals: true } },
    { pluginId: "forms" },
    { pluginId: "email" },
    { pluginId: "chatbot" },
    { pluginId: "support" },
    { pluginId: "seo" },
    { pluginId: "analytics", features: { pageviews: true, events: true, heatmaps: true, funnelTracking: true } },
    { pluginId: "compliance" },
  ],
};

// ─── Registry ──────────────────────────────────────────────────────────────

const PRESETS: AquaPreset[] = [
  EMPTY,
  WEBSITE_SCRATCH,
  WEBSITE_EXISTING,
  ECOMMERCE_PHYSICAL,
  ECOMMERCE_DIGITAL,
  ECOMMERCE_HYBRID,
  BLOG,
  MARKETING,
  SAAS,
];

export function listPresets(): AquaPreset[] {
  return [...PRESETS];
}

export function getPreset(id: string): AquaPreset | undefined {
  return PRESETS.find(p => p.id === id);
}
