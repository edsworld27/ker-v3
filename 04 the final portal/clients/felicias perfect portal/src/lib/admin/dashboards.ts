"use client";

// Admin-side dashboard layout client (G-4). Cached per org; invalidated on
// save + on org-switch.

import type { DashboardLayout, DashboardWidget } from "@/portal/server/types";

interface DashboardPayload { ok: boolean; layout: DashboardLayout; defaultLayout: DashboardLayout; }

const cache: Record<string, DashboardLayout> = {};
const CHANGE_EVENT = "lk-dashboard-change";

export async function loadDashboard(orgId: string, force = false): Promise<DashboardLayout> {
  if (!force && cache[orgId]) return cache[orgId];
  const res = await fetch(`/api/portal/dashboard/${encodeURIComponent(orgId)}`, { cache: "no-store" });
  const data = await res.json() as DashboardPayload;
  cache[orgId] = data.layout;
  return data.layout;
}

export async function saveDashboard(orgId: string, widgets: DashboardWidget[]): Promise<DashboardLayout> {
  const res = await fetch(`/api/portal/dashboard/${encodeURIComponent(orgId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ widgets }),
  });
  const data = await res.json() as DashboardPayload;
  cache[orgId] = data.layout;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  return data.layout;
}

export async function resetDashboard(orgId: string): Promise<DashboardLayout> {
  const res = await fetch(`/api/portal/dashboard/${encodeURIComponent(orgId)}`, { method: "DELETE" });
  const data = await res.json() as DashboardPayload;
  cache[orgId] = data.layout;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  return data.layout;
}

export function onDashboardChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}
