// GET  /api/portal/funnels?orgId=...
// POST /api/portal/funnels
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listFunnels, createFunnel, type FunnelStep } from "@/portal/server/funnels";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, funnels: listFunnels(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; name?: string; description?: string;
    steps?: Array<Omit<FunnelStep, "id" | "reached" | "completed">>;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const f = createFunnel({
    orgId: body.orgId,
    name: body.name,
    description: body.description,
    steps: body.steps,
  });
  return NextResponse.json({ ok: true, funnel: f });
}
