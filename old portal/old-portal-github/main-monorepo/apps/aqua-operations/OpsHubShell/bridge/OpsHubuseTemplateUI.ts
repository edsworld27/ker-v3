import { useAppContext } from './OpsHubAppContext';
import { BridgeUIRegistry } from './OpsHubuiRegistration';

/**
 * useTemplateUI
 * 
 * A hook for template views to get their current UI configuration.
 * It automatically merges the template's hardcoded defaults with
 * any overrides saved in the Bridge (agencyConfig).
 */
export function useTemplateUI(viewId: string) {
  const { agencyConfig } = useAppContext();
  
  // 1. Resolve the hardcoded config from the Bridge Registry
  const config = BridgeUIRegistry.resolve(viewId);
  
  // 2. Extract overrides for this specific view from the global config
  const overrides = agencyConfig?.identity?.templateUIOverrides?.[viewId] || {};

  // 3. Build the final UI object (Defaults -> Overrides)
  const ui: Record<string, any> = {};
  
  if (config) {
    config.variables.forEach(v => {
      ui[variableIdToKey(v.id)] = overrides[v.id] ?? v.default;
    });
  }

  return ui;
}

/**
 * Helper to convert variable IDs (kebab-case) to camelCase keys
 * e.g. 'primary-color' -> 'primaryColor'
 */
function variableIdToKey(id: string): string {
  return id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
