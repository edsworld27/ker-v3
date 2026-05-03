/**
 * Bridge Component Registry
 *
 * The shared memory space where Templates register their UI components
 * so the App Shell can resolve and render them.
 *
 * Moved to @aqua/bridge so it's truly product-agnostic.
 * Both Operations and AQUA Client import from here.
 */

import type { ComponentType } from 'react';
import type { SuiteTemplate } from '../types';

// Singleton maps — survive HMR in dev via window globals
if (typeof window !== 'undefined') {
  (window as any).__BRIDGE_COMPONENTS__ = (window as any).__BRIDGE_COMPONENTS__ || {};
  (window as any).__BRIDGE_SUITES__     = (window as any).__BRIDGE_SUITES__     || {};
  (window as any).__BRIDGE_PROVIDERS__  = (window as any).__BRIDGE_PROVIDERS__  || {};
}

const getComponentMap = (): Record<string, ComponentType<any>> =>
  typeof window !== 'undefined' ? (window as any).__BRIDGE_COMPONENTS__ : {};
const getSuiteMap = (): Record<string, SuiteTemplate> =>
  typeof window !== 'undefined' ? (window as any).__BRIDGE_SUITES__ : {};
const getProviderMap = (): Record<string, ComponentType<{ children: React.ReactNode }>> =>
  typeof window !== 'undefined' ? (window as any).__BRIDGE_PROVIDERS__ : {};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export const BridgeRegistry = {
  // ── Subscriptions ─────────────────────────────────────────────────────────

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // ── Component Registration ─────────────────────────────────────────────────

  register(id: string, component: ComponentType<any> | any) {
    const map = getComponentMap();
    map[id] = component;
    // Auto-register hyphenated alias for PascalCase ids
    const hyphenated = id.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
    if (hyphenated !== id) map[hyphenated] = component;
    notify();
  },

  registerAll(components: Record<string, ComponentType<any> | any>) {
    const map = getComponentMap();
    Object.entries(components).forEach(([id, component]) => {
      map[id] = component;
    });
    notify();
  },

  resolve(id: string): ComponentType<any> | null {
    return getComponentMap()[id] ?? null;
  },

  getRegisteredIds(): string[] {
    return Object.keys(getComponentMap());
  },

  // ── Suite Registration ─────────────────────────────────────────────────────

  registerSuite(metadata: SuiteTemplate | any) {
    getSuiteMap()[metadata.id] = metadata;
    notify();
  },

  getSuites(): SuiteTemplate[] {
    return Object.values(getSuiteMap());
  },

  getSuite(id: string): SuiteTemplate | null {
    return getSuiteMap()[id] ?? null;
  },

  // ── Provider Registration ─────────────────────────────────────────────────

  registerProvider(suiteId: string, provider: ComponentType<{ children: React.ReactNode }>) {
    getProviderMap()[suiteId] = provider;
    notify();
  },

  resolveProvider(suiteId: string): ComponentType<{ children: React.ReactNode }> | null {
    return getProviderMap()[suiteId] ?? null;
  },
};
