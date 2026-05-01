// Aqua plugin runtime — install / uninstall / enable / disable / configure.
//
// Pure server-side. Mutates `OrgRecord.plugins[]` and runs the plugin's
// lifecycle hooks. Used by:
//   • the marketplace API (POST /api/portal/orgs/[orgId]/plugins/[pluginId])
//   • the new-org flow when a preset is selected
//   • test fixtures
//
// Errors are returned as { ok: false, error } rather than thrown so the
// API layer can surface them to the operator without a 500.

import { getOrg, updateOrg } from "@/portal/server/orgs";
import { getState, mutate } from "@/portal/server/storage";
import { getPlugin, listCorePlugins } from "./_registry";
import type {
  AquaPlugin, AquaPreset, OrgPluginInstall, PluginCtx, PluginStorage,
} from "./_types";

// ─── Plugin storage namespacing ────────────────────────────────────────────
//
// Each org × plugin pair gets a slice of state under
// `state.pluginData[orgId][pluginId][key]`. This isolation means
// uninstall can blow away one plugin's data without touching the rest.

interface PluginDataState {
  pluginData?: Record<string, Record<string, Record<string, unknown>>>;
}

function getPluginDataState(): Record<string, Record<string, Record<string, unknown>>> {
  const s = getState() as unknown as PluginDataState;
  if (!s.pluginData) s.pluginData = {};
  return s.pluginData;
}

function makeStorage(orgId: string, pluginId: string): PluginStorage {
  return {
    async get<T = unknown>(key: string): Promise<T | undefined> {
      const data = getPluginDataState();
      return data[orgId]?.[pluginId]?.[key] as T | undefined;
    },
    async set<T = unknown>(key: string, value: T): Promise<void> {
      mutate(state => {
        const s = state as unknown as PluginDataState;
        if (!s.pluginData) s.pluginData = {};
        if (!s.pluginData[orgId]) s.pluginData[orgId] = {};
        if (!s.pluginData[orgId][pluginId]) s.pluginData[orgId][pluginId] = {};
        s.pluginData[orgId][pluginId][key] = value;
      });
    },
    async del(key: string): Promise<void> {
      mutate(state => {
        const s = state as unknown as PluginDataState;
        delete s.pluginData?.[orgId]?.[pluginId]?.[key];
      });
    },
    async list(prefix?: string): Promise<string[]> {
      const data = getPluginDataState();
      const slice = data[orgId]?.[pluginId] ?? {};
      const keys = Object.keys(slice);
      return prefix ? keys.filter(k => k.startsWith(prefix)) : keys;
    },
  };
}

function makeCtx(orgId: string, install: OrgPluginInstall): PluginCtx {
  return {
    orgId,
    install,
    storage: makeStorage(orgId, install.pluginId),
  };
}

// ─── Default-feature derivation ────────────────────────────────────────────

function defaultFeatures(plugin: AquaPlugin, overrides?: Record<string, boolean>): Record<string, boolean> {
  const base: Record<string, boolean> = {};
  for (const f of plugin.features) base[f.id] = f.default;
  return { ...base, ...overrides };
}

function defaultConfig(plugin: AquaPlugin, overrides?: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  for (const group of plugin.settings.groups) {
    for (const field of group.fields) {
      if (field.default !== undefined) base[field.id] = field.default;
    }
  }
  return { ...base, ...overrides };
}

// ─── Installation ──────────────────────────────────────────────────────────

export type InstallResult =
  | { ok: true; install: OrgPluginInstall }
  | { ok: false; error: string };

export interface InstallOptions {
  installedBy?: string;
  setupAnswers?: Record<string, string>;
  featureOverrides?: Record<string, boolean>;
  configOverrides?: Record<string, unknown>;
}

