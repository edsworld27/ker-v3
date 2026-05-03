"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AUTH_EVENT,
  getSession, signOut, signInWithEmail, signInWithGoogle, signUp,
  resendVerificationEmail, isAdminEmail,
  type Session, type User,
} from "@/lib/auth";
import { getOrCreateCodeForUser, type ReferralCode } from "@/lib/referralCodes";
import CookiePreferencesModal from "@/components/CookiePreferencesModal";
import {
  getLoginCustomisation, onLoginCustomisationChange,
  type LoginCustomisation,
} from "@/lib/admin/loginCustomisation";
import BlockRenderer from "@/components/editor/BlockRenderer";
import { listPortalVariants } from "@/lib/admin/editorPages";
import { getActiveSite } from "@/lib/admin/sites";
import type { EditorPage } from "@/portal/server/types";

// ── Mock orders + referrals ─────────────────────────────────────────────────
//
// In production these come from Shopify:
//   orders     → fetchCustomerOrders(session.accessToken)  (src/lib/shopifyCustomer.ts)
//   referrals  → Shopify Admin API discountCode usage report, filtered by the
//                user's referral code.

const MOCK_ORDERS = [
  { id: "ORD-4821", date: "18 Apr 2026", status: "Delivered",
    items: [
      { name: "Odo Body · Wild Orange · 200g", qty: 1, price: 22.0 },
      { name: "Odo Face · Lavender · 100ml",   qty: 1, price: 24.0 },
    ], total: 46.0, tracking: "GB123456789" },
  { id: "ORD-3910", date: "2 Mar 2026",  status: "Delivered",
    items: [{ name: "The Ritual Set · Signature", qty: 1, price: 55.0 }],
    total: 55.0, tracking: "GB987654321" },
  { id: "ORD-3104", date: "14 Jan 2026", status: "Delivered",
    items: [
      { name: "Odo Hands · Frankincense · 100g", qty: 2, price: 36.0 },
      { name: "Odo Pumice · Standard",            qty: 1, price: 12.0 },
    ], total: 48.0, tracking: "GB456123789" },
];

const MOCK_REFERRALS = [
  { name: "Sarah M.",  date: "22 Apr 2026", status: "Converted", earned: 10 },
  { name: "James O.",  date: "14 Apr 2026", status: "Converted", earned: 10 },
  { name: "Fatima D.", date: "3 Apr 2026",  status: "Pending",   earned: 0  },
  { name: "Yaa S.",    date: "19 Mar 2026", status: "Converted", earned: 10 },
  { name: "Tom B.",    date: "7 Mar 2026",  status: "Converted", earned: 10 },
];

type DashTab = "orders" | "affiliate" | "privacy";

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab: DashTab = rawTab === "affiliate" ? "affiliate" : rawTab === "privacy" ? "privacy" : "orders";

  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
    // Keep this page in sync if the user signs out from the navbar dropdown
    // (or signs in from another tab).
    const refresh = () => setSession(getSession());
    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!hydrated) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 min-h-screen bg-brand-black" />
        <Footer />
      </>
    );
  }

  if (session) {
    return (
      <Dashboard
        key={initialTab}
        user={session.user}
        initialTab={initialTab}
        onLogout={() => { signOut(); setSession(null); }}
        onRefresh={() => setSession(getSession())}
      />
    );
  }

  return <LoginScreen onLogin={(s) => setSession(s)} />;
}

