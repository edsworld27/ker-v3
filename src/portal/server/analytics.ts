// Self-hosted analytics — backs the Analytics plugin.
//
// Stores raw events in a per-org bucket on the cloud-storage layer.
// Aggregations are computed on read (cheaper than maintaining
// rollup tables for the volumes we expect; revisit if a tenant
// crosses ~100k events/day).
//
// The Analytics plugin's `samplingRate` config drops a fraction of
// events on the way in, and `retentionDays` trims old events on
// every write so the bucket doesn't grow unbounded.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import type { OrgPluginInstall } from "./types";

export type AnalyticsEventType =
  | "pageview"
  | "click"
  | "scroll"
  | "form-submit"
  | "purchase"
  | "session-start"
  | "session-end"
  | "custom";

export interface AnalyticsEvent {
  id: string;
  orgId: string;
  type: AnalyticsEventType;
  // Custom event name when type === "custom".
  name?: string;
  // Page path the event happened on.
  path: string;
  // Visitor session id — short-lived, browser-bound.
  sessionId: string;
  // Hashed IP (sha256) so we have unique-visitor counts without
  // storing raw IPs. Set to "anon" for GDPR-strict mode.
  visitorId: string;
  // Optional payload for click/scroll/form/purchase events.
  payload?: Record<string, unknown>;
  // Geo + UA — optional, populated by the tracking endpoint where
  // supported by the runtime.
  country?: string;
  device?: "desktop" | "tablet" | "mobile";
  referrer?: string;
  userAgent?: string;
  createdAt: number;
}

interface AnalyticsState {
  analyticsEvents?: AnalyticsEvent[];
}

// ─── Config resolution ─────────────────────────────────────────────────────

interface AnalyticsConfig {
  retentionDays: number;
  samplingRate: number;
  gdprMode: boolean;
  pageviewsEnabled: boolean;
  eventsEnabled: boolean;
  scrollEnabled: boolean;
  heatmapsEnabled: boolean;
}

function getAnalyticsInstall(orgId: string): OrgPluginInstall | null {
  const org = getOrg(orgId);
  if (!org) return null;
  const install = (org.plugins ?? []).find(p => p.pluginId === "analytics");
  if (!install || !install.enabled) return null;
  return install;
}

function resolveConfig(install: OrgPluginInstall): AnalyticsConfig {
  const c = install.config as Record<string, unknown>;
  const f = install.features ?? {};
  return {
    retentionDays: typeof c.retentionDays === "number" ? c.retentionDays : 90,
    samplingRate: typeof c.samplingRate === "number" ? c.samplingRate : 100,
    gdprMode: f.gdprMode === true,
    pageviewsEnabled: f.pageviews !== false,
    eventsEnabled: f.events !== false,
    scrollEnabled: f.scrollTracking !== false,
    heatmapsEnabled: f.heatmaps === true,
  };
}

// ─── Ingest ────────────────────────────────────────────────────────────────

export interface TrackInput {
  orgId: string;
  type: AnalyticsEventType;
  name?: string;
  path: string;
  sessionId: string;
  visitorId?: string;
  payload?: Record<string, unknown>;
  country?: string;
  device?: AnalyticsEvent["device"];
  referrer?: string;
  userAgent?: string;
}

