import { autoComponentMap } from './HostautoComponentMap';
import { HostRegistration } from '@HostShell/bridge/HostRegistration';

/**
 * SmartRegistry (Dynamic Bridge Proxy)
 * 
 * Uses a Proxy to intercept component requests and auto-resolve them
 * using the Bridge Registry first (plugged-in templates), 
 * then falling back to the baseline HostApp Shell components.
 */
export const SmartRegistry = new Proxy(autoComponentMap, {
  get(target, prop: string | symbol) {
    // Ignore internal React properties and symbols
    if (
      typeof prop === 'symbol' || 
      prop.startsWith('__') || 
      ['$$typeof', 'displayName', 'propTypes', 'defaultProps', 'then', 'toJSON'].includes(prop as string)
    ) {
      return (target as any)[prop];
    }
    
    // 1. Bridge Registry (Highest Priority - Templates)
    const bridgeComponent = HostRegistration.resolve(prop);
    if (bridgeComponent) return bridgeComponent;

    // 2. Exact Match (Baseline Shell Components)
    if (prop in target) return target[prop];

    // 3. Fallback normalization (Kebab-case to PascalCase etc)
    const normalize = (p: string) => p.toLowerCase().replace(/-widget$/, '').replace(/-view$/, '');
    const normalizedProp = normalize(prop);

    // Search Bridge again with normalized key
    const bridgeFallback = HostRegistration.resolve(normalizedProp);
    if (bridgeFallback) return bridgeFallback;

    // Search baseline target with normalized keys
    const foundKey = Object.keys(target).find(k => normalize(k) === normalizedProp);
    if (foundKey) return target[foundKey];

    // 4. Silent fallback — log once, render nothing.
    // Showing a red "Component Not Found" banner in production is louder than
    // necessary; a silent null lets first-party shell hooks (DesignModeInspector
    // etc.) and conditionally-rendered widgets coexist with optional plugins.
    // The console warning still surfaces the missing key for diagnosis.
    if (typeof window !== 'undefined' && !(window as any).__SMART_REGISTRY_WARNED__?.[prop]) {
      console.warn(`[SmartRegistry] Missing Component: ${prop}`);
      ((window as any).__SMART_REGISTRY_WARNED__ ||= {})[prop] = true;
    }
    return () => null;
  }
});
