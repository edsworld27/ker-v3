// GET  /api/portal/reservations/resources?orgId=...
// POST /api/portal/reservations/resources  — create one (admin)
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listResources, createResource, type AvailabilityWindow } from "@/portal/server/reservations";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, resources: listResources(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; name?: string; description?: string;
    capacity?: number; durationMinutes?: number;
    availability?: AvailabilityWindow[];
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const r = createResource({
    orgId: body.orgId,
    name: body.name,
    description: body.description,
    capacity: body.capacity,
    durationMinutes: body.durationMinutes,
    availability: body.availability,
  });
  return NextResponse.json({ ok: true, resource: r });
}
