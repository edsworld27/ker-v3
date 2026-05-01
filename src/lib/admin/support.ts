"use client";

import type { FeatureRequest, MeetingBooking, SupportInvoice } from "@/portal/server/types";

const EVENT = "lk-support-change";
function notify() { if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT)); }

export async function listFeatureRequests(orgId?: string): Promise<FeatureRequest[]> {
  const url = `/api/portal/support/feature-requests${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.items ?? [];
}

export async function createFeatureRequest(input: { orgId: string; title: string; body: string; priority?: "low" | "medium" | "high" | "urgent"; submittedBy?: string }): Promise<FeatureRequest | null> {
  const res = await fetch("/api/portal/support/feature-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json();
  notify();
  return data.item ?? null;
}

export async function patchFeatureRequest(id: string, patch: { title?: string; body?: string; status?: FeatureRequest["status"]; priority?: FeatureRequest["priority"]; voteDelta?: 1 | -1; addComment?: { author: string; body: string; isAgency?: boolean } }): Promise<FeatureRequest | null> {
  const res = await fetch(`/api/portal/support/feature-requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json();
  notify();
  return data.item ?? null;
}

export async function deleteFeatureRequest(id: string): Promise<boolean> {
  const res = await fetch(`/api/portal/support/feature-requests/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (res.ok) notify();
  return res.ok;
}

export async function listMeetings(orgId?: string): Promise<MeetingBooking[]> {
  const url = `/api/portal/support/meetings${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.items ?? [];
}

export async function createMeeting(input: { orgId: string; topic: string; preferredDates: string[]; notes?: string; contactEmail?: string }): Promise<MeetingBooking | null> {
  const res = await fetch("/api/portal/support/meetings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json();
  notify();
  return data.item ?? null;
}

export async function patchMeeting(id: string, patch: { status?: MeetingBooking["status"]; meetingUrl?: string; notes?: string }): Promise<MeetingBooking | null> {
  const res = await fetch(`/api/portal/support/meetings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const data = await res.json();
  notify();
  return data.item ?? null;
}

export async function listInvoices(orgId?: string): Promise<SupportInvoice[]> {
  const url = `/api/portal/support/invoices${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.items ?? [];
}

export async function createInvoice(input: { orgId: string; amountTotal: number; description?: string; currency?: string; dueDate?: number; lines?: Array<{ description: string; quantity: number; unitAmount: number }> }): Promise<SupportInvoice | null> {
  const res = await fetch("/api/portal/support/invoices", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const data = await res.json();
  notify();
  return data.item ?? null;
}

export interface SupportStatsResponse {
  openRequests: number;
  pendingMeetings: number;
  unpaidPence: number;
  totalRequests: number;
  totalMeetings: number;
  totalInvoices: number;
}

export async function loadStats(orgId?: string): Promise<SupportStatsResponse> {
  const url = `/api/portal/support/stats${orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return data.stats ?? { openRequests: 0, pendingMeetings: 0, unpaidPence: 0, totalRequests: 0, totalMeetings: 0, totalInvoices: 0 };
}

export function onSupportChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function formatMoney(pence: number, currency = "GBP"): string {
  try { return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(pence / 100); }
  catch { return `£${(pence / 100).toFixed(2)}`; }
}
