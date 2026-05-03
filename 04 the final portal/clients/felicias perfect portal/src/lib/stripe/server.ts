// Server-only Stripe client.
//
// Required env vars (add to .env.local — never commit):
//   STRIPE_SECRET_KEY=sk_test_...        (or sk_live_...)
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
//   NEXT_PUBLIC_SITE_URL=https://luvandker.com
//
// Install: npm i stripe @stripe/stripe-js
//
// This file deliberately wraps the import so the rest of the codebase (and
// builds) don't crash when the package isn't installed yet.

import "server-only";

export interface StripeLineItem {
  name: string;
  description?: string;
  amount: number;     // in pence (£12.50 → 1250)
  currency: "gbp" | "usd" | "eur";
  quantity: number;
  images?: string[];  // absolute URLs surfaced on the Stripe-hosted checkout
}

export interface CheckoutSessionInput {
  lineItems: StripeLineItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  // Optional: gift-card balance / discount applied as a one-off coupon.
  discountAmount?: number; // pence
}

export interface CheckoutSessionResult {
  id: string;
  url: string;
}

let _stripe: unknown = null;

async function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local.");
  // Dynamic import so a missing `stripe` package doesn't crash the build.
  const mod = await import(/* webpackIgnore: true */ "stripe").catch(() => null);
  if (!mod) throw new Error("The `stripe` package is not installed. Run: npm i stripe");
  const Stripe = (mod as { default: new (k: string, opts: { apiVersion: string }) => unknown }).default;
  _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  return _stripe;
}

export async function createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = (await getStripe()) as any;

  const params: Record<string, unknown> = {
    mode: "payment",
    line_items: input.lineItems.map(li => ({
      quantity: li.quantity,
      price_data: {
        currency: li.currency,
        unit_amount: li.amount,
        product_data: {
          name: li.name,
          description: li.description,
          // Stripe rejects empty arrays — only attach when we actually have
          // an absolute, https-served URL.
          images: li.images && li.images.length > 0 ? li.images : undefined,
        },
      },
    })),
    customer_email: input.customerEmail,
    metadata: input.metadata,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    automatic_tax: { enabled: true },
    shipping_address_collection: { allowed_countries: ["GB", "IE", "FR", "DE", "US", "CA"] },
    phone_number_collection: { enabled: true },
    // Avoid stacking: if the cart already applied a discount client-side
    // (we're attaching it as a one-time coupon below), suppress the Stripe
    // promo-code field so customers can't double-dip.
    allow_promotion_codes: input.discountAmount && input.discountAmount > 0 ? false : true,
  };

  if (input.discountAmount && input.discountAmount > 0) {
    // Apply as a one-time coupon. For repeat codes (ODO10 etc.) you'd create
    // persistent Stripe coupons in the dashboard and pass discounts: [{ coupon }].
    const coupon = await stripe.coupons.create({
      amount_off: input.discountAmount,
      currency: input.lineItems[0]?.currency ?? "gbp",
      duration: "once",
      name: "Cart discount",
    });
    params.discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create(params);
  return { id: session.id as string, url: session.url as string };
}

// Verify and parse an incoming webhook. Throws on signature mismatch.
export async function constructWebhookEvent(rawBody: string, signature: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = (await getStripe()) as any;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

// ── Billing portal ────────────────────────────────────────────────────────
//
// Stripe's hosted Customer Portal — customers manage their subscription
// (plan changes, payment method, cancel, invoice history) without us
// rebuilding any of it. Each portal session is a one-shot URL that
// redirects to Stripe; expiry is short, so we mint per-click.

export interface BillingPortalInput {
  customerId?: string;          // Stripe customer id, when known
  customerEmail?: string;       // fallback — we'll resolve via Stripe customer search
  returnUrl: string;            // where Stripe sends the customer back to
}

export interface BillingPortalResult {
  url: string;
}

export async function createBillingPortalSession(input: BillingPortalInput): Promise<BillingPortalResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = (await getStripe()) as any;

  let customerId = input.customerId;

  if (!customerId) {
    if (!input.customerEmail) {
      throw new Error("billing-portal: provide customerId or customerEmail");
    }
    // Stripe's customer search index is async — for fresh customers
    // (just-created in this request) `list({email})` is more reliable.
    // We pick the first match; multi-customer-per-email is rare and the
    // operator can pass the explicit id when it matters.
    const list = await stripe.customers.list({ email: input.customerEmail, limit: 1 });
    if (!list.data?.length) {
      throw new Error(`No Stripe customer found for ${input.customerEmail}`);
    }
    customerId = list.data[0].id as string;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: input.returnUrl,
  });
  return { url: session.url as string };
}
