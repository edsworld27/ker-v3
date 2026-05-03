import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { updateMeeting } from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  let body: { status?: "requested" | "confirmed" | "completed" | "cancelled"; meetingUrl?: string; notes?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  const item = updateMeeting(id, body);
  if (!item) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}
