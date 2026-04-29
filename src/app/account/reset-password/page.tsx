"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Those passwords don't match."); return; }
    setBusy(true);
    const r = await resetPassword(token, password);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setDone(true);
    setTimeout(() => router.push("/account"), 1200);
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen">
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Set new password</span>
          </div>
          <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
            Choose a new password
          </h1>
          <p className="text-brand-cream/65 leading-relaxed mb-8">
            Pick something at least 8 characters long. You&apos;ll be signed in once you&apos;re done.
          </p>

          {!token && (
            <div className="rounded-2xl border border-red-500/30 bg-red-900/20 px-5 py-4 mb-6">
              <p className="text-red-300/90 text-sm font-medium">This link is missing its reset token.</p>
              <p className="text-brand-cream/55 text-xs mt-2">
                Try the <Link href="/account/forgot-password" className="text-brand-orange hover:underline">forgot password</Link> form again to get a fresh link.
              </p>
            </div>
          )}

          {done ? (
            <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/10 px-5 py-4">
              <p className="text-brand-amber font-medium text-sm">Password updated ✓</p>
              <p className="text-brand-cream/55 text-xs mt-2">Redirecting you to your account…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} placeholder="At least 8 characters"
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  required minLength={8}
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors" />
              </div>

              {error && (
                <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button type="submit" disabled={busy || !token}
                className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-lg shadow-brand-orange/15 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
                {busy ? "Working…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
