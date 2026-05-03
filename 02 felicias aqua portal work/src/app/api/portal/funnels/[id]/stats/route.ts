// GET    /api/portal/funnels/[id]/stats?orgId=...
// DELETE /api/portal/funnels/[id]/stats?orgId=...  — reset counters
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { funnelStats, resetFunnelStats } from "@/portal/server/funnels";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const stats = funnelStats(orgId, id);
  if (!stats) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, stats });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  resetFunnelStats(orgId, id);
  return NextResponse.json({ ok: true });
}