export async function installPlugin(
  orgId: string,
  pluginId: string,
  options: InstallOptions = {},
): Promise<InstallResult> {
  const org = getOrg(orgId);
  if (!org) return { ok: false, error: `Org "${orgId}" not found.` };

  const plugin = getPlugin(pluginId);
  if (!plugin) return { ok: false, error: `Plugin "${pluginId}" not found.` };

  const existing = (org.plugins ?? []).find(p => p.pluginId === pluginId);
  if (existing) return { ok: false, error: `Plugin "${pluginId}" already installed.` };

  // Dependency check — every required plugin must already be installed.
  if (plugin.requires?.length) {
    const installedIds = new Set((org.plugins ?? []).map(p => p.pluginId));
    const missing = plugin.requires.filter(id => !installedIds.has(id));
    if (missing.length) {
      return { ok: false, error: `Missing dependencies: ${missing.join(", ")}.` };
    }
  }

  // Conflict check.
  if (plugin.conflicts?.length) {
    const installedIds = new Set((org.plugins ?? []).map(p => p.pluginId));
    const conflicting = plugin.conflicts.filter(id => installedIds.has(id));
    if (conflicting.length) {
      return { ok: false, error: `Conflicts with installed plugin(s): ${conflicting.join(", ")}.` };
    }
  }

  const install: OrgPluginInstall = {
    pluginId,
    installedAt: Date.now(),
    installedBy: options.installedBy,
    enabled: true,
    config: defaultConfig(plugin, options.configOverrides),
    features: defaultFeatures(plugin, options.featureOverrides),
    setupAnswers: options.setupAnswers,
  };

  // Persist the install record first so onInstall hooks can read it
  // back via ctx.install.
  updateOrg(orgId, { plugins: [...(org.plugins ?? []), install] });

  if (plugin.onInstall) {
    try {
      await plugin.onInstall(makeCtx(orgId, install), options.setupAnswers ?? {});
    } catch (err) {
      // Roll back the install record so the org doesn't end up with
      // a half-installed plugin.
      const rolled = (getOrg(orgId)?.plugins ?? []).filter(p => p.pluginId !== pluginId);
      updateOrg(orgId, { plugins: rolled });
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: true, install };
}

// ─── Uninstallation ────────────────────────────────────────────────────────

export async function uninstallPlugin(
  orgId: string,
  pluginId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const org = getOrg(orgId);
  if (!org) return { ok: false, error: `Org "${orgId}" not found.` };

  const plugin = getPlugin(pluginId);
  if (!plugin) return { ok: false, error: `Plugin "${pluginId}" not found.` };

  if (plugin.core) return { ok: false, error: `Plugin "${pluginId}" is core and cannot be uninstalled.` };

  const install = (org.plugins ?? []).find(p => p.pluginId === pluginId);
  if (!install) return { ok: false, error: `Plugin "${pluginId}" is not installed.` };

  // Reverse-dependency check — refuse if another installed plugin requires this one.
  const dependents = (org.plugins ?? []).filter(p => {
    const dependent = getPlugin(p.pluginId);
    return dependent?.requires?.includes(pluginId);
  });
  if (dependents.length) {
    const names = dependents.map(d => d.pluginId).join(", ");
    return { ok: false, error: `Other installed plugins depend on this: ${names}. Uninstall them first.` };
  }

  if (plugin.onUninstall) {
    try {
      await plugin.onUninstall(makeCtx(orgId, install));
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // Wipe the plugin's state slice.
  mutate(state => {
    const s = state as unknown as PluginDataState;
    delete s.pluginData?.[orgId]?.[pluginId];
  });

  updateOrg(orgId, {
    plugins: (org.plugins ?? []).filter(p => p.pluginId !== pluginId),
  });

  return { ok: true };
}

// ─── Enable / disable ──────────────────────────────────────────────────────

export async function setPluginEnabled(
  orgId: string,
  pluginId: string,
  enabled: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const org = getOrg(orgId);
  if (!org) return { ok: false, error: `Org "${orgId}" not found.` };

  const plugin = getPlugin(pluginId);
  if (!plugin) return { ok: false, error: `Plugin "${pluginId}" not found.` };

  const install = (org.plugins ?? []).find(p => p.pluginId === pluginId);
  if (!install) return { ok: false, error: `Plugin "${pluginId}" is not installed.` };

  if (install.enabled === enabled) return { ok: true };

  const next: OrgPluginInstall = { ...install, enabled };
  updateOrg(orgId, {
    plugins: (org.plugins ?? []).map(p => p.pluginId === pluginId ? next : p),
  });

  const hook = enabled ? plugin.onEnable : plugin.onDisable;
  if (hook) {
    try {
      await hook(makeCtx(orgId, next));
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: true };
}

// ─── Configure (settings + feature toggles) ────────────────────────────────

export interface ConfigurePatch {
  config?: Record<string, unknown>;
  features?: Record<string, boolean>;
}

export async function configurePlugin(
  orgId: string,
  pluginId: string,
  patch: ConfigurePatch,
): Promise<{ ok: true; install: OrgPluginInstall } | { ok: false; error: string }> {
  const org = getOrg(orgId);
  if (!org) return { ok: false, error: `Org "${orgId}" not found.` };

  const plugin = getPlugin(pluginId);
  if (!plugin) return { ok: false, error: `Plugin "${pluginId}" not found.` };

  const install = (org.plugins ?? []).find(p => p.pluginId === pluginId);
  if (!install) return { ok: false, error: `Plugin "${pluginId}" is not installed.` };

  // Validate feature toggles obey their `requires` chain.
  if (patch.features) {
    const merged = { ...install.features, ...patch.features };
    for (const feature of plugin.features) {
      if (!merged[feature.id]) continue;
      for (const dep of feature.requires ?? []) {
        if (!merged[dep]) {
          return { ok: false, error: `Feature "${feature.id}" requires "${dep}" to be enabled.` };
        }
      }
    }
  }

  const next: OrgPluginInstall = {
    ...install,
    config: patch.config ? { ...install.config, ...patch.config } : install.config,
    features: patch.features ? { ...install.features, ...patch.features } : install.features,
  };

  updateOrg(orgId, {
    plugins: (org.plugins ?? []).map(p => p.pluginId === pluginId ? next : p),
  });

  if (plugin.onConfigure) {
    try {
      await plugin.onConfigure(makeCtx(orgId, next));
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: true, install: next };
}

// ─── Feature gate (read-side) ──────────────────────────────────────────────
//
// The single helper everyone uses to ask "is this sub-feature on for this
// org?". Used by route shells (404 if off), nav rendering (hide item),
// and FeatureGate components.

export function isFeatureEnabled(orgId: string, pluginId: string, featureId: string): boolean {
  const org = getOrg(orgId);
  if (!org) return false;
  const install = (org.plugins ?? []).find(p => p.pluginId === pluginId);
  if (!install || !install.enabled) return false;
  return install.features[featureId] === true;
}

export function isPluginInstalled(orgId: string, pluginId: string): boolean {
  const org = getOrg(orgId);
  if (!org) return false;
  return (org.plugins ?? []).some(p => p.pluginId === pluginId && p.enabled);
}

export function getInstall(orgId: string, pluginId: string): OrgPluginInstall | undefined {
  return getOrg(orgId)?.plugins?.find(p => p.pluginId === pluginId);
}

// ─── Auto-install core plugins ─────────────────────────────────────────────
//
// Called when an org is first created. Core plugins (Brand Kit, etc.)
// install silently with default config — the org never sees them in
// the marketplace because they're always already installed.

export async function installCorePluginsForOrg(orgId: string): Promise<void> {
  for (const plugin of listCorePlugins()) {
    const already = getInstall(orgId, plugin.id);
    if (already) continue;
    await installPlugin(orgId, plugin.id, { installedBy: "system" });
  }
}

// ─── Preset application ────────────────────────────────────────────────────
//
// Runs `installPlugin` for each entry in the preset, in order, with the
// preset's feature/config overrides applied. Stops on the first failure
// and rolls back the partial installs so the org doesn't end up
// mid-preset.

export async function applyPreset(
  orgId: string,
  preset: AquaPreset,
  installedBy?: string,
): Promise<{ ok: true; installed: string[] } | { ok: false; error: string; installed: string[] }> {
  const installed: string[] = [];

  for (const entry of preset.plugins) {
    const result = await installPlugin(orgId, entry.pluginId, {
      installedBy,
      featureOverrides: entry.features,
      configOverrides: entry.config,
    });
    if (!result.ok) {
      // Roll back what we installed so far.
      for (const id of installed.reverse()) {
        await uninstallPlugin(orgId, id).catch(() => undefined);
      }
      return { ok: false, error: `Failed installing "${entry.pluginId}": ${result.error}`, installed: [] };
    }
    installed.push(entry.pluginId);
  }

  return { ok: true, installed };
}
