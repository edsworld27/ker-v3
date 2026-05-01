import { NextResponse } from "next/server";

// GET /api/portal/health
// Basic liveness probe + capability map. Use this to feature-detect which
// portal endpoints have been wired up server-side.

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    ok: true,
    portal: "ker-v3",
    version: 1,
    ts: Date.now(),
    capabilities: {
      // Server-readable today
      products: true,
      tag: true,                  // /portal/tag.js loader + heartbeat
      heartbeat: true,            // POST /api/portal/heartbeat
      tracking: true,             // GET/POST /api/portal/config/[siteId]
      // Client-only (localStorage) — exposed via portal module imports but
      // not yet via HTTP. Need DB persistence first.
      orders: false,
      customers: false,
      theme: false,
      pages: false,
      flags: false,
      activity: false,
    },
  });
}
