import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listReports, runAudit } from "@/portal/server/audit";

// GET  /api/portal/audit/[siteId]?orgId=… — history for this site
// POST /api/portal/audit/[siteId]
//      body: { orgId, url, strategy?: "mobile" | "desktop" }
//      Runs PageSpeed Insights, normalises findings, optionally fires the
//      Anthropic formatter in the background. Honours per-org free quota.

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
  return NextResponse.json({ ok: true, reports: listReports(orgId, siteId) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: { orgId?: string; url?: string; strategy?: "mobile" | "desktop" };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId || !body.url) return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  try {
    const report = await runAudit({ orgId: body.orgId, siteId, url: body.url, strategy: body.strategy });
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
