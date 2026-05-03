// GET    /api/portal/memberships?orgId=...&includeCancelled=1
// POST   /api/portal/memberships          { orgId, email, name?, tierId, expiresAt? }
// DELETE /api/portal/memberships?orgId=...&email=...   (cancels membership)
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  listMembers, upsertMember, cancelMembership, getTier,
} from "@/portal/server/memberships";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const includeCancelled = req.nextUrl.searchParams.get("includeCancelled") === "1";
  return NextResponse.json({ ok: true, members: listMembers(orgId, includeCancelled) });
}

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; email?: string; name?: string;
    tierId?: string; expiresAt?: number;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.email || !body.tierId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const tier = getTier(body.orgId, body.tierId);
  if (!tier) {
    return NextResponse.json({ ok: false, error: "unknown-tier" }, { status: 400 });
  }

  const member = upsertMember({
    orgId: body.orgId,
    email: body.email,
    name: body.name,
    tierId: body.tierId,
    expiresAt: body.expiresAt,
  });
  recordAdminAction(actor, {
    category: "customers",
    action: `Set membership tier "${tier.name}" for ${body.email}`,
    resourceId: member.id,
    resourceLink: `/admin/customers/${encodeURIComponent(body.email)}`,
  });
  return NextResponse.json({ ok: true, member });
}

export async function DELETE(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const orgId = req.nextUrl.searchParams.get("orgId");
  const email = req.nextUrl.searchParams.get("email");
  if (!orgId || !email) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const cancelled = cancelMembership(orgId, email);
  if (cancelled) {
    recordAdminAction(actor, {
      category: "customers",
      action: `Cancelled membership for ${email}`,
      resourceLink: `/admin/customers/${encodeURIComponent(email)}`,
    });
  }
  return NextResponse.json({ ok: cancelled, cancelled });
}
