import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  getDiscoveries, confirmDiscovery, dismissDiscovery, runDiscovery,
} from "@/portal/server/discovery";

// GET    /api/portal/discoveries
//   List all auto-discovery records, freshest first.
// POST   /api/portal/discoveries
//   Body: { host: string, action: "confirm" | "dismiss" | "rerun" }
//
// Same-origin only. Confirm/dismiss flips a discovery's status; rerun
// forces a fresh probe (used by the admin if creds were just added).

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({ ok: true, discoveries: getDiscoveries() });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { host?: string; action?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.host || typeof body.host !== "string") {
    return NextResponse.json({ ok: false, error: "missing-host" }, { status: 400 });
  }

  switch (body.action) {
    case "confirm": {
      const d = confirmDiscovery(body.host);
      if (!d) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
      return NextResponse.json({ ok: true, discovery: d });
    }
    case "dismiss": {
      const d = dismissDiscovery(body.host);
      if (!d) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
      return NextResponse.json({ ok: true, discovery: d });
    }
    case "rerun": {
      // Wipe the existing record by dismissing then re-running so
      // runDiscovery sees a clean slate.
      dismissDiscovery(body.host);
      const d = await runDiscovery(body.host);
      return NextResponse.json({ ok: true, discovery: d });
    }
    default:
      return NextResponse.json({ ok: false, error: `Unknown action "${body.action}"` }, { status: 400 });
  }
}
