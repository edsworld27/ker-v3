"use client";

// Portal-wide admin settings — GitHub repo + auth (used by D-3 PR promotion),
// database backend (D-4 storage swap), and deployment URLs.
//
// Stored in localStorage on the admin side only. Sensitive fields like the
// PAT are not persisted server-side until we have proper auth; storing them
// in browser localStorage is a development convenience.
//
// Mirrors the conventional pattern in ./sites.ts: KEY + EVENT, read/save/reset
// helpers with deep-merge per top-level section, change subscription that
// listens to both same-tab events and cross-tab `storage` events.

import { logActivity } from "./activity";
import type { PortalSettings, DatabaseBackend } from "@/portal/server/types";

const KEY = "lk_portal_settings_v1";
const EVENT = "lk-portal-settings-change";

// Patch type: each top-level section may be supplied partially. So a caller
// can send { github: { repoUrl: "…" } } and keep defaultBranch untouched.
export type PortalSettingsPatch = {
  [K in keyof PortalSettings]?: Partial<PortalSettings[K]>;
};

export const DEFAULT_SETTINGS: PortalSettings = {
  github: { repoUrl: "", defaultBranch: "main" },
  database: { backend: "file" },
  deployment: {},
};

function read(): PortalSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PortalSettings>;
    // Section-level merge so a partial saved blob never erases the
    // defaultBranch / backend defaults.
    return {
      github:     { ...DEFAULT_SETTINGS.github,     ...(parsed.github     ?? {}) },
      database:   { ...DEFAULT_SETTINGS.database,   ...(parsed.database   ?? {}) },
      deployment: { ...DEFAULT_SETTINGS.deployment, ...(parsed.deployment ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(s: PortalSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVENT));
}

export function getSettings(): PortalSettings {
  return read();
}

// Shallow merge per top-level section so callers can patch a single field
// without having to re-supply siblings:
//   saveSettings({ github: { repoUrl: "…" } })   ← keeps defaultBranch
export function saveSettings(patch: PortalSettingsPatch): PortalSettings {
  const prev = read();
  const next: PortalSettings = {
    github:     { ...prev.github,     ...(patch.github     ?? {}) },
    database: {
      ...prev.database,
      ...(patch.database ?? {}),
      // `backend` is required on PortalSettings.database. The spread above
      // never deletes keys, but TS narrows the merged type as Partial<…>
      // unless we explicitly carry the required field.
      backend: patch.database?.backend ?? prev.database.backend,
    },
    deployment: { ...prev.deployment, ...(patch.deployment ?? {}) },
  };
  write(next);
  // Log the section(s) that changed — gives a usable audit trail without
  // leaking the actual values (which may be tokens / connection strings).
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
  return next;
}

export function resetSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
  logActivity({
    category: "settings",
    action: "Reset portal settings to defaults",
    resourceLink: "/admin/portal-settings",
  });
}

export function onSettingsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// Re-exported for convenience so callers don't have to dual-import from
// types.ts and this module.
export type { PortalSettings, DatabaseBackend };
