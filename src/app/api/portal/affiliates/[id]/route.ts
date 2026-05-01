// PATCH /api/portal/affiliates/[id]  — change status
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { setAffiliateStatus } from "@/portal/server/affiliates";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  let body: { orgId?: string; status?: "pending" | "approved" | "suspended" };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.status) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  setAffiliateStatus(body.orgId, id, body.status);
  return NextResponse.json({ ok: true });
}
