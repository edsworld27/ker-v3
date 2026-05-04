// Client-side site list/selector. Adapted from
// `02/src/lib/admin/sites.ts`.

import type { Site, CreateSiteInput, UpdateSitePatch } from "../types/site";

const BASE = "/api/portal/website-editor/sites";

async function call<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  const init: RequestInit = {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  };
  const res = await fetch(url.toString(), init);
  const json = (await res.json()) as { ok: boolean; error?: string } & Record<string, unknown>;
  if (!json.ok) throw new Error(json.error ?? "request failed");
  return json as T;
}

export async function listSites(): Promise<Site[]> {
  const r = await call<{ sites: Site[] }>("GET", "");
  return r.sites;
}

export async function getSite(siteId: string): Promise<Site> {
  const r = await call<{ site: Site }>("GET", "/get", undefined, { siteId });
  return r.site;
}

export async function createSite(input: Omit<CreateSiteInput, "agencyId" | "clientId">): Promise<Site> {
  const r = await call<{ site: Site }>("POST", "", input);
  return r.site;
}

export async function updateSite(siteId: string, patch: UpdateSitePatch): Promise<Site> {
  const r = await call<{ site: Site }>("PATCH", "", { siteId, patch });
  return r.site;
}

export async function deleteSite(siteId: string): Promise<boolean> {
  const r = await call<{ deleted: boolean }>("DELETE", "", { siteId });
  return r.deleted;
}
