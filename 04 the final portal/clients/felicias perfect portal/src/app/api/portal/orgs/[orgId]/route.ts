import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrg, updateOrg, deleteOrg } from "@/portal/server/orgs";
import type { OrgRecord, OrgStatus } from "@/portal/server/types";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const org = getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, org });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;
  let body: Partial<OrgRecord>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const allowed: Partial<OrgRecord> = {};
  if (typeof body.name === "string") allowed.name = body.name;
  if (typeof body.slug === "string") allowed.slug = body.slug;
  if (typeof body.ownerEmail === "string") allowed.ownerEmail = body.ownerEmail;
  if (typeof body.brandColor === "string") allowed.brandColor = body.brandColor;
  if (typeof body.logoUrl === "string") allowed.logoUrl = body.logoUrl;
  if (typeof body.status === "string" && (body.status === "active" || body.status === "suspended" || body.status === "trialing")) {
    allowed.status = body.status as OrgStatus;
  }
  if (typeof body.stripeCustomerId === "string") allowed.stripeCustomerId = body.stripeCustomerId;

  const saved = updateOrg(orgId, allowed);
  if (!saved) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, org: saved });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const ok = deleteOrg(orgId);
  if (!ok) return NextResponse.json({ ok: false, error: "cannot-delete" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