// Logged-out landing. Prefers an operator-designed "login" portal variant
// if one is active for the current site; otherwise falls back to the
// existing AuthForm with LoginCustomisation styling. The variant block
// tree typically includes a LoginFormBlock that handles auth.
function LoginScreen({ onLogin }: { onLogin: (s: Session) => void }) {
  const [variant, setVariant] = useState<EditorPage | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const site = getActiveSite();
      if (!site) { if (!cancelled) setVariant(null); return; }
      const variants = await listPortalVariants(site.id, "login");
      if (cancelled) return;
      setVariant(variants.find(v => v.isActivePortal) ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // Optimistic — show the existing form while the variant fetch resolves
  // so customers don't see a blank screen on slow networks. Also fall
  // back if the active variant exists but has no blocks (operator saved
  // an empty variant by accident).
  const renderableBlocks = variant?.publishedBlocks ?? variant?.blocks ?? [];
  const useVariant = variant && renderableBlocks.length > 0;

  if (!useVariant) return <AuthForm onLogin={onLogin} />;

  return (
    <>
      <Navbar />
      <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
        <BlockRenderer blocks={renderableBlocks} themeId={variant.themeId} />
      </main>
      <Footer />
    </>
  );
}

// ── Auth form ────────────────────────────────────────────────────────────────

type Mode = "signin" | "signup";

function AuthForm({ onLogin }: { onLogin: (s: Session) => void }) {
  const [cfg, setCfg] = useState<LoginCustomisation>(() => getLoginCustomisation());
  const [mode,     setMode]     = useState<Mode>("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [busy,     setBusy]     = useState<"google" | "email" | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => onLoginCustomisationChange(() => setCfg(getLoginCustomisation())), []);

  const isSignIn = mode === "signin";
  const headline    = isSignIn ? cfg.headline    : cfg.signupHeadline;
  const subheadline = isSignIn ? cfg.subheadline : cfg.signupSubheadline;
  const btnLabel    = isSignIn ? cfg.loginButtonLabel : cfg.signupButtonLabel;
  const primaryColor = cfg.primaryColor || "#E8621A";

  async function handleGoogle() {
    setError(null); setBusy("google");
    const r = await signInWithGoogle();
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    onLogin(r.session);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy("email");
    const r = isSignIn
      ? await signInWithEmail(email, password)
      : await signUp({ email, password, name });
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    onLogin(r.session);
  }

  const formInner = (
    <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
      {/* Logo */}
      {cfg.showLogo && cfg.logoUrl && (
        <img src={cfg.logoUrl} alt="Logo" className="h-10 mb-6 object-contain" />
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="adinkra-line w-10" />
        <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Account</span>
      </div>
      <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-3"
        style={cfg.textColor ? { color: cfg.textColor } : undefined}>
        {headline}
      </h1>
      <p className="text-brand-cream/65 leading-relaxed mb-8"
        style={cfg.textColor ? { color: `${cfg.textColor}99` } : undefined}>
        {subheadline}
      </p>

      {/* Social proof */}
      {cfg.showSocialProof && cfg.socialProofText && (
        <p className="text-xs text-brand-cream/45 bg-white/4 border border-white/8 rounded-lg px-4 py-2.5 mb-6 text-center">
          ⭐ {cfg.socialProofText}
        </p>
      )}

      {/* Mode tabs — only if signup is enabled */}
      {cfg.enableSignup && (
        <div className="grid grid-cols-2 mb-6 rounded-xl bg-brand-black-card p-1 border border-white/5">
          {(["signin", "signup"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className="py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={mode === m
                ? { background: primaryColor, color: "#fff" }
                : { color: "rgba(255,255,255,0.55)" }}
            >
              {m === "signin" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>
      )}

      {/* Google button */}
      {cfg.enableGoogle && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy !== null}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/15 bg-brand-black-card hover:bg-white/[0.04] disabled:opacity-50 text-sm font-medium text-brand-cream transition-colors"
        >
          <GoogleIcon />
          {busy === "google" ? "Connecting…" : isSignIn ? "Continue with Google" : "Sign up with Google"}
        </button>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/30">or use email</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignIn && cfg.enableSignup && (
          <Field label="Name">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Your name" className={inputCls} />
          </Field>
        )}
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="you@example.com" className={inputCls} />
        </Field>
        <Field
          label="Password"
          right={isSignIn && cfg.enableForgotPassword
            ? <Link href="/account/forgot-password" className="text-[11px] hover:underline" style={{ color: primaryColor }}>Forgot?</Link>
            : undefined}
        >
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={8} placeholder={isSignIn ? "Your password" : "At least 8 characters"}
            className={inputCls} />
        </Field>

        {error && (
          <div className="text-xs text-red-300/90 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={busy !== null}
          className="w-full py-4 rounded-xl disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-lg transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
          style={{ background: primaryColor, boxShadow: `0 8px 24px ${primaryColor}26` }}>
          {busy === "email" ? "Working…" : btnLabel}
        </button>
      </form>

      <p className="text-xs text-brand-cream/40 mt-6 text-center">
        By continuing you agree to our{" "}
        <Link href="/privacy" className="text-brand-cream/60 hover:underline">Privacy Policy</Link>.
      </p>

      {/* Footer links */}
      {cfg.footerLinks.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-4 border-t border-white/8">
          {cfg.footerLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-xs text-brand-cream/40 hover:text-brand-cream transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/8">
        <Link
          href="/admin"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all"
          style={{ borderColor: `${primaryColor}4d`, color: primaryColor, background: `${primaryColor}14` }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Admin Access
        </Link>
      </div>
    </div>
  );

  const customCss = cfg.customCSS
    ? <style dangerouslySetInnerHTML={{ __html: cfg.customCSS }} />
    : null;

  if (cfg.layout === "split") {
    const overlayAlpha = Math.round(cfg.heroOverlayOpacity * 255).toString(16).padStart(2, "0");
    const overlayHex   = `${cfg.heroOverlayColor}${overlayAlpha}`;
    return (
      <>
        {customCss}
        <Navbar />
        <main className="w-full min-h-screen flex" style={cfg.bgColor ? { background: cfg.bgColor } : undefined}>
          {/* Left hero panel */}
          <div
            className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden shrink-0 items-end p-12"
            style={cfg.heroImage ? { backgroundImage: `url(${cfg.heroImage})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "#111" }}
          >
            <div className="absolute inset-0" style={{ background: overlayHex }} />
            <div className="relative z-10">
              <p className="font-display text-3xl xl:text-4xl text-white font-bold leading-tight">{headline}</p>
              <p className="text-white/70 mt-2 text-sm leading-relaxed">{subheadline}</p>
            </div>
          </div>
          {/* Right form panel */}
          <div className="flex-1 flex items-center justify-center pt-20 overflow-y-auto"
            style={cfg.cardColor ? { background: cfg.cardColor } : undefined}>
            {formInner}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (cfg.layout === "minimal") {
    return (
      <>
        {customCss}
        <Navbar />
        <main className="w-full pt-20 sm:pt-24 min-h-screen"
          style={{ background: cfg.bgColor || "transparent" }}>
          {formInner}
        </main>
        <Footer />
      </>
    );
  }

  // Default: centered
  return (
    <>
      {customCss}
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen"
        style={cfg.bgColor ? { background: cfg.bgColor } : undefined}>
        {formInner}
      </main>
      <Footer />
    </>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, initialTab, onLogout, onRefresh }: {
  user: User; initialTab: DashTab; onLogout: () => void; onRefresh: () => void;
}) {
  const [tab, setTab] = useState<DashTab>(initialTab);
  const firstName  = user.name.split(" ")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const admin = isAdminEmail(user.email);

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black pt-16 sm:pt-[4.5rem] lg:pt-20 2xl:pt-24">

        {/* Email-not-verified banner — sits just below the fixed navbar */}
        {!user.emailVerified && <VerifyBanner email={user.email} onRefresh={onRefresh} />}

        {/* Header bar — no longer needs to clear the navbar itself */}
        <section className="w-full pt-8 pb-10 sm:pt-10 sm:pb-12 bg-brand-black-soft border-b border-white/5">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="adinkra-line w-8" />
                  <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">My Account</span>
                </div>
                <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl">
                  Welcome back, {displayName}
                </h1>
                <p className="text-brand-cream/40 text-sm mt-1">
                  {user.email}
                  {user.provider === "google" && <span className="ml-2 text-brand-cream/30">· via Google</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {admin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/20 hover:border-brand-orange/50 transition-colors font-medium"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={onLogout}
                  className="text-xs tracking-wide text-brand-cream/40 hover:text-brand-cream border border-white/10 px-4 py-2 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-8 p-1 bg-brand-black-card border border-white/8 rounded-xl w-fit">
              {([
                { id: "orders",    label: "Orders" },
                { id: "affiliate", label: "Affiliate Dashboard" },
                { id: "privacy",   label: "Privacy & Data" },
              ] as { id: DashTab; label: string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-brand-black-soft border border-white/10 text-brand-cream"
                      : "text-brand-cream/50 hover:text-brand-cream"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab content */}
        <section className="w-full py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12">
            {tab === "orders"    && <OrdersTab />}
            {tab === "affiliate" && <AffiliateTab user={user} />}
            {tab === "privacy"   && <PrivacyTab />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Verify banner ────────────────────────────────────────────────────────────

function VerifyBanner({ email, onRefresh }: { email: string; onRefresh: () => void }) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  function resend() {
    resendVerificationEmail(email);
    setStatus("sent");
    setTimeout(() => { setStatus("idle"); onRefresh(); }, 2500);
  }
  return (
    <div className="w-full bg-brand-amber/15 border-b border-brand-amber/25">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <p className="text-brand-amber">
          ⚠ Verify your email to unlock checkout perks and referral payouts.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={resend}
            className="text-xs px-3 py-1.5 rounded-md border border-brand-amber/40 text-brand-amber hover:bg-brand-amber/10 transition-colors"
          >
            {status === "sent" ? "Sent — check console" : "Resend email"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  // TODO Shopify: replace MOCK_ORDERS with:
  //   const orders = await fetchCustomerOrders(session.accessToken);
  //   useEffect runs once on mount; cache result in state.

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-bold text-brand-cream text-xl sm:text-2xl">Your Orders</h2>
        <span className="text-brand-cream/40 text-sm">{MOCK_ORDERS.length} orders</span>
      </div>

      <p className="text-[11px] text-brand-cream/30 -mt-1 mb-2">
        Showing demo orders. Once Shopify is wired, this list comes straight from <code className="text-brand-cream/50">customer.orders</code>.
      </p>

      {MOCK_ORDERS.map(order => {
        const open = expanded === order.id;
        return (
          <div key={order.id} className="rounded-2xl bg-brand-black-card border border-white/5 overflow-hidden">
            <button
              onClick={() => setExpanded(open ? null : order.id)}
              className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-brand-cream">{order.id}</p>
                  <p className="text-xs text-brand-cream/40 mt-0.5">{order.date}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-display font-bold text-brand-amber text-lg">£{order.total.toFixed(2)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-brand-cream/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {open && (
              <div className="border-t border-white/5 px-5 sm:px-6 py-5 space-y-4">
                <div className="flex flex-col gap-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <p className="text-sm text-brand-cream/70">{item.name} {item.qty > 1 && <span className="text-brand-cream/40">×{item.qty}</span>}</p>
                      <p className="text-sm text-brand-cream shrink-0">£{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] tracking-widest uppercase text-brand-cream/30 mb-1">Tracking</p>
                    <p className="text-sm text-brand-cream/70 font-mono">{order.tracking}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/products"
                      className="text-xs px-4 py-2 rounded-lg border border-white/10 text-brand-cream/60 hover:text-brand-cream hover:border-white/25 transition-colors"
                    >
                      Buy again
                    </Link>
                    <a
                      href={`mailto:hello@luvandker.com?subject=Order%20${order.id}`}
                      className="text-xs px-4 py-2 rounded-lg border border-white/10 text-brand-cream/60 hover:text-brand-cream hover:border-white/25 transition-colors"
                    >
                      Get help
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Affiliate tab ────────────────────────────────────────────────────────────

const TIERS = [
  { label: "Glow Getter",   min: 1,  max: 4,           reward: "£10 / referral" },
  { label: "Skin Advocate", min: 5,  max: 9,           reward: "£15 / referral" },
  { label: "Odo Ambassador",min: 10, max: Infinity,    reward: "£20 + free product" },
];

function AffiliateTab({ user }: { user: User }) {
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setCode(getOrCreateCodeForUser(user.email)); }, [user.email]);

  if (!code) return null;

  const totalReferrals = MOCK_REFERRALS.length;
  const converted      = MOCK_REFERRALS.filter(r => r.status === "Converted").length;
  const totalEarned    = MOCK_REFERRALS.reduce((s, r) => s + r.earned, 0);
  const pendingPayout  = MOCK_REFERRALS.filter(r => r.status === "Converted" && r.earned > 0).slice(-1)[0]?.earned ?? 0;

  const currentTier = TIERS.find(t => totalReferrals >= t.min && totalReferrals <= t.max) ?? TIERS[0];
  const nextTier    = TIERS[TIERS.indexOf(currentTier) + 1];
  const progress    = nextTier
    ? Math.min(((totalReferrals - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100)
    : 100;

  function copy() {
    navigator.clipboard.writeText(code!.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const shareText = `I've been using Odo by Felicia and it's genuinely changed my skin. Use my code ${code.code} for £10 off your first order: https://luv-and-ker.com/products`;

  return (
    <div className="flex flex-col gap-8">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total referrals",   value: totalReferrals },
          { label: "Converted",         value: converted },
          { label: "Total earned",      value: `£${totalEarned}` },
          { label: "Pending payout",    value: `£${pendingPayout}` },
        ].map(s => (
          <div key={s.label} className="flex flex-col p-5 rounded-2xl bg-brand-black-card border border-white/5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-brand-amber">{s.value}</span>
            <span className="text-[11px] tracking-wide text-brand-cream/40 mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tier */}
      <div className="p-6 rounded-2xl bg-brand-black-card border border-white/5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-1">Current tier</p>
            <p className="font-display font-bold text-brand-cream text-xl">{currentTier.label}</p>
            <p className="text-brand-orange text-sm mt-0.5">{currentTier.reward}</p>
          </div>
          {nextTier && (
            <div className="text-right">
              <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-1">Next tier</p>
              <p className="text-brand-cream text-sm font-medium">{nextTier.label}</p>
              <p className="text-brand-cream/40 text-xs mt-0.5">{nextTier.min - totalReferrals} more referral{nextTier.min - totalReferrals !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
        <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-amber transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!nextTier && (
          <p className="text-brand-amber text-xs mt-2">You&apos;re at the top tier — maximum rewards unlocked.</p>
        )}
      </div>

      {/* Referral discount code */}
      <div className="p-6 rounded-2xl bg-brand-black-card border border-white/5">
        <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-2">Your referral discount code</p>
        <p className="text-sm text-brand-cream/55 mb-4">
          Share this code with a friend. When they enter it at checkout they get £10 off — and you earn credit on every successful order.
        </p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-brand-black border border-white/10 rounded-xl px-5 py-4 text-brand-amber text-2xl font-display font-bold tracking-[0.18em] text-center">
            {code.code}
          </div>
          <button
            onClick={copy}
            className="px-5 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium transition-all shrink-0"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share on WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share on X
          </a>
          <a
            href={`mailto:?subject=You need to try this&body=${encodeURIComponent(shareText)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share by Email
          </a>
        </div>
        <p className="text-[11px] text-brand-cream/30 mt-4">
          Tracked on Shopify — once a friend uses your code, the matching order is attributed to you automatically.
        </p>
      </div>

      {/* Referral history */}
      <div>
        <h3 className="font-display font-bold text-brand-cream text-lg mb-4">Referral History</h3>
        <div className="rounded-2xl bg-brand-black-card border border-white/5 overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 border-b border-white/5 text-[11px] tracking-[0.18em] uppercase text-brand-cream/30">
            <span>Friend</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Earned</span>
          </div>
          {MOCK_REFERRALS.map((r, i) => (
            <div key={i} className="grid grid-cols-4 px-5 py-4 border-b border-white/[0.04] last:border-0 items-center">
              <span className="text-sm text-brand-cream">{r.name}</span>
              <span className="text-sm text-brand-cream/50">{r.date}</span>
              <StatusBadge status={r.status} />
              <span className={`text-sm text-right font-medium ${r.earned > 0 ? "text-brand-amber" : "text-brand-cream/30"}`}>
                {r.earned > 0 ? `+£${r.earned}` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout info */}
      <div className="p-5 rounded-2xl border border-brand-purple/20 bg-brand-purple-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-cream">Next payout: <span className="text-brand-amber">1 May 2026</span></p>
          <p className="text-xs text-brand-cream/40 mt-1">Earnings paid monthly via bank transfer or gift credit. Email hello@luvandker.com to set up bank transfer.</p>
        </div>
        <a
          href="mailto:hello@luvandker.com?subject=Affiliate payout setup"
          className="shrink-0 text-xs px-4 py-2.5 rounded-lg border border-brand-purple/40 text-brand-purple-light hover:bg-brand-purple/10 transition-colors whitespace-nowrap"
        >
          Set up payout →
        </a>
      </div>

    </div>
  );
}

// ── Privacy & Data tab ───────────────────────────────────────────────────────

function PrivacyTab() {
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefTab, setPrefTab] = useState<"cookies" | "data">("cookies");

  return (
    <div className="space-y-6">
      {/* Cookie preferences */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg text-brand-cream">Cookie preferences</h3>
          <p className="text-sm text-brand-cream/45 mt-1">Control which cookies are active on your account.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            {[
              { key: "necessary", label: "Strictly necessary", desc: "Always on — required for the site to function.", fixed: true },
              { key: "functional", label: "Functional", desc: "Cart, preferences, personalisation." },
              { key: "analytics", label: "Analytics", desc: "Usage patterns to improve the site." },
              { key: "marketing", label: "Marketing", desc: "Personalised ads on social platforms." },
            ].map(cat => (
              <div key={cat.key} className="rounded-xl border border-white/8 p-3">
                <p className="font-medium text-brand-cream text-xs mb-0.5">{cat.label}</p>
                <p className="text-[11px] text-brand-cream/40 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setPrefTab("cookies"); setShowPrefs(true); }}
              className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
            >
              Manage cookie settings
            </button>
          </div>
        </div>
      </div>

      {/* Data rights */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg text-brand-cream">Your data rights (GDPR)</h3>
          <p className="text-sm text-brand-cream/45 mt-1">Download or delete data we hold about you in this browser.</p>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-brand-cream/55 leading-relaxed">
            We store your session, cart, orders, and preferences in your browser. You have the right to access, download,
            or permanently delete this data at any time.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setPrefTab("data"); setShowPrefs(true); }}
              className="text-xs px-4 py-2 rounded-lg border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 font-semibold transition-colors"
            >
              ↓ Download my data
            </button>
            <button
              onClick={() => { setPrefTab("data"); setShowPrefs(true); }}
              className="text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold transition-colors"
            >
              Delete my data
            </button>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card px-6 py-5">
        <p className="text-sm font-medium text-brand-cream mb-1">Questions about your data?</p>
        <p className="text-sm text-brand-cream/50 leading-relaxed">
          Email <a href="mailto:privacy@luvandker.com" className="text-brand-orange hover:underline">privacy@luvandker.com</a> — we respond within 72 hours.
        </p>
      </div>

      {showPrefs && <CookiePreferencesModal onClose={() => setShowPrefs(false)} initialTab={prefTab} />}
    </div>
  );
}

// ── Shared helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    Delivered:  "bg-brand-amber/15 text-brand-amber",
    Processing: "bg-brand-purple/20 text-brand-purple-light",
    Shipped:    "bg-brand-orange/15 text-brand-orange",
    Converted:  "bg-brand-amber/15 text-brand-amber",
    Pending:    "bg-white/8 text-brand-cream/50",
  };
  return (
    <span className={`text-[11px] tracking-wide px-2.5 py-1 rounded-full ${colours[status] ?? "bg-white/8 text-brand-cream/50"}`}>
      {status}
    </span>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50">{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-brand-black-card border border-white/10 rounded-xl px-4 py-3.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 transition-colors";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.55c2.08-1.92 3.28-4.74 3.28-8.11z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.27-2.62l-3.55-2.76c-.98.66-2.24 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.85 14.14a6.6 6.6 0 0 1 0-4.28V7H2.18a11 11 0 0 0 0 10l3.67-2.86z"/>
      <path fill="#EA4335" d="M12 5.4c1.61 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.18 7l3.67 2.85C6.72 7.32 9.14 5.4 12 5.4z"/>
    </svg>
  );
}
