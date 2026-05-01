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
      // Server-side cookie session. Strict mode requires this to succeed.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (mode !== "strict") {
          // In dev/off, fall back to the legacy localStorage path so a
          // pre-existing demo user can still sign in.
          const fallback = await signInWithEmail(email, password);
          if (!fallback.ok) { setError(fallback.error); return; }
          router.replace(next);
          return;
        }
        setError(data?.error ?? "Sign-in failed"); return;
      }
      // Mirror the session into localStorage so existing client-side
      // /admin code (which still reads getSession()) stays in sync.
      await signInWithEmail(email, password).catch(() => {});
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  async function handleDevSignIn() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      // Server cookie first — so middleware lets the operator into /admin.
      const res = await fetch("/api/auth/dev", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Dev sign-in disabled"); return;
      }
      // Localstorage parity for client-side code.
      try { signInAsDev(); } catch {}
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
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
    return <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #06121f 0%, #0a0e1a 100%)" }} />;
  }

  const showDevButton = mode === "dev" || mode === "off";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-body antialiased"
      style={{
        background: "linear-gradient(135deg, #06121f 0%, #0a0e1a 50%, #0f1828 100%)",
        color: "#e6f1ff",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Back button — top-left of the card */}
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-[12px] text-cyan-200/70 hover:text-cyan-100 transition-colors"
          type="button"
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div
          className="rounded-2xl p-6 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(56,189,248,0.18)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-7 h-7 rounded-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #6366f1 100%)" }}
              aria-hidden="true"
            />
            <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-300">Aqua portal</p>
          </div>
          <h1 className="font-display text-2xl mb-1" style={{ color: "#fff" }}>Admin sign-in</h1>
          <p className="text-[12px] text-cyan-100/55 mb-5">
            {mode === "strict"
              ? "Sign in to manage your portal."
              : mode === "dev"
                ? "Sign in, or hit Dev bypass below for one-click admin access."
                : "Security is off — click Dev bypass to enter."}
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
                className="w-full bg-white/5 border border-cyan-300/10 rounded-xl px-3 py-2.5 text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-300/40"
                style={{ color: "#e6f1ff" }}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                className="w-full bg-white/5 border border-cyan-300/10 rounded-xl px-3 py-2.5 text-sm placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-300/40"
                style={{ color: "#e6f1ff" }}
              />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={busy || !email || !password}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", color: "#fff" }}
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {showDevButton && (
            <>
              {mode !== "off" && (
                <div className="my-4 flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-cyan-100/35">
                  <span className="flex-1 h-px bg-cyan-300/15" />
                  <span>or</span>
                  <span className="flex-1 h-px bg-cyan-300/15" />
                </div>
              )}
              <button
                type="button"
                onClick={handleDevSignIn}
                disabled={busy}
                className="w-full px-3 py-3 rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "#1a1a1a",
                  boxShadow: "0 8px 24px rgba(251,191,36,0.25)",
                }}
              >
                <span aria-hidden="true">⚡</span>
                <span>{busy ? "Entering…" : "Dev bypass — open portal"}</span>
              </button>
              {mode === "off" && error && (
                <p className="mt-3 text-[11px] text-red-400">{error}</p>
              )}
              <p className="mt-2 text-[10px] text-cyan-100/40 text-center">
                One-click admin access for development. Set <code className="font-mono">NEXT_PUBLIC_PORTAL_SECURITY=true</code> in production to disable.
              </p>
            </>
          )}

          <div className="mt-5 pt-4 border-t border-cyan-300/10 flex items-center justify-between text-[11px] text-cyan-100/45">
            <Link href="/account" className="hover:text-cyan-100 transition-colors">
              Customer sign-in →
            </Link>
            <Link href="/" className="hover:text-cyan-100 transition-colors">
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
    <Suspense fallback={<div className="min-h-screen" style={{ background: "linear-gradient(135deg, #06121f 0%, #0a0e1a 100%)" }} />}>
      <LoginInner />
    </Suspense>
  );
}
