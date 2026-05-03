// GET  /api/portal/affiliates/payouts?orgId=...&affiliateId=...
// POST /api/portal/affiliates/payouts
//   { orgId, affiliateId, amount, currency?, method?, reference?, note? }
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPayouts, recordPayout } from "@/portal/server/affiliates";
import { requireAdmin } from "@/lib/server/auth";

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
  try { await requireAdmin(); }
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
  return NextResponse.json(result);
}
