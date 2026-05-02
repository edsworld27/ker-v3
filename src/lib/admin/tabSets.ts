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
