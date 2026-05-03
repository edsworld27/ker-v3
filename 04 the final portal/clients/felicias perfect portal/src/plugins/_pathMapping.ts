// Resolve which plugin owns a given /admin path.
//
// Each plugin's manifest declares its sidebar nav items (with their
// /admin/<x> hrefs). This helper walks the registry and finds the
// best match for an arbitrary pathname. Used by:
//   • <PluginRequired> — empty-state when the plugin isn't installed
//   • Dynamic sidebar — filter nav items by installed plugins
//   • Admin layout — show "Install plugin from marketplace" hint
//
// Match rule: longest-prefix wins. So /admin/products/[slug]/variants
// maps to E-commerce because that plugin owns /admin/products even
// though no nav item literally points at /admin/products/[slug]/variants.

import { listPlugins } from "./_registry";

export function pluginIdForPath(pathname: string): string | null {
  if (!pathname.startsWith("/admin")) return null;
  let bestPluginId: string | null = null;
  let bestLen = 0;
  for (const plugin of listPlugins()) {
    for (const item of plugin.navItems) {
      if (!item.href.startsWith("/admin")) continue;
      // exact match or "is descendant" — guard against "/admin/products"
      // matching "/admin/product-grid" by requiring a "/" boundary.
      const exact = pathname === item.href;
      const descendant = pathname.startsWith(item.href + "/");
      if (!exact && !descendant) continue;
      if (item.href.length > bestLen) {
        bestPluginId = plugin.id;
        bestLen = item.href.length;
      }
    }
  }
  return bestPluginId;
}
