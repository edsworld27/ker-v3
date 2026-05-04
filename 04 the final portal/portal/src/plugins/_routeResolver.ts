import "server-only";
// Resolve a portal URL to the plugin page that should render it.
//
// URL conventions handled:
//
//   /portal/agency/<pluginId>/<sub-path>
//     → `<sub-path>` matched against `plugin.pages[i].path`
//
//   /portal/clients/<clientId>/<pluginId>/<sub-path>
//     → same, but with the client scope's install resolved instead
//
//   /portal/clients/<clientId>/<sub-path>     (no plugin id in URL)
//     → search all plugins for a `pages[i].path` matching `<sub-path>`.
//       Used by client-side surfaces a plugin contributes at the
//       per-client root (e.g. fulfillment's "checklist" page).
//
// Path matching rules for `plugin.pages[i].path` ("PP"):
//   • PP === ""               matches when remaining segments is empty
//   • PP === "literal"        exact match against single remaining segment
//   • PP === "a/b"            joined-segments match against remainder
//   • PP starts with ":"      single-parameter match — captures one segment
//                              and exposes it via `segments[0]`
//
// Returns null when no plugin owns the URL — caller renders 404.

import { listPlugins } from "./_registry";
import { getInstall } from "@/server/pluginInstalls";
import type { AquaPlugin, PluginPage } from "./_types";
import type { PluginInstall } from "@/server/types";

export interface ResolvedPluginPage {
  plugin: AquaPlugin;
  page: PluginPage;
  install: PluginInstall;
  segments: string[];
}

interface MatchInput { agencyId: string; clientId?: string; rest: string[] }

function tryMatchPage(page: PluginPage, rest: string[]): { ok: true; segments: string[] } | null {
  const pp = page.path;
  if (pp === "") {
    if (rest.length === 0) return { ok: true, segments: [] };
    return null;
  }
  if (pp.startsWith(":")) {
    if (rest.length === 1) return { ok: true, segments: [rest[0]!] };
    return null;
  }
  const ppSegs = pp.split("/").filter(Boolean);
  if (ppSegs.length !== rest.length) return null;
  for (let i = 0; i < ppSegs.length; i++) {
    if (ppSegs[i]!.startsWith(":")) continue;
    if (ppSegs[i] !== rest[i]) return null;
  }
  // segments[] = the dynamic captures only
  const captures: string[] = [];
  for (let i = 0; i < ppSegs.length; i++) {
    if (ppSegs[i]!.startsWith(":")) captures.push(rest[i]!);
  }
  return { ok: true, segments: captures };
}

function pickInstall(pluginId: string, agencyId: string, clientId?: string): PluginInstall | null {
  // Prefer client-scoped install when in client scope; fall back to
  // agency install (core plugins typically live there).
  if (clientId) {
    const c = getInstall({ agencyId, clientId }, pluginId);
    if (c?.enabled) return c;
  }
  const a = getInstall({ agencyId }, pluginId);
  if (a?.enabled) return a;
  return null;
}

// Agency-scope catch-all: /portal/agency/[...rest]
export function resolveAgencyPluginPage({ agencyId, rest }: { agencyId: string; rest: string[] }): ResolvedPluginPage | null {
  if (rest.length === 0) return null;
  const pluginId = rest[0]!;
  const plugin = listPlugins().find(p => p.id === pluginId);
  if (!plugin) return null;
  const install = pickInstall(pluginId, agencyId);
  if (!install) return null;
  const sub = rest.slice(1);
  for (const page of plugin.pages) {
    const m = tryMatchPage(page, sub);
    if (m) return { plugin, page, install, segments: m.segments };
  }
  return null;
}

// Client-scope catch-all: /portal/clients/[clientId]/[...rest]
export function resolveClientPluginPage({ agencyId, clientId, rest }: MatchInput): ResolvedPluginPage | null {
  if (rest.length === 0) return null;

  // Branch 1: explicit plugin id prefix.
  const head = rest[0]!;
  const pluginByPrefix = listPlugins().find(p => p.id === head);
  if (pluginByPrefix) {
    const install = pickInstall(pluginByPrefix.id, agencyId, clientId);
    if (install) {
      const sub = rest.slice(1);
      for (const page of pluginByPrefix.pages) {
        const m = tryMatchPage(page, sub);
        if (m) return { plugin: pluginByPrefix, page, install, segments: m.segments };
      }
    }
    // Fall through to branch 2 in case it isn't actually a plugin id prefix.
  }

  // Branch 2: top-level page contribution under client scope. Search all
  // plugins for a pages[].path matching the full rest path.
  for (const plugin of listPlugins()) {
    const install = pickInstall(plugin.id, agencyId, clientId);
    if (!install) continue;
    for (const page of plugin.pages) {
      const m = tryMatchPage(page, rest);
      if (m) return { plugin, page, install, segments: m.segments };
    }
  }

  return null;
}

// API catch-all: /api/portal/<pluginId>/<sub-path>
export interface ResolvedPluginApiRoute {
  plugin: AquaPlugin;
  route: import("./_types").PluginApiRoute;
  install: PluginInstall;
}

export function resolvePluginApiRoute(
  pluginId: string,
  rest: string[],
  scope: { agencyId: string; clientId?: string },
  method: string,
): ResolvedPluginApiRoute | null {
  const plugin = listPlugins().find(p => p.id === pluginId);
  if (!plugin) return null;
  const install = pickInstall(pluginId, scope.agencyId, scope.clientId);
  if (!install) return null;
  const path = rest.join("/");
  for (const route of plugin.api) {
    if (route.path === path && route.methods.includes(method as "GET" | "POST" | "PATCH" | "PUT" | "DELETE")) {
      return { plugin, route, install };
    }
  }
  return null;
}
