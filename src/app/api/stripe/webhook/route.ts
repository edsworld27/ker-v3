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

/* ────────────────────────────────────────────────────────────────────────
 * E-commerce audit notes (T1 #7) — last reviewed 2026-05-01
 *
 *  1. Webhook idempotency  — FIXED. Module-level Set tracks processed
 *                            event ids; duplicates are 200-acked and skipped.
 *                            Survives a single instance for the lifetime of
 *                            the process; cluster-safe persistence is a DB
 *                            concern (see follow-up TODO below).
 *  2. Order atomicity      — PARTIAL. Order rows are written client-side on
 *                            /checkout/success from a localStorage stash
 *                            because the order store is "use client". This
 *                            webhook only logs and acks. Migrating to a real
 *                            DB requires the cloud-storage swap mentioned in
 *                            orders.ts.
 *  3. Confirmation email   — TODO. No transactional sender wired (Resend /
 *                            Postmark / Mailgun would be the candidates).
 *                            Stripe's own receipt is enabled out of the box
 *                            when `payment_intent_data.receipt_email` is set
 *                            or `customer_email` is collected, which it is.
 *                            That covers the basics for now.
 *  4. Inventory deduction  — PARTIAL. Reservation is committed client-side
 *                            on /checkout/success via commitPendingSale().
 *                            Server-side deduction here is blocked by the
 *                            same localStorage architectural gap (#2).
 *  5. Cart restoration     — FIXED. CartContext now persists items +
 *                            discounts to localStorage and rehydrates on
 *                            mount. Survives reload + tab close.
 *  6. Cart clear-on-success— FIXED. /checkout/success calls clearCart().
 *  7. Discount → Stripe    — OK. Cart calculates the discount £, the
 *                            checkout API maps it onto a one-time Stripe
 *                            coupon, and the codes themselves ride on
 *                            session.metadata.discountCodes.
 *                            Note: allow_promotion_codes is also true in
 *                            checkout/server.ts so customers can stack a
 *                            second code at the Stripe page — flagged.
 *  8. Empty-cart UX        — OK. Both cart page + drawer hide the Checkout
 *                            button when items.length === 0; the API
 *                            returns 400 if it's hit anyway.
 *  9. Line items shape     — OK on name / amount / currency / quantity.
 *                            Images are not passed because product cards
 *                            don't carry a CDN URL yet (placeholder SVGs).
 * 10. Signature verification— OK. constructWebhookEvent() uses
 *                            stripe.webhooks.constructEvent with the
 *                            STRIPE_WEBHOOK_SECRET env var; raw body is
 *                            preserved via req.text().
 * ──────────────────────────────────────────────────────────────────────── */

import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  upsertOrderByStripeSession, markOrderRefunded,
  type ServerOrderItem,
} from "@/portal/server/orders";
import { sendEmail } from "@/portal/server/email";
import { emit } from "@/portal/server/eventBus";
import "@/portal/server/webhooks";
import "@/portal/server/notifications";

export const runtime = "nodejs";

// Idempotency cache. Stripe retries on 4xx/5xx and occasionally on transient
// network blips, so the same event id can land here multiple times. Tracking
// it module-side gives us cheap dedupe inside a single Node process. For a
// horizontally scaled deployment, swap this for a Redis SETNX or a
// `processed_webhook_events` table with a unique index on event_id.
//
// TODO(T1 #7 follow-up): persist processed event ids to the cloud storage
// backend (Supabase table `webhook_events(event_id text primary key,
// received_at timestamptz default now())`) so dedupe survives a redeploy
// and works across multiple serverless instances.
const PROCESSED_EVENTS = new Set<string>();
const MAX_TRACKED_EVENTS = 1000; // bound the in-memory set so we don't leak

