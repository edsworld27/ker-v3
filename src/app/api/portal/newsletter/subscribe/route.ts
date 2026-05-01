// POST /api/portal/newsletter/subscribe — newsletter opt-in.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { subscribe } from "@/portal/server/newsletter";
import { emit } from "@/portal/server/eventBus";
import "@/portal/server/webhooks";

export const dynamic = "force-dynamic";

interface Body { orgId?: string; email?: string; source?: string }

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.email) return NextResponse.json({ ok: false, error: "missing-email" }, { status: 400 });

  await ensureHydrated();
  const orgId = body.orgId ?? "agency";
  const sub = subscribe(orgId, body.email, body.source ?? "newsletter-block");
  emit(orgId, "newsletter.subscribed", { email: sub.email, source: sub.source });
  return NextResponse.json({ ok: true, subscribedAt: sub.subscribedAt });
}
