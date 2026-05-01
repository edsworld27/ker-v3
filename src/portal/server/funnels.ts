// Funnels runtime — backs the Funnels & A/B plugin.
//
// Multi-step conversion funnels (landing → opt-in → checkout → thank-you).
// Each step has a URL pattern; the analytics tracker calls
// recordStepVisit(orgId, pathname, sessionId) on every pageview, which
// matches the path against active funnels and advances per-session
// progress. Stats stored server-side, per-org.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { emit } from "./eventBus";

export type FunnelStatus = "active" | "paused" | "draft";
export type StepType = "page" | "product" | "checkout" | "external";

export interface FunnelStep {
  id: string;
  name: string;
  type: StepType;
  // URL pattern — exact match or prefix match. Glob "*" wildcards
  // supported (e.g. "/products/*" matches all products).
  path: string;
  description?: string;
  // Aggregated counters. reached = anyone who hit this step;
  // completed = anyone who reached the NEXT step too.
  reached: number;
  completed: number;
}

export interface Funnel {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: FunnelStatus;
  steps: FunnelStep[];
  createdAt: number;
  updatedAt: number;
}

interface FunnelSession {
  // Step ids the visitor has reached on this session, in order.
  reached: string[];
  lastSeenMs: number;
}

interface FunnelsState {
  funnels?: Funnel[];
  // sessionsByFunnel[funnelId][sessionId] = FunnelSession
  funnelSessions?: Record<string, Record<string, FunnelSession>>;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export function listFunnels(orgId: string): Funnel[] {
  const s = getState() as unknown as FunnelsState;
  return (s.funnels ?? [])
    .filter(f => f.orgId === orgId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getFunnel(orgId: string, id: string): Funnel | undefined {
  return listFunnels(orgId).find(f => f.id === id);
}

export interface CreateFunnelInput {
  orgId: string;
  name: string;
  description?: string;
  steps?: Array<Omit<FunnelStep, "id" | "reached" | "completed">>;
}

export function createFunnel(input: CreateFunnelInput): Funnel {
  const f: Funnel = {
    id: makeId("fn"),
    orgId: input.orgId,
    name: input.name,
    description: input.description,
    status: "draft",
    steps: (input.steps ?? []).map(s => ({
      ...s,
      id: makeId("step"),
      reached: 0,
      completed: 0,
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as FunnelsState;
    if (!s.funnels) s.funnels = [];
    s.funnels.push(f);
  });
  return f;
}

export function updateFunnel(orgId: string, id: string, patch: Partial<Omit<Funnel, "id" | "orgId" | "createdAt">>): Funnel | null {
  let result: Funnel | null = null;
  mutate(state => {
    const s = state as unknown as FunnelsState;
    const f = s.funnels?.find(x => x.orgId === orgId && x.id === id);
    if (!f) return;
    Object.assign(f, patch, { updatedAt: Date.now() });
    result = f;
  });
  return result;
}

export function deleteFunnel(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as FunnelsState;
    if (!s.funnels) return;
    const before = s.funnels.length;
    s.funnels = s.funnels.filter(f => !(f.orgId === orgId && f.id === id));
    removed = s.funnels.length < before;
    // Drop the session bucket too — saves space.
    delete s.funnelSessions?.[id];
  });
  return removed;
}

export function setFunnelStatus(orgId: string, id: string, status: FunnelStatus): void {
  updateFunnel(orgId, id, { status });
}

// ─── Step CRUD ─────────────────────────────────────────────────────────────

export interface AddStepInput {
  orgId: string;
  funnelId: string;
  name: string;
  type: StepType;
  path: string;
  description?: string;
}

export function addStep(input: AddStepInput): FunnelStep | null {
  const step: FunnelStep = {
    id: makeId("step"),
    name: input.name,
    type: input.type,
    path: input.path,
    description: input.description,
    reached: 0,
    completed: 0,
  };
  let added: FunnelStep | null = null;
  mutate(state => {
    const s = state as unknown as FunnelsState;
    const f = s.funnels?.find(x => x.orgId === input.orgId && x.id === input.funnelId);
    if (!f) return;
    f.steps.push(step);
    f.updatedAt = Date.now();
    added = step;
  });
  return added;
}

export function removeStep(orgId: string, funnelId: string, stepId: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as FunnelsState;
    const f = s.funnels?.find(x => x.orgId === orgId && x.id === funnelId);
    if (!f) return;
    const before = f.steps.length;
    f.steps = f.steps.filter(st => st.id !== stepId);
    f.updatedAt = Date.now();
    removed = f.steps.length < before;
  });
  return removed;
}

// ─── URL → step matching ───────────────────────────────────────────────────

function matchPath(pattern: string, pathname: string): boolean {
  // Exact match.
  if (pattern === pathname) return true;
  // Prefix match (with optional trailing slash).
  if (pathname === pattern + "/" || pathname.startsWith(pattern + "/")) return true;
  // Glob with single trailing wildcard ("/products/*" matches "/products/foo").
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1);
    return pathname.startsWith(prefix);
  }
  return false;
}

