import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "seo",
  name: "SEO",
  version: "1.0.0",
  status: "stable",
  category: "marketing",
  tagline: "Sitemap, robots.txt, OG images, meta editor, SEO score.",
  description: "Auto-generated sitemap.xml + robots.txt, dynamic OG image generator, per-page meta editor, on-page SEO score with suggestions, schema.org structured data.",

  requires: ["website"],

  navItems: [
    { id: "seo", label: "SEO", href: "/admin/seo", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "sitemap", label: "Auto sitemap.xml", default: true },
    { id: "robots", label: "robots.txt", default: true },
    { id: "ogImages", label: "OG image generator", default: true },
    { id: "metaEditor", label: "Per-page meta editor", default: true },
    { id: "seoScore", label: "SEO score panel", default: true },
    { id: "structuredData", label: "Schema.org structured data", default: true },
    { id: "redirects", label: "Redirect manager", default: false, plans: ["pro", "enterprise"] },
    { id: "canonicalDomains", label: "Canonical domain rules", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "defaults",
        label: "Site-wide defaults",
        fields: [
          { id: "defaultTitle", label: "Default title", type: "text" },
          { id: "defaultDescription", label: "Default description", type: "textarea" },
          { id: "defaultOgImage", label: "Default OG image URL", type: "url" },
          { id: "twitterHandle", label: "Twitter handle", type: "text", placeholder: "@brand" },
        ],
      },
      {
        id: "search-console",
        label: "Search Console",
        fields: [
          { id: "googleVerificationCode", label: "Google verification code", type: "text" },
          { id: "bingVerificationCode", label: "Bing verification code", type: "text" },
        ],
      },
    ],
  },
};

export default plugin;
