"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const search = useSearchParams();
  const sessionId = search.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    // Mark this browser as a returning customer (suppresses the first-order popup).
    localStorage.setItem("odo_has_purchased", "true");
    // Commit the inventory reservation that was stashed at checkout-submit:
    // decrement onHand and clear reserved for every linked SKU. In production
    // the Stripe webhook would do this server-side; this client fallback
    // keeps the admin dashboard accurate while we're on localStorage.
    import("@/lib/admin/inventory").then(({ commitPendingSale }) => commitPendingSale());
    import("@/lib/admin/orders").then(({ commitPendingOrder }) => commitPendingOrder(sessionId || undefined));
    // The bag is now archived as a paid order — drop it so the customer
    // doesn't return to a stale cart on the next visit.
    clearCart();
    // TODO(T1 #7 follow-up): hit /api/orders?session=... to fetch the confirmed
    // order details once the webhook has written them to the DB. Right now
    // commitPendingOrder() reads localStorage that was set at checkout-submit,
    // so an order opened in a different tab/browser won't appear here.
  }, [sessionId, clearCart]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-black flex items-center justify-center px-6 pt-24">
        <div className="max-w-lg text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-brand-amber mb-4">Order confirmed</p>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-cream mb-4">Asante.</h1>
          <p className="text-brand-cream/65 leading-relaxed mb-8">
            Your order is in. A confirmation email is on the way, and Felicia will hand-pack
            and ship it within two working days.
          </p>
          {sessionId && (
            <p className="text-[11px] text-brand-cream/30 font-mono mb-8 break-all">Reference: {sessionId}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/account?tab=orders" className="px-6 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold">
              View order
            </Link>
            <Link href="/products" className="px-6 py-3 rounded-xl border border-white/15 text-brand-cream/80 text-sm">
              Keep browsing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
