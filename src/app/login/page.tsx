"use client";

// /login — Aqua portal admin login.
//
// Minimal, dedicated entry point for portal admins. Distinct from /account
// (the customer storefront login) so the agency-side experience can iterate
// without affecting the storefront UX. The admin-access link in
// /embed/login points here.
//
// Security modes (see getSecurityMode() in src/lib/auth.ts):
//   "strict" — credentials required, no shortcut shown
//   "dev"    — credentials work AND a Dev mode button drops the operator
//              into a synthesised admin session
//   "off"    — admin auth bypassed entirely; the page autoredirects to
//              /admin once the dev session is created
//
// G-5 will replace this with real per-tenant auth.

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getSession, getSecurityMode, signInAsDev, signInWithEmail,
  type SecurityMode,
} from "@/lib/auth";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const back = params?.get("back") ?? null;
  const next = params?.get("next") ?? "/admin";

  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<SecurityMode>("strict");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(getSecurityMode());
    setHydrated(true);
    // Already signed in? Skip straight through. (Don't auto-bounce in
    // "off" mode — we still want the operator to see the dev button so
    // they can switch identities if they want.)
    const session = getSession();
    if (session && session.user.role === "admin") {
      router.replace(next);
    }
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.ok) { setError(result.error); return; }
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  function handleDevSignIn() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      signInAsDev();
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  function handleBack() {
    if (back) {
      // Explicit back URL takes precedence — used by the embed admin-access
      // link to send the operator back to the host site they came from.
      window.location.href = back;
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.replace("/");
  }

  if (!hydrated) {
    return <div className="min-h-screen bg-brand-black" />;
  }

  const showDevButton = mode === "dev" || mode === "off";

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-body antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back button — top-left of the card */}
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-[12px] text-brand-cream/60 hover:text-brand-cream transition-colors"
          type="button"
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div className="rounded-2xl border border-white/10 bg-brand-black-soft p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-2">Aqua portal</p>
          <h1 className="font-display text-2xl text-brand-cream mb-1">Admin sign-in</h1>
          <p className="text-[12px] text-brand-cream/55 mb-5">
            {mode === "strict"
              ? "Sign in to manage your portal."
              : mode === "dev"
                ? "Sign in or use Dev mode for one-click access."
                : "Security is off — click Dev mode to enter."}
          </p>

          {mode !== "off" && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-white/30"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-white/30"
              />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={busy || !email || !password}
                className="w-full px-3 py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {showDevButton && (
            <>
              {mode !== "off" && (
                <div className="my-4 flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/30">
                  <span className="flex-1 h-px bg-white/10" />
                  <span>or</span>
                  <span className="flex-1 h-px bg-white/10" />
                </div>
              )}
              <button
                type="button"
                onClick={handleDevSignIn}
                disabled={busy}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-amber/40 bg-brand-amber/10 text-brand-amber text-sm font-semibold disabled:opacity-40 hover:bg-brand-amber/20 transition-colors flex items-center justify-center gap-2"
              >
                <span aria-hidden="true">⚡</span>
                <span>{busy ? "Entering…" : "Dev mode — instant sign-in"}</span>
              </button>
              {mode === "off" && error && (
                <p className="mt-3 text-[11px] text-red-400">{error}</p>
              )}
              <p className="mt-3 text-[10px] text-brand-cream/40 text-center">
                {mode === "off"
                  ? "Set NEXT_PUBLIC_PORTAL_SECURITY=strict to require credentials."
                  : "Visible because NEXT_PUBLIC_PORTAL_SECURITY isn't set to strict."}
              </p>
            </>
          )}

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-brand-cream/45">
            <Link href="/account" className="hover:text-brand-cream transition-colors">
              Customer sign-in →
            </Link>
            <Link href="/" className="hover:text-brand-cream transition-colors">
              Site →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalAdminLoginPage() {
  // useSearchParams() requires a Suspense boundary for static export safety.
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <LoginInner />
    </Suspense>
  );
}
