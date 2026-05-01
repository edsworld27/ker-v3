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

interface EmbedTheme {
  brandColor?: string;
  logoUrl?: string;
  welcomeHeadline?: string;
  welcomeSubtitle?: string;
  signInLabel?: string;
  showAdminLink?: boolean;
  adminLinkLabel?: string;
  adminUrl?: string;
}

const DEFAULT_BRAND = "#FF6B35";

export default function PortalEmbedLoginPage() {
  const [siteId, setSiteId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedInAs, setSignedInAs] = useState<{ email: string; name: string } | null>(null);
  const [theme, setTheme] = useState<EmbedTheme>({});

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

    // Pull the per-site embed theme so the iframe paints with the
    // tenant's brand colour, logo, and copy.
    void (async () => {
      try {
        const res = await fetch(`/api/portal/embed-theme/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (res.ok) setTheme(await res.json() as EmbedTheme);
      } catch {}
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

  const brand = theme.brandColor || DEFAULT_BRAND;
  const headline = theme.welcomeHeadline || (signedInAs ? "Signed in" : "Welcome");
  const subtitle = theme.welcomeSubtitle ?? (signedInAs
    ? `You're signed in as ${signedInAs.name}`
    : siteId ? `Sign in to ${siteId}` : "Sign in to continue");
  const signInLabel = theme.signInLabel || "Sign in";
  const adminUrl = theme.adminUrl || "/admin";
  const adminLabel = theme.adminLinkLabel || "Admin sign-in →";

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-body antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-brand-black-soft p-6 shadow-2xl">
          {theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.logoUrl} alt="" className="h-8 w-auto mb-3" />
          ) : (
            <p className="text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: brand }}>Portal</p>
          )}
          <h1 className="font-display text-2xl text-brand-cream mb-1">
            {headline}
          </h1>
          <p className="text-[12px] text-brand-cream/55 mb-5">{subtitle}</p>

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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-white/30"
                style={{ outlineColor: brand }}
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
                className="w-full px-3 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: brand }}
              >
                {busy ? "Signing in…" : signInLabel}
              </button>
            </form>
          )}

          {theme.showAdminLink && !signedInAs && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <a
                href={adminUrl}
                target="_top"
                rel="noopener noreferrer"
                className="text-[12px] text-brand-cream/60 hover:text-brand-cream"
              >
                {adminLabel}
              </a>
            </div>
          )}

          <p className="text-[10px] text-brand-cream/30 mt-5 text-center">
            Portal-managed session · isolated to this origin
          </p>
        </div>
      </div>
    </div>
  );
}
