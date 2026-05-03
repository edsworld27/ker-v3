// Knowledge base plugin — public help-centre site.
//
// Articles organised by category. Search built-in. Customer-facing
// (vs the AuditLog plugin which is admin-only). Often paired with
// the Chatbot plugin so the bot can quote KB articles.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "knowledgebase",
  name: "Knowledge base",
  version: "0.1.0",
  status: "alpha",
  category: "support",
  tagline: "Public help centre with categories, search, article voting.",
  description: "Add a /help section to the storefront. Authoring works like the Blog plugin's editor; visitors browse by category or search. Article up/down voting tells you which docs are landing. Optional Chatbot integration so the bot can answer with article quotes.",

  requires: ["website"],

  navItems: [
    { id: "kb",              label: "Knowledge base", href: "/admin/kb",            order: 0, panelId: "website" },
    { id: "kb-categories",   label: "Categories",     href: "/admin/kb/categories", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "categories",     label: "Categories",                default: true },
    { id: "search",         label: "Storefront search",         default: true },
    { id: "voting",         label: "Article up/down voting",    default: true },
    { id: "chatbotQuotes",  label: "Chatbot can quote articles", default: false, plans: ["pro", "enterprise"] },
    { id: "tableOfContents", label: "Auto table of contents",   default: true },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "kbPath", label: "Knowledge base URL path", type: "text", default: "/help" },
          { id: "tagline", label: "Tagline", type: "text", default: "Find your answer fast." },
          { id: "showVoteCount", label: "Show vote counts publicly", type: "boolean", default: false },
        ],
      },
    ],
  },
};

export default plugin;
