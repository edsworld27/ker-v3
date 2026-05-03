// GET /api/portal/donations?orgId=...               → { stats }
// GET /api/portal/donations?orgId=...&donations=1   → { stats, donations[] }
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { donorStats, listDonations } from "@/portal/server/donations";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const includeDonations = req.nextUrl.searchParams.get("donations") === "1";
  return NextResponse.json({
    ok: true,
    stats: donorStats(orgId),
    ...(includeDonations ? { donations: listDonations(orgId) } : {}),
  });
}
