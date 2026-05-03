// GET /api/portal/orders/[id] — public order lookup (read-only, by id).
//
// Used by /account/orders/[id] (linked from confirmation emails) so a
// customer can see their order without an account. Doesn't require
// auth because the id is already a hard-to-guess random token; we
// also don't return PII beyond what the customer themselves supplied
// at checkout.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getServerOrder } from "@/portal/server/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const order = getServerOrder(id);
  if (!order) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  // Strip metadata (could contain internal fields) and paymentIntentId
  // (operational reference, not for the customer).
  const { paymentIntentId, metadata, ...safe } = order;
  void paymentIntentId; void metadata;
  return NextResponse.json({ ok: true, order: safe });
}
