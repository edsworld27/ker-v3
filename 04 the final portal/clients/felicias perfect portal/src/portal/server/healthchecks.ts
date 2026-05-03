// Plugin healthcheck infrastructure.
//
// Each installed plugin can declare a `healthcheck(ctx)` function on
// its manifest. This module runs them on a schedule (and on demand)
// and persists the result on the OrgPluginInstall so the marketplace
// + admin dashboard can show a coloured indicator.

import "server-only";
import { getOrg, updateOrg } from "./orgs";
// Avoid importing the registry directly (manifests pull in React
// types, fine on server, but keep the boundary clean by parameterising).
import type { HealthStatus, AquaPlugin } from "@/plugins/_types";

export interface HealthRunResult {
  pluginId: string;
  status: HealthStatus;
  ranAt: number;
}

// ─── Run a single plugin's healthcheck ─────────────────────────────────────

export async function runPluginHealthcheck(
  orgId: string,
  plugin: AquaPlugin,
): Promise<HealthRunResult> {
  if (!plugin.healthcheck) {
    return {
      pluginId: plugin.id,
      status: { ok: true, message: "No healthcheck declared." },
      ranAt: Date.now(),
    };
  }
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === plugin.id);
  if (!install) {
    return {
      pluginId: plugin.id,
      status: { ok: false, message: "Not installed." },
      ranAt: Date.now(),
    };
  }
  try {
    const result = await plugin.healthcheck({
      orgId,
      install,
      // Storage stub — real implementations land in the plugin runtime;
      // healthchecks generally don't need to write state.
      storage: {
        async get<T = unknown>(): Promise<T | undefined> { return undefined; },
        async set<T = unknown>(): Promise<void> { return; },
        async del(): Promise<void> { return; },
        async list(): Promise<string[]> { return []; },
      },
    });
    persistHealth(orgId, plugin.id, result);
    return { pluginId: plugin.id, status: result, ranAt: Date.now() };
  } catch (err) {
    const status: HealthStatus = {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
    persistHealth(orgId, plugin.id, status);
    return { pluginId: plugin.id, status, ranAt: Date.now() };
  }
}

function persistHealth(orgId: string, pluginId: string, status: HealthStatus): void {
  const org = getOrg(orgId);
  if (!org) return;
  const next = (org.plugins ?? []).map(p =>
    p.pluginId === pluginId
      ? { ...p, health: status, healthCheckedAt: Date.now() }
      : p,
  );
  updateOrg(orgId, { plugins: next });
}

// ─── Run all healthchecks for an org ───────────────────────────────────────

export async function runAllHealthchecks(
  orgId: string,
  plugins: AquaPlugin[],
): Promise<HealthRunResult[]> {
  const results: HealthRunResult[] = [];
  for (const plugin of plugins) {
    if (!plugin.healthcheck) continue;
    const result = await runPluginHealthcheck(orgId, plugin);
    results.push(result);
  }
  return results;
}

// Convenience: read the most recent persisted result without re-running.
export function getLastHealth(orgId: string, pluginId: string): { status?: HealthStatus; checkedAt?: number } | null {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === pluginId);
  if (!install) return null;
  return { status: install.health, checkedAt: install.healthCheckedAt };
}
