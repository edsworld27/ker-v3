// Server-side split-test groups (X-2). Each group has metadata
// (status, traffic %, sticky-by, goal event, schedule) plus a list of
// (pageId, blockId) refs telling the runtime resolver which blocks
// participate. Each participating block stores its own variant set on
// `block.variantsByGroup[groupId]`.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { SplitTestGroup, SplitTestResult, SplitTestStatus } from "./types";

function makeId(): string { return `st_${crypto.randomBytes(6).toString("hex")}`; }

export interface CreateGroupInput {
  siteId: string;
  name: string;
  description?: string;
  trafficPercent?: number;
  stickyBy?: "visitor" | "session";
  goalEvent?: string;
}

export function listGroups(siteId?: string): SplitTestGroup[] {
  const all = Object.values(getState().splitTests);
  return all
    .filter(g => !siteId || g.siteId === siteId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getGroup(id: string): SplitTestGroup | undefined {
  return getState().splitTests[id];
}

export function createGroup(input: CreateGroupInput): SplitTestGroup {
  const g: SplitTestGroup = {
    id: makeId(),
    siteId: input.siteId,
    name: input.name,
    description: input.description,
    status: "draft",
    trafficPercent: input.trafficPercent ?? 100,
    stickyBy: input.stickyBy ?? "visitor",
    goalEvent: input.goalEvent,
    blockRefs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  mutate(state => { state.splitTests[g.id] = g; });
  return g;
}

export function updateGroup(id: string, patch: Partial<Pick<SplitTestGroup, "name" | "description" | "status" | "trafficPercent" | "stickyBy" | "goalEvent" | "endsAt" | "startedAt" | "blockRefs">>): SplitTestGroup | null {
  let result: SplitTestGroup | null = null;
  mutate(state => {
    const existing = state.splitTests[id];
    if (!existing) return;
    state.splitTests[id] = { ...existing, ...patch, updatedAt: Date.now() };
    result = state.splitTests[id];
  });
  return result;
}

export function setGroupStatus(id: string, status: SplitTestStatus): SplitTestGroup | null {
  const patch: Partial<SplitTestGroup> = { status };
  if (status === "running" && !getGroup(id)?.startedAt) patch.startedAt = Date.now();
  return updateGroup(id, patch);
}

export function deleteGroup(id: string): boolean {
  let removed = false;
  mutate(state => {
    if (state.splitTests[id]) {
      delete state.splitTests[id];
      // Remove any results too.
      for (const k of Object.keys(state.splitTestResults)) {
        if (k.startsWith(`${id}:`)) delete state.splitTestResults[k];
      }
      removed = true;
    }
  });
  return removed;
}

// ── Results ─────────────────────────────────────────────────────────────
function resultKey(groupId: string, variantId: string): string {
  return `${groupId}:${variantId}`;
}

export function recordExposure(groupId: string, variantId: string) {
  mutate(state => {
    const k = resultKey(groupId, variantId);
    const existing = state.splitTestResults[k] ?? { groupId, variantId, exposures: 0, conversions: 0, updatedAt: Date.now() };
    state.splitTestResults[k] = { ...existing, exposures: existing.exposures + 1, updatedAt: Date.now() };
  });
}

export function recordConversion(groupId: string, variantId: string) {
  mutate(state => {
    const k = resultKey(groupId, variantId);
    const existing = state.splitTestResults[k] ?? { groupId, variantId, exposures: 0, conversions: 0, updatedAt: Date.now() };
    state.splitTestResults[k] = { ...existing, conversions: existing.conversions + 1, updatedAt: Date.now() };
  });
}

export function getGroupResults(groupId: string): SplitTestResult[] {
  return Object.values(getState().splitTestResults)
    .filter(r => r.groupId === groupId)
    .sort((a, b) => b.exposures - a.exposures);
}
