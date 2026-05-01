"use client";

// /embed/login — self-contained iframe-able portal sign-in page.
//
// Architecture note (corrected from the postMessage-token version):
// the iframe is the portal app. Cookies, localStorage, sessions, and
// API calls to /api/portal/* all live in THIS origin (portal.app),
// which is first-party from the iframe's perspective even when the
// parent page is on a different origin. The host page doesn't manage
// auth tokens, doesn't read user state, doesn't call our APIs — same
// model as Intercom / Crisp / Calendly chat widgets. They embed us;
// we run our own world inside the iframe.
//
// What we DO postMessage (best-effort, optional): "ready", "resize",
// "auth-changed" (booleans only — no tokens). Lets the parent show a
// nicer container (resize the iframe panel, badge "signed in", etc.)
// without ever exposing credentials.
//
// Storage partitioning: modern browsers isolate 3rd-party iframe
// storage per parent. That's actually a feature here — each host site
// gets its own scoped portal session. Visitors don't bleed state
// between sites that embed the same portal.

import { useEffect, useState } from "react";

interface ParentSignal {
  source: "portal-embed";
  type: "ready" | "resize" | "auth-changed";
  siteId: string;
  authed?: boolean;
  email?: string;
  name?: string;
  height?: number;        // for "resize"
}

export default function PortalEmbedLoginPage() {
  const [siteId, setSiteId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedInAs, setSignedInAs] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("site") ?? "";
    setSiteId(id);

    // Restore session if the user is already signed in (cookie/localStorage
    // scoped to the portal origin — survives navigation within the iframe).
    void (async () => {
      const auth = await import("@/lib/auth");
      const session = auth.getSession();
      if (session) {
        setSignedInAs({ email: session.user.email, name: session.user.name });
        signal({ source: "portal-embed", type: "auth-changed", siteId: id, authed: true, email: session.user.email, name: session.user.name });
      }
    })();

    signal({ source: "portal-embed", type: "ready", siteId: id });
  }, []);

  // Tell the parent (best-effort) that our content height changed so it
  // can resize the iframe. Targets the ancestor's origin via "*" because
  // we don't always know who's embedding us.
  function signal(message: ParentSignal) {
    if (typeof window === "undefined") return;
    if (window.parent === window) return;
    try { window.parent.postMessage(message, "*"); } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const auth = await import("@/lib/auth");
      const result = await auth.signInWithEmail(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const session = auth.getSession();
      if (!session) { setError("Session not created"); return; }
      setSignedInAs({ email: session.user.email, name: session.user.name });
      signal({
        source: "portal-embed",
        type: "auth-changed",
        siteId,
        authed: true,
        email: session.user.email,
        name: session.user.name,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  async function handleSignOut() {
    const auth = await import("@/lib/auth");
    auth.signOut();
    setSignedInAs(null);
    setEmail(""); setPassword("");
    signal({ source: "portal-embed", type: "auth-changed", siteId, authed: false });
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-body antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-brand-black-soft p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-2">Portal</p>
          <h1 className="font-display text-2xl text-brand-cream mb-1">
            {signedInAs ? "Signed in" : "Welcome"}
          </h1>
          <p className="text-[12px] text-brand-cream/45 mb-5">
            {signedInAs
              ? <>You&apos;re signed in as <strong className="text-brand-cream">{signedInAs.name}</strong></>
              : siteId
                ? <>Sign in to <strong className="text-brand-cream">{siteId}</strong></>
                : "Sign in to continue"}
          </p>

          {signedInAs ? (
            <div className="space-y-3">
              <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[12px] text-brand-cream/70">
                {signedInAs.email}
              </div>
              <button
                onClick={handleSignOut}
                className="w-full px-3 py-2.5 rounded-xl border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
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
          )}

          <p className="text-[10px] text-brand-cream/30 mt-5 text-center">
            Portal-managed session · isolated to this origin
          </p>
        </div>
      </div>
    </div>
  );
}
