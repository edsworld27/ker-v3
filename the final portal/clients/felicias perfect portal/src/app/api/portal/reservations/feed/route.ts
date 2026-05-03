// GET /api/portal/reservations/feed?orgId=...&token=...
//
// Public iCal feed for Google / Apple / Notion / Outlook subscribe.
// Token-gated so the feed URL doubles as a shareable secret —
// rotating the token invalidates outstanding subscriptions.
//
// Note: lives at /feed (not /calendar.ics) because Turbopack treats
// dot-containing route segments as static asset paths under some
// conditions. Calendar clients honour Content-Type: text/calendar
// regardless of URL extension.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { generateIcalFeed, verifyFeedToken } from "@/portal/server/calendar";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId");
  const token = req.nextUrl.searchParams.get("token");
  if (!orgId || !token) {
    return NextResponse.json({ ok: false, error: "missing-params" }, { status: 400 });
  }
  if (!verifyFeedToken(orgId, token)) {
    return NextResponse.json({ ok: false, error: "invalid-token" }, { status: 403 });
  }
  const ics = generateIcalFeed(orgId);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=\"aqua-calendar.ics\"",
      // Tell calendar clients to refresh ~hourly. Apple respects
      // X-PUBLISHED-TTL inside the body too; this header is a hint.
      "Cache-Control": "max-age=3600, must-revalidate",
    },
  });
}
