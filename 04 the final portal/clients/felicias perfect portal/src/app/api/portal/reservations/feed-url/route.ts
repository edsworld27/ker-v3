// GET /api/portal/reservations/feed-url?orgId=...
// Returns the absolute calendar.ics URL the operator can paste into
// Google / Apple / Notion / Outlook to subscribe.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrCreateFeedToken, rotateFeedToken } from "@/portal/server/calendar";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const token = getOrCreateFeedToken(orgId);
  const origin = req.headers.get("x-forwarded-proto") && req.headers.get("host")
    ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = `${origin}/api/portal/reservations/feed?orgId=${encodeURIComponent(orgId)}&token=${token}`;
  return NextResponse.json({ ok: true, url });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  let body: { orgId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  return NextResponse.json({ ok: true, token: rotateFeedToken(body.orgId) });
}
