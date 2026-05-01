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
      backendSelector: true,      // PORTAL_BACKEND env switches storage; /api/portal/storage-info reports active (D-4)
      cloudArchitected: true,     // server-side storage + settings, async hydration, KV-ready (Cloud-1)
      compliance: true,           // /admin/compliance + GET/POST /api/portal/compliance (E-3)
      customerEdit: true,         // Edit-profile alternative + impersonation auto-stop on mode flip (E-4)
      autoDiscover: true,         // Vercel-driven site auto-discovery on first heartbeat (E-2)
      cloudAudit: true,           // server-side activity log with retention purge by compliance mode
      supabase: true,             // Supabase backend with auto-detected schema + inline migration SQL
      quickSetup: true,           // /admin/sites “Quick setup” → /admin/portal-settings checklist
      autoMigrate: true,          // POST /api/portal/migrate auto-applies schema via Supabase Management API
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
