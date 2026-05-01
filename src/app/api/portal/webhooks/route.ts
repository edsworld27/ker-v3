// GET  /api/portal/webhooks?orgId=...  — list webhooks for org
// POST /api/portal/webhooks            — create webhook

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listWebhooks, createWebhook } from "@/portal/server/webhooks";
import type { AquaEventName } from "@/portal/server/eventBus";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, webhooks: listWebhooks(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; url?: string; events?: string[]; description?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.url) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const wh = createWebhook({
    orgId: body.orgId,
    url: body.url,
    events: body.events as AquaEventName[],
    description: body.description,
  });
  return NextResponse.json({ ok: true, webhook: wh });
}
