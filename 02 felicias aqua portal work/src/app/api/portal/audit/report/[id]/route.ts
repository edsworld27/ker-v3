import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { formatReportWithLLM, getReport } from "@/portal/server/audit";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const report = getReport(id);
  if (!report) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, report });
}

// POST regenerates the LLM-formatted markdown (e.g. after the admin
// adds an Anthropic key without re-running PageSpeed).
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const report = await formatReportWithLLM(id);
  if (!report) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, report });
}
