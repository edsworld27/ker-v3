// GET  /api/portal/reservations/external?orgId=...
// POST /api/portal/reservations/external — add a feed
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listExternalFeeds, addExternalFeed } from "@/portal/server/calendar";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, feeds: listExternalFeeds(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; url?: string; label?: string; resourceId?: string; staffId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.url || !body.label || !body.resourceId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    feed: addExternalFeed({
      orgId: body.orgId,
      url: body.url,
      label: body.label,
      resourceId: body.resourceId,
      staffId: body.staffId,
    }),
  });
}
