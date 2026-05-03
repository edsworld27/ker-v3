// Search plugin — site-wide storefront search across pages, products,
// blog posts and knowledge base articles. Indexes content on publish
// and serves a /search page + a search-bar block.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "search",
  name: "Search",
  version: "0.1.0",
  status: "alpha",
  category: "content",
  tagline: "Site-wide search across pages, products, blog and KB.",
  description: "Lightweight in-process search index — title, body, tags, descriptions. No third-party dependency. Refreshed automatically on content change events. Storefront /search page + an optional search-bar block in the editor.",

  requires: ["website"],

  navItems: [
    { id: "search", label: "Search index", href: "/admin/search", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "indexPages",     label: "Index editor pages",     default: true },
    { id: "indexProducts",  label: "Index products",         default: true },
    { id: "indexBlog",      label: "Index blog posts",       default: true },
    { id: "indexKB",        label: "Index KB articles",      default: true },
    { id: "fuzzy",          label: "Fuzzy matching",         default: true },
    { id: "trending",       label: "Trending searches widget", default: false, plans: ["pro", "enterprise"] },
    { id: "synonyms",       label: "Synonym dictionary",     default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "Search",
        fields: [
          { id: "minQueryLength", label: "Min query length", type: "number", default: 2 },
          { id: "maxResults",     label: "Max results",      type: "number", default: 50 },
          { id: "showSnippets",   label: "Show body snippets in results", type: "boolean", default: true },
        ],
      },
    ],
  },
};

export default plugin;
