// Plugin registry — single source of truth for what plugins ship.
//
// Plugins are registered explicitly (not auto-discovered) so:
//   1. The bundler can tree-shake unused plugins out of production
//      builds for tenants that don't have them installed (each plugin's
//      heavy code lives behind dynamic imports inside its manifest).
//   2. There's a single file to grep when answering "what plugins do
//      we ship?".
//
// Adding a new plugin: import its manifest below and append to PLUGINS.
//
// Foundation lands with the registry empty. T2 will add the fulfillment
// plugin; T3 will add website-editor. Round 2 ports e-commerce.

import type { AquaPlugin } from "./_types";
import { validatePlugin, validateRegistry } from "./_validate";

export { validatePlugin, validateRegistry } from "./_validate";
export type { PluginValidationResult } from "./_validate";

// ─── First-party plugins ──────────────────────────────────────────────────
//
// Each entry is a manifest imported from its plugin folder under
// `04 the final portal/plugins/<id>/`. T2 + T3 land their imports here
// during their respective rounds.
const PLUGINS: AquaPlugin[] = [
  // T2 → import fulfillment from "@plugins/fulfillment";
  // T3 → import websiteEditor from "@plugins/website-editor";
];

// Validate every shipped plugin once on module load. Authoring mistakes
// (missing id, duplicate nav items, bad hrefs) surface as console
// errors at boot rather than obscure runtime crashes when the layout
// or marketplace tries to render. We don't throw — that would take the
// whole app down on a single malformed manifest. Instead, malformed
// plugins are filtered out so the rest of the app keeps running.
const PLUGIN_REGISTRY: AquaPlugin[] = (() => {
  const accepted: AquaPlugin[] = [];
  for (const p of PLUGINS) {
    const result = validatePlugin(p);
    if (result.warnings.length > 0) {
      console.warn(`[plugins] "${p?.id ?? "?"}" warnings:\n  - ${result.warnings.join("\n  - ")}`);
    }
    if (!result.ok) {
      console.error(`[plugins] "${p?.id ?? "?"}" REJECTED:\n  - ${result.errors.join("\n  - ")}`);
      continue;
    }
    accepted.push(p);
  }
  const cross = validateRegistry(accepted);
  if (cross.warnings.length > 0) {
    console.warn(`[plugins] registry warnings:\n  - ${cross.warnings.join("\n  - ")}`);
  }
  if (!cross.ok) {
    console.error(`[plugins] registry errors:\n  - ${cross.errors.join("\n  - ")}`);
  }
  return accepted;
})();

export function registerPlugin(plugin: AquaPlugin): void {
  const result = validatePlugin(plugin);
  if (!result.ok) {
    throw new Error(`Plugin "${plugin?.id ?? "?"}" is invalid:\n  - ${result.errors.join("\n  - ")}`);
  }
  if (PLUGIN_REGISTRY.some(p => p.id === plugin.id)) {
    throw new Error(`Plugin "${plugin.id}" is already registered.`);
  }
  PLUGIN_REGISTRY.push(plugin);
}

export function listPlugins(): AquaPlugin[] {
  return [...PLUGIN_REGISTRY];
}

export function getPlugin(id: string): AquaPlugin | undefined {
  return PLUGIN_REGISTRY.find(p => p.id === id);
}

export function listCorePlugins(): AquaPlugin[] {
  return PLUGIN_REGISTRY.filter(p => p.core === true);
}

export function listInstallablePlugins(): AquaPlugin[] {
  return PLUGIN_REGISTRY.filter(p => p.core !== true);
}

export function requirePlugin(id: string): AquaPlugin {
  const plugin = getPlugin(id);
  if (!plugin) throw new Error(`Plugin "${id}" not found in registry.`);
  return plugin;
}
