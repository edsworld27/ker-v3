"use client";

// Admin client for organisations (G-2). The server (/api/portal/orgs)
// owns the canonical list; this module is a fetch + cache + active-org
// helper. The active-org id is per-admin localStorage so each operator
// can be working with a different tenant in the same browser.

import { logActivity } from "./activity";
import type { OrgRecord, OrgStatus } from "@/portal/server/types";

export type { OrgRecord, OrgStatus };

const ACTIVE_KEY = "lk_active_org_v1";
const ORGS_CACHE_KEY = "lk_orgs_v1";
const EVENT = "lk-orgs-change";
const REFRESH_MS = 60_000;

let cache: OrgRecord[] | null = null;
let pending: Promise<OrgRecord[]> | null = null;
let lastFetched = 0;

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

// Mirror the in-memory cache to localStorage so admin chrome modules
// (e.g. adminConfig.readBrandPluginBranding) can read the active org's
// plugin config synchronously without needing to import this client.
// Best-effort — quota-exceeded or private-mode failures are swallowed.
function persistCache(orgs: OrgRecord[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(ORGS_CACHE_KEY, JSON.stringify(orgs)); }
  catch { /* ignore */ }
}

// Hydrate the in-memory cache from localStorage on first import so
// callers like getBranding() return the right tenant chrome on page
// load — before loadOrgs() finishes its network round-trip.
function hydrateFromCache(): OrgRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ORGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrgRecord[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch { return null; }
}

if (cache === null) {
  const fromDisk = hydrateFromCache();
  if (fromDisk) cache = fromDisk;
}

export async function loadOrgs(force = false): Promise<OrgRecord[]> {
  if (!force && cache && Date.now() - lastFetched < REFRESH_MS) return cache;
  if (pending) return pending;
  pending = (async () => {
    try {
      const res = await fetch("/api/portal/orgs", { cache: "no-store" });
      if (!res.ok) return cache ?? [];
      const data = await res.json() as { orgs: OrgRecord[] };
      cache = data.orgs;
      lastFetched = Date.now();
      persistCache(cache);
      notify();
      return cache;
    } catch {
      return cache ?? [];
    } finally {
      pending = null;
    }
  })();
  return pending;
}

export function listOrgs(): OrgRecord[] {
  return cache ?? [];
}

export function getOrg(id: string): OrgRecord | undefined {
  return (cache ?? []).find(o => o.id === id);
}

export function getPrimaryOrg(): OrgRecord | undefined {
  return (cache ?? []).find(o => o.isPrimary);
}

// ─── Active org (per admin user) ────────────────────────────────────────────

export function getActiveOrgId(adminEmail?: string): string {
  if (typeof window === "undefined") return "agency";
  try {
    const key = adminEmail ? `${ACTIVE_KEY}_${adminEmail}` : ACTIVE_KEY;
    const stored = localStorage.getItem(key);
    if (stored && getOrg(stored)) return stored;
  } catch {}
  return getPrimaryOrg()?.id ?? "agency";
}

export function getActiveOrg(adminEmail?: string): OrgRecord | undefined {
  return getOrg(getActiveOrgId(adminEmail));
}

export function setActiveOrgId(orgId: string, adminEmail?: string) {
  if (typeof window === "undefined") return;
  const key = adminEmail ? `${ACTIVE_KEY}_${adminEmail}` : ACTIVE_KEY;
  localStorage.setItem(key, orgId);
  const org = getOrg(orgId);
  notify();
  logActivity({
    category: "settings",
    action: `Switched active org → ${org?.name ?? orgId}`,
    resourceId: orgId,
    resourceLink: "/admin/orgs",
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface CreateOrgInput {
  name: string;
  slug?: string;
  ownerEmail?: string;
  brandColor?: string;
  logoUrl?: string;
  // Preset id from src/plugins/_presets.ts. The server applies it after
  // creating the org so the new portal boots with the right plugins
  // installed (e.g. Website + E-commerce + SEO + …).
  presetId?: string;
}

export async function createOrg(input: CreateOrgInput): Promise<OrgRecord | null> {
  try {
    const res = await fetch("/api/portal/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    const data = await res.json() as { org: OrgRecord };
    await loadOrgs(true);
    logActivity({
      category: "settings",
      action: `Created org "${data.org.name}"`,
      resourceId: data.org.id,
      resourceLink: "/admin/orgs",
    });
    return data.org;
  } catch { return null; }
}

export async function updateOrg(id: string, patch: Partial<OrgRecord>): Promise<OrgRecord | null> {
  try {
    const res = await fetch(`/api/portal/orgs/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = await res.json() as { org: OrgRecord };
    await loadOrgs(true);
    return data.org;
  } catch { return null; }
}

export async function deleteOrg(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/portal/orgs/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return false;
    await loadOrgs(true);
    return true;
  } catch { return false; }
}

// ─── Subscription ───────────────────────────────────────────────────────────

export function onOrgsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
