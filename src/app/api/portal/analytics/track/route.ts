// POST /api/portal/analytics/track — receive one event from the browser.
//
// Public endpoint (no auth) — same model as Plausible/Fathom.
// Sampling and per-feature gating happens server-side via the
// Analytics plugin's config.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensureHydrated } from "@/portal/server/storage";
import { trackEvent, type AnalyticsEventType } from "@/portal/server/analytics";
import { recordStepVisit, isFunnelsPluginInstalled } from "@/portal/server/funnels";
import "@/portal/server/webhooks";
import "@/portal/server/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  orgId?: string;
  type?: AnalyticsEventType;
  name?: string;
  path?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
  referrer?: string;
}

function hashIp(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
             req.headers.get("x-real-ip") ?? "anon";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function deviceFromUA(ua: string): "desktop" | "tablet" | "mobile" {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/Mobile|iPhone|Android/.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.type || !body.path || !body.sessionId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  await ensureHydrated();

  const ua = req.headers.get("user-agent") ?? "";
  const result = trackEvent({
    orgId: body.orgId,
    type: body.type,
    name: body.name,
    path: body.path,
    sessionId: body.sessionId,
    visitorId: hashIp(req),
    payload: body.payload,
    country: req.headers.get("x-vercel-ip-country") ?? undefined,
    device: deviceFromUA(ua),
    referrer: body.referrer,
    userAgent: ua,
  });

  // Funnel matching — every pageview attempts to advance any active
  // funnel for this org. No-op when the Funnels plugin isn't installed.
  if (body.type === "pageview" && isFunnelsPluginInstalled(body.orgId)) {
    try { recordStepVisit(body.orgId, body.path, body.sessionId); } catch { /* swallow */ }
  }

  return NextResponse.json({ ok: result.ok, reason: result.reason });
}
