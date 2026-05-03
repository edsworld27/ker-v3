// POST /api/donations/checkout — start a Stripe Checkout session
// for a donation. Public endpoint; the visitor doesn't need an
// account.
//
// Body: { amount, currency, recurring?, goalId?, donorEmail?, donorName?, anonymous?, message?, giftAid? }

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { recordDonation } from "@/portal/server/donations";
import { emit } from "@/portal/server/eventBus";
import "@/portal/server/webhooks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  orgId?: string;
  amount?: number;
  currency?: string;
  recurring?: boolean;
  goalId?: string;
  donorEmail?: string;
  donorName?: string;
  anonymous?: boolean;
  message?: string;
  giftAid?: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ ok: false, error: "missing-amount" }, { status: 400 });
  }

  await ensureHydrated();
  const orgId = body.orgId ?? "agency";
  const currency = (body.currency ?? "GBP").toLowerCase();
  const amount = Math.round(body.amount * 100); // major → minor units

  // Record a pending donation immediately so the operator sees the
  // attempt even before Stripe confirms. The Stripe webhook will
  // upgrade status to "completed".
  const donation = recordDonation({
    orgId,
    donorEmail: body.donorEmail ?? "anonymous@aqua.local",
    donorName: body.anonymous ? undefined : body.donorName,
    amount,
    currency,
    recurring: body.recurring ?? false,
    giftAid: body.giftAid ?? false,
    anonymous: body.anonymous ?? false,
    message: body.message,
    goalId: body.goalId,
  });

  emit(orgId, "form.submitted", {
    formName: "donation",
    fields: {
      amount: String(body.amount),
      currency,
      recurring: String(body.recurring ?? false),
      goalId: body.goalId ?? "",
    },
  });

  // In production this would create an actual Stripe Checkout
  // session — for now we return a stub URL that the donation
  // button can redirect to (which would land on a thank-you page
  // until Stripe is wired). The recordDonation above means the
  // operator's admin dashboard already reflects the intent.
  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/donate/thanks?id=${donation.id}`;
  return NextResponse.json({ ok: true, donationId: donation.id, url: successUrl });
}
