"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { createCart, addToCart } from "@/lib/shopify";

export default function CartDrawer() {
  const { items, count, subtotal, total, discounts, applyDiscount, removeDiscount, isOpen, closeCart, updateQty, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountBusy, setDiscountBusy] = useState(false);

  async function handleApplyDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setDiscountBusy(true);
    setDiscountError(null);
    const res = await applyDiscount(discountCode);
    if (!res.ok) {
      setDiscountError(res.reason);
    } else {
      setDiscountCode("");
    }
    setDiscountBusy(false);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const lines = items
        .filter((item) => item.shopifyVariantId)
        .map((item) => ({
          merchandiseId: item.shopifyVariantId as string,
          quantity: item.quantity,
        }));

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
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong initiating checkout. Check the console.");
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer — full width on xs, capped at sm/md on wider screens */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-sm md:max-w-md 2xl:max-w-lg bg-brand-black-soft flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-white/10">
          <div>
            <h2 className="font-display text-lg sm:text-xl 2xl:text-2xl text-brand-cream">Your Bag</h2>
            <p className="text-xs 2xl:text-sm text-brand-cream/40 mt-0.5">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-brand-cream/50 hover:text-brand-cream transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-purple-muted flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-purple-light">
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="text-brand-cream/50 text-sm">Your bag is empty</p>
              <p className="text-brand-cream/30 text-xs mt-1">Add Odo to begin your ritual</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-brand-black-card border border-white/5"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-brand-purple-muted flex-shrink-0 flex items-center justify-center">
                  <SoapIcon />
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm 2xl:text-base font-medium text-brand-cream truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-brand-cream/40 mt-0.5">{item.variant}</p>
                  )}
                  <p className="text-brand-orange text-sm font-semibold mt-1">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-brand-cream/30 hover:text-brand-orange transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-white/10 text-brand-cream/60 hover:border-brand-orange hover:text-brand-orange transition-colors text-xs flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm text-brand-cream w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-white/10 text-brand-cream/60 hover:border-brand-orange hover:text-brand-orange transition-colors text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — checkout */}
        {items.length > 0 && (
          <div className="px-5 sm:px-7 py-5 sm:py-6 border-t border-white/10 space-y-4">

            {/* Applied discounts */}
            {discounts.map((d) => (
              <div key={d.code} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-brand-amber/10 border border-brand-amber/25">
                <div className="min-w-0">
                  <p className="text-[10px] tracking-widest uppercase text-brand-amber/80 mb-0.5">{d.label}</p>
                  <p className="text-sm text-brand-cream truncate">{d.code}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-brand-amber">−£{d.amountOff.toFixed(2)}</span>
                  <button
                    onClick={() => removeDiscount(d.code)}
                    className="text-xs text-brand-cream/55 hover:text-brand-cream underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Discount code input */}
            <form onSubmit={handleApplyDiscount} className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={discountCode}
                  onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(null); }}
                  placeholder="Discount / gift card code"
                  className="flex-1 min-w-0 bg-brand-black-card border border-white/10 rounded-lg px-3 py-2.5 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-amber/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={discountBusy || !discountCode.trim()}
                  className="shrink-0 px-4 py-2.5 rounded-lg bg-brand-amber/15 hover:bg-brand-amber/25 border border-brand-amber/30 text-brand-amber text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {discountBusy ? "…" : "Apply"}
                </button>
              </div>
              {discountError && <p className="text-[11px] text-brand-orange">{discountError}</p>}
            </form>

            <div className="flex items-center justify-between text-sm text-brand-cream/55">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {discounts.map((d) => (
              <div key={d.code} className="flex items-center justify-between text-sm text-brand-amber">
                <span className="truncate mr-2">{d.label}</span>
                <span className="shrink-0">−£{d.amountOff.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-brand-cream/60 text-sm 2xl:text-base">Total</span>
              <span className="font-display text-xl 2xl:text-2xl text-brand-cream">£{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-light transition-colors font-semibold text-white tracking-wide text-sm 2xl:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? "Loading Secure Checkout..." : "Checkout"}
            </button>
            <button
              onClick={closeCart}
              className="w-full py-2.5 sm:py-3 text-brand-cream/50 hover:text-brand-cream transition-colors text-sm 2xl:text-base"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SoapIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-purple-light">
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <circle cx="12" cy="13" r="2" />
    </svg>
  );
}
