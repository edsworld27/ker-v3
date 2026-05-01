// Memberships plugin — gated content + paid membership tiers.
//
// Adds member-only sections to the storefront (e.g. blog posts,
// pages, downloads) that require a logged-in user with the right
// membership tier. Tiers can be free (signup-gated) or paid
// (Stripe-recurring via the Subscriptions plugin).
//
// Common use cases: paid newsletter, exclusive content, member
// directory, gated community.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "memberships",
  name: "Memberships",
  version: "0.1.0",
  status: "alpha",
  category: "content",
  tagline: "Member-only content with free + paid tiers.",
  description: "Lock pages, posts and downloads behind membership tiers. Free tier (signup-gated), paid tiers (Stripe-recurring via Subscriptions plugin), and a member directory if you want a public roster. Per-tier benefits, custom welcome emails, and member-only blocks for the editor.",

  requires: ["website"],

  navItems: [
    { id: "memberships",      label: "Memberships",  href: "/admin/memberships",        order: 0 },
    { id: "membership-tiers", label: "Tiers",        href: "/admin/memberships/tiers",  order: 1 },
    { id: "member-directory", label: "Members",      href: "/admin/memberships/members", order: 2 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "freeTier",         label: "Free signup tier",          default: true },
    { id: "paidTiers",        label: "Paid tiers (recurring)",    default: false, requires: ["freeTier"] },
    { id: "memberDirectory",  label: "Public member directory",   default: false },
    { id: "memberOnlyBlocks", label: "Member-only block visibility gate", default: true },
    { id: "welcomeEmail",     label: "Custom welcome email per tier", default: false },
    { id: "memberCommunity",  label: "Member community area",     default: false, plans: ["pro", "enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "loginUrl",  label: "Member sign-in URL", type: "url", default: "/account" },
          { id: "signupUrl", label: "Member signup URL",  type: "url", default: "/account?mode=signup" },
        ],
      },
      {
        id: "directory",
        label: "Directory",
        description: "Only used when Member Directory feature is on.",
        fields: [
          { id: "directoryPath", label: "Directory URL path", type: "text", default: "/members" },
          { id: "showAvatars",   label: "Show member avatars", type: "boolean", default: true },
          { id: "requireApproval", label: "Require admin approval before listing", type: "boolean", default: false },
        ],
      },
    ],
  },
};

export default plugin;
