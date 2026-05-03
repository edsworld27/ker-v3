// Wiki plugin — collaborative documentation pages with revision
// history. Can sit at /docs or any custom path. Optional public
// edit mode or member-restricted.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "wiki",
  name: "Wiki / documentation",
  version: "0.1.0",
  status: "alpha",
  category: "content",
  tagline: "Collaborative wiki pages with revision history.",
  description: "Set up at /docs (or any path). Markdown-based pages with edit history, sidebar navigation tree, internal link auto-completion. Public read by default; edit can be public, member-only, or admin-only.",

  requires: ["website"],

  navItems: [
    { id: "wiki",         label: "Wiki",       href: "/admin/wiki",         order: 0, panelId: "website" },
    { id: "wiki-history", label: "Revisions",  href: "/admin/wiki/history", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "publicEdit",     label: "Public edit",                default: false },
    { id: "memberEdit",     label: "Member-only edit",           default: true },
    { id: "revisionHistory", label: "Revision history",          default: true },
    { id: "sidebarNav",     label: "Sidebar navigation tree",    default: true },
    { id: "internalLinks",  label: "[[Wiki link]] auto-complete", default: true },
    { id: "tableOfContents", label: "Auto table of contents",    default: true },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "wikiPath",     label: "Wiki URL path",       type: "text", default: "/docs" },
          { id: "homePageSlug", label: "Home page slug",      type: "text", default: "home" },
          { id: "editorMode",   label: "Editor mode",         type: "select", default: "members",
            options: [
              { value: "public",  label: "Anyone can edit" },
              { value: "members", label: "Members can edit" },
              { value: "admins",  label: "Admins only" },
            ] },
        ],
      },
    ],
  },
};

export default plugin;
