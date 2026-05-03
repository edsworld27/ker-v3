// DELETE /api/portal/reservations/staff/[id]?orgId=...
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { deleteStaff } from "@/portal/server/reservations";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  return NextResponse.json({ ok: deleteStaff(orgId, id) });
}
