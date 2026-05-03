import React from 'react';
import { autoComponentMap } from './PeopleautoComponentMap';
import { PeopleRegistration } from '@PeopleShell/bridge/PeopleRegistration';

/**
 * SmartRegistry (Dynamic Bridge Proxy)
 * 
 * Uses a Proxy to intercept component requests and auto-resolve them
 * using the Bridge Registry first (plugged-in templates), 
 * then falling back to the baseline App Shell components.
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
    const bridgeComponent = PeopleRegistration.resolve(prop);
    if (bridgeComponent) return bridgeComponent;

    // 2. Exact Match (Baseline Shell Components)
    if (prop in target) return target[prop];

    // 3. Fallback normalization (Kebab-case to PascalCase etc)
    const normalize = (p: string) => p.toLowerCase().replace(/-widget$/, '').replace(/-view$/, '');
    const normalizedProp = normalize(prop);

    // Search Bridge again with normalized key
    const bridgeFallback = PeopleRegistration.resolve(normalizedProp);
    if (bridgeFallback) return bridgeFallback;

    // Search baseline target with normalized keys
    const foundKey = Object.keys(target).find(k => normalize(k) === normalizedProp);
    if (foundKey) return target[foundKey];

    // 4. Graceful Missing Component UI
    console.warn(`[SmartRegistry] Missing Component: ${prop}`);
    return (props: any) => (
      <div className="p-4 border border-dashed border-red-500/50 bg-red-500/10 rounded-md text-red-500 flex flex-col items-center justify-center min-h-[100px] w-full text-center">
        <span className="font-bold text-xs uppercase tracking-wide opacity-50 mb-2 italic">Component Not Found</span>
        <code className="text-[10px] font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-red-500/20 shadow-lg text-white">
          {prop}
        </code>
        <p className="mt-2 text-[10px] opacity-40 max-w-[200px] leading-relaxed">
          The shell is active, but the Bridge has not yet received a registration for this view ID from a template.
        </p>
      </div>
    );
  }
});
