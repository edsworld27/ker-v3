"use client";

// /account/change-password — signed-in self-service password change.
//
// Used directly by users who want to rotate their password, and as the
// landing page when an account is flagged with mustChangePassword=true
// (operator-created accounts, post-reset). On success the
// mustChangePassword flag clears server-side, so the next /api/auth/me
// returns the user without the must-change signal.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { friendlyError } from "@/lib/admin/friendlyError";

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordContent />
    </Suspense>
  );
}

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const forced = searchParams.get("forced") === "1";

  const [email, setEmail] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) router.replace(`/account?next=${encodeURIComponent("/account/change-password")}`);
          return;
        }
        const data = await res.json() as { user?: { email?: string } };
        if (!cancelled) setEmail(data.user?.email ?? null);
      } catch {
        // Network blip — leave the page; the form will still work if
        // the cookie is good.
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        const f = friendlyError(data.error, "Couldn't update password");
        setError(f.hint ? `${f.message} ${f.hint}` : f.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.replace(next), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen">
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">
              {forced ? "Set your password" : "Change password"}
            </span>
          </div>
          <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl leading-tight mb-3">
            {forced ? "Pick a new password" : "Update your password"}
          </h1>
          <p className="text-brand-cream/65 leading-relaxed mb-2">
            {forced
              ? "Your account was created with a temporary password. Set your own before continuing."
              : "Enter your current password, then choose a new one. At least 8 characters."}
          </p>
          {email && (
            <p className="text-brand-cream/40 text-xs mb-8">Signed in as {email}.</p>
          )}

          {done ? (
            <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/10 px-5 py-4">
              <p className="text-brand-amber font-medium text-sm">Password updated ✓</p>
              <p className="text-brand-cream/55 text-xs mt-2">Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
                />
                {forced && (
                  <p className="text-[10px] text-brand-cream/40 mt-1.5">
                    Use the temporary password sent to you by your operator.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors"
                />
              </div>

              {error && (
                <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-lg shadow-brand-orange/15 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                {busy ? "Working…" : "Update password"}
              </button>

              {!forced && (
                <p className="text-[11px] text-brand-cream/45 text-center">
                  Forgot your current password?{" "}
                  <Link href="/account/forgot-password" className="text-brand-orange hover:underline">
                    Reset via email
                  </Link>
                </p>
              )}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
