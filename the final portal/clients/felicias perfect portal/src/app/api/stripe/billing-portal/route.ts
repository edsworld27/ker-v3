// POST /api/stripe/billing-portal
//
// Mints a one-shot Stripe billing-portal URL and returns it for the
// caller to redirect to. Two callers:
//
// 1. Customer-facing — signed-in customer clicks "Manage subscription"
//    on /account or /account/orders. Body: { returnUrl? }. We resolve
//    their Stripe customer via their session email.
// 2. Admin — operator on /admin/customers/[email] sends the customer
//    a portal link. Body: { customerEmail, returnUrl? }. Admin-gated.
//
// Either way the response is { url } and the client navigates.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createBillingPortalSession } from "@/lib/stripe/server";
import { getCurrentUserFromReq, requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureHydrated();

  let body: { customerEmail?: string; customerId?: string; returnUrl?: string };
  try { body = await req.json(); }
  catch { body = {}; }

  // Admin path — explicit customerEmail / customerId in the body. Must
  // be authenticated as an admin.
  if (body.customerEmail || body.customerId) {
    try { await requireAdmin(); }
    catch (r) { return r as Response; }
  } else {
    // Customer path — resolve from session.
    const user = await getCurrentUserFromReq(req);
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    body.customerEmail = user.email;
  }

  const origin = req.nextUrl.origin;
  const returnUrl = body.returnUrl ?? `${origin}/account`;

  try {
    const { url } = await createBillingPortalSession({
      customerId: body.customerId,
      customerEmail: body.customerEmail,
      returnUrl,
    });
    return NextResponse.json({ ok: true, url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "billing-portal-failed";
    // 502 — upstream Stripe failure / config gap. The error message is
    // operator-facing on the admin path and customer-facing on the
    // self-serve path; the strings from server.ts are intentionally
    // descriptive ("STRIPE_SECRET_KEY is not set", "No Stripe customer
    // found for …") rather than dressed up.
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
