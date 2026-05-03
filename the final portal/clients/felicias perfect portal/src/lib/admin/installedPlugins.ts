"use client";

// Client-side cache of "which plugins are installed on the active org"
// + "which /admin paths belong to which plugin". The admin layout uses
// this to filter the sidebar so client portals only see nav items for
// the plugins they have installed.
//
// Primary (agency) orgs always see everything — they're the operators.

import { getActiveOrgId, getActiveOrg, loadOrgs } from "./orgs";

interface NavItem {
  id: string;
  label: string;
  href: string;
  requiresFeature?: string | null;
  panelId?: string | null;
  groupId?: string | null;
  order?: number | null;
  badge?: string | number | null;
}
interface ApiPlugin { id: string; navItems: NavItem[] }

// What a plugin nav item contributes to the sidebar tree once its
// owning plugin is installed + the path is allowed. Captured at
// fetchRegistry time so the layout merge is sync.
export interface PluginSidebarContribution {
  pluginId: string;
  panelId: string;
  groupId?: string;
  navId: string;
  label: string;
  href: string;
  requiresFeature: string | null;
  order: number;
  badge?: string | number;
}

interface State {
  paths: Map<string, { pluginId: string; requiresFeature: string | null }>;
  contributions: PluginSidebarContribution[];
  installed: Set<string>;
  features: Map<string, Record<string, boolean>>;
  enabled: Map<string, boolean>;
  primary: boolean;
  loaded: boolean;
}

let state: State = {
  paths: new Map(),
  contributions: [],
  installed: new Set(),
  features: new Map(),
  enabled: new Map(),
  primary: false,
  loaded: false,
};

const CHANGE_EVENT = "lk-installed-plugins-change";
let registryFetchPromise: Promise<void> | null = null;

async function fetchRegistry(): Promise<void> {
  if (state.paths.size > 0) return;
  if (registryFetchPromise) return registryFetchPromise;
  registryFetchPromise = (async () => {
    try {
      const res = await fetch("/api/portal/plugins");
      const data = await res.json() as { plugins: ApiPlugin[] };
      const next = new Map<string, { pluginId: string; requiresFeature: string | null }>();
      const contributions: PluginSidebarContribution[] = [];
      for (const p of data.plugins) {
        for (const n of p.navItems) {
          if (!n.href.startsWith("/admin")) continue;
          next.set(n.href, { pluginId: p.id, requiresFeature: n.requiresFeature ?? null });
          // Plugins that declare panelId opt into being merged into the
          // sidebar tree. Items without panelId stay filtered through
          // DEFAULT_LAYOUT only.
          if (n.panelId) {
            contributions.push({
              pluginId: p.id,
              panelId: n.panelId,
              groupId: n.groupId ?? undefined,
              navId: n.id,
              label: n.label,
              href: n.href,
              requiresFeature: n.requiresFeature ?? null,
              order: typeof n.order === "number" ? n.order : 0,
              badge: typeof n.badge === "string" || typeof n.badge === "number" ? n.badge : undefined,
            });
          }
        }
      }
      state = { ...state, paths: next, contributions };
    } catch { /* leave empty; fallback to "show everything" */ }
  })();
  await registryFetchPromise;
  registryFetchPromise = null;
}

async function fetchInstalls(): Promise<void> {
  await loadOrgs(false);
  const org = getActiveOrg();
  if (!org) {
    state = { ...state, installed: new Set(), features: new Map(), enabled: new Map(), primary: false, loaded: true };
    return;
  }
  const installed = new Set<string>();
  const features = new Map<string, Record<string, boolean>>();
  const enabled = new Map<string, boolean>();
  for (const inst of org.plugins ?? []) {
    installed.add(inst.pluginId);
    features.set(inst.pluginId, inst.features ?? {});
    enabled.set(inst.pluginId, inst.enabled);
  }
  state = { ...state, installed, features, enabled, primary: org.isPrimary, loaded: true };
}

export async function refreshInstalledPlugins(): Promise<void> {
  await Promise.all([fetchRegistry(), fetchInstalls()]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export function isPathAllowed(href: string): boolean {
  if (!state.loaded) return true;        // optimistic until first load
  if (state.primary) return true;        // agency owner sees everything
  const meta = state.paths.get(href);
  if (!meta) return true;                // unknown paths default open (custom tabs, /admin root, etc.)
  const enabled = state.enabled.get(meta.pluginId) === true;
  if (!enabled) return false;
  if (meta.requiresFeature) {
    const featureMap = state.features.get(meta.pluginId) ?? {};
    if (featureMap[meta.requiresFeature] !== true) return false;
  }
  return true;
}

export function onInstalledPluginsChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

// Used by tests / the layout's first paint to seed without waiting.
export function getInstalledPluginsSnapshot() {
  return {
    primary: state.primary,
    installed: new Set(state.installed),
    enabled: new Map(state.enabled),
    features: new Map(state.features),
  };
}

// Sidebar contributions declared by plugin manifests via navItems[].panelId.
// Returned filtered through the same install/feature gates as isPathAllowed
// so the caller can drop them straight into the rendered tree without
// repeating the check.
export function getPluginSidebarContributions(): PluginSidebarContribution[] {
  // Primary org sees everything (the agency operator).
  if (state.primary) return state.contributions.slice();
  return state.contributions.filter(c => {
    if (!state.installed.has(c.pluginId)) return false;
    if (state.enabled.get(c.pluginId) !== true) return false;
    if (c.requiresFeature) {
      const feats = state.features.get(c.pluginId) ?? {};
      if (feats[c.requiresFeature] !== true) return false;
    }
    return true;
  });
}

// Re-fetch installs when the active org changes.
if (typeof window !== "undefined") {
  window.addEventListener("lk-orgs-change", () => {
    void refreshInstalledPlugins();
  });
}
