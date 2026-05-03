import React from 'react';
import { autoComponentMap } from './FinanceautoComponentMap';
import { FinanceRegistration } from '@FinanceShell/bridge/FinanceRegistration';

/**
 * SmartRegistry (Dynamic Bridge Proxy)
 * Uses Bridge Registry first, falls back to baseline shell components.
 */
export const SmartRegistry = new Proxy(autoComponentMap, {
  get(target, prop: string | symbol) {
    if (
      typeof prop === 'symbol' ||
      prop.startsWith('__') ||
      ['$$typeof', 'displayName', 'propTypes', 'defaultProps', 'then', 'toJSON'].includes(prop as string)
    ) {
      return (target as any)[prop];
    }

    const bridgeComponent = FinanceRegistration.resolve(prop);
    if (bridgeComponent) return bridgeComponent;
    if (prop in target) return target[prop];

    const normalize = (p: string) => p.toLowerCase().replace(/-widget$/, '').replace(/-view$/, '');
    const normalizedProp = normalize(prop);
    const bridgeFallback = FinanceRegistration.resolve(normalizedProp);
    if (bridgeFallback) return bridgeFallback;
    const foundKey = Object.keys(target).find(k => normalize(k) === normalizedProp);
    if (foundKey) return target[foundKey];

    console.warn(`[FinanceSmartRegistry] Missing Component: ${String(prop)}`);
    return (props: any) => (
      <div className="p-4 border border-dashed border-red-500/50 bg-red-500/10 rounded-md text-red-500 flex flex-col items-center justify-center min-h-[100px] w-full text-center">
        <code className="text-[10px] font-mono">Finance: {String(prop)}</code>
      </div>
    );
  }
});
