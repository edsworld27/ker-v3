"use client";

// Admin activity log. Every mutation in the admin should call logActivity()
// so there's an audit trail of who changed what and when.
//
// Cloud-first: each entry is POSTed to /api/portal/activity asynchronously
// (fire-and-forget). The server enforces retention based on the active
// compliance mode (HIPAA → 6 years, SOC 2 → 1 year, GDPR → 6 months,
// none → 90 days). LocalStorage is kept as a fast-read cache + offline
// fallback so the activity page renders something even when the network's
// out, but it's no longer the source of truth.
//
// Sync API preserved at the call sites: logActivity() returns void
// immediately and dispatches the network write in the background. The
// activity page uses the new async loadActivity() to pull from the
// server when available, falling back to listActivity() (localStorage).

import { getSession } from "@/lib/auth";

const KEY = "lk_admin_activity_v1";
const EVENT = "lk-activity-change";
const MAX_LOCAL_ENTRIES = 500;

export type ActivityCategory =
  | "orders" | "products" | "customers" | "marketing" | "content"
  | "theme"  | "settings" | "features"  | "shipping"  | "support" | "auth";

export interface ActivityEntry {
  id: string;
  ts: number;
  actorEmail: string;
  actorName: string;
  category: ActivityCategory;
  action: string;
  resourceId?: string;
  resourceLink?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

function readLocal(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function writeLocal(entries: ActivityEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(EVENT));
}

// Fire-and-forget POST to the cloud activity endpoint. Failures are
// swallowed — we still have the localStorage entry as a fallback record.
function postToServer(entry: ActivityEntry): void {
  if (typeof window === "undefined") return;
  // navigator.sendBeacon would be ideal (survives page unload) but it
  // doesn't accept JSON content-type without preflight; fetch+keepalive
  // is the close-enough alternative.
  try {
    void fetch("/api/portal/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(() => { /* offline / 4xx — local copy is the fallback */ });
  } catch { /* ignore */ }
}

/**
 * Append an activity entry. Sync from the caller's POV — writes the
 * localStorage cache immediately and fires the server POST in the
 * background.
 */
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
  const existing = readLocal();
  const trimmed = [next, ...existing].slice(0, MAX_LOCAL_ENTRIES);
  writeLocal(trimmed);
  postToServer(next);
}

/**
 * Sync read of the localStorage cache. Fast, available even offline,
 * but capped at MAX_LOCAL_ENTRIES and only sees activity logged from
 * THIS browser. Use loadActivity() for the cloud-side full view.
 */
export function listActivity(): ActivityEntry[] {
  return readLocal();
}

export interface LoadActivityOptions {
  limit?: number;
  category?: ActivityCategory;
  actorEmail?: string;
  search?: string;
  since?: number;
}

export interface LoadActivityResult {
  entries: ActivityEntry[];
  stats: {
    total: number;
    oldestTs: number | null;
    retentionDays: number;
    byCategory: Record<string, number>;
  };
  source: "cloud" | "local";
}

/**
 * Async read of the cloud-side activity log. Falls back to localStorage
 * when the server is unreachable.
 */
export async function loadActivity(opts: LoadActivityOptions = {}): Promise<LoadActivityResult> {
  try {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.category) params.set("category", opts.category);
    if (opts.actorEmail) params.set("actor", opts.actorEmail);
    if (opts.search) params.set("search", opts.search);
    if (opts.since) params.set("since", String(opts.since));
    const qs = params.toString();
    const res = await fetch(`/api/portal/activity${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json() as {
      entries: ActivityEntry[];
      stats: LoadActivityResult["stats"];
    };
    return { ...data, source: "cloud" };
  } catch {
    const local = readLocal();
    return {
      entries: local,
      stats: {
        total: local.length,
        oldestTs: local.length ? local[local.length - 1].ts : null,
        retentionDays: 0,
        byCategory: {},
      },
      source: "local",
    };
  }
}

export function clearActivity() {
  writeLocal([]);
  // Also wipe the cloud copy. Best-effort — admin can retry if it fails.
  if (typeof window !== "undefined") {
    void fetch("/api/portal/activity", { method: "DELETE" }).catch(() => {});
  }
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
