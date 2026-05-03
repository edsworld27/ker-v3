// Social plugin — share buttons + social feed embeds.
//
// Pretty thin layer over native browser share APIs and the typical
// embed iframes (Twitter/X, Instagram, TikTok, YouTube).

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "social",
  name: "Social",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Share buttons + Instagram / X / TikTok feed embeds.",
  description: "Drop-in share buttons for blog posts and product pages. Native Web Share on supported devices, fallback to per-platform URLs. Social feed embed blocks for the editor.",

  requires: ["website"],

  navItems: [
    { id: "social", label: "Social", href: "/admin/social", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "shareButtons",      label: "Share button block",         default: true },
    { id: "instagramFeed",     label: "Instagram feed embed",       default: true },
    { id: "twitterFeed",       label: "X / Twitter feed embed",     default: true },
    { id: "tiktokEmbed",       label: "TikTok embed",               default: true },
    { id: "youtubeChannel",    label: "YouTube channel embed",      default: true },
    { id: "openGraphTags",     label: "Auto Open Graph tags",       default: true },
    { id: "twitterCardTags",   label: "Auto Twitter card tags",     default: true },
  ],

  settings: {
    groups: [
      {
        id: "handles",
        label: "Handles",
        fields: [
          { id: "instagram", label: "Instagram", type: "text", placeholder: "@brand" },
          { id: "twitter",   label: "X / Twitter", type: "text", placeholder: "@brand" },
          { id: "tiktok",    label: "TikTok", type: "text", placeholder: "@brand" },
          { id: "facebook",  label: "Facebook", type: "url" },
          { id: "youtube",   label: "YouTube", type: "url" },
        ],
      },
    ],
  },
};

export default plugin;
