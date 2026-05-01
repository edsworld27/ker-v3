// GET  /api/portal/reservations?orgId=...&resourceId=...
// POST /api/portal/reservations  — create a booking (public)
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listBookings, createBooking } from "@/portal/server/reservations";
import "@/portal/server/webhooks";
import "@/portal/server/notifications";

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
    orgId?: string; resourceId?: string; serviceId?: string; staffId?: string;
    startMs?: number; partySize?: number;
    customerName?: string; customerEmail?: string;
    customerPhone?: string; notes?: string;
    source?: "storefront" | "admin" | "external-ical";
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.resourceId || !body.startMs || !body.customerName || !body.customerEmail) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const result = createBooking({
    orgId: body.orgId,
    resourceId: body.resourceId,
    serviceId: body.serviceId,
    staffId: body.staffId,
    startMs: body.startMs,
    partySize: body.partySize,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    notes: body.notes,
    source: body.source ?? "storefront",
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, booking: result.booking });
}
