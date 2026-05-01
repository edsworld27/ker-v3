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

// First-party plugins. Order is presentation-only (marketplace
// rendering); install dependencies are enforced by the runtime.
const PLUGINS: AquaPlugin[] = [
  brand,
  website,
  ecommerce,
  blog,
  email,
  forms,
  chatbot,
  seo,
  analytics,
  funnels,
  compliance,
  support,
  auditor,
  repo,
];

export function registerPlugin(plugin: AquaPlugin): void {
  if (PLUGINS.some(p => p.id === plugin.id)) {
    throw new Error(`Plugin "${plugin.id}" is already registered.`);
  }
  PLUGINS.push(plugin);
}

export function listPlugins(): AquaPlugin[] {
  return [...PLUGINS];
}

export function getPlugin(id: string): AquaPlugin | undefined {
  return PLUGINS.find(p => p.id === id);
}

export function listCorePlugins(): AquaPlugin[] {
  return PLUGINS.filter(p => p.core === true);
}

export function listInstallablePlugins(): AquaPlugin[] {
  return PLUGINS.filter(p => p.core !== true);
}

// Convenience: get a plugin's manifest or throw. Use when the caller
// is already certain the plugin should exist (e.g. inside a route
// dispatcher that's already validated `id` against an install record).
export function requirePlugin(id: string): AquaPlugin {
  const plugin = getPlugin(id);
  if (!plugin) throw new Error(`Plugin "${id}" not found in registry.`);
  return plugin;
}
