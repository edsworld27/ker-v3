/**
 * HostBridgeBootstrap
 *
 * Imports each plugin module's register function and invokes them once at
 * startup. This is what turns the host shell from "iframe orchestrator" into
 * "single-domain plugin host" — every suite registers its components against
 * the BridgeRegistry, so the renderer can resolve them by view-id without
 * crossing process boundaries.
 *
 * Each sub-app lives in its own workspace with a separate tsconfig and path
 * aliases. We use lazy dynamic imports so chunks load on demand and so the
 * host shell never imports a sub-app at module-evaluation time. Next.js +
 * Turbopack create a chunk per literal import() at build time.
 *
 * To add a new plugin: append a new entry to PLUGIN_LOADERS below.
 */

type RegisterFn = () => Promise<void> | void;

export interface PluginBootResult {
  id: string;
  ok: boolean;
  error?: string;
}

const PLUGIN_LOADERS: Array<{ id: string; key: string; load: () => Promise<any> }> = [
  {
    id: 'aqua-client',
    key: 'registerClientApp',
    load: () => import('@ClientShell/ClientTemplates/Clientindex'),
  },
  {
    id: 'aqua-crm',
    key: 'registerCrmApp',
    load: () => import('@CRMShell/CRMTemplates/CRMindex'),
  },
  {
    id: 'aqua-ops-revenue',
    key: 'registerRevenueApp',
    load: () => import('@RevenueShell/RevenueTemplates/Revenueindex'),
  },
  {
    id: 'aqua-ops-finance',
    key: 'registerFinanceApp',
    load: () => import('@FinanceShell/FinanceTemplates/Financeindex'),
  },
  {
    id: 'aqua-ops-people',
    key: 'registerPeopleApp',
    load: () => import('@PeopleShell/PeopleTemplates/Peopleindex'),
  },
  {
    id: 'aqua-operations',
    key: 'registerOpsHubApp',
    load: () => import('@OpsHubShell/OpsHubTemplates/OpsHubindex'),
  },
];

let bootstrapPromise: Promise<PluginBootResult[]> | null = null;

export async function bootstrapBridge(): Promise<PluginBootResult[]> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const results: PluginBootResult[] = [];
    console.log(`[BridgeBootstrap] Starting registration of ${PLUGIN_LOADERS.length} plugin(s)...`);

    for (const plugin of PLUGIN_LOADERS) {
      try {
        const mod: any = await plugin.load();
        const fn: RegisterFn | undefined = mod?.[plugin.key] || mod?.default;
        if (typeof fn !== 'function') {
          const msg = `module loaded but export "${plugin.key}" is not a function`;
          console.warn(`[BridgeBootstrap] ${plugin.id}: ${msg}`);
          results.push({ id: plugin.id, ok: false, error: msg });
          continue;
        }
        await fn();
        console.log(`[BridgeBootstrap] ${plugin.id}: registered`);
        results.push({ id: plugin.id, ok: true });
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error(`[BridgeBootstrap] ${plugin.id}: failed —`, err);
        results.push({ id: plugin.id, ok: false, error: msg });
      }
    }

    const ok = results.filter(r => r.ok).length;
    console.log(`[BridgeBootstrap] Done. ${ok}/${results.length} plugin(s) registered successfully.`);
    if (typeof window !== 'undefined') {
      (window as any).__BRIDGE_BOOT_RESULTS__ = results;
    }
    return results;
  })();

  return bootstrapPromise;
}

export { PLUGIN_LOADERS };
