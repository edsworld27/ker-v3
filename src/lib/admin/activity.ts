"use client";

// Admin activity log. Every mutation in the admin should call logActivity()
// so there's an audit trail of who changed what and when.
//
// Stored in localStorage, capped at 500 entries (oldest evicted).

import { getSession } from "@/lib/auth";

const KEY = "lk_admin_activity_v1";
const EVENT = "lk-activity-change";
const MAX_ENTRIES = 500;

export type ActivityCategory =
  | "orders" | "products" | "customers" | "marketing" | "content"
  | "theme"  | "settings" | "features"  | "shipping"  | "support" | "auth";

export interface ActivityEntry {
  id: string;
  ts: number;
  actorEmail: string;
  actorName: string;
  category: ActivityCategory;
  action: string;     // verb phrase, eg. "Updated order ORD-4821 status to fulfilled"
  resourceId?: string;
  resourceLink?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

function read(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function write(entries: ActivityEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(EVENT));
}

export function logActivity(entry: Omit<ActivityEntry, "id" | "ts" | "actorEmail" | "actorName">) {
  const session = getSession();
  const actorEmail = session?.user.email ?? "anonymous";
  const actorName  = session?.user.name  ?? "Anonymous";
  const next: ActivityEntry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    actorEmail, actorName,
    ...entry,
  };
  const existing = read();
  const trimmed = [next, ...existing].slice(0, MAX_ENTRIES);
  write(trimmed);
}

export function listActivity(): ActivityEntry[] {
  return read();
}

export function clearActivity() {
  write([]);
}

export function onActivityChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60)    return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)    return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)    return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)     return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
