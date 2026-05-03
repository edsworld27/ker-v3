// GET /api/portal/memberships/tiers?orgId=...
// POST /api/portal/memberships/tiers — replace the tiers list
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listTiers, setTiers, type MembershipTier } from "@/portal/server/memberships";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, tiers: listTiers(orgId) });
}

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; tiers?: MembershipTier[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !Array.isArray(body.tiers)) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const before = listTiers(body.orgId);
  setTiers(body.orgId, body.tiers);
  recordAdminAction(actor, {
    category: "customers",
    action: `Updated membership tiers (${body.tiers.length})`,
    resourceLink: "/admin/memberships/tiers",
    diff: { tiers: { from: before.length, to: body.tiers.length } },
  });
  return NextResponse.json({ ok: true });
}
