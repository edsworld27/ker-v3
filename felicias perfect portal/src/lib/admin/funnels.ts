"use client";

// Admin client for funnels. Mirrors the lib/admin/orgs.ts pattern:
// fetches from /api/portal/funnels into an in-memory cache; sync
// getters return the cached snapshot; mutations POST/PATCH/DELETE
// and refresh.
//
// The funnel runtime lives server-side in src/portal/server/funnels.ts;
// step-visit tracking happens automatically inside the analytics
// tracker's ingest endpoint, so the storefront doesn't need to call
// recordStepVisit explicitly.

import { getActiveOrgId } from "./orgs";

export type FunnelStatus = "active" | "paused" | "draft";
export type StepType = "page" | "product" | "checkout" | "external";

export interface FunnelStep {
  id: string;
  name: string;
  type: StepType;
  path: string;
  description?: string;
  reached: number;
  completed: number;
}

export interface Funnel {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: FunnelStatus;
  steps: FunnelStep[];
  createdAt: number;
  updatedAt: number;
}

const CHANGE_EVENT = "lk-funnels-change";
const REFRESH_MS = 30_000;

let cache: Funnel[] = [];
let pending: Promise<Funnel[]> | null = null;
let lastFetched = 0;

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

async function fetchFunnels(force = false): Promise<Funnel[]> {
  if (!force && Date.now() - lastFetched < REFRESH_MS) return cache;
  if (pending) return pending;
  pending = (async () => {
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/funnels?orgId=${orgId}`, { cache: "no-store" });
      if (!res.ok) return cache;
      const data = await res.json() as { funnels?: Funnel[] };
      cache = data.funnels ?? [];
      lastFetched = Date.now();
      notify();
      return cache;
    } catch {
      return cache;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

// ─── Sync API (returns cache; call refreshFunnels first if stale) ─────────

export function listFunnels(): Funnel[] {
  // Trigger background refresh if we haven't loaded recently. Callers
  // listening on onFunnelsChange will receive an update.
  if (Date.now() - lastFetched > REFRESH_MS) void fetchFunnels(false);
  return cache;
}

export function getFunnel(id: string): Funnel | undefined {
  return cache.find(f => f.id === id);
}

export async function refreshFunnels(): Promise<Funnel[]> {
  return fetchFunnels(true);
}

// ─── Mutations ────────────────────────────────────────────────────────────

export interface CreateFunnelInput {
  name: string;
  description?: string;
  steps?: Array<Omit<FunnelStep, "id" | "reached" | "completed">>;
}

export async function createFunnel(input: CreateFunnelInput): Promise<Funnel | null> {
  const orgId = getActiveOrgId();
  try {
    const res = await fetch("/api/portal/funnels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...input }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { ok: boolean; funnel: Funnel };
    if (!data.ok) return null;
    await refreshFunnels();
    return data.funnel;
  } catch { return null; }
}

export async function saveFunnel(funnel: Funnel): Promise<void> {
  const orgId = getActiveOrgId();
  try {
    await fetch(`/api/portal/funnels/${funnel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        name: funnel.name,
        description: funnel.description,
        status: funnel.status,
        steps: funnel.steps,
      }),
    });
  } finally { await refreshFunnels(); }
}

export async function patchFunnel(id: string, patch: Partial<Funnel>): Promise<void> {
  const orgId = getActiveOrgId();
  try {
    await fetch(`/api/portal/funnels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...patch }),
    });
  } finally { await refreshFunnels(); }
}

export async function deleteFunnel(id: string): Promise<void> {
  const orgId = getActiveOrgId();
  try {
    await fetch(`/api/portal/funnels/${id}?orgId=${orgId}`, { method: "DELETE" });
  } finally { await refreshFunnels(); }
}

export async function setFunnelStatus(id: string, status: FunnelStatus): Promise<void> {
  return patchFunnel(id, { status });
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export interface FunnelStats {
  funnelId: string;
  totalSessions: number;
  conversionRate: number;
  steps: Array<{
    stepId: string;
    name: string;
    reached: number;
    completed: number;
    dropoff: number;
    dropoffRate: number;
  }>;
}

export async function fetchFunnelStats(funnelId: string): Promise<FunnelStats | null> {
  const orgId = getActiveOrgId();
  try {
    const res = await fetch(`/api/portal/funnels/${funnelId}/stats?orgId=${orgId}`);
    if (!res.ok) return null;
    const data = await res.json() as { ok: boolean; stats?: FunnelStats };
    return data.ok ? data.stats ?? null : null;
  } catch { return null; }
}

export async function resetFunnelStats(funnelId: string): Promise<void> {
  const orgId = getActiveOrgId();
  try {
    await fetch(`/api/portal/funnels/${funnelId}/stats?orgId=${orgId}`, { method: "DELETE" });
  } finally { await refreshFunnels(); }
}

// Conversion rate from cached funnel (no extra fetch).
export function funnelConversionRate(funnel: Funnel): number {
  if (!funnel.steps.length) return 0;
  const first = funnel.steps[0].reached;
  const last = funnel.steps[funnel.steps.length - 1].reached;
  if (first === 0) return 0;
  return Math.round((last / first) * 100);
}

export function onFunnelsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

// Initialise on first import in browser.
if (typeof window !== "undefined") {
  void fetchFunnels(true);
}
