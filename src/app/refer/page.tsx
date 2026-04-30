"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrCreateCodeForUser, type ReferralCode } from "@/lib/referralCodes";
import { useContent } from "@/lib/useContent";

const PERKS = [
  {
    icon: "🎁",
    title: "You get £10 off",
    desc: "Every time a friend makes their first purchase using your code, you earn £10 credit towards your next order.",
  },
  {
    icon: "🧡",
    title: "They get £10 off too",
    desc: "Your friend gets £10 off their first order — they just enter your code at checkout.",
  },
  {
    icon: "∞",
    title: "No limits",
    desc: "Refer as many friends as you like. There's no cap — the more you share, the more you earn.",
  },
  {
    icon: "⚡",
    title: "Tracked on Shopify",
    desc: "Every use of your code is attributed to you automatically. Credit lands the moment the order is confirmed.",
  },
];

const TIERS = [
  { refs: "1–4 referrals", reward: "£10 per referral", badge: "Glow Getter" },
  { refs: "5–9 referrals", reward: "£15 per referral", badge: "Skin Advocate" },
  { refs: "10+ referrals", reward: "£20 per referral + free product", badge: "Odo Ambassador" },
];

export default function ReferPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<ReferralCode | null>(null);
  const eyebrow   = useContent("refer.hero.eyebrow",   "Referral Programme");
  const headline1 = useContent("refer.hero.headline1", "Share the glow.");
  const headline2 = useContent("refer.hero.headline2", "Get rewarded.");
  const intro     = useContent("refer.hero.intro",     "When you love something this much, sharing it should pay off. Share your unique discount code — when a friend uses it at checkout, you both get £10 off.");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setCode(getOrCreateCodeForUser(email));
  };

  const shareText = code
    ? `I've been using Odo by Felicia and it's genuinely changed my skin. Use my code ${code.code} for £10 off your first order: https://luv-and-ker.com/products`
    : "";

  return (
    <>
      <Navbar />
      <main className="w-full bg-brand-black min-h-screen">

        {/* Hero */}
        <section className="w-full pt-28 pb-20 sm:pt-36 sm:pb-24 bg-brand-black-soft overflow-hidden relative">
          <div className="absolute inset-0 hero-glow pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="adinkra-line w-8 sm:w-10" />
                <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">{eyebrow}</span>
                <div className="adinkra-line w-8 sm:w-10" />
              </div>
              <h1 className="font-display font-bold text-brand-cream leading-tight mb-5 text-4xl sm:text-5xl md:text-6xl xl:text-7xl">
                {headline1}<br />
                <span className="gradient-text">{headline2}</span>
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
                {intro}
              </p>

              {/* CTA / code box */}
              {!code ? (
                <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-3">
                  <p className="text-brand-cream/50 text-sm">Enter your email to get your unique discount code</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 bg-brand-black-card border border-white/10 rounded-xl px-4 py-3 text-brand-cream text-sm placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Get my code
                    </button>
                  </div>
                </form>
              ) : (
                <div className="w-full max-w-md flex flex-col gap-3">
                  <p className="text-brand-cream/50 text-sm">
                    Share this code. Your friend enters it at checkout and you both get £10 off.
                  </p>
                  <div className="flex gap-2 p-1 bg-brand-black-card border border-white/10 rounded-xl">
                    <span className="flex-1 px-3 py-3 text-brand-amber font-display font-bold text-2xl tracking-[0.18em] text-center">
                      {code.code}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-5 py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-medium transition-all"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex gap-3 justify-center mt-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
                    >
                      Share on WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
                    >
                      Share on X
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">How it works</span>
              <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl">
                Three simple steps
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Get your code", desc: "Enter your email above and we'll generate your unique discount code instantly." },
                { step: "02", title: "Share it anywhere", desc: "Send it via WhatsApp, Instagram, email — anywhere. They enter it at checkout." },
                { step: "03", title: "Both of you earn", desc: "Your friend gets £10 off their first order. You get £10 credit the moment Shopify confirms it." },
              ].map((s) => (
                <div key={s.step} className="flex flex-col p-7 rounded-2xl bg-brand-black-card border border-white/5">
                  <span className="font-display text-4xl font-bold text-brand-orange/20 mb-4">{s.step}</span>
                  <h3 className="font-display font-bold text-brand-cream text-lg mb-2">{s.title}</h3>
                  <p className="text-brand-cream/50 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="w-full py-16 sm:py-20 bg-brand-black-soft">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light mb-3">The benefits</span>
              <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl">
                Why it pays to share
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PERKS.map((perk) => (
                <div key={perk.title} className="flex flex-col p-6 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-purple/30 transition-colors">
                  <span className="text-3xl mb-4">{perk.icon}</span>
                  <h3 className="font-display font-bold text-brand-cream text-base mb-2">{perk.title}</h3>
                  <p className="text-brand-cream/50 text-sm leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="w-full py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">Ambassador tiers</span>
              <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-3">
                The more you refer, the more you earn
              </h2>
              <p className="text-brand-cream/50 text-base max-w-xl">
                Our programme rewards consistent advocates with higher credit and exclusive perks.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {TIERS.map((tier, i) => (
                <div
                  key={tier.badge}
                  className={`flex flex-col p-7 rounded-2xl border transition-colors ${
                    i === 2
                      ? "bg-gradient-to-br from-brand-orange/10 to-brand-purple/10 border-brand-amber/30"
                      : "bg-brand-black-card border-white/5"
                  }`}
                >
                  {i === 2 && (
                    <span className="text-[10px] tracking-[0.2em] uppercase text-brand-amber mb-3">Top tier</span>
                  )}
                  <p className="text-xs tracking-wide text-brand-cream/40 mb-1">{tier.refs}</p>
                  <p className="font-display font-bold text-brand-cream text-xl mb-1">{tier.reward}</p>
                  <p className="text-brand-amber text-sm font-medium mt-auto pt-4">{tier.badge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full py-16 sm:py-20 bg-brand-black-soft">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 text-center">
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-4">
              Ready to start sharing?
            </h2>
            <p className="text-brand-cream/50 text-base mb-8 max-w-md mx-auto">
              Get your code in seconds and start earning today.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-medium tracking-wide transition-colors"
            >
              Get my discount code →
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
