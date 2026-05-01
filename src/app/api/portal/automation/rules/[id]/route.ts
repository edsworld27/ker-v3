// PATCH /api/portal/automation/rules/[id]  — enable/disable
// DELETE /api/portal/automation/rules/[id]
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { setRuleEnabled, deleteRule } from "@/portal/server/automation";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  let body: { orgId?: string; enabled?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || typeof body.enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  setRuleEnabled(body.orgId, id, body.enabled);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  return NextResponse.json({ ok: deleteRule(orgId, id) });
}
