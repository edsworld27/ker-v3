/**
 * Bridge UI Registry
 *
 * Templates register their editable UI variable configs here.
 * The Design Mode / Omega Editor resolves these to generate
 * controls dynamically per-view.
 *
 * Stored in the Bridge (not AppShell) so all three products
 * can register UI configs through the same channel.
 *
 * Two registration modes:
 *   1. Full UIViewConfig: BridgeUIRegistry.register({ id, title, variables })
 *   2. Token bag with explicit id: BridgeUIRegistry.register('view-id', tokens, 'Title')
 *      — used by per-view UI token files (the .ui.ts re-exports) that don't
 *      author the variables[] schema themselves but still want their tokens
 *      reachable via the registry for Design Mode lookups.
 */

export interface UIVariable {
  id: string;
  label: string;
  type: 'color' | 'select' | 'text' | 'number' | string;
  options?: string[];
  default: any;
}

export interface UIViewConfig {
  id: string;
  title: string;
  variables: UIVariable[];
  /** Free-form styling tokens consumed by widget components. */
  tokens?: Record<string, any>;
}

// Module-level singleton — survives across imports in the same runtime
const uiConfigs: Record<string, UIViewConfig> = {};

export const BridgeUIRegistry = {
  register(idOrConfig: string | UIViewConfig, tokens?: Record<string, any>, title?: string): void {
    if (typeof idOrConfig === 'string') {
      const id = idOrConfig;
      uiConfigs[id] = {
        id,
        title: title ?? id,
        variables: [],
        tokens,
      };
    } else {
      uiConfigs[idOrConfig.id] = idOrConfig;
    }
  },

  resolve(id: string): UIViewConfig | null {
    return uiConfigs[id] ?? null;
  },

  getAll(): UIViewConfig[] {
    return Object.values(uiConfigs);
  },
};

