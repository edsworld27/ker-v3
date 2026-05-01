"use client";

// Host-side renderer for portal-managed pages (V-D).
//
// Mount this anywhere on the host site to render the block tree the
// admin authored in /admin/sites/[siteId]/editor/[pageId]:
//
//   <PortalPageRenderer slug="/about" />
//
// By default it serves the published snapshot. Add `?preview=1` to the
// URL (and pass `preview` in the `previewMode` prop) to preview drafts.
//
// Performance note: this fetches once per (siteId, slug) and caches the
// result client-side. The data is tiny (a JSON tree); each page render
// is a single HTTP round-trip. No iframe, no second-origin cookies.
//
// The site id is read from the global `__PORTAL_SITE_ID__` injected by
// the SiteResolver bootstrap; falls back to a `siteId` prop.

import { useEffect, useMemo, useState } from "react";
import type { Block } from "@/portal/server/types";
import BlockRenderer from "./editor/BlockRenderer";

declare global {
  interface Window {
    __PORTAL_SITE_ID__?: string;
  }
}

export interface PortalPageRendererProps {
  slug: string;
  siteId?: string;             // override the auto-detected site id
  previewMode?: boolean;       // serve draft instead of published
  fallback?: React.ReactNode;  // shown while loading or on 404
  loading?: React.ReactNode;   // shown only while loading
}

interface PageResponse {
  ok: boolean;
  page?: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    blocks: Block[];
    status: "draft" | "published";
    updatedAt: number;
  };
  error?: string;
}

const cache = new Map<string, PageResponse>();
const inflight = new Map<string, Promise<PageResponse>>();

function cacheKey(siteId: string, slug: string, preview: boolean): string {
  return `${siteId}::${slug}::${preview ? "draft" : "live"}`;
}

async function fetchPage(siteId: string, slug: string, preview: boolean): Promise<PageResponse> {
  const key = cacheKey(siteId, slug, preview);
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;
  const url = `/api/portal/pages/${encodeURIComponent(siteId)}/by-slug?slug=${encodeURIComponent(slug)}${preview ? "&preview=1" : ""}`;
  const promise = fetch(url, { cache: "no-store" })
    .then(r => r.json() as Promise<PageResponse>)
    .then(data => { cache.set(key, data); inflight.delete(key); return data; })
    .catch(err => {
      inflight.delete(key);
      const fail: PageResponse = { ok: false, error: err instanceof Error ? err.message : String(err) };
      cache.set(key, fail);
      return fail;
    });
  inflight.set(key, promise);
  return promise;
}

export default function PortalPageRenderer({ slug, siteId: explicitSiteId, previewMode, fallback, loading }: PortalPageRendererProps) {
  const [data, setData] = useState<PageResponse | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const siteId = useMemo(() => {
    if (explicitSiteId) return explicitSiteId;
    if (typeof window !== "undefined" && window.__PORTAL_SITE_ID__) return window.__PORTAL_SITE_ID__;
    return null;
  }, [explicitSiteId]);

  useEffect(() => {
    setHydrated(true);
    if (!siteId) { setData({ ok: false, error: "no-site-id" }); return; }
    let cancelled = false;
    void fetchPage(siteId, slug, previewMode === true).then(d => {
      if (!cancelled) setData(d);
    });
    return () => { cancelled = true; };
  }, [siteId, slug, previewMode]);

  if (!hydrated) return null;        // SSR-safe: render nothing on the server pass

  if (!data) return <>{loading ?? null}</>;

  if (!data.ok || !data.page) {
    return <>{fallback ?? null}</>;
  }

  return <BlockRenderer blocks={data.page.blocks} />;
}

// Helper for invalidating the in-page cache (e.g. when the admin saves
// in another tab and broadcasts via BroadcastChannel — wired later).
export function invalidatePortalPageCache(siteId?: string, slug?: string) {
  if (!siteId) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${siteId}::`) && (slug === undefined || key.includes(`::${slug}::`))) {
      cache.delete(key);
    }
  }
}
