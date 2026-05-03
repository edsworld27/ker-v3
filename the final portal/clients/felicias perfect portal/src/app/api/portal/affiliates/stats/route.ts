// GET /api/portal/affiliates/stats?orgId=...
//
// Returns per-affiliate rollups (clicks / conversions / earned / paid /
// conversion rate) plus program-wide totals so the stats page can render
// without a per-affiliate fan-out fetch.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listAffiliates, affiliateStats } from "@/portal/server/affiliates";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const affiliates = listAffiliates(orgId);

  const rows = affiliates.map(a => ({
    id: a.id,
    name: a.name,
    code: a.code,
    email: a.email,
    status: a.status,
    commissionRate: a.commissionRate,
    ...affiliateStats(orgId, a.id),
  }));

  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
      earned: acc.earned + r.totalEarned,
      paid: acc.paid + r.totalPaid,
    }),
    { clicks: 0, conversions: 0, earned: 0, paid: 0 },
  );

  return NextResponse.json({
    ok: true,
    rows,
    totals: {
      ...totals,
      affiliates: rows.length,
      approved: rows.filter(r => r.status === "approved").length,
      conversionRate: totals.clicks === 0 ? 0 : (totals.conversions / totals.clicks) * 100,
      outstanding: totals.earned - totals.paid,
    },
  });
}
