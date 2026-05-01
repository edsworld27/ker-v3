// Server-only heartbeat store for the portal tag.
//
// Each external site that loads /portal/tag.js posts a heartbeat to
// /api/portal/heartbeat. We keep the most recent reading per site in a
// module-level Map. State is in-memory and resets on cold start — fine for
// connectivity monitoring (heartbeats arrive frequently), and the Phase B
// migration to durable storage (KV / DB) replaces this module wholesale.

export interface Heartbeat {
  siteId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  beats: number;
  lastUrl?: string;
  lastTitle?: string;
  lastReferrer?: string;
  lastUserAgent?: string;
  lastEvent?: string;          // "connect" | "hide" | "ping"
}

const store = new Map<string, Heartbeat>();

export interface IncomingBeat {
  siteId: string;
  url?: string;
  title?: string;
  referrer?: string;
  event?: string;
  userAgent?: string;
}

export function record(beat: IncomingBeat): Heartbeat {
  const now = Date.now();
  const existing = store.get(beat.siteId);
  const next: Heartbeat = {
    siteId: beat.siteId,
    firstSeenAt: existing?.firstSeenAt ?? now,
    lastSeenAt: now,
    beats: (existing?.beats ?? 0) + 1,
    lastUrl: beat.url ?? existing?.lastUrl,
    lastTitle: beat.title ?? existing?.lastTitle,
    lastReferrer: beat.referrer ?? existing?.lastReferrer,
    lastUserAgent: beat.userAgent ?? existing?.lastUserAgent,
    lastEvent: beat.event ?? existing?.lastEvent,
  };
  store.set(beat.siteId, next);
  return next;
}

export function list(): Heartbeat[] {
  return Array.from(store.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

export function get(siteId: string): Heartbeat | undefined {
  return store.get(siteId);
}

export function clear(siteId?: string) {
  if (siteId) store.delete(siteId);
  else store.clear();
}
