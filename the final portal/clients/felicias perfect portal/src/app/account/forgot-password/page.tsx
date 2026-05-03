"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ devLink?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const r = await requestPasswordReset(email);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    // r.link is empty when the email isn't on file (anti-enumeration). We
    // still show a success state so we don't leak which emails are real.
    setSent({ devLink: r.link || undefined });
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen">
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Reset password</span>
          </div>
          <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
            Forgot your password?
          </h1>
          <p className="text-brand-cream/65 leading-relaxed mb-8">
            Enter the email tied to your account. We&apos;ll send you a link to set a new password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com"
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors" />
              </div>

              {error && (
                <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button type="submit" disabled={busy}
                className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-lg shadow-brand-orange/15 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/10 px-5 py-4">
                <p className="text-brand-amber font-medium text-sm">If that email is on file, a reset link is on its way.</p>
                <p className="text-brand-cream/55 text-xs mt-2">
                  Check your inbox (and your spam folder). The link expires in 4 hours.
                </p>
              </div>

              {/* Dev convenience: surface the local link until Shopify is wired. */}
              {sent.devLink && (
                <div className="rounded-2xl border border-white/10 bg-brand-black-card px-5 py-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-2">
                    Dev mode — your reset link
                  </p>
                  <Link href={sent.devLink} className="text-brand-orange text-xs break-all hover:underline">
                    {sent.devLink}
                  </Link>
                  <p className="text-[11px] text-brand-cream/30 mt-2">
                    Once Shopify <code>customerRecover</code> is wired, this email is sent by Shopify and this card disappears.
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-brand-cream/40 mt-8 text-center">
            <Link href="/account" className="text-brand-cream/60 hover:underline">← Back to log in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