function rememberEvent(id: string) {
  if (PROCESSED_EVENTS.size >= MAX_TRACKED_EVENTS) {
    // Drop the oldest insertion. Sets preserve insertion order.
    const first = PROCESSED_EVENTS.values().next().value;
    if (first) PROCESSED_EVENTS.delete(first);
  }
  PROCESSED_EVENTS.add(id);
}

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

  // Idempotency check — Stripe can deliver the same event id more than once.
  // Acknowledge the duplicate with a 200 so Stripe stops retrying it; the
  // body's `duplicate: true` flag is logged but otherwise ignored.
  if (event?.id && PROCESSED_EVENTS.has(event.id)) {
    console.info("[stripe/webhook] duplicate event ignored", { id: event.id, type: event.type });
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Note: orders.ts is a "use client" localStorage scaffold — it can't run
  // here. The actual order write happens client-side on /checkout/success
  // (see commitPendingOrder). Once you migrate to a server DB, replace these
  // log blocks with the actual insert / update calls.
  //
  // TODO(T1 #7 follow-up): when orders are persisted server-side, this
  // handler should:
  //   1. Insert/upsert the order row keyed on session.id (idempotent by PK)
  //   2. Decrement inventory on each line item via a transactional adjust
  //   3. Enqueue a confirmation email (Resend / Postmark)
  //   4. Update orders.status to "paid" with a paymentIntent reference
  await ensureHydrated();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.metadata?.orgId ?? "agency";
      const items: ServerOrderItem[] = Array.isArray(session.line_items?.data)
        ? session.line_items.data.map((li: { description: string; quantity: number; price?: { unit_amount?: number; currency?: string } }) => ({
            name: li.description ?? "Item",
            quantity: li.quantity ?? 1,
            unitAmount: li.price?.unit_amount ?? 0,
            currency: li.price?.currency ?? session.currency ?? "gbp",
          }))
        : [];

      const order = upsertOrderByStripeSession({
        orgId,
        stripeSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "gbp",
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        shippingAddress: session.shipping_details?.address ? {
          line1: session.shipping_details.address.line1,
          line2: session.shipping_details.address.line2,
          city:  session.shipping_details.address.city,
          postalCode: session.shipping_details.address.postal_code,
          country: session.shipping_details.address.country,
          state: session.shipping_details.address.state,
        } : undefined,
        items,
        metadata: session.metadata as Record<string, string>,
      });

      // Best-effort email confirmation. Non-blocking — webhook still
      // returns 200 if email fails; the operator can resend manually.
      if (order.customerEmail) {
        const total = (order.amountTotal / 100).toFixed(2);
        const currency = order.currency.toUpperCase() === "GBP" ? "£" : order.currency.toUpperCase() === "USD" ? "$" : order.currency.toUpperCase() === "EUR" ? "€" : "";
        await sendEmail({
          orgId,
          to: order.customerEmail,
          subject: `Your order is confirmed — ${order.id}`,
          templateId: "order-confirmation",
          variables: {
            customerName: order.customerName ?? "there",
            orderId: order.id,
            currency,
            total,
            orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/account/orders/${order.id}`,
          },
          tags: ["order-confirmation", `org:${orgId}`],
        }).catch(err => console.error("[stripe/webhook] order-confirmation email failed:", err));
      }

      // Emit events so subscribed webhooks fire too.
      emit(orgId, "order.created", { orderId: order.id, amountTotal: order.amountTotal, currency: order.currency });
      emit(orgId, "order.paid",    { orderId: order.id, amountTotal: order.amountTotal, currency: order.currency });

      console.info("[stripe/webhook] order persisted", { orderId: order.id, sessionId: session.id });
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (piId) {
        const refunded = markOrderRefunded(piId);
        if (refunded?.customerEmail) {
          await sendEmail({
            orgId: refunded.orgId,
            to: refunded.customerEmail,
            subject: `Refund processed — ${refunded.id}`,
            html: `<h1>Refund processed</h1><p>Your refund for order <strong>${refunded.id}</strong> has been issued. It may take 5–10 business days to appear on your statement.</p>`,
            text: `Your refund for order ${refunded.id} has been issued. It may take 5–10 business days to appear on your statement.`,
            tags: ["refund", `org:${refunded.orgId}`],
          }).catch(err => console.error("[stripe/webhook] refund email failed:", err));
        }
        if (refunded) {
          emit(refunded.orgId, "order.refunded", { orderId: refunded.id });
        }
        console.info("[stripe/webhook] charge.refunded", { id: charge.id, orderId: refunded?.id });
      }
      break;
    }
    default:
      console.info("[stripe/webhook] unhandled", event.type);
  }

  // Mark as processed only after the handler ran cleanly. If the switch
  // throws, the event id stays unrecorded so Stripe's retry catches it.
  if (event?.id) rememberEvent(event.id);

  return NextResponse.json({ received: true });
}
