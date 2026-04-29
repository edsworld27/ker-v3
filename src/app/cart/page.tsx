"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { createCart, addToCart } from "@/lib/shopify";

export default function CartPage() {
  const { items, count, subtotal, total, giftCard, applyGiftCard, removeGiftCard, updateQty, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftError, setGiftError] = useState<string | null>(null);
  const [giftBusy, setGiftBusy] = useState(false);

  async function handleApplyGiftCard(e: React.FormEvent) {
    e.preventDefault();
    if (!giftCode.trim()) return;
    setGiftBusy(true);
    setGiftError(null);
    const res = await applyGiftCard(giftCode);
    if (!res.ok) setGiftError(res.reason);
    else setGiftCode("");
    setGiftBusy(false);
  }

  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const lines = items
        .filter((item) => item.shopifyVariantId)
        .map((item) => ({ merchandiseId: item.shopifyVariantId as string, quantity: item.quantity }));

      if (lines.length === 0) {
        alert("Please map your products to Shopify Variant IDs to enable checkout.");
        setIsCheckingOut(false);
        return;
      }
      const cart = await createCart();
      const cartWithItems = await addToCart(cart.id, lines);
      if (cartWithItems?.checkoutUrl) {
        localStorage.setItem("odo_has_purchased", "true");
        window.location.href = cartWithItems.checkoutUrl;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong initiating checkout. Check the console.");
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black pt-28 pb-16 sm:pt-32">
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
          <h1 className="font-display text-4xl sm:text-5xl text-brand-cream mb-2">Your Bag</h1>
          <p className="text-brand-cream/45 text-sm mb-8">{count} {count === 1 ? "item" : "items"}</p>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-brand-black-card p-12 text-center">
              <p className="text-brand-cream/60">Your bag is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-brand-black-card border border-white/5">
                    <div className="w-16 h-16 rounded-lg bg-brand-purple-muted" />
                    <div className="flex-1">
                      <h3 className="text-brand-cream">{item.name}</h3>
                      {item.variant && <p className="text-xs text-brand-cream/45">{item.variant}</p>}
                      <p className="text-brand-orange mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeItem(item.id)} className="text-brand-cream/40 hover:text-brand-orange">Remove</button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded border border-white/15">−</button>
                        <span className="text-brand-cream">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded border border-white/15">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="rounded-2xl border border-white/10 bg-brand-black-card p-5 h-fit space-y-4">
                {giftCard ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-brand-amber/10 border border-brand-amber/25">
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-widest uppercase text-brand-amber/80 mb-0.5">Gift card applied</p>
                      <p className="text-sm text-brand-cream truncate">{giftCard.code}</p>
                    </div>
                    <button onClick={() => removeGiftCard()} className="shrink-0 text-xs text-brand-cream/55 hover:text-brand-cream underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyGiftCard} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={giftCode}
                        onChange={(e) => { setGiftCode(e.target.value); setGiftError(null); }}
                        placeholder="Gift card code"
                        className="flex-1 min-w-0 bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-xs text-brand-cream"
                      />
                      <button type="submit" disabled={giftBusy || !giftCode.trim()} className="px-4 py-2.5 rounded-lg bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold disabled:opacity-40">
                        {giftBusy ? "…" : "Apply"}
                      </button>
                    </div>
                    {giftError && <p className="text-[11px] text-brand-orange">{giftError}</p>}
                  </form>
                )}
                <div className="flex justify-between text-brand-cream/60 text-sm"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                {giftCard && <div className="flex justify-between text-brand-amber text-sm"><span>Gift card</span><span>-£{giftCard.amount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-brand-cream"><span>Total</span><span className="font-display text-xl">£{total.toFixed(2)}</span></div>
                <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full py-3 rounded-xl bg-brand-orange text-white font-semibold disabled:opacity-40">
                  {isCheckingOut ? "Loading Secure Checkout..." : "Checkout"}
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
