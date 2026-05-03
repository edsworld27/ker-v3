import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getDashboard, setDashboard, resetDashboard, DEFAULT_DASHBOARD } from "@/portal/server/dashboards";
import type { DashboardWidget } from "@/portal/server/types";

// GET    /api/portal/dashboard/[orgId]   — current layout (default if unset)
// POST   /api/portal/dashboard/[orgId]   — { widgets } → save layout
// DELETE /api/portal/dashboard/[orgId]   — drop override; revert to default

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  return NextResponse.json({ ok: true, layout: getDashboard(orgId), defaultLayout: DEFAULT_DASHBOARD });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  let body: { widgets?: DashboardWidget[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!Array.isArray(body.widgets)) return NextResponse.json({ ok: false, error: "missing-widgets" }, { status: 400 });
  const layout = setDashboard(orgId, body.widgets);
  if (!layout) return NextResponse.json({ ok: false, error: "org-not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, layout });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const layout = resetDashboard(orgId);
  return NextResponse.json({ ok: true, layout });
}
