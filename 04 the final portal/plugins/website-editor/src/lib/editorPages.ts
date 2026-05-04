// Client-side wrapper around the website-editor API. Operators in admin
// pages call these to load/save pages. Adapted from
// `02/src/lib/admin/editorPages.ts`.

import type { CreatePageInput, EditorPage, UpdatePagePatch } from "../types/editorPage";
import type { PortalRole } from "./portalRole";

const BASE = "/api/portal/website-editor";

async function call<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<T> {
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

export async function listPages(siteId: string): Promise<EditorPage[]> {
  const r = await call<{ pages: EditorPage[] }>("GET", "/pages", undefined, { siteId });
  return r.pages;
}

export async function getPage(siteId: string, pageId: string): Promise<EditorPage> {
  const r = await call<{ page: EditorPage }>("GET", "/pages/get", undefined, { siteId, pageId });
  return r.page;
}

export async function createPage(input: CreatePageInput): Promise<EditorPage> {
  const r = await call<{ page: EditorPage }>("POST", "/pages", input);
  return r.page;
}

export async function updatePage(siteId: string, pageId: string, patch: UpdatePagePatch): Promise<EditorPage> {
  const r = await call<{ page: EditorPage }>("PATCH", "/pages", { siteId, pageId, patch });
  return r.page;
}

export async function publishPage(siteId: string, pageId: string): Promise<EditorPage> {
  const r = await call<{ page: EditorPage }>("POST", "/pages/publish", { siteId, pageId });
  return r.page;
}

export async function revertPage(siteId: string, pageId: string): Promise<EditorPage> {
  const r = await call<{ page: EditorPage }>("POST", "/pages/revert", { siteId, pageId });
  return r.page;
}

export async function deletePage(siteId: string, pageId: string): Promise<boolean> {
  const r = await call<{ deleted: boolean }>("DELETE", "/pages", { siteId, pageId });
  return r.deleted;
}

export async function listPortalVariants(siteId: string, role: PortalRole): Promise<EditorPage[]> {
  const r = await call<{ variants: EditorPage[] }>("GET", "/portal-variants", undefined, { siteId, role });
  return r.variants;
}

export async function setActivePortalVariant(
  siteId: string,
  role: PortalRole,
  pageId: string | null,
): Promise<boolean> {
  await call<{ ok: true }>("POST", "/portal-variants/active", { siteId, role, pageId });
  return true;
}
