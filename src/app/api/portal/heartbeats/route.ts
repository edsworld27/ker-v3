import { NextResponse } from "next/server";
import { list } from "@/portal/server/heartbeats";
import { ensureHydrated } from "@/portal/server/storage";

// GET /api/portal/heartbeats
// Same-origin only — used by the admin UI to render connection status.
// State is in-memory per server instance, so a fleet of serverless workers
// will each return their own slice; the admin polls and unions client-side.

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  const heartbeats = list();
  const now = Date.now();
  return NextResponse.json({
    ok: true,
    count: heartbeats.length,
    serverNow: now,
    heartbeats,
  });
}
