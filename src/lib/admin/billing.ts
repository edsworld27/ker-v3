"use client";

// Admin-side billing client (G-3). Talks to /api/portal/billing/[orgId].
// Cached + invalidated on org switch so the sidebar can hide gated items
// without a per-render fetch.

import type { Plan, Subscription } from "@/portal/server/types";

interface BillingPayload {
  ok: boolean;
  subscription: Subscription | null;
  features: string[];
  plans: Plan[];
}

const cache: Record<string, BillingPayload> = {};
const CHANGE_EVENT = "lk-billing-change";

export async function loadBilling(orgId: string, force = false): Promise<BillingPayload> {
  if (!force && cache[orgId]) return cache[orgId];
  const res = await fetch(`/api/portal/billing/${encodeURIComponent(orgId)}`, { cache: "no-store" });
  const data = await res.json() as BillingPayload;
  cache[orgId] = data;
  return data;
}

export function getCachedBilling(orgId: string): BillingPayload | null {
  return cache[orgId] ?? null;
}

export async function setPlan(orgId: string, planId: string): Promise<BillingPayload> {
  await fetch(`/api/portal/billing/${encodeURIComponent(orgId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ planId }),
  });
  delete cache[orgId];
  const next = await loadBilling(orgId, true);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export async function cancelPlan(orgId: string): Promise<BillingPayload> {
  await fetch(`/api/portal/billing/${encodeURIComponent(orgId)}`, { method: "DELETE" });
  delete cache[orgId];
  const next = await loadBilling(orgId, true);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}

export function onBillingChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

// Sync feature check — relies on the cache being populated. The org
// switcher / dashboard hydrates the cache on mount.
export function hasFeature(orgId: string, flag: string): boolean {
  const c = cache[orgId];
  if (!c) return true; // optimistic until hydrated
  return c.features.includes(flag);
}
