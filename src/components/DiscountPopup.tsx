"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getPopupConfig, onPopupChange, shouldShowOnPath, type PopupConfig,
} from "@/lib/admin/popup";

export default function DiscountPopup() {
  const pathname = usePathname() ?? "";
  const [cfg, setCfg] = useState<PopupConfig>(() => getPopupConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => onPopupChange(() => setCfg(getPopupConfig())), []);

  useEffect(() => {
    if (!cfg.enabled) return;
    if (!shouldShowOnPath(cfg, pathname)) return;

    const hasSeen      = localStorage.getItem("odo_discount_seen");
    const hasPurchased = localStorage.getItem("odo_has_purchased");
    const isLoggedIn   = !!getSession();

    if (cfg.hideForLoggedIn && isLoggedIn) return;
    if (cfg.hideAfterSeen && hasSeen) return;
    if (cfg.hideForReturningCustomers && hasPurchased) return;

    let cleanup: (() => void) | undefined;

    if (cfg.trigger === "always") {
      setIsOpen(true);
      localStorage.setItem("odo_discount_seen", "true");
    } else if (cfg.trigger === "delay") {
      const t = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("odo_discount_seen", "true");
      }, cfg.delaySeconds * 1000);
      cleanup = () => clearTimeout(t);
    } else if (cfg.trigger === "scroll") {
      const handler = () => {
        const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        if (scrolled >= cfg.scrollPercent) {
          setIsOpen(true);
          localStorage.setItem("odo_discount_seen", "true");
          window.removeEventListener("scroll", handler);
        }
      };
      window.addEventListener("scroll", handler, { passive: true });
      cleanup = () => window.removeEventListener("scroll", handler);
    } else if (cfg.trigger === "exit") {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsOpen(true);
          localStorage.setItem("odo_discount_seen", "true");
          document.removeEventListener("mouseout", handler);
        }
      };
      document.addEventListener("mouseout", handler);
      cleanup = () => document.removeEventListener("mouseout", handler);
    }

    return cleanup;
  }, [cfg, pathname]);

  if (!isOpen || !cfg.enabled) return null;

  const accent = cfg.accentColor;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-brand-black-card border border-brand-purple/20 rounded-3xl overflow-hidden shadow-2xl animate-[float_4s_ease-in-out_infinite]">
          <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(to right, ${accent}, #ffb84d, #b478e0)` }} />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-purple/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 blur-[80px] rounded-full pointer-events-none" style={{ background: `${accent}1a` }} />

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            type="button"
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-brand-cream/70 hover:text-brand-cream transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center">
            <span className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: accent }}>
              {cfg.eyebrow}
            </span>
            <h2 className="font-display text-3xl font-bold text-brand-cream leading-tight mb-3">
              {cfg.headline}
            </h2>
            <p className="text-sm text-brand-cream/60 leading-relaxed mb-8">
              {cfg.subheadline}
            </p>

            {submitted ? (
              <div className="w-full flex flex-col items-center gap-4 py-6">
                <p className="text-brand-cream/80 text-sm">{cfg.successText}</p>
                <div className="w-full py-4 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-cream font-bold text-2xl tracking-[0.2em]">
                  {cfg.discountCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cfg.discountCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ background: accent, boxShadow: `0 8px 24px ${accent}33` }}
                >
                  {copied ? cfg.copiedLabel : cfg.copyLabel}
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
                  className="w-full px-5 py-4 rounded-xl bg-brand-black border border-white/10 text-brand-cream text-sm focus:outline-none transition-colors"
                  style={{ borderColor: undefined }}
                  required
                />
                <label className="flex items-start gap-3 text-left cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-white/20 bg-brand-black group-hover:border-white/40 transition-colors shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                      required
                    />
                    {agreed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: accent }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-brand-cream/50 leading-relaxed select-none group-hover:text-brand-cream/70 transition-colors">
                    {cfg.consentLabel}
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full py-4 mt-2 rounded-xl text-white font-semibold text-sm tracking-wide shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
                  style={{ background: accent, boxShadow: `0 8px 24px ${accent}33` }}
                  disabled={!email || !agreed}
                >
                  {cfg.ctaLabel}
                </button>
              </form>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 text-[10px] tracking-widest uppercase text-brand-cream/30 hover:text-brand-cream/50 transition-colors"
            >
              {cfg.declineLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
