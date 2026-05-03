"use client";

import type { ThemeRecord, ThemeTokens } from "@/portal/server/types";

interface ListResponse { ok: boolean; themes: ThemeRecord[] }
interface OneResponse { ok: boolean; theme?: ThemeRecord; error?: string }

const cache: Record<string, ThemeRecord[]> = {};
const EVENT = "lk-themes-change";

function bust(siteId: string) {
  delete cache[siteId];
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: { siteId } }));
}

export async function loadThemes(siteId: string, force = false): Promise<ThemeRecord[]> {
  if (!force && cache[siteId]) return cache[siteId];
  const res = await fetch(`/api/portal/themes/${encodeURIComponent(siteId)}`, { cache: "no-store" });
  const data = await res.json() as ListResponse;
  cache[siteId] = data.themes ?? [];
  return cache[siteId];
}

export function listCachedThemes(siteId: string): ThemeRecord[] {
  return cache[siteId] ?? [];
}

export async function createTheme(siteId: string, input: { name: string; appearance?: "light" | "dark" | "auto"; tokens?: ThemeTokens }): Promise<ThemeRecord | null> {
  const res = await fetch(`/api/portal/themes/${encodeURIComponent(siteId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json() as OneResponse;
  bust(siteId);
  return data.theme ?? null;
}

export async function updateTheme(siteId: string, themeId: string, patch: { name?: string; appearance?: "light" | "dark" | "auto"; tokens?: ThemeTokens; setAsDefault?: boolean }): Promise<ThemeRecord | null> {
  const res = await fetch(`/api/portal/themes/${encodeURIComponent(siteId)}/${encodeURIComponent(themeId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json() as OneResponse;
  bust(siteId);
  return data.theme ?? null;
}

export async function deleteTheme(siteId: string, themeId: string): Promise<boolean> {
  const res = await fetch(`/api/portal/themes/${encodeURIComponent(siteId)}/${encodeURIComponent(themeId)}`, { method: "DELETE" });
  if (res.ok) bust(siteId);
  return res.ok;
}

export function onThemesChange(cb: (siteId: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { siteId?: string } | undefined;
    if (detail?.siteId) cb(detail.siteId);
  };
  window.addEventListener(EVENT, handler as EventListener);
  return () => window.removeEventListener(EVENT, handler as EventListener);
}