// Called by the storefront analytics tracker on every pageview.
// Records step visits for any active funnel that matches the URL.
// Idempotent per session: visiting the same step twice in one session
// only counts once.
export function recordStepVisit(orgId: string, pathname: string, sessionId: string): void {
  if (!sessionId) return;
  const funnels = listFunnels(orgId).filter(f => f.status === "active");
  if (funnels.length === 0) return;

  mutate(state => {
    const s = state as unknown as FunnelsState;
    if (!s.funnelSessions) s.funnelSessions = {};
    const now = Date.now();

    for (const f of funnels) {
      const liveFunnel = s.funnels?.find(x => x.id === f.id);
      if (!liveFunnel) continue;

      const matchedStep = liveFunnel.steps.find(st => matchPath(st.path, pathname));
      if (!matchedStep) continue;

      if (!s.funnelSessions[f.id]) s.funnelSessions[f.id] = {};
      const sess = s.funnelSessions[f.id][sessionId] ?? { reached: [], lastSeenMs: 0 };
      if (sess.reached.includes(matchedStep.id)) {
        sess.lastSeenMs = now;
        s.funnelSessions[f.id][sessionId] = sess;
        continue;
      }
      sess.reached.push(matchedStep.id);
      sess.lastSeenMs = now;
      s.funnelSessions[f.id][sessionId] = sess;

      matchedStep.reached++;

      // If the visitor was already on the previous step, count that
      // step as completed (they progressed forward).
      const stepIdx = liveFunnel.steps.findIndex(st => st.id === matchedStep.id);
      if (stepIdx > 0) {
        const prevStep = liveFunnel.steps[stepIdx - 1];
        if (sess.reached.includes(prevStep.id)) {
          prevStep.completed++;
        }
      }
      liveFunnel.updatedAt = now;

      // Emit so Webhooks / Automation / Notifications can fan out.
      emit(orgId, "form.submitted", {
        formName: "funnel-step",
        fields: {
          funnelId: f.id,
          funnelName: f.name,
          stepId: matchedStep.id,
          stepName: matchedStep.name,
          path: pathname,
          sessionId,
        },
      });
    }
  });
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export interface FunnelStats {
  funnelId: string;
  totalSessions: number;
  conversionRate: number;     // percent
  steps: Array<{
    stepId: string;
    name: string;
    reached: number;
    completed: number;
    dropoff: number;          // visitors who didn't progress to next step
    dropoffRate: number;      // percent
  }>;
}

export function funnelStats(orgId: string, funnelId: string): FunnelStats | null {
  const f = getFunnel(orgId, funnelId);
  if (!f) return null;
  const s = getState() as unknown as FunnelsState;
  const sessions = s.funnelSessions?.[funnelId] ?? {};
  const totalSessions = Object.keys(sessions).length;

  const steps = f.steps.map((st, i) => {
    const isLast = i === f.steps.length - 1;
    const dropoff = Math.max(0, st.reached - (isLast ? st.reached : st.completed));
    const dropoffRate = st.reached === 0 ? 0 : (dropoff / st.reached) * 100;
    return {
      stepId: st.id,
      name: st.name,
      reached: st.reached,
      completed: st.completed,
      dropoff,
      dropoffRate,
    };
  });

  const first = f.steps[0]?.reached ?? 0;
  const last = f.steps[f.steps.length - 1]?.reached ?? 0;
  const conversionRate = first === 0 ? 0 : (last / first) * 100;

  return {
    funnelId,
    totalSessions,
    conversionRate,
    steps,
  };
}

// Reset stats — keeps the funnel definition but zeroes counters.
export function resetFunnelStats(orgId: string, funnelId: string): void {
  mutate(state => {
    const s = state as unknown as FunnelsState;
    const f = s.funnels?.find(x => x.orgId === orgId && x.id === funnelId);
    if (!f) return;
    for (const st of f.steps) {
      st.reached = 0;
      st.completed = 0;
    }
    f.updatedAt = Date.now();
    delete s.funnelSessions?.[funnelId];
  });
}

export function isFunnelsPluginInstalled(orgId: string): boolean {
  const org = getOrg(orgId);
  return (org?.plugins ?? []).some(p => p.pluginId === "funnels" && p.enabled);
}
