// PATCH  /api/portal/webhooks/[id]  — enable/disable
// DELETE /api/portal/webhooks/[id]?orgId=... — delete

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { setWebhookEnabled, deleteWebhook } from "@/portal/server/webhooks";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  let body: { orgId?: string; enabled?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || typeof body.enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  setWebhookEnabled(body.orgId, id, body.enabled);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const removed = deleteWebhook(orgId, id);
  return NextResponse.json({ ok: removed });
}
