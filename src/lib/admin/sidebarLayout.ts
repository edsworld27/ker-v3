"use client";

// Sidebar layout for the admin panel. The sidebar is organised as a small set
// of top-level "panels" (Store, Website, Users, Settings). When the admin
// clicks a panel, the sidebar drills into it and shows that panel's items.
// A "back" affordance returns to the top-level view.
//
// The layout is fully customisable from /admin/customise → Sidebar:
// admins can rename panels, reorder/rename items, group items into
// dropdowns, and add their own custom routes (internal paths or external
// URLs).

import type { Resource } from "./team";

const KEY = "lk_admin_sidebar_layout_v1";
const CHANGE_EVENT = "lk-admin-sidebar-layout-change";

export type SidebarItemType = "link" | "group";

export interface SidebarLink {
  id: string;
  label: string;
  href: string;
  resource?: Resource;
  external?: boolean;          // open in new browser tab
  badgeKey?: BadgeKey;         // optional notification badge
}

export interface SidebarGroup {
  id: string;
  label: string;
  items: SidebarLink[];        // dropdown children
  defaultOpen?: boolean;
}

export type SidebarItem =
  | ({ type: "link" } & SidebarLink)
  | ({ type: "group" } & SidebarGroup);

export interface SidebarPanel {
  id: string;
  label: string;
  icon: string;                // emoji or short string
  description?: string;
  items: SidebarItem[];
}

export interface SidebarLayout {
  panels: SidebarPanel[];
}

// Built-in badge keys — the layout component reads counts for these.
export type BadgeKey =
  | "pendingOrders"
  | "lowStock"
  | "drafts"
  | "tickets"
  | "owedCommissions"
  | "activeTests"
  | "activeFunnels";

// ─── Default layout ──────────────────────────────────────────────────────────

export const DEFAULT_LAYOUT: SidebarLayout = {
  panels: [
    {
      id: "store",
      label: "Store",
      icon: "🛍",
      description: "Orders, products, customers, marketing",
      items: [
        { type: "link", id: "overview",  label: "Overview",   href: "/admin",            resource: "overview" },
        { type: "link", id: "orders",    label: "Orders",     href: "/admin/orders",     resource: "orders",     badgeKey: "pendingOrders" },
        { type: "link", id: "customers", label: "Customers",  href: "/admin/customers",  resource: "customers" },
        { type: "link", id: "products",  label: "Products",   href: "/admin/products",   resource: "products" },
        { type: "link", id: "collections", label: "Collections", href: "/admin/collections", resource: "collections" },
        { type: "link", id: "inventory", label: "Inventory",  href: "/admin/inventory",  resource: "inventory",  badgeKey: "lowStock" },
        { type: "link", id: "reviews",   label: "Reviews",    href: "/admin/reviews",    resource: "reviews" },
        {
          type: "group",
          id: "marketing-group",
          label: "Marketing",
          defaultOpen: true,
          items: [
            { id: "marketing",  label: "Campaigns",      href: "/admin/marketing",  resource: "marketing", badgeKey: "owedCommissions" },
            { id: "popup",      label: "Discount popup", href: "/admin/popup",      resource: "marketing" },
            { id: "split-test", label: "Split test",     href: "/admin/split-test", resource: "split_test", badgeKey: "activeTests" },
            { id: "funnels",    label: "Funnels",        href: "/admin/funnels",    resource: "funnels",    badgeKey: "activeFunnels" },
          ],
        },
        { type: "link", id: "shipping", label: "Shipping", href: "/admin/shipping", resource: "shipping" },
        { type: "link", id: "support",  label: "Support",  href: "/admin/support",  resource: "support",  badgeKey: "tickets" },
      ],
    },
    {
      id: "website",
      label: "Website",
      icon: "🌐",
      description: "Content, pages, theme, sections",
      items: [
        { type: "link", id: "website",  label: "Content",   href: "/admin/website",  resource: "website", badgeKey: "drafts" },
        { type: "link", id: "blog",     label: "Blog",      href: "/admin/blog",     resource: "blog" },
        { type: "link", id: "faq",      label: "FAQ",       href: "/admin/faq",      resource: "faq" },
        { type: "link", id: "pages",    label: "Pages",     href: "/admin/pages",    resource: "pages" },
        {
          type: "group",
          id: "design-group",
          label: "Design",
          defaultOpen: true,
          items: [
            { id: "theme",    label: "Theme",    href: "/admin/theme",    resource: "theme" },
            { id: "sections", label: "Sections", href: "/admin/sections", resource: "sections" },
          ],
        },
        { type: "link", id: "tooltips", label: "Tooltips", href: "/admin/tooltips", resource: "settings" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: "👥",
      description: "Team members, roles, permissions",
      items: [
        { type: "link", id: "team", label: "Team", href: "/admin/team", resource: "team" },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
      description: "Sites, features, customisation",
      items: [
        { type: "link", id: "settings", label: "General",       href: "/admin/settings", resource: "settings" },
        { type: "link", id: "sites",    label: "Sites",         href: "/admin/sites",    resource: "settings" },
        { type: "link", id: "features", label: "Feature flags", href: "/admin/features", resource: "settings" },
        { type: "link", id: "customise", label: "Customise",    href: "/admin/customise", resource: "settings" },
        { type: "link", id: "activity", label: "Activity log",  href: "/admin/activity", resource: "settings" },
      ],
    },
  ],
};

// ─── Storage ─────────────────────────────────────────────────────────────────

export function getSidebarLayout(): SidebarLayout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as SidebarLayout;
    if (!parsed.panels || !Array.isArray(parsed.panels)) return DEFAULT_LAYOUT;
    return parsed;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function saveSidebarLayout(layout: SidebarLayout) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(layout));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetSidebarLayout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onSidebarLayoutChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Find which panel "owns" a given pathname, used to auto-drill the sidebar
// when the admin navigates directly to a sub-route.
export function findPanelForPath(layout: SidebarLayout, pathname: string): string | null {
  if (!pathname) return null;
  let bestPanelId: string | null = null;
  let bestLength = -1;
  for (const panel of layout.panels) {
    for (const item of panel.items) {
      const links = item.type === "link" ? [item] : item.items;
      for (const link of links) {
        const href = link.href;
        if (!href || href.startsWith("http")) continue;
        const matches = href === "/admin"
          ? pathname === "/admin"
          : pathname === href || pathname.startsWith(href + "/");
        if (matches && href.length > bestLength) {
          bestLength = href.length;
          bestPanelId = panel.id;
        }
      }
    }
  }
  return bestPanelId;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}
