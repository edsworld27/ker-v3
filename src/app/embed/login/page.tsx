"use client";

// /embed/login — iframeable login page. Host sites embed it via
//
//   <iframe src="https://your-portal.app/embed/login?site=<siteId>"
//           width="360" height="480"
//           style="border:0; border-radius:16px"></iframe>
//
// Or via the JS embed snippet shown in /admin/portal-settings, which
// auto-creates the iframe at a chosen mount point.
//
// Successful login posts a message to the parent frame:
//
//   { source: "portal-login", type: "auth-success",
//     siteId, email, name, accessToken, expiresAt }
//
// The host site listens with window.addEventListener("message", …),
// validates event.origin against its expected portal URL, and stores
// the token however it wants (cookie, localStorage, server session).
//
// We deliberately avoid sending portal admin cookies into this frame —
// each site's iframe boots fresh and the host owns the resulting
// session shape on its end.

import { useEffect, useState } from "react";

interface AuthMessage {
  source: "portal-login";
  type: "auth-success" | "auth-error" | "ready";
  siteId: string;
  email?: string;
  name?: string;
  accessToken?: string;
  expiresAt?: number;
  error?: string;
}

export default function PortalEmbedLoginPage() {
  const [siteId, setSiteId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hostOrigin, setHostOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setSiteId(params.get("site") ?? "");
    // Capture the parent's origin so we can target postMessage at it
    // rather than "*". We can't read parent.location cross-origin, but
    // document.referrer tells us where we were embedded from.
    try {
      const ref = document.referrer;
      if (ref) setHostOrigin(new URL(ref).origin);
    } catch {}
    // Tell the parent the iframe is ready so it can resize / show.
    postToParent({
      source: "portal-login",
      type: "ready",
      siteId: params.get("site") ?? "",
    });
  }, []);

  function postToParent(message: AuthMessage) {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;          // not in an iframe
    try {
      window.parent.postMessage(message, hostOrigin || "*");
    } catch { /* parent gone */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);

    // We piggy-back on the existing localStorage-based auth in
    // /lib/auth.ts. Imported dynamically so the iframe bundle stays
    // small for cold starts.
    try {
      const auth = await import("@/lib/auth");
      const result = await auth.signInWithEmail(email, password);
      if (!result.ok) {
        setError(result.error);
        postToParent({
          source: "portal-login",
          type: "auth-error",
          siteId,
          error: result.error,
        });
        return;
      }
      const session = auth.getSession();
      if (!session) {
        setError("Session not created");
        return;
      }
      postToParent({
        source: "portal-login",
        type: "auth-success",
        siteId,
        email: session.user.email,
        name: session.user.name,
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-body antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-brand-black-soft p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-2">Portal sign-in</p>
          <h1 className="font-display text-2xl text-brand-cream mb-1">Welcome back</h1>
          <p className="text-[12px] text-brand-cream/45 mb-5">
            {siteId ? <>Signing in to <strong className="text-brand-cream">{siteId}</strong></> : "Sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
            />
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={busy || !email || !password}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold disabled:opacity-40 transition-colors"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-[10px] text-brand-cream/30 mt-5 text-center">
            Embedded portal login · sends auth state via postMessage to the parent frame
          </p>
        </div>
      </div>
    </div>
  );
}
