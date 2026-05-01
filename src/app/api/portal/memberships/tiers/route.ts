// GET /api/portal/memberships/tiers?orgId=...
// POST /api/portal/memberships/tiers — replace the tiers list
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listTiers, setTiers, type MembershipTier } from "@/portal/server/memberships";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, tiers: listTiers(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; tiers?: MembershipTier[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !Array.isArray(body.tiers)) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  setTiers(body.orgId, body.tiers);
  return NextResponse.json({ ok: true });
}
