"use client";

// React adapter for the D-1 manifest pattern.
//
//   <PortalProvider siteId="…" portal="https://portal.example" schema={portal}>
//     <App />
//   </PortalProvider>
//
//   const { hero } = usePortalContent(portal);
//   <h1>{hero.headline}</h1>
//
// The hook works both inside a provider (returns context, no extra fetch)
// and standalone (does its own fetch on mount). When standalone, it
// returns the schema defaults synchronously and re-renders when the
// network request resolves so SSR / first paint never block.

import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import {
  loadPortalContent,
  type ManifestSchema, type ResolvedPortal,
} from ".";

interface ProviderState<T extends ManifestSchema> {
  siteId: string;
  portal: string;
  schema: T;
  resolved: ResolvedPortal<T>;
}

// We can't parameterise React contexts, so we type-erase via unknown here
// and reapply the parameter in usePortalContent below. The schema identity
// is the bridge: callers pass the same `schema` reference to provider
// and hook, so the runtime values match the compile-time type.
const PortalContext = createContext<ProviderState<ManifestSchema> | null>(null);

export interface PortalProviderProps<T extends ManifestSchema> {
  siteId: string;
  portal: string;
  schema: T;
  children: ReactNode;
}

export function PortalProvider<T extends ManifestSchema>({
  siteId, portal, schema, children,
}: PortalProviderProps<T>) {
  const [resolved, setResolved] = useState<ResolvedPortal<T>>(() => buildDefaultsLocal(schema));

  useEffect(() => {
    const ctrl = new AbortController();
    loadPortalContent({ siteId, portal, schema, signal: ctrl.signal })
      .then(next => setResolved(next))
      .catch(() => { /* keep defaults */ });
    return () => ctrl.abort();
  }, [siteId, portal, schema]);

  const value = useMemo<ProviderState<ManifestSchema>>(
    () => ({ siteId, portal, schema, resolved: resolved as ResolvedPortal<ManifestSchema> }),
    [siteId, portal, schema, resolved],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortalContent<T extends ManifestSchema>(schema: T): ResolvedPortal<T> {
  const ctx = useContext(PortalContext);
  // Standalone fallback: if no provider is mounted we fetch on demand.
  // Defaults are returned synchronously so the first render is never blank.
  const [standalone, setStandalone] = useState<ResolvedPortal<T>>(() => buildDefaultsLocal(schema));

  useEffect(() => {
    if (ctx) return;        // provider drives state — nothing to do
    if (typeof window === "undefined") return;
    const portalOrigin = window.location.origin;
    // Without explicit siteId we can't fetch; the standalone path is for
    // when usePortalContent is used outside a PortalProvider during dev
    // / testing — in that case it just returns schema defaults.
    void loadPortalContent({
      siteId: "default",
      portal: portalOrigin,
      schema,
    })
      .then(next => setStandalone(next))
      .catch(() => { /* keep defaults */ });
  }, [ctx, schema]);

  if (ctx) return ctx.resolved as ResolvedPortal<T>;
  return standalone;
}

// Mirror of the private helper in ./index. Re-implemented locally to keep
// the React adapter from leaking on the SSR-safe boundary (no top-level
// fetch / cache state). Schema is small so the duplication is cheap.
function buildDefaultsLocal<T extends ManifestSchema>(schema: T): ResolvedPortal<T> {
  const out = {} as Record<string, Record<string, string>>;
  for (const [section, fields] of Object.entries(schema)) {
    out[section] = {};
    for (const [key, field] of Object.entries(fields)) {
      out[section][key] = field.default;
    }
  }
  return out as ResolvedPortal<T>;
}
