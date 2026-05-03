// tabSets — shared tab strips for "hub" surfaces in the admin chrome.
// Each strip links between sibling pages so an operator can navigate
// plugin-related or settings-related screens without dropping back to
// the sidebar.
//
// Adding tabs here is purely additive: every linked page also keeps its
// own sidebar entry. Tabs are a discoverability layer over the existing
// routes, never a replacement.

import type { AdminTab } from "@/components/admin/AdminTabs";

// Plugins / extensibility hub. Surfaces around the marketplace.
export const MARKETPLACE_TABS: AdminTab[] = [
  { label: "Browse",    href: "/admin/marketplace",                    exact: true },
  { label: "Health",    href: "/admin/plugin-health" },
  { label: "Features",  href: "/admin/features" },
  { label: "Authoring", href: "/admin/portal-settings/plugin-authoring" },
];

// Settings hub. Surfaces around portal + tenant configuration.
export const SETTINGS_TABS: AdminTab[] = [
  { label: "Integrations",  href: "/admin/settings",        exact: true },
  { label: "Customise",     href: "/admin/customise" },
  { label: "Sites",         href: "/admin/sites" },
  { label: "Organisations", href: "/admin/orgs" },
  { label: "Portal",        href: "/admin/portal-settings", exact: true },
  { label: "Compliance",    href: "/admin/compliance" },
];

// Per-product detail tabs. The slug is bound at render time so each
// product gets its own correctly-scoped tab strip.
export function productDetailTabs(slug: string): AdminTab[] {
  return [
    { label: "Details",  href: `/admin/products/${slug}`,          exact: true },
    { label: "Variants", href: `/admin/products/${slug}/variants` },
  ];
}

// Content workbench. Every authoring surface that produces something
// the public site renders — pages, blog posts, FAQ, KB articles, wiki
// entries, forum templates, reusable sections, popups, themes, media
// assets. The Editor is the headline workbench; the listing pages stay
// for quick-access and rows deep-link back into the editor for items
// that have a block tree.
export const CONTENT_TABS: AdminTab[] = [
  { label: "Editor",   href: "/admin/editor" },
  { label: "Pages",    href: "/admin/pages" },
  { label: "Blog",     href: "/admin/blog" },
  { label: "FAQ",      href: "/admin/faq",      exact: true },
  { label: "Help",     href: "/admin/kb" },
  { label: "Wiki",     href: "/admin/wiki" },
  { label: "Forum",    href: "/admin/forum" },
  { label: "Sections", href: "/admin/sections" },
  { label: "Popups",   href: "/admin/popup" },
  { label: "Themes",   href: "/admin/themes" },
  { label: "Assets",   href: "/admin/assets" },
];
