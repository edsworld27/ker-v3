"use client";

import { useState, useEffect } from "react";

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("odo_discount_seen");
    const hasPurchased = localStorage.getItem("odo_has_purchased");
    if (hasSeen || hasPurchased) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("odo_discount_seen", "true");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        {/* Modal */}
        <div className="relative w-full max-w-md bg-brand-black-card border border-brand-purple/20 rounded-3xl overflow-hidden shadow-2xl animate-[float_4s_ease-in-out_infinite]">
          {/* Decorative gradients */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange via-brand-amber to-brand-purple" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-purple/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-orange/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-brand-cream/40 hover:text-brand-cream transition-colors z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-amber mb-3">Unlock The Ritual</span>
            <h2 className="font-display text-3xl font-bold text-brand-cream leading-tight mb-3">
              Take 10% off your first order
            </h2>
            <p className="text-sm text-brand-cream/60 leading-relaxed mb-8">
              Join the Odo community for exclusive early access to small-batch releases and ancestral skincare wisdom.
            </p>

            {submitted ? (
              <div className="w-full flex flex-col items-center gap-4 py-6">
                <p className="text-brand-cream/80 text-sm">Your code is ready!</p>
                <div className="w-full py-4 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-cream font-bold text-2xl tracking-[0.2em]">
                  ODO10
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("ODO10");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light transition-colors text-white font-semibold text-sm tracking-wide shadow-lg shadow-brand-orange/20 hover:-translate-y-0.5"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            ) : (
              <form 
                className="w-full flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email && agreed) setSubmitted(true);
                }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-brand-black border border-white/10 text-brand-cream text-sm focus:outline-none focus:border-brand-orange/50 transition-colors"
                  required
                />
                <label className="flex items-start gap-3 text-left cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-white/20 bg-brand-black group-hover:border-brand-orange/50 transition-colors shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                      required
                    />
                    {agreed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-orange">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-brand-cream/50 leading-relaxed select-none group-hover:text-brand-cream/70 transition-colors">
                    I agree to receive marketing emails with exclusive offers and ancestral skincare wisdom.
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full py-4 mt-2 rounded-xl bg-brand-orange hover:bg-brand-orange-light transition-colors text-white font-semibold text-sm tracking-wide shadow-lg shadow-brand-orange/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  disabled={!email || !agreed}
                >
                  Reveal My Code
                </button>
              </form>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 text-[10px] tracking-widest uppercase text-brand-cream/30 hover:text-brand-cream/50 transition-colors"
            >
              No thanks, I prefer paying full price
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
