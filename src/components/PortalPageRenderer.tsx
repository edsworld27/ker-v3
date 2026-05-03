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
import type { Block, ThemeRecord, SplitTestGroup } from "@/portal/server/types";
import BlockRenderer from "./editor/BlockRenderer";
import { tokensToCssVarsClient } from "./editor/themeCss";

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
    customHead?: string;
    customFoot?: string;
    customCss?: string;
    themeId?: string;
    layoutOverrides?: {
      hideNav?: boolean;
      hideFooter?: boolean;
      nav?: Block[];
      footer?: Block[];
    };
    seo?: {
      title?: string;
      metaDescription?: string;
      keywords?: string[];
      canonical?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      ogType?: "website" | "article" | "product";
      twitterCard?: "summary" | "summary_large_image";
      noindex?: boolean;
      nofollow?: boolean;
      jsonLd?: string;
    };
  };
  theme?: ThemeRecord;
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
  const [splitTestGroups, setSplitTestGroups] = useState<SplitTestGroup[]>([]);
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
    // Pull running split-test groups for this site (best-effort; never
    // blocks the page render).
    void fetch(`/api/portal/split-tests?siteId=${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok) setSplitTestGroups(j.groups ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [siteId, slug, previewMode]);

  if (!hydrated) return null;        // SSR-safe: render nothing on the server pass

  if (!data) return <>{loading ?? null}</>;

  if (!data.ok || !data.page) {
    return <>{fallback ?? null}</>;
  }

  const customHead = data.page.customHead;
  const customFoot = data.page.customFoot;
  const seo = data.page.seo;

  // Apply page SEO via document.title + meta tags. Effective for client-
  // navigated SPAs; SSR builds should embed the same data via the
  // promote-to-git portal.pages.json instead.
  if (typeof document !== "undefined" && seo) {
    const title = seo.title ?? data.page.title;
    if (title) document.title = title;
    setMeta("description", seo.metaDescription ?? data.page.description);
    setMeta("og:title", seo.ogTitle ?? title, true);
    setMeta("og:description", seo.ogDescription ?? seo.metaDescription, true);
    setMeta("og:image", seo.ogImage, true);
    setMeta("og:type", seo.ogType, true);
    setMeta("twitter:card", seo.twitterCard);
    if (seo.canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
      link.setAttribute("href", seo.canonical);
    }
    const robotsParts: string[] = [];
    if (seo.noindex) robotsParts.push("noindex");
    if (seo.nofollow) robotsParts.push("nofollow");
    if (robotsParts.length) setMeta("robots", robotsParts.join(","));
  }

  // Theme CSS variables — scoped to the rendered subtree so different
  // pages on the same SPA can use different themes without colliding.
  const themeId = data.page.themeId ?? data.theme?.id ?? "default";
  const themeVars = tokensToCssVarsClient(data.theme?.tokens);
  const scopeId = `portal-page-${data.page.id}`;
  const themeCss = themeVars ? `[data-portal-page="${scopeId}"] { ${themeVars} }` : "";

  // Pro-mode page-level CSS — scoped to the same data-portal-page
  // attribute so the rules can't leak past this page. Authors who
  // want to escape the scope can use `:root` selectors at their own
  // risk, but the default surface is sandboxed.
  const pageCss = data.page.customCss
    ? `[data-portal-page="${scopeId}"] { ${data.page.customCss} }`
    : "";

  return (
    <>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      {pageCss && <style dangerouslySetInnerHTML={{ __html: pageCss }} />}
      {seo?.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.jsonLd }} />
      )}
      {customHead && <span dangerouslySetInnerHTML={{ __html: customHead }} />}
      <div data-portal-page={scopeId} data-theme-id={themeId} data-theme-appearance={data.theme?.appearance ?? "auto"}>
        {data.page.layoutOverrides?.nav && !data.page.layoutOverrides.hideNav && (
          <BlockRenderer blocks={data.page.layoutOverrides.nav} themeId={themeId} />
        )}
        <BlockRenderer blocks={data.page.blocks} themeId={themeId} splitTestGroups={splitTestGroups} />
        {data.page.layoutOverrides?.footer && !data.page.layoutOverrides.hideFooter && (
          <BlockRenderer blocks={data.page.layoutOverrides.footer} themeId={themeId} />
        )}
      </div>
      {customFoot && <span dangerouslySetInnerHTML={{ __html: customFoot }} />}
    </>
  );
}

function setMeta(name: string, content: string | undefined, isProperty = false) {
  if (typeof document === "undefined" || !content) return;
  const attr = isProperty ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
  tag.setAttribute("content", content);
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
