import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createGroup, listGroups } from "@/portal/server/splitTests";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const siteId = req.nextUrl.searchParams.get("siteId") ?? undefined;
  return NextResponse.json({ ok: true, groups: listGroups(siteId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { siteId?: string; name?: string; description?: string; trafficPercent?: number; stickyBy?: "visitor" | "session"; goalEvent?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.siteId || !body.name) return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  const group = createGroup({ siteId: body.siteId, name: body.name, description: body.description, trafficPercent: body.trafficPercent, stickyBy: body.stickyBy, goalEvent: body.goalEvent });
  return NextResponse.json({ ok: true, group });
}
