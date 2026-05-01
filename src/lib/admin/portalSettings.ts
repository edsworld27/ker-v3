"use client";

// Cloud-architected portal settings client. State lives server-side in
// the portal storage backend (file/memory/kv); this module is a thin
// async fetch+save wrapper that the admin UI uses. No localStorage.
//
// Secrets are NEVER returned to the client by GET — the server replaces
// them with a sentinel ("__portal_secret_set__") so the UI can show
// "saved" without ever reading the value back. POSTing the sentinel
// back is treated as "leave unchanged" so partial saves don't blank out
// previously-stored secrets.

import { logActivity } from "./activity";
import type { PortalSettings, PortalSettingsPatch, DatabaseBackend } from "@/portal/server/types";

export const SECRET_PLACEHOLDER = "__portal_secret_set__";

export const DEFAULT_SETTINGS: PortalSettings = {
  github: { repoUrl: "", defaultBranch: "main" },
  database: { backend: "file" },
  deployment: {},
};

// In-memory cache so the admin UI doesn't refetch on every render. A small
// pub/sub keeps separate components in sync.
let cache: PortalSettings | null = null;
let pending: Promise<PortalSettings> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) {
    try { fn(); } catch { /* listener error is its own problem */ }
  }
}

async function fetchOnce(): Promise<PortalSettings> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    try {
      const res = await fetch("/api/portal/settings", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json() as { settings: PortalSettings };
      cache = data.settings;
      return cache;
    } catch {
      // Server unreachable — surface defaults so the admin UI can render.
      // The next save attempt will surface the real error.
      cache = DEFAULT_SETTINGS;
      return cache;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/**
 * Asynchronously load the current settings from the cloud store.
 * Resolves to the cached copy after the first call within a session.
 */
export async function loadSettings(): Promise<PortalSettings> {
  return fetchOnce();
}

/**
 * Synchronous read — returns defaults until loadSettings() resolves.
 * Use only when you've already awaited loadSettings() (or when defaults
 * are an acceptable fallback render).
 */
export function getSettings(): PortalSettings {
  return cache ?? DEFAULT_SETTINGS;
}

/**
 * Save a partial patch to the server. The sentinel placeholder is
 * stripped server-side so calling saveSettings({ github: {} }) is a
 * no-op rather than a secret-clearing footgun.
 */
export async function saveSettings(patch: PortalSettingsPatch): Promise<PortalSettings> {
  const res = await fetch("/api/portal/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`save failed: ${res.status} ${txt}`);
  }
  const data = await res.json() as { settings: PortalSettings };
  cache = data.settings;
  notify();
  const sections = Object.keys(patch).filter(k =>
    k === "github" || k === "database" || k === "deployment"
  );
  if (sections.length > 0) {
    logActivity({
      category: "settings",
      action: `Updated portal settings: ${sections.join(", ")}`,
      resourceLink: "/admin/portal-settings",
    });
  }
  return cache;
}

export async function resetSettings(): Promise<PortalSettings> {
  const res = await fetch("/api/portal/settings", { method: "DELETE" });
  if (!res.ok) throw new Error(`reset failed: ${res.status}`);
  const data = await res.json() as { settings: PortalSettings };
  cache = data.settings;
  notify();
  logActivity({
    category: "settings",
    action: "Reset portal settings to defaults",
    resourceLink: "/admin/portal-settings",
  });
  return cache;
}

export function onSettingsChange(handler: () => void): () => void {
  listeners.add(handler);
  return () => { listeners.delete(handler); };
}

async function safeText(res: Response): Promise<string> {
  try { return (await res.text()).slice(0, 200); }
  catch { return ""; }
}

// True when the server has a value for this field (the GET projection
// returns SECRET_PLACEHOLDER for set secrets, "" for unset).
export function hasSecret(value: string | undefined): boolean {
  return value === SECRET_PLACEHOLDER;
}

export type { PortalSettings, PortalSettingsPatch, DatabaseBackend };
