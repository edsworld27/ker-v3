import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createMeeting, listMeetings } from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
  return NextResponse.json({ ok: true, items: listMeetings(orgId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { orgId?: string; topic?: string; preferredDates?: string[]; notes?: string; contactEmail?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId || !body.topic || !Array.isArray(body.preferredDates) || body.preferredDates.length === 0) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const item = createMeeting({ orgId: body.orgId, topic: body.topic, preferredDates: body.preferredDates, notes: body.notes, contactEmail: body.contactEmail });
  return NextResponse.json({ ok: true, item });
}
