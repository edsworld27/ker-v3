// Forum / community plugin — threaded discussion area.
//
// Categories with topics, replies, voting. Member-gated optional
// (pairs with Memberships plugin). Moderator queue for posts that
// trip the spam filter or get flagged.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "forum",
  name: "Forum / community",
  version: "0.1.0",
  status: "alpha",
  category: "support",
  tagline: "Threaded discussion area on the storefront. Categories, voting, moderation.",
  description: "Discord-lite — threaded discussion at /community. Categories, topics, replies, up/down voting, mention notifications via Email plugin, moderator queue. Optional gating to paid Memberships tiers only.",

  requires: ["website"],

  navItems: [
    { id: "forum",            label: "Forum",        href: "/admin/forum",         order: 0 },
    { id: "forum-moderation", label: "Moderation",   href: "/admin/forum/moderation", order: 1 },
    { id: "forum-categories", label: "Categories",   href: "/admin/forum/categories", order: 2 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "voting",           label: "Up/down voting on posts",         default: true },
    { id: "mentions",         label: "@mentions with email notify",     default: true },
    { id: "moderation",       label: "Moderator queue",                 default: true },
    { id: "memberOnly",       label: "Lock forum to paid members only", default: false, requires: [] },
    { id: "richText",         label: "Rich text + image attachments",   default: true },
    { id: "topicSubscriptions", label: "Topic subscriptions",           default: true },
    { id: "trustLevels",      label: "Trust levels (Discourse-style)",  default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "forumPath",  label: "Forum URL path",   type: "text", default: "/community" },
          { id: "tagline",    label: "Forum tagline",    type: "text", default: "Talk to other members." },
          { id: "minPostLength", label: "Min post length (chars)", type: "number", default: 20 },
        ],
      },
    ],
  },
};

export default plugin;
