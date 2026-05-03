// Aqua plugin registry.
//
// Single source of truth for what plugins exist in the codebase. The
// marketplace UI reads from `listPlugins()`, the admin sidebar reads
// installed plugins via the runtime, and route shells dispatch to
// `getPlugin(id)` to find the manifest at request time.
//
// Plugins are registered explicitly (not auto-discovered) so:
//   1. The bundler can tree-shake unused plugins out of production
//      builds for orgs that don't have them installed (each plugin's
//      heavy code lives behind dynamic imports inside its manifest).
//   2. There's a single file to grep when answering "what plugins do
//      we ship?".
//
// Adding a new plugin: import its manifest below and append to PLUGINS.

import type { AquaPlugin } from "./_types";

import brand from "./brand";
import website from "./website";
import ecommerce from "./ecommerce";
import blog from "./blog";
import chatbot from "./chatbot";
import forms from "./forms";
import funnels from "./funnels";
import seo from "./seo";
import auditor from "./auditor";
import compliance from "./compliance";
import support from "./support";
import repo from "./repo";
import analytics from "./analytics";
import email from "./email";
import i18n from "./i18n";
import subscriptions from "./subscriptions";
import webhooks from "./webhooks";
import memberships from "./memberships";
import reservations from "./reservations";
import donations from "./donations";
import crm from "./crm";
import affiliates from "./affiliates";
import livechat from "./livechat";
import auditlog from "./auditlog";
import automation from "./automation";
import knowledgebase from "./knowledgebase";
import search from "./search";
import backups from "./backups";
import forum from "./forum";
import wiki from "./wiki";
import inventory from "./inventory";
import reviewsV2 from "./reviews";
import social from "./social";
import notifications from "./notifications";

// First-party plugins. Order is presentation-only (marketplace
// rendering); install dependencies are enforced by the runtime.
const PLUGINS: AquaPlugin[] = [
  brand,
  website,
  ecommerce,
  inventory,
  subscriptions,
  blog,
  wiki,
  knowledgebase,
  forum,
  memberships,
  reservations,
  donations,
  email,
  forms,
  chatbot,
  livechat,
  seo,
  social,
  analytics,
  funnels,
  affiliates,
  crm,
  automation,
  search,
  reviewsV2,
  compliance,
  support,
  auditor,
  auditlog,
  backups,
  webhooks,
  notifications,
  repo,
  i18n,
];

import { validatePlugin, validateRegistry } from "./_validate";

// Re-export so the marketplace + authoring guide can run the same
// validator against in-progress manifests.
export { validatePlugin, validateRegistry } from "./_validate";
export type { PluginValidationResult } from "./_validate";

// Validate every shipped plugin once on module load. Authoring mistakes
// (missing id, duplicate nav items, bad hrefs) surface as console
// errors at boot rather than obscure runtime crashes when the layout
// or marketplace tries to render. We don't throw — that would take the
// whole app down on a single malformed manifest. Instead, malformed
// plugins are filtered out of the registry so the rest of the app
// keeps running.
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
  // Validate before mutating the registry — a malformed third-party or
  // dev-time plugin must not pollute the in-memory list and break the
  // marketplace for everyone else.
  const result = validatePlugin(plugin);
  if (!result.ok) {
    throw new Error(
      `Plugin "${plugin?.id ?? "?"}" is invalid:\n  - ${result.errors.join("\n  - ")}`,
    );
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

// Convenience: get a plugin's manifest or throw. Use when the caller
// is already certain the plugin should exist (e.g. inside a route
// dispatcher that's already validated `id` against an install record).
export function requirePlugin(id: string): AquaPlugin {
  const plugin = getPlugin(id);
  if (!plugin) throw new Error(`Plugin "${id}" not found in registry.`);
  return plugin;
}
