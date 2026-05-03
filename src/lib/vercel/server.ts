// Server-only Vercel API client.
//
// Required env vars to actually attach domains to a Vercel project:
//   VERCEL_TOKEN=<scope: domain-attach access>      bearer token
//   VERCEL_PROJECT_ID=<prj_…>                       project to attach to
//   VERCEL_TEAM_ID=<team_…>                         optional, only for team scope
//
// Without VERCEL_TOKEN every method throws a descriptive error so the
// UI can render the existing manual-DNS instructions. The Vercel REST
// API is plain JSON — no SDK dependency.
//
// Reference: https://vercel.com/docs/rest-api/endpoints/projects#add-a-domain

import "server-only";

const API_BASE = "https://api.vercel.com";

function token(): string {
  const t = process.env.VERCEL_TOKEN;
  if (!t) {
    throw new Error(
      "VERCEL_TOKEN is not set. Add it in your env to enable auto-attach. " +
      "Without it, manual DNS instructions still apply.",
    );
  }
  return t;
}

function projectId(): string {
  const p = process.env.VERCEL_PROJECT_ID;
  if (!p) {
    throw new Error("VERCEL_PROJECT_ID is not set. Find it in Vercel → Project Settings → General.");
  }
  return p;
}

function teamScope(): string {
  const team = process.env.VERCEL_TEAM_ID;
  return team ? `?teamId=${encodeURIComponent(team)}` : "";
}

interface VercelDomainResponse {
  name: string;
  verified: boolean;
  // Stored on the domain when Vercel detects DNS misconfiguration —
  // we return these to the operator verbatim so they can fix the
  // exact records.
  verification?: Array<{
    type: string;       // "TXT", "CNAME", …
    domain: string;
    value: string;
    reason?: string;
  }>;
  // Surfaced on conflict / already-attached responses.
  error?: { code: string; message: string };
}

export interface AttachDomainResult {
  ok: boolean;
  verified: boolean;
  domain: string;
  // DNS rows the operator must add at their registrar to make Vercel
  // happy. Empty when verified === true.
  pending: Array<{ type: string; name: string; value: string; reason?: string }>;
  error?: string;
}

async function call(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}${teamScope()}`, {
    ...init,
    headers: {
      "authorization": `Bearer ${token()}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

function normaliseDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

export async function attachDomain(rawDomain: string): Promise<AttachDomainResult> {
  const domain = normaliseDomain(rawDomain);
  if (!domain) {
    return { ok: false, verified: false, domain: "", pending: [], error: "missing-domain" };
  }
  const res = await call(`/v10/projects/${encodeURIComponent(projectId())}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
  const data = await res.json() as VercelDomainResponse;

  // 409 = already attached to this project — that's effectively a
  // success for the operator's intent. Anything else 4xx-5xx is an
  // error we surface verbatim.
  const alreadyAttached = res.status === 409 || data.error?.code === "domain_already_in_use";
  if (!res.ok && !alreadyAttached) {
    return {
      ok: false,
      verified: false,
      domain,
      pending: [],
      error: data.error?.message ?? `Vercel ${res.status}`,
    };
  }

  return {
    ok: true,
    verified: !!data.verified,
    domain: data.name ?? domain,
    pending: (data.verification ?? []).map(v => ({
      type: v.type,
      name: v.domain,
      value: v.value,
      reason: v.reason,
    })),
  };
}

export async function removeDomain(rawDomain: string): Promise<{ ok: boolean; error?: string }> {
  const domain = normaliseDomain(rawDomain);
  if (!domain) return { ok: false, error: "missing-domain" };
  const res = await call(`/v9/projects/${encodeURIComponent(projectId())}/domains/${encodeURIComponent(domain)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let message = `Vercel ${res.status}`;
    try {
      const data = await res.json() as VercelDomainResponse;
      if (data.error?.message) message = data.error.message;
    } catch { /* keep status fallback */ }
    return { ok: false, error: message };
  }
  return { ok: true };
}

export async function verifyDomain(rawDomain: string): Promise<AttachDomainResult> {
  const domain = normaliseDomain(rawDomain);
  if (!domain) {
    return { ok: false, verified: false, domain: "", pending: [], error: "missing-domain" };
  }
  const res = await call(
    `/v9/projects/${encodeURIComponent(projectId())}/domains/${encodeURIComponent(domain)}/verify`,
    { method: "POST" },
  );
  const data = await res.json() as VercelDomainResponse;
  if (!res.ok) {
    return {
      ok: false,
      verified: false,
      domain,
      pending: [],
      error: data.error?.message ?? `Vercel ${res.status}`,
    };
  }
  return {
    ok: true,
    verified: !!data.verified,
    domain: data.name ?? domain,
    pending: (data.verification ?? []).map(v => ({
      type: v.type,
      name: v.domain,
      value: v.value,
      reason: v.reason,
    })),
  };
}

export function isConfigured(): boolean {
  return !!process.env.VERCEL_TOKEN && !!process.env.VERCEL_PROJECT_ID;
}
