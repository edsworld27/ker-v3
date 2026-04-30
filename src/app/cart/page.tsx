"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { listSources, onSourcesChange, type OrderSource } from "@/lib/admin/marketing";

export default function CartPage() {
  const { items, count, subtotal, total, discounts, applyDiscount, removeDiscount, updateQty, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountBusy, setDiscountBusy] = useState(false);
  const [sources, setSources] = useState<OrderSource[]>([]);
  const [source, setSource] = useState<string>("");
  const [sourceDetail, setSourceDetail] = useState("");

  useEffect(() => {
    setSources(listSources());
    return onSourcesChange(() => setSources(listSources()));
  }, []);

  async function handleApplyDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setDiscountBusy(true);
    setDiscountError(null);
    const res = await applyDiscount(discountCode);
    if (!res.ok) setDiscountError(res.reason);
    else setDiscountCode("");
    setDiscountBusy(false);
  }

  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const totalDiscount = discounts.reduce((s, d) => s + d.amountOff, 0);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.id,
            name: i.name,
            variant: i.variant,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          discountAmount: totalDiscount > 0 ? totalDiscount : undefined,
          metadata: { discountCodes: discounts.map(d => d.code).join(",") },
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "No checkout URL returned");
      const { stashPendingSale } = await import("@/lib/admin/inventory");
      const { stashPendingOrder } = await import("@/lib/admin/orders");
      stashPendingSale(items);
      stashPendingOrder({
        items,
        subtotal,
        discountAmount: totalDiscount,
        total,
        discountCode: discounts[0]?.code,
        source: source || undefined,
        sourceDetail: sourceDetail.trim() || undefined,
      });
      localStorage.setItem("odo_has_purchased", "true");
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong initiating checkout.");
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
                {/* Applied discounts */}
                {discounts.map((d) => (
                  <div key={d.code} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-brand-amber/10 border border-brand-amber/25">
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-widest uppercase text-brand-amber/80 mb-0.5">{d.label}</p>
                      <p className="text-sm text-brand-cream truncate">{d.code}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-brand-amber">−£{d.amountOff.toFixed(2)}</span>
                      <button onClick={() => removeDiscount(d.code)} className="text-xs text-brand-cream/55 hover:text-brand-cream underline">Remove</button>
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
                      className="flex-1 min-w-0 bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-amber/40 transition-colors"
                    />
                    <button type="submit" disabled={discountBusy || !discountCode.trim()} className="px-4 py-2.5 rounded-lg bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold disabled:opacity-40 hover:bg-brand-amber/25 transition-colors">
                      {discountBusy ? "…" : "Apply"}
                    </button>
                  </div>
                  {discountError && <p className="text-[11px] text-brand-orange">{discountError}</p>}
                </form>

                <div className="flex justify-between text-brand-cream/60 text-sm"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                {discounts.map((d) => (
                  <div key={d.code} className="flex justify-between text-brand-amber text-sm">
                    <span className="truncate mr-2">{d.label}</span>
                    <span className="shrink-0">−£{d.amountOff.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-brand-cream"><span>Total</span><span className="font-display text-xl">£{total.toFixed(2)}</span></div>

                {/* Where did you hear about us? */}
                <div className="pt-3 border-t border-white/8">
                  <label className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5 block">
                    Where did you hear about us?
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-xs text-brand-cream focus:outline-none focus:border-brand-amber/40"
                  >
                    <option value="">Select…</option>
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  {(source === "other" || source === "press") && (
                    <input
                      value={sourceDetail}
                      onChange={(e) => setSourceDetail(e.target.value)}
                      placeholder="Tell us more (optional)"
                      className="mt-2 w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-amber/40"
                    />
                  )}
                </div>

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
