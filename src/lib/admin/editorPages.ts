"use client";

// Admin-side client for the visual editor's page store. Talks to
// /api/portal/pages/[siteId][/...]. Wraps fetch + a per-site cache so the
// canvas can iterate fast without re-roundtripping on every keystroke.

import type { Block, EditorPage, PortalRole } from "@/portal/server/types";

interface ListPayload { ok: boolean; pages: EditorPage[]; }
interface PagePayload { ok: boolean; page: EditorPage; }

const cache: Record<string, EditorPage[]> = {};
const CHANGE_EVENT = "lk-editor-pages-change";

function bust(siteId: string) {
  delete cache[siteId];
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { siteId } }));
}

export async function listPages(siteId: string, force = false): Promise<EditorPage[]> {
  if (!force && cache[siteId]) return cache[siteId];
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}`, { cache: "no-store" });
  const data = await res.json() as ListPayload;
  cache[siteId] = data.pages ?? [];
  return cache[siteId];
}

export async function getPage(siteId: string, pageId: string): Promise<EditorPage | null> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}/${encodeURIComponent(pageId)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json() as PagePayload;
  return data.page;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  description?: string;
  blocks?: Block[];
  portalRole?: PortalRole;
}

export async function createPage(siteId: string, input: CreatePageInput): Promise<EditorPage | null> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json() as PagePayload;
  bust(siteId);
  return data.page;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  description?: string;
  blocks?: Block[];
  themeId?: string;
  customHead?: string;
  customFoot?: string;
  seo?: EditorPage["seo"];
  layoutOverrides?: EditorPage["layoutOverrides"];
  portalRole?: PortalRole;
}

export async function updatePage(siteId: string, pageId: string, patch: UpdatePageInput): Promise<EditorPage | null> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}/${encodeURIComponent(pageId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json() as PagePayload;
  bust(siteId);
  return data.page;
}

export async function deletePage(siteId: string, pageId: string): Promise<boolean> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}/${encodeURIComponent(pageId)}`, { method: "DELETE" });
  if (res.ok) bust(siteId);
  return res.ok;
}

export async function publishPage(siteId: string, pageId: string): Promise<EditorPage | null> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}/${encodeURIComponent(pageId)}/publish`, { method: "POST" });
  if (!res.ok) return null;
  const data = await res.json() as PagePayload;
  bust(siteId);
  return data.page;
}

export async function revertPage(siteId: string, pageId: string): Promise<EditorPage | null> {
  const res = await fetch(`/api/portal/pages/${encodeURIComponent(siteId)}/${encodeURIComponent(pageId)}/revert`, { method: "POST" });
  if (!res.ok) return null;
  const data = await res.json() as PagePayload;
  bust(siteId);
  return data.page;
}

export function onPagesChange(cb: (siteId: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { siteId?: string } | undefined;
    if (detail?.siteId) cb(detail.siteId);
  };
  window.addEventListener(CHANGE_EVENT, handler as EventListener);
  return () => window.removeEventListener(CHANGE_EVENT, handler as EventListener);
}

// ─── Portal variants ──────────────────────────────────────────────────────

export async function listPortalVariants(siteId: string, role: PortalRole): Promise<EditorPage[]> {
  const res = await fetch(
    `/api/portal/pages/${encodeURIComponent(siteId)}/portal-variants?role=${encodeURIComponent(role)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json() as { ok: boolean; variants?: EditorPage[] };
  return data.variants ?? [];
}

export async function setActivePortalVariant(
  siteId: string,
  role: PortalRole,
  pageId: string | null,
): Promise<EditorPage[]> {
  const res = await fetch(
    `/api/portal/pages/${encodeURIComponent(siteId)}/portal-variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, pageId }),
    },
  );
  bust(siteId);
  if (!res.ok) return [];
  const data = await res.json() as { ok: boolean; variants?: EditorPage[] };
  return data.variants ?? [];
}
