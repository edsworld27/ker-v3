// GET  /api/portal/affiliates/payouts?orgId=...&affiliateId=...
// POST /api/portal/affiliates/payouts
//   { orgId, affiliateId, amount, currency?, method?, reference?, note? }
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPayouts, recordPayout, listAffiliates } from "@/portal/server/affiliates";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const affiliateId = req.nextUrl.searchParams.get("affiliateId") ?? undefined;
  return NextResponse.json({ ok: true, payouts: listPayouts(orgId, affiliateId) });
}

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; affiliateId?: string; amount?: number;
    currency?: string; method?: "manual" | "stripe-connect" | "paypal";
    reference?: string; note?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.affiliateId || typeof body.amount !== "number") {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const result = recordPayout({
    orgId: body.orgId,
    affiliateId: body.affiliateId,
    amount: body.amount,
    currency: body.currency,
    method: body.method,
    reference: body.reference,
    note: body.note,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  const aff = listAffiliates(body.orgId).find(a => a.id === body.affiliateId);
  recordAdminAction(actor, {
    category: "marketing",
    action: `Recorded ${(body.amount / 100).toFixed(2)} ${body.currency ?? "GBP"} payout to ${aff?.name ?? body.affiliateId} via ${result.payout.method}`,
    resourceId: result.payout.id,
    resourceLink: "/admin/affiliates/payouts",
  });
  return NextResponse.json(result);
}
