// POST /api/stripe/webhook
//
// Stripe → us. Handles checkout.session.completed (the moment payment clears)
// and writes a record to the orders store.
//
// Set up:
//   1. In the Stripe dashboard, add a webhook endpoint pointing at
//      https://<your-domain>/api/stripe/webhook
//   2. Subscribe to: checkout.session.completed, charge.refunded
//   3. Copy the signing secret into STRIPE_WEBHOOK_SECRET
//
// Local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
// — that command prints a `whsec_...` secret you paste into .env.local.

import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/server";

export const runtime = "nodejs";

// Stripe needs the raw body for signature verification — Next.js gives us
// req.text() which preserves bytes.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const raw = await req.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = await constructWebhookEvent(raw, signature);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature.";
    console.error("[stripe/webhook] signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Note: orders.ts is a "use client" localStorage scaffold — it can't run
  // here. Once you wire Supabase, replace this console.log block with the DB
  // insert: orders.insert({ id, customer_email, items, total, status: 'paid', ... }).
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.info("[stripe/webhook] checkout.session.completed", {
        id: session.id,
        amount_total: session.amount_total,
        customer_email: session.customer_details?.email,
        payment_intent: session.payment_intent,
      });
      // TODO Database: insert order row from session.line_items + customer_details
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      console.info("[stripe/webhook] charge.refunded", { id: charge.id, amount: charge.amount_refunded });
      // TODO Database: update orders.status = 'refunded' where payment_intent = charge.payment_intent
      break;
    }
    default:
      // Acknowledge — Stripe re-delivers if we 4xx/5xx.
      console.info("[stripe/webhook] unhandled", event.type);
  }

  return NextResponse.json({ received: true });
}
