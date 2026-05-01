// GET /api/portal/analytics/[orgId]?days=30 — aggregated summary
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSummary } from "@/portal/server/analytics";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const days = Math.max(1, Math.min(365, Number(req.nextUrl.searchParams.get("days") ?? 30)));
  const endMs = Date.now();
  const startMs = endMs - days * 24 * 60 * 60 * 1000;
  return NextResponse.json({ ok: true, summary: getSummary({ orgId, startMs, endMs }) });
}
