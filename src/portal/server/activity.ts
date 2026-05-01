// Server-side activity log — durable mirror of the per-browser localStorage
// log so HIPAA / SOC 2 retention windows are real, not just labels.
//
// Retention is driven by the active compliance mode (see
// src/portal/server/compliance.ts → auditRetentionDays). On every append
// we drop entries older than the window AND cap the total at
// ACTIVITY_HARD_CAP so the on-disk / KV blob stays bounded even when
// retention is set to several years.
//
// Reads (listActivity) accept simple filters so the admin page can
// render without pulling 50k entries client-side.

import { getState, mutate } from "./storage";
import { auditRetentionDays } from "./compliance";
import {
  ACTIVITY_HARD_CAP,
  type ActivityEntry, type ActivityCategory,
} from "./types";

export type { ActivityEntry, ActivityCategory };

export interface AppendInput {
  actorEmail: string;
  actorName: string;
  category: ActivityCategory;
  action: string;
  resourceId?: string;
  resourceLink?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
  ts?: number;          // optional override (default Date.now())
  id?: string;          // optional client-supplied id (for de-dup)
}

export function appendActivity(input: AppendInput): ActivityEntry {
  let saved!: ActivityEntry;
  mutate(state => {
    const ts = input.ts ?? Date.now();
    const id = input.id ?? `act_${ts.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    saved = {
      id,
      ts,
      actorEmail: input.actorEmail,
      actorName: input.actorName,
      category: input.category,
      action: input.action,
      resourceId: input.resourceId,
      resourceLink: input.resourceLink,
      diff: input.diff,
    };
    // Don't double-record if the client retries with the same id
    // (network blip, online-after-offline, etc.).
    if (state.activity.some(e => e.id === saved.id)) {
      return;
    }
    // Newest first, then trim by retention + hard cap.
    const cutoff = Date.now() - auditRetentionDays() * 24 * 60 * 60 * 1000;
    const merged = [saved, ...state.activity]
      .filter(e => e.ts >= cutoff)
      .slice(0, ACTIVITY_HARD_CAP);
    state.activity = merged;
  });
  return saved;
}

export interface ListActivityOptions {
  limit?: number;
  category?: ActivityCategory;
  actorEmail?: string;
  search?: string;
  since?: number;
}

export function listActivity(opts: ListActivityOptions = {}): ActivityEntry[] {
  const limit = opts.limit ?? 500;
  const search = opts.search?.toLowerCase().trim();
  let entries = getState().activity;
  if (opts.since) entries = entries.filter(e => e.ts >= opts.since!);
  if (opts.category) entries = entries.filter(e => e.category === opts.category);
  if (opts.actorEmail) entries = entries.filter(e => e.actorEmail === opts.actorEmail);
  if (search) {
    entries = entries.filter(e =>
      e.action.toLowerCase().includes(search)
      || e.actorName.toLowerCase().includes(search)
      || e.actorEmail.toLowerCase().includes(search)
      || (e.resourceId ?? "").toLowerCase().includes(search)
    );
  }
  // Already sorted newest-first by appendActivity, but trust nothing.
  entries = [...entries].sort((a, b) => b.ts - a.ts);
  return entries.slice(0, limit);
}

export function clearActivity(): void {
  mutate(state => { state.activity = []; });
}

// Stats for the dashboard — total + entries grouped by category, plus the
// effective retention window so the admin can see what's enforced.
export function getActivityStats(): {
  total: number;
  oldestTs: number | null;
  retentionDays: number;
  byCategory: Record<string, number>;
} {
  const entries = getState().activity;
  const byCategory: Record<string, number> = {};
  let oldestTs: number | null = null;
  for (const e of entries) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    if (oldestTs === null || e.ts < oldestTs) oldestTs = e.ts;
  }
  return {
    total: entries.length,
    oldestTs,
    retentionDays: auditRetentionDays(),
    byCategory,
  };
}
