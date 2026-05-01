// GET  /api/portal/reservations?orgId=...&resourceId=...
// POST /api/portal/reservations  — create a booking (public)
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listBookings, createBooking } from "@/portal/server/reservations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const resourceId = req.nextUrl.searchParams.get("resourceId") ?? undefined;
  return NextResponse.json({ ok: true, bookings: listBookings(orgId, resourceId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: {
    orgId?: string; resourceId?: string; startMs?: number;
    partySize?: number; customerName?: string; customerEmail?: string;
    customerPhone?: string; notes?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.resourceId || !body.startMs || !body.customerName || !body.customerEmail) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const result = createBooking({
    orgId: body.orgId,
    resourceId: body.resourceId,
    startMs: body.startMs,
    partySize: body.partySize,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    notes: body.notes,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, booking: result.booking });
}
