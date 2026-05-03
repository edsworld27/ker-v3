'use client';

/**
 * RegistryViewRenderer — Single-domain plugin-driven renderer.
 *
 * Replaces IFrameViewRenderer for the consolidated portal model. Resolves the
 * target component from the BridgeRegistry, optionally wraps it in a registered
 * provider for that suite, and renders inline. No iframes, no postMessage.
 *
 * Resolution is permissive: tries the literal id, kebab-case variants, and the
 * suite's defaultView so legacy registrations (e.g. discovery-style PascalCase
 * view names) keep resolving even if the sidebar emits a kebab id.
 */

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { BridgeRegistry } from '@aqua/bridge/registry';
import type { ComponentType } from 'react';

interface RegistryViewRendererProps {
  viewId: string;
  suiteId?: string;
  sharedProps?: Record<string, unknown>;
}

const PassthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const NotInstalled: React.FC<{ viewId: string; tried: string[] }> = ({ viewId, tried }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-center">
    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
      <span className="text-base text-slate-500">○</span>
    </div>
    <h3 className="text-base font-semibold text-white mb-1">Suite not installed</h3>
    <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-2">
      No plugin is registered for view ID
    </p>
    <code className="text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
      {viewId}
    </code>
    {tried.length > 1 && (
      <details className="mt-4 text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-300">Tried {tried.length} variants</summary>
        <pre className="mt-2 text-left bg-white/[0.02] px-3 py-2 rounded-md border border-white/5 max-w-md overflow-auto text-slate-400">
          {tried.join('\n')}
        </pre>
      </details>
    )}
    <p className="text-xs text-slate-500 mt-5 max-w-sm">
      Install it from the Marketplace, or check that the suite&apos;s register function ran during bootstrap.
    </p>
  </div>
);

const Loading: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-400">Loading view…</span>
    </div>
  </div>
);

const toKebab = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[A-Z]/g, m => m.toLowerCase()).replace(/^-/, '');

const toPascal = (s: string) =>
  s.split('-').filter(Boolean).map(p => p[0]?.toUpperCase() + p.slice(1)).join('');

/**
 * Try a series of common id transformations against the registry until
 * something resolves. Returns the resolved component + the list of ids
 * that were tried (used by the NotInstalled UI for diagnosability).
 */
function resolveTolerant(viewId: string): { component: ComponentType<any> | null; tried: string[] } {
  const tried: string[] = [];
  const tryId = (id: string): ComponentType<any> | null => {
    if (!id || tried.includes(id)) return null;
    tried.push(id);
    return BridgeRegistry.resolve(id);
  };

  // 1. literal
  let cmp = tryId(viewId);
  if (cmp) return { component: cmp, tried };

  // 2. kebab-case variant
  const kebab = toKebab(viewId);
  cmp = tryId(kebab);
  if (cmp) return { component: cmp, tried };

  // 3. PascalCase variant
  const pascal = toPascal(viewId);
  cmp = tryId(pascal);
  if (cmp) return { component: cmp, tried };

  // 4. PascalCase + 'View' suffix (e.g. 'agency-clients' → 'AgencyClientsView')
  cmp = tryId(`${pascal}View`);
  if (cmp) return { component: cmp, tried };

  // 5. kebab + '-view' suffix
  cmp = tryId(`${kebab}-view`);
  if (cmp) return { component: cmp, tried };

  // 6. Walk every registered suite and find one whose defaultView OR any
  //    subItem.view matches the requested id, then resolve THAT default.
  const suites = BridgeRegistry.getSuites();
  for (const suite of suites) {
    if (suite.id === viewId || suite.defaultView === viewId) {
      if (suite.defaultView && suite.defaultView !== viewId) {
        cmp = tryId(suite.defaultView);
        if (cmp) return { component: cmp, tried };
      }
      const firstSub = suite.subItems?.[0];
      if (firstSub?.view) {
        cmp = tryId(firstSub.view);
        if (cmp) return { component: cmp, tried };
      }
      if ((suite as any).component) {
        return { component: (suite as any).component, tried };
      }
    }
    const subMatch = suite.subItems?.find(s => s.id === viewId || s.view === viewId);
    if (subMatch) {
      if (subMatch.view) {
        cmp = tryId(subMatch.view);
        if (cmp) return { component: cmp, tried };
      }
      if ((subMatch as any).component) {
        return { component: (subMatch as any).component, tried };
      }
    }
  }

  return { component: null, tried };
}

export const RegistryViewRenderer: React.FC<RegistryViewRendererProps> = ({ viewId, suiteId, sharedProps }) => {
  const [, setTick] = useState(0);
  useEffect(() => BridgeRegistry.subscribe(() => setTick(t => t + 1)), []);

  const { component: Component, tried } = useMemo(() => resolveTolerant(viewId), [viewId]);

  const Provider: ComponentType<{ children: React.ReactNode }> =
    (suiteId && BridgeRegistry.resolveProvider(suiteId)) || PassthroughProvider;

  if (!Component) {
    return <NotInstalled viewId={viewId} tried={tried} />;
  }

  return (
    <Provider>
      <Suspense fallback={<Loading />}>
        <Component {...(sharedProps || {})} />
      </Suspense>
    </Provider>
  );
};

export default RegistryViewRenderer;
