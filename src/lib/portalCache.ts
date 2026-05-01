"use client";

// Tiny client-side cache that fetches the portal's published overrides
// for the active site once on hydration and exposes them as a sync
// key→value lookup. useContent layers this on top of the legacy
// localStorage CMS so dual-run is transparent to existing call sites.
//
// We only fetch ONCE per page load (the cache is shared) and respect
// the loader's preview-token convention — if the page URL carries
// ?portal_preview=draft&pt=… the same params are forwarded so previewing
// a draft also works for components rendered via useContent.

const CHANGE_EVENT = "lk-portal-cache-change";

let cache: Record<string, { value: string; type: string }> | null = null;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) {
    try { fn(); } catch {}
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

function previewParam(): string {
  if (typeof window === "undefined") return "";
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("portal_preview") === "draft" && p.get("pt")) {
      return `?preview=draft&pt=${encodeURIComponent(p.get("pt") ?? "")}`;
    }
  } catch {}
  return "";
}

// Resolve the active site id. We default to "luvandker" (the primary
// site id from src/lib/admin/sites.ts DEFAULT_PRIMARY_SITE) — the
// SiteResolver component handles host-based routing for live deploys
// but the portal tag uses a stable id baked into the script attribute.
function activeSiteId(): string {
  if (typeof window !== "undefined") {
    const tag = document.querySelector<HTMLScriptElement>("script[data-portal-site]");
    if (tag) return tag.getAttribute("data-portal-site") ?? "luvandker";
  }
  return "luvandker";
}

export async function loadPortalCache(): Promise<void> {
  if (cache) return;
  if (pending) return pending;
  pending = (async () => {
    try {
      const url = `/api/portal/content/${encodeURIComponent(activeSiteId())}${previewParam()}`;
      const res = await fetch(url, { cache: "no-store", credentials: "omit" });
      if (!res.ok) { cache = {}; return; }
      const data = await res.json();
      cache = (data && typeof data === "object" ? data : {}) as Record<string, { value: string; type: string }>;
    } catch {
      cache = {};
    } finally {
      pending = null;
      notify();
    }
  })();
  return pending;
}

// Sync read used by useContent. Returns undefined when the cache hasn't
// hydrated yet (or the key isn't overridden) so the caller falls through
// to the next tier (legacy CMS, then fallback string).
export function getPortalValue(key: string): string | undefined {
  if (!cache) return undefined;
  const hit = cache[key];
  return hit && typeof hit.value === "string" ? hit.value : undefined;
}

export function onPortalCacheChange(handler: () => void): () => void {
  listeners.add(handler);
  if (typeof window !== "undefined") window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    listeners.delete(handler);
    if (typeof window !== "undefined") window.removeEventListener(CHANGE_EVENT, handler);
  };
}

// Force a re-fetch — used when the admin pushes a publish event from
// another tab. Cache is cleared and the next loadPortalCache resolves
// against fresh data.
export function invalidatePortalCache(): void {
  cache = null;
  pending = null;
  notify();
}
