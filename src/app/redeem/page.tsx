"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGiftCard, type GiftCard } from "@/lib/giftCards";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [card, setCard] = useState<GiftCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const found = getGiftCard(code);
    if (!found) {
      setCard(null);
      setError("We couldn't find a gift card with that code. Check the format and try again.");
      return;
    }
    setCard(found);
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">
        <section className="w-full bg-brand-black">
          <div className="w-full max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Gift Cards</span>
            </div>
            <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-5">
              Check your balance
            </h1>
            <p className="text-brand-cream/65 leading-relaxed mb-8">
              Enter the code from your Odo gift card. To spend the balance, head to{" "}
              <a href="/#shop" className="text-brand-orange hover:underline">the shop</a>{" "}
              and apply your code in the bag at checkout.
            </p>

            <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                placeholder="ODO-XXXX-XXXX-XXXX"
                className="flex-1 min-w-0 bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-amber/40 transition-colors"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
              >
                Check balance
              </button>
            </form>

            {error && (
              <div className="p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-sm text-brand-orange">
                {error}
              </div>
            )}

            {card && (
              <div className="p-7 rounded-2xl bg-gradient-to-br from-brand-purple-muted/40 to-brand-black-card border border-brand-amber/20 space-y-5">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-brand-amber/80 mb-1">Card</p>
                  <p className="font-display text-xl text-brand-cream tracking-[0.15em]">{card.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-1">Original value</p>
                    <p className="font-display text-2xl text-brand-cream">£{card.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-1">Remaining</p>
                    <p className={`font-display text-2xl ${card.balance > 0 ? "text-brand-amber" : "text-brand-cream/30"}`}>
                      £{card.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                {card.recipientName && (
                  <div className="pt-4 border-t border-white/10 text-sm text-brand-cream/60">
                    For <span className="text-brand-cream">{card.recipientName}</span>
                    {card.senderName && <> · from <span className="text-brand-cream">{card.senderName}</span></>}
                  </div>
                )}
                {card.message && (
                  <p className="text-sm italic text-brand-cream/70 leading-relaxed">&ldquo;{card.message}&rdquo;</p>
                )}
                {card.redemptions.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-2">Activity</p>
                    <ul className="space-y-1.5 text-xs text-brand-cream/60">
                      {card.redemptions.map((r, i) => (
                        <li key={i} className="flex justify-between">
                          <span>Redemption</span>
                          <span>−£{r.amount.toFixed(2)} · {new Date(r.at).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
