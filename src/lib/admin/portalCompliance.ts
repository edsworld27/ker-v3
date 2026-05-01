"use client";

// Client-side compliance probe. Fetches the active mode + report from
// /api/portal/compliance and caches it in memory. Used by the team page
// (gates impersonation), the ImpersonationBar (auto-stop if mode flips),
// and any other admin surface that wants to hide non-compliant features.
//
// We refresh once per minute so a mode change in one tab propagates to
// other tabs within ~60s without needing a websocket.

import type { ComplianceMode, ComplianceSettings } from "@/portal/server/types";

interface ComplianceCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  fixHint?: string;
}

interface ComplianceResponse {
  ok: boolean;
  settings: ComplianceSettings;
  report: {
    mode: ComplianceMode;
    retentionDays: number;
    checks: ComplianceCheck[];
  };
}

const CHANGE_EVENT = "lk-compliance-change";
const REFRESH_MS = 60_000;

let cache: ComplianceResponse | null = null;
let pending: Promise<ComplianceResponse | null> | null = null;
let lastFetched = 0;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) {
    try { fn(); } catch {}
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export async function loadCompliance(force = false): Promise<ComplianceResponse | null> {
  if (!force && cache && Date.now() - lastFetched < REFRESH_MS) return cache;
  if (pending) return pending;
  pending = (async () => {
    try {
      const res = await fetch("/api/portal/compliance", { cache: "no-store" });
      if (!res.ok) return cache;
      const data = await res.json() as ComplianceResponse;
      cache = data;
      lastFetched = Date.now();
      notify();
      return data;
    } catch {
      return cache;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

export function getComplianceModeSync(): ComplianceMode {
  return cache?.report.mode ?? "none";
}

// True if straight customer impersonation is allowed under the active
// mode. HIPAA + SOC 2 disable it; GDPR + none allow it. The team page
// uses this to grey-out the Impersonate buttons; the ImpersonationBar
// uses it to auto-stop a session that's no longer compliant.
export function isImpersonationAllowedSync(): boolean {
  const mode = getComplianceModeSync();
  return !(mode === "hipaa" || mode === "soc2");
}

export function onComplianceChange(handler: () => void): () => void {
  listeners.add(handler);
  if (typeof window !== "undefined") window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    listeners.delete(handler);
    if (typeof window !== "undefined") window.removeEventListener(CHANGE_EVENT, handler);
  };
}
