// PATCH  /api/portal/funnels/[id] — update name, description, status, steps
// DELETE /api/portal/funnels/[id]?orgId=...
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  updateFunnel, deleteFunnel, type Funnel,
} from "@/portal/server/funnels";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  let body: { orgId?: string } & Partial<Omit<Funnel, "id" | "orgId" | "createdAt">>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const { orgId, ...patch } = body;
  const f = updateFunnel(orgId, id, patch);
  return NextResponse.json({ ok: !!f, funnel: f });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  return NextResponse.json({ ok: deleteFunnel(orgId, id) });
}
