import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createFeatureRequest, listFeatureRequests } from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
  return NextResponse.json({ ok: true, items: listFeatureRequests(orgId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { orgId?: string; title?: string; body?: string; priority?: "low" | "medium" | "high" | "urgent"; submittedBy?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId || !body.title || !body.body) return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  const item = createFeatureRequest({ orgId: body.orgId, title: body.title, body: body.body, priority: body.priority, submittedBy: body.submittedBy });
  return NextResponse.json({ ok: true, item });
}