function makeId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function trackEvent(input: TrackInput): { ok: boolean; reason?: string } {
  const install = getAnalyticsInstall(input.orgId);
  if (!install) return { ok: false, reason: "plugin-not-installed" };
  const cfg = resolveConfig(install);

  // Per-feature gates.
  if (input.type === "pageview" && !cfg.pageviewsEnabled) return { ok: false, reason: "pageviews-off" };
  if ((input.type === "click" || input.type === "form-submit" || input.type === "custom") && !cfg.eventsEnabled) {
    return { ok: false, reason: "events-off" };
  }
  if (input.type === "scroll" && !cfg.scrollEnabled) return { ok: false, reason: "scroll-off" };

  // Sampling.
  if (cfg.samplingRate < 100 && Math.random() * 100 > cfg.samplingRate) {
    return { ok: false, reason: "sampled-out" };
  }

  const event: AnalyticsEvent = {
    id: makeId(),
    orgId: input.orgId,
    type: input.type,
    name: input.name,
    path: input.path,
    sessionId: input.sessionId,
    visitorId: cfg.gdprMode ? "anon" : (input.visitorId ?? "anon"),
    payload: input.payload,
    country: input.country,
    device: input.device,
    referrer: input.referrer,
    userAgent: cfg.gdprMode ? undefined : input.userAgent,
    createdAt: Date.now(),
  };

  const cutoff = Date.now() - cfg.retentionDays * 24 * 60 * 60 * 1000;
  mutate(state => {
    const s = state as unknown as AnalyticsState;
    if (!s.analyticsEvents) s.analyticsEvents = [];
    s.analyticsEvents.push(event);
    // Trim old events on every write — cheap when there are few,
    // and amortises the cost.
    s.analyticsEvents = s.analyticsEvents.filter(e => e.createdAt >= cutoff);
  });
  return { ok: true };
}

// ─── Aggregations (reads) ─────────────────────────────────────────────────

export interface AnalyticsRange {
  orgId: string;
  startMs: number;
  endMs: number;
}

function getEvents({ orgId, startMs, endMs }: AnalyticsRange): AnalyticsEvent[] {
  const s = getState() as unknown as AnalyticsState;
  if (!s.analyticsEvents) return [];
  return s.analyticsEvents.filter(e =>
    e.orgId === orgId && e.createdAt >= startMs && e.createdAt <= endMs,
  );
}

export interface AnalyticsSummary {
  pageviews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  byDevice: Record<"desktop" | "tablet" | "mobile" | "other", number>;
  byDay: Array<{ day: string; views: number }>;
  conversionRate: number;
  totalEvents: number;
}

export function getSummary(range: AnalyticsRange): AnalyticsSummary {
  const events = getEvents(range);
  const pageviews = events.filter(e => e.type === "pageview");
  const purchases = events.filter(e => e.type === "purchase");

  const pageCounts = new Map<string, number>();
  const refCounts = new Map<string, number>();
  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const byDevice: AnalyticsSummary["byDevice"] = { desktop: 0, tablet: 0, mobile: 0, other: 0 };
  const byDay = new Map<string, number>();

  for (const e of pageviews) {
    pageCounts.set(e.path, (pageCounts.get(e.path) ?? 0) + 1);
    if (e.referrer) refCounts.set(e.referrer, (refCounts.get(e.referrer) ?? 0) + 1);
    visitors.add(e.visitorId);
    sessions.add(e.sessionId);
    byDevice[e.device ?? "other"]++;
    const day = new Date(e.createdAt).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }));

  const topReferrers = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, views]) => ({ referrer, views }));

  const dayList = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, views]) => ({ day, views }));

  return {
    pageviews: pageviews.length,
    uniqueVisitors: visitors.size,
    uniqueSessions: sessions.size,
    topPages,
    topReferrers,
    byDevice,
    byDay: dayList,
    conversionRate: pageviews.length === 0 ? 0 : (purchases.length / pageviews.length) * 100,
    totalEvents: events.length,
  };
}

export function getHeatmapForPath(orgId: string, path: string, days = 30): Array<{ x: number; y: number; count: number }> {
  const start = Date.now() - days * 24 * 60 * 60 * 1000;
  const events = getEvents({ orgId, startMs: start, endMs: Date.now() })
    .filter(e => e.type === "click" && e.path === path);
  const buckets = new Map<string, { x: number; y: number; count: number }>();
  for (const e of events) {
    const x = Number(e.payload?.x ?? 0);
    const y = Number(e.payload?.y ?? 0);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    // Snap to 16px grid so the heatmap aggregates clicks near the same
    // visual element instead of one dot per pixel.
    const bx = Math.round(x / 16) * 16;
    const by = Math.round(y / 16) * 16;
    const key = `${bx}:${by}`;
    const existing = buckets.get(key);
    if (existing) existing.count++;
    else buckets.set(key, { x: bx, y: by, count: 1 });
  }
  return [...buckets.values()];
}
