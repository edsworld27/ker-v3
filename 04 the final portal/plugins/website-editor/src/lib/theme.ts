// Client-side theme editor. Adapted from `02/src/lib/admin/theme.ts`.

import type { CreateThemeInput, ThemeRecord, UpdateThemePatch } from "../types/theme";

const BASE = "/api/portal/website-editor/themes";

async function call<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const json = (await res.json()) as { ok: boolean; error?: string } & Record<string, unknown>;
  if (!json.ok) throw new Error(json.error ?? "request failed");
  return json as T;
}

export async function listThemes(siteId: string): Promise<ThemeRecord[]> {
  return (await call<{ themes: ThemeRecord[] }>("GET", "", undefined, { siteId })).themes;
}

export async function getTheme(siteId: string, themeId: string): Promise<ThemeRecord> {
  return (await call<{ theme: ThemeRecord }>("GET", "/get", undefined, { siteId, themeId })).theme;
}

export async function createTheme(input: Omit<CreateThemeInput, "agencyId" | "clientId">): Promise<ThemeRecord> {
  return (await call<{ theme: ThemeRecord }>("POST", "", input)).theme;
}

export async function updateTheme(siteId: string, themeId: string, patch: UpdateThemePatch): Promise<ThemeRecord> {
  return (await call<{ theme: ThemeRecord }>("PATCH", "", { siteId, themeId, patch })).theme;
}

export async function setDefaultTheme(siteId: string, themeId: string): Promise<void> {
  await call("POST", "/default", { siteId, themeId });
}

export async function deleteTheme(siteId: string, themeId: string): Promise<void> {
  await call("DELETE", "", { siteId, themeId });
}
