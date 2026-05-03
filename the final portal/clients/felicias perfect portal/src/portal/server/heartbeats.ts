// Server-only heartbeat store for the portal tag. Backed by storage.ts so
// state survives dev-server restarts when the filesystem is writable, and
// gracefully degrades to in-memory otherwise.

import { getState, mutate } from "./storage";
import type { Heartbeat } from "./types";

export type { Heartbeat };

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
  let recorded!: Heartbeat;
  mutate(state => {
    const existing = state.heartbeats[beat.siteId];
    recorded = {
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
    state.heartbeats[beat.siteId] = recorded;
  });
  return recorded;
}

export function list(): Heartbeat[] {
  return Object.values(getState().heartbeats).sort((a, b) => b.lastSeenAt - a.lastSeenAt);
}

export function get(siteId: string): Heartbeat | undefined {
  return getState().heartbeats[siteId];
}

export function clear(siteId?: string) {
  mutate(state => {
    if (siteId) delete state.heartbeats[siteId];
    else state.heartbeats = {};
  });
}
