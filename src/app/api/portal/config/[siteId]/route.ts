import { NextRequest, NextResponse } from "next/server";
import { getPublicConfig, setConfig, getConfig } from "@/portal/server/tracking";
import type { Tracker } from "@/portal/server/types";

// GET  /api/portal/config/[siteId]   — public, CORS-open. Returns the
//                                       projection the loader needs.
// POST /api/portal/config/[siteId]   — same-origin only. Admin saves
//                                       full config (any-origin POSTs are
//                                       rejected by the lack of CORS
//                                       Allow-Origin echo).

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=30, s-maxage=30",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  // ?admin=1 returns the full config (used by the admin UI). The default
  // is the loader projection — narrower payload, only enabled trackers.
  const wantsAdmin = new URL(req.url).searchParams.get("admin") === "1";
  const body = wantsAdmin ? getConfig(siteId) : getPublicConfig(siteId);
  return NextResponse.json(body, { headers: corsHeaders });
}

// Admin-side save. Accepts the FULL config (so the admin can replace
// the tracker list atomically). No CORS headers — same-origin only.
export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const input = body as Partial<{ requireConsent: boolean; trackers: Tracker[] }>;
  const trackers: Tracker[] = Array.isArray(input.trackers)
    ? input.trackers.filter(isTracker).map(normaliseTracker)
    : getConfig(siteId).trackers;
  const saved = setConfig(siteId, {
    requireConsent: typeof input.requireConsent === "boolean" ? input.requireConsent : undefined,
    trackers,
  });
  return NextResponse.json({ ok: true, config: saved });
}

function isTracker(t: unknown): t is Tracker {
  if (!t || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  return typeof o.id === "string"
    && typeof o.provider === "string"
    && typeof o.value === "string"
    && typeof o.consentCategory === "string"
    && typeof o.enabled === "boolean";
}

function normaliseTracker(t: Tracker): Tracker {
  return {
    id: t.id,
    provider: t.provider,
    enabled: !!t.enabled,
    consentCategory: t.consentCategory,
    value: t.value.trim(),
    label: t.label?.trim() || undefined,
  };
}
