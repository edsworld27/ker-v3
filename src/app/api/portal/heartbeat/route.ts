import { NextRequest, NextResponse } from "next/server";
import { record } from "@/portal/server/heartbeats";

// POST /api/portal/heartbeat
// Ingests a heartbeat from an external site running /portal/tag.js. Open to
// any origin — the body carries no secrets, only the site ID the admin
// minted and the page they're on.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  // sendBeacon posts as text/plain (we choose that to avoid a preflight) so
  // we always read the body as text and JSON.parse it ourselves.
  let body: unknown;
  try {
    const text = await req.text();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400, headers: corsHeaders });
  }

  const beat = body as Partial<{
    siteId: string; event: string; url: string; title: string; referrer: string;
  }>;

  if (!beat.siteId || typeof beat.siteId !== "string") {
    return NextResponse.json({ ok: false, error: "missing-siteId" }, { status: 400, headers: corsHeaders });
  }

  const recorded = record({
    siteId: beat.siteId,
    event: typeof beat.event === "string" ? beat.event : undefined,
    url: typeof beat.url === "string" ? beat.url : undefined,
    title: typeof beat.title === "string" ? beat.title : undefined,
    referrer: typeof beat.referrer === "string" ? beat.referrer : undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(
    { ok: true, lastSeenAt: recorded.lastSeenAt, beats: recorded.beats },
    { headers: corsHeaders },
  );
}
