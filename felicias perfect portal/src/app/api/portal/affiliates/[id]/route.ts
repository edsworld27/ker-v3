// PATCH /api/portal/affiliates/[id]  — change status
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { setAffiliateStatus, listAffiliates } from "@/portal/server/affiliates";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  let body: { orgId?: string; status?: "pending" | "approved" | "suspended" };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.status) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const before = listAffiliates(body.orgId).find(a => a.id === id);
  setAffiliateStatus(body.orgId, id, body.status);
  recordAdminAction(actor, {
    category: "marketing",
    action: `Set affiliate ${before?.name ?? id} status to ${body.status}`,
    resourceId: id,
    resourceLink: "/admin/affiliates",
    diff: before ? { status: { from: before.status, to: body.status } } : undefined,
  });
  return NextResponse.json({ ok: true });
}
