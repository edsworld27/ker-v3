import "server-only";
// Sidebar nav assembly — the chrome contract that T2 + T3 ship against.
//
// Inputs:
//   • role (from session)
//   • currentClient (when on a /portal/clients/[clientId] route)
//   • installedPlugins (read at request time from pluginInstalls)
//
// Output: an ordered list of `NavPanel`s. Each panel groups nav items
// by `panelId`. The default panels exist even when no plugin contributes
// — keeps the chrome stable while plugins are landing.
//
// Plugin nav items are merged onto the default tree by their declared
// `panelId`. Items without a panelId fall into the "main" panel.

import { listPlugins } from "@/plugins/_registry";
import type { NavItem, PanelId } from "@/plugins/_types";
import type { Client, PluginInstall, Role } from "@/server/types";
import { isAgencyRole, isClientRole } from "@/server/types";

export interface NavPanel {
  id: PanelId;
  label: string;
  order: number;
  items: NavItem[];
}

const DEFAULT_PANELS: { id: PanelId; label: string; order: number }[] = [
  { id: "main", label: "Overview", order: 0 },
  { id: "fulfillment", label: "Fulfillment", order: 10 },
  { id: "store", label: "Store", order: 20 },
  { id: "content", label: "Content", order: 30 },
  { id: "marketing", label: "Marketing", order: 40 },
  { id: "ops", label: "Operations", order: 50 },
  { id: "tools", label: "Tools", order: 60 },
  { id: "settings", label: "Settings", order: 90 },
];

export interface BuildSidebarInput {
  role: Role;
  scope: "agency" | "client" | "customer";
  currentClient?: Client;
  installedPlugins: PluginInstall[];
}

// Default top-of-list nav items contributed by the foundation, role-aware.
// Plugins layer their items underneath these via panelId.
function defaultMainItems(input: BuildSidebarInput): NavItem[] {
  const items: NavItem[] = [];
  if (input.scope === "agency") {
    items.push({ id: "home", label: "Dashboard", href: "/portal/agency", panelId: "main", order: -10 });
    if (isAgencyRole(input.role)) {
      items.push({ id: "clients", label: "Clients", href: "/portal/clients", panelId: "main", order: -5 });
    }
  } else if (input.scope === "client" && input.currentClient) {
    items.push({
      id: "home",
      label: "Dashboard",
      href: `/portal/clients/${input.currentClient.id}`,
      panelId: "main",
      order: -10,
    });
  } else if (input.scope === "customer") {
    items.push({ id: "home", label: "My account", href: "/portal/customer", panelId: "main", order: -10 });
  }
  return items;
}

export function buildSidebar(input: BuildSidebarInput): NavPanel[] {
  const itemsByPanel = new Map<PanelId, NavItem[]>();
  for (const p of DEFAULT_PANELS) itemsByPanel.set(p.id, []);

  // Default top-of-list contributions.
  for (const item of defaultMainItems(input)) {
    appendIntoPanel(itemsByPanel, item);
  }

  // Plugin contributions — only for plugins installed AND enabled in this scope.
  const enabledIds = new Set(input.installedPlugins.filter(i => i.enabled).map(i => i.pluginId));
  for (const plugin of listPlugins()) {
    if (!enabledIds.has(plugin.id)) continue;
    for (const navItem of plugin.navItems) {
      // Role gate (when the plugin author specifies one).
      if (navItem.roles && !navItem.roles.includes(input.role)) continue;
      // Feature gate.
      if (navItem.requiresFeature) {
        const install = input.installedPlugins.find(i => i.pluginId === plugin.id);
        if (!install?.features[navItem.requiresFeature]) continue;
      }
      // Rewrite client-scoped item hrefs to embed the current clientId
      // (plugins author with a `:clientId` placeholder by convention).
      const href = navItem.href.includes(":clientId") && input.currentClient
        ? navItem.href.replaceAll(":clientId", input.currentClient.id)
        : navItem.href;
      appendIntoPanel(itemsByPanel, { ...navItem, href });
    }
  }

  // Settings — every scope sees a settings entry. Plugins can add more.
  if (input.scope === "agency" && isAgencyRole(input.role)) {
    appendIntoPanel(itemsByPanel, { id: "agency-settings", label: "Agency settings", href: "/portal/agency/settings", panelId: "settings", order: 100 });
  } else if (input.scope === "client" && input.currentClient && (isAgencyRole(input.role) || isClientRole(input.role))) {
    appendIntoPanel(itemsByPanel, {
      id: "client-settings",
      label: "Client settings",
      href: `/portal/clients/${input.currentClient.id}/settings`,
      panelId: "settings",
      order: 100,
    });
  }

  // Assemble panels in defined order, dropping empties.
  const result: NavPanel[] = [];
  for (const panel of DEFAULT_PANELS) {
    const items = itemsByPanel.get(panel.id) ?? [];
    if (items.length === 0) continue;
    result.push({
      ...panel,
      items: items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label)),
    });
  }
  return result;
}

function appendIntoPanel(map: Map<PanelId, NavItem[]>, item: NavItem) {
  const panelId = (item.panelId ?? "main") as PanelId;
  let bucket = map.get(panelId);
  if (!bucket) {
    bucket = [];
    map.set(panelId, bucket);
  }
  bucket.push(item);
}
