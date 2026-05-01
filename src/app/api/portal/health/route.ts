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
      content: true,              // GET/POST /api/portal/content/[siteId]
      manifest: true,             // GET/POST /api/portal/schema/[siteId] (D-1)
      embeds: true,               // GET/POST /api/portal/embeds/[siteId] (D-5)
      settings: true,             // /admin/portal-settings (GitHub + DB backend + deployment, D-4-prep)
      workflow: true,             // draft/publish/preview/history on content overrides (D-2)
      promote: true,              // POST /api/portal/promote/[siteId] opens a PR (D-3)
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
