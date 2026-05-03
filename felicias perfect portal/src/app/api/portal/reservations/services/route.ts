// GET  /api/portal/reservations/services?orgId=...
// POST /api/portal/reservations/services
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listServices, createService } from "@/portal/server/reservations";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, services: listServices(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; name?: string; description?: string;
    durationMinutes?: number; price?: number; currency?: string;
    resourceIds?: string[]; staffIds?: string[];
    bufferBeforeMinutes?: number; bufferAfterMinutes?: number;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name || !body.durationMinutes) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const svc = createService({
    orgId: body.orgId,
    name: body.name,
    description: body.description,
    durationMinutes: body.durationMinutes,
    price: body.price,
    currency: body.currency,
    resourceIds: body.resourceIds,
    staffIds: body.staffIds,
    bufferBeforeMinutes: body.bufferBeforeMinutes,
    bufferAfterMinutes: body.bufferAfterMinutes,
  });
  return NextResponse.json({ ok: true, service: svc });
}
