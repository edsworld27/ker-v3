// Server-side store for content overrides with draft/publish workflow.
//
// Two buckets per site:
//  • draft     — admin's working copy. Writes from the admin UI land here.
//  • published — what the host site sees. Promoted from draft via publish().
//
// publish() snapshots the previous `published` into `history` so revert is
// trivial. history is capped at PUBLISH_HISTORY_CAP entries; older
// snapshots roll off.
//
// Discovery records (auto-discovered keys from data-portal-edit and the
// manifest) live alongside but aren't part of the workflow — they're just
// "what the tag has seen lately".

import { getState, mutate } from "./storage";
import {
  DISCOVERED_PATH_CAP,
  PUBLISH_HISTORY_CAP,
  type ContentOverride,
  type DiscoveredKey,
  type OverrideType,
  type PublishSnapshot,
  type SiteContentState,
} from "./types";

export type { ContentOverride, DiscoveredKey, OverrideType, PublishSnapshot, SiteContentState };

const empty = (siteId: string): SiteContentState => ({
  siteId,
  draft: {},
  published: {},
  history: [],
  discovered: {},
  updatedAt: 0,
});

function newSnapshotId(): string {
  return `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function getContentState(siteId: string): SiteContentState {
  return getState().content[siteId] ?? empty(siteId);
}

// ─── Public projection (loader payload) ────────────────────────────────────

// What the loader fetches by default — published overrides, stripped to
// just { value, type } so the tag has minimum work to do.
export function getPublicOverrides(siteId: string): Record<string, { value: string; type: OverrideType }> {
  return projectFor(getContentState(siteId).published);
}

// Preview projection — same shape, but reads from draft. Used when a
// signed preview token is presented on the loader request.
export function getPreviewOverrides(siteId: string): Record<string, { value: string; type: OverrideType }> {
  return projectFor(getContentState(siteId).draft);
}

function projectFor(map: Record<string, ContentOverride>): Record<string, { value: string; type: OverrideType }> {
  const out: Record<string, { value: string; type: OverrideType }> = {};
  for (const [k, o] of Object.entries(map)) {
    if (!o || o.value === "") continue;
    out[k] = { value: o.value, type: o.type };
  }
  return out;
}

// ─── Draft mutations ────────────────────────────────────────────────────────

export interface SetOverrideInput {
  key: string;
  value: string;
  type?: OverrideType;
}

// Replace the draft override map atomically. The admin UI sends the full
// list each time, so this is a wholesale set-and-clear, not a partial patch.
export function setDraftOverrides(siteId: string, inputs: SetOverrideInput[]): SiteContentState {
  let saved!: SiteContentState;
  mutate(state => {
    const existing = state.content[siteId] ?? empty(siteId);
    const draft: Record<string, ContentOverride> = {};
    const now = Date.now();
    for (const i of inputs) {
      const key = i.key.trim();
      if (!key || i.value === "") continue;          // blank value = no override
      draft[key] = {
        value: i.value,
        type: i.type ?? existing.draft[key]?.type ?? "text",
        updatedAt: now,
      };
    }
    saved = { ...existing, draft, updatedAt: now };
    state.content[siteId] = saved;
  });
  return saved;
}

// Backwards-compatible alias — D-2 callers should use setDraftOverrides.
export const setOverrides = setDraftOverrides;

// ─── Publish / discard / revert ─────────────────────────────────────────────

export interface PublishOptions {
  publishedBy?: string;
  message?: string;
}

export function publishDraft(siteId: string, opts: PublishOptions = {}): SiteContentState {
  let saved!: SiteContentState;
  mutate(state => {
    const existing = state.content[siteId] ?? empty(siteId);
    const now = Date.now();
    // Snapshot the previous published state into history before promoting.
    // The diff between previous-published and current-draft tells the UI
    // what actually changed in this publish.
    const changedKeys = diffKeys(existing.published, existing.draft);
    const snapshot: PublishSnapshot = {
      id: newSnapshotId(),
      publishedAt: now,
      publishedBy: opts.publishedBy,
      message: opts.message,
      overrides: existing.published,         // store the OUTGOING published state
      changedKeys,
    };
    const history = [snapshot, ...existing.history].slice(0, PUBLISH_HISTORY_CAP);
    saved = {
      ...existing,
      published: { ...existing.draft },     // promote draft → published
      history,
      updatedAt: now,
    };
    state.content[siteId] = saved;
  });
  return saved;
}

export function discardDraft(siteId: string): SiteContentState {
  let saved!: SiteContentState;
  mutate(state => {
    const existing = state.content[siteId] ?? empty(siteId);
    saved = { ...existing, draft: { ...existing.published }, updatedAt: Date.now() };
    state.content[siteId] = saved;
  });
  return saved;
}

// Revert by restoring an older published snapshot. We don't replace the
// history entry — instead a NEW snapshot of the current published is
// pushed first, so revert is itself a publishable event you can undo.
export function revertToSnapshot(siteId: string, snapshotId: string, opts: PublishOptions = {}): SiteContentState | null {
  let saved: SiteContentState | null = null;
  mutate(state => {
    const existing = state.content[siteId];
    if (!existing) return;
    const target = existing.history.find(s => s.id === snapshotId);
    if (!target) return;
    const now = Date.now();
    const changedKeys = diffKeys(existing.published, target.overrides);
    const checkpoint: PublishSnapshot = {
      id: newSnapshotId(),
      publishedAt: now,
      publishedBy: opts.publishedBy,
      message: opts.message ?? `Revert to ${target.id}`,
      overrides: existing.published,
      changedKeys,
    };
    const history = [checkpoint, ...existing.history].slice(0, PUBLISH_HISTORY_CAP);
    saved = {
      ...existing,
      published: { ...target.overrides },
      // Bring the draft back in line with the reverted state too — the
      // admin almost always wants this; if they don't they can re-edit.
      draft: { ...target.overrides },
      history,
      updatedAt: now,
    };
    state.content[siteId] = saved;
  });
  return saved;
}

function diffKeys(prev: Record<string, ContentOverride>, next: Record<string, ContentOverride>): string[] {
  const all = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const changed: string[] = [];
  for (const k of all) {
    const a = prev[k];
    const b = next[k];
    if (!a && b) { changed.push(k); continue; }
    if (a && !b) { changed.push(k); continue; }
    if (a && b && (a.value !== b.value || a.type !== b.type)) changed.push(k);
  }
  return changed.sort();
}

// True if draft and published differ — used by the admin UI to enable the
// Publish button.
export function hasUnpublishedChanges(siteId: string): boolean {
  const s = getContentState(siteId);
  return diffKeys(s.published, s.draft).length > 0;
}

// ─── Discovery ──────────────────────────────────────────────────────────────

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
