// Website plugin. Owns the visual page editor, themes, pages, assets,
// and the public storefront route /p/[slug]. Required by E-commerce,
// Blog and Forms (they extend the website with commerce/post/form
// pages but can't render without the website plugin's editor).

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "website",
  name: "Website",
  version: "1.0.0",
  status: "stable",
  category: "content",
  tagline: "Visual page editor with 33 blocks, themes, SEO and asset library.",
  description: "Drag-and-drop block editor, per-site themes, version history, page templates, asset library. Core requirement for any client-facing site.",

  requires: [],

  navItems: [
    { id: "pages", label: "Pages", href: "/admin/pages", order: 0 },
    { id: "website", label: "Website", href: "/admin/website", order: 1 },
    { id: "media", label: "Media", href: "/admin/website/media", order: 2 },
    { id: "assets", label: "Assets", href: "/admin/assets", order: 3 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "simpleEditor", label: "Simple editor", description: "Drag-and-drop blocks, no code.", default: true },
    { id: "advancedEditor", label: "Advanced editor", description: "Power-user tools: nested layouts, custom CSS per block.", default: true },
    { id: "codeView", label: "Code view", description: "Edit raw JSX. Enterprise-only.", default: false, plans: ["enterprise"] },
    { id: "templates", label: "Templates library", default: true },
    { id: "versionHistory", label: "Version history", default: true },
    { id: "customCSS", label: "Custom CSS", default: false, plans: ["pro", "enterprise"] },
    { id: "headInjection", label: "Head injection", description: "Custom <script>/<meta> tags per page.", default: false, plans: ["pro", "enterprise"] },
    { id: "customDomain", label: "Custom domain", description: "Map the site to a client-owned domain.", default: false, plans: ["pro", "enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "siteName", label: "Site name", type: "text" },
          { id: "siteUrl", label: "Public URL", type: "url" },
          { id: "defaultLocale", label: "Default locale", type: "select", default: "en", options: [
            { value: "en", label: "English" },
            { value: "fr", label: "French" },
            { value: "es", label: "Spanish" },
            { value: "de", label: "German" },
          ] },
        ],
      },
      {
        id: "deployment",
        label: "Deployment",
        fields: [
          { id: "githubRepoUrl", label: "GitHub repo", type: "url", helpText: "Connected repo, if any. Used by Repo Browser plugin." },
          { id: "deployTarget", label: "Deploy target", type: "select", default: "vercel", options: [
            { value: "vercel", label: "Vercel" },
            { value: "netlify", label: "Netlify" },
            { value: "self-host", label: "Self-host" },
            { value: "managed", label: "Managed (Aqua)" },
          ] },
        ],
      },
    ],
  },
};

export default plugin;
