// Server-side store for content overrides. Each site gets a key→value
// map (the override) plus a key→discovery record (what the tag has seen).
//
// Discovery is best-effort: the loader scans `[data-portal-edit]` keys on
// every page and posts them with the heartbeat. The portal records a
// per-key first/last-seen timestamp and a small set of pathnames so the
// admin sees where each key is used. Cap controls memory bloat.

import { getState, mutate } from "./storage";
import {
  DISCOVERED_PATH_CAP,
  type ContentOverride,
  type DiscoveredKey,
  type OverrideType,
  type SiteContentState,
} from "./types";

export type { ContentOverride, DiscoveredKey, OverrideType, SiteContentState };

const empty = (siteId: string): SiteContentState => ({
  siteId,
  overrides: {},
  discovered: {},
  updatedAt: 0,
});

export function getContentState(siteId: string): SiteContentState {
  return getState().content[siteId] ?? empty(siteId);
}

// Public projection — what the tag fetches. Just key → { value, type }
// because the loader doesn't need timestamps or discovery records.
export function getPublicOverrides(siteId: string): Record<string, { value: string; type: OverrideType }> {
  const state = getContentState(siteId);
  const out: Record<string, { value: string; type: OverrideType }> = {};
  for (const [k, o] of Object.entries(state.overrides)) {
    if (o.value === "") continue;       // empty override = no override
    out[k] = { value: o.value, type: o.type };
  }
  return out;
}

export interface SetOverrideInput {
  key: string;
  value: string;
  type?: OverrideType;
}

export function setOverrides(siteId: string, inputs: SetOverrideInput[]): SiteContentState {
  let saved!: SiteContentState;
  mutate(state => {
    const existing = state.content[siteId] ?? empty(siteId);
    const overrides = { ...existing.overrides };
    const now = Date.now();
    for (const i of inputs) {
      const key = i.key.trim();
      if (!key) continue;
      if (i.value === "") {
        delete overrides[key];          // explicit clear
      } else {
        overrides[key] = {
          value: i.value,
          type: i.type ?? overrides[key]?.type ?? "text",
          updatedAt: now,
        };
      }
    }
    saved = { ...existing, overrides, updatedAt: now };
    state.content[siteId] = saved;
  });
  return saved;
}

export interface IncomingDiscovery {
  key: string;
  type?: OverrideType;
}

export function recordDiscovered(siteId: string, path: string, keys: IncomingDiscovery[]): void {
  if (!keys.length) return;
  mutate(state => {
    const existing = state.content[siteId] ?? empty(siteId);
    const discovered = { ...existing.discovered };
    const now = Date.now();
    for (const k of keys) {
      const key = k.key.trim();
      if (!key) continue;
      const prev: DiscoveredKey = discovered[key] ?? {
        firstSeen: now,
        lastSeen: now,
        seenOn: [],
      };
      const seenOn = prev.seenOn.includes(path)
        ? prev.seenOn
        : [path, ...prev.seenOn].slice(0, DISCOVERED_PATH_CAP);
      discovered[key] = {
        firstSeen: prev.firstSeen,
        lastSeen: now,
        seenOn,
        type: k.type ?? prev.type,
      };
    }
    state.content[siteId] = { ...existing, discovered, updatedAt: now };
  });
}

export function clearDiscovered(siteId: string): void {
  mutate(state => {
    const existing = state.content[siteId];
    if (!existing) return;
    state.content[siteId] = { ...existing, discovered: {}, updatedAt: Date.now() };
  });
}
