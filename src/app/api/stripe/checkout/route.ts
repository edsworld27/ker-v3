// POST /api/stripe/checkout
//
// Body: { items: [{ name, unitPrice, quantity, productId, variant? }],
//         discountAmount?: number,
//         customerEmail?: string,
//         metadata?: Record<string, string> }
//
// Returns: { url: string } — redirect the browser there.
//
// Hosted Stripe Checkout is the right call for a small DTC site: PCI scope is
// SAQ-A, no card fields ever hit our server, and Apple/Google Pay come for
// free. When you outgrow it (custom checkout UI, embedded address autocomplete,
// upsells) swap for Payment Elements.

import { NextResponse } from "next/server";
import { createCheckoutSession, type StripeLineItem } from "@/lib/stripe/server";

export const runtime = "nodejs";

interface ClientCartItem {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number; // £
}

interface CheckoutBody {
  items: ClientCartItem[];
  discountAmount?: number; // £
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export async function POST(req: Request) {
  let body: CheckoutBody;
  try { body = (await req.json()) as CheckoutBody; }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const lineItems: StripeLineItem[] = body.items.map(it => ({
    name: it.name,
    description: it.variant,
    amount: Math.round(it.unitPrice * 100),
    currency: "gbp",
    quantity: it.quantity,
  }));

  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? req.headers.get("origin")
    ?? "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      lineItems,
      customerEmail: body.customerEmail,
      metadata: body.metadata,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/cart`,
      discountAmount: body.discountAmount ? Math.round(body.discountAmount * 100) : undefined,
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed.";
    console.error("[stripe/checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
