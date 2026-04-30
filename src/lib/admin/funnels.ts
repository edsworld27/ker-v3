"use client";

const FUNNELS_KEY = "lk_admin_funnels_v1";
const SESSION_PREFIX = "lk_funnel_session_";
const CHANGE_EVENT = "lk-funnels-change";

export type FunnelStatus = "active" | "paused" | "draft";
export type StepType = "page" | "product" | "checkout" | "external";

export interface FunnelStep {
  id: string;
  name: string;
  type: StepType;
  path: string;         // URL path or slug to match (e.g. "/p/sale-page", "/products/black-soap")
  description?: string;
  stats: { reached: number; completed: number };
}

export interface Funnel {
  id: string;
  name: string;
  description?: string;
  status: FunnelStatus;
  steps: FunnelStep[];
  createdAt: number;
  updatedAt: number;
}

function read(): Funnel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FUNNELS_KEY);
    return raw ? (JSON.parse(raw) as Funnel[]) : [];
  } catch {
    return [];
  }
}

function write(funnels: Funnel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listFunnels(): Funnel[] {
  return read();
}

export function getFunnel(id: string): Funnel | undefined {
  return read().find((f) => f.id === id);
}

export function saveFunnel(funnel: Funnel) {
  const funnels = read();
  const idx = funnels.findIndex((f) => f.id === funnel.id);
  const updated = { ...funnel, updatedAt: Date.now() };
  if (idx >= 0) funnels[idx] = updated;
  else funnels.push(updated);
  write(funnels);
}

export function createFunnel(
  partial: Omit<Funnel, "id" | "createdAt" | "updatedAt">
): Funnel {
  const funnel: Funnel = {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const funnels = read();
  funnels.push(funnel);
  write(funnels);
  return funnel;
}

export function deleteFunnel(id: string) {
  write(read().filter((f) => f.id !== id));
}

export function setFunnelStatus(id: string, status: FunnelStatus) {
  const funnels = read();
  const idx = funnels.findIndex((f) => f.id === id);
  if (idx < 0) return;
  funnels[idx] = { ...funnels[idx], status, updatedAt: Date.now() };
  write(funnels);
}

// ── Tracking ──────────────────────────────────────────────────────────────────

function getSessionKey(funnelId: string): string {
  return `${SESSION_PREFIX}${funnelId}`;
}

export function recordFunnelStep(funnelId: string, stepId: string) {
  const funnels = read();
  const idx = funnels.findIndex((f) => f.id === funnelId);
  if (idx < 0) return;

  const funnel = funnels[idx];
  const stepIdx = funnel.steps.findIndex((s) => s.id === stepId);
  if (stepIdx < 0) return;

  // Prevent double-counting per session
  const key = getSessionKey(funnelId);
  const seen = new Set<string>(
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem(key) ?? "[]") as string[]
      : []
  );
  if (seen.has(stepId)) return;
  seen.add(stepId);
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify([...seen]));
  }

  funnel.steps[stepIdx].stats.reached++;
  // Mark "completed" for all previous steps if they're seen for first time
  if (stepIdx > 0) {
    const prevStep = funnel.steps[stepIdx - 1];
    if (seen.has(prevStep.id)) {
      funnel.steps[stepIdx - 1].stats.completed++;
    }
  }
  write(funnels);
}

// Check current URL against all active funnels and record step visits
export function matchAndRecord(pathname: string) {
  const funnels = read().filter((f) => f.status === "active");
  for (const funnel of funnels) {
    for (const step of funnel.steps) {
      if (pathname === step.path || pathname.startsWith(step.path + "/")) {
        recordFunnelStep(funnel.id, step.id);
      }
    }
  }
}

// Compute drop-off rate for a funnel
export function funnelConversionRate(funnel: Funnel): number {
  if (!funnel.steps.length) return 0;
  const first = funnel.steps[0].stats.reached;
  const last = funnel.steps[funnel.steps.length - 1].stats.reached;
  if (first === 0) return 0;
  return Math.round((last / first) * 100);
}

export function onFunnelsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
