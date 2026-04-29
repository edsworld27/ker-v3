"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: "ORD-4821",
    date: "18 Apr 2026",
    status: "Delivered",
    items: [
      { name: "Odo Body · Wild Orange · 200g", qty: 1, price: 22.0 },
      { name: "Odo Face · Lavender · 100ml",   qty: 1, price: 24.0 },
    ],
    total: 46.0,
    tracking: "GB123456789",
  },
  {
    id: "ORD-3910",
    date: "2 Mar 2026",
    status: "Delivered",
    items: [
      { name: "The Ritual Set · Signature",     qty: 1, price: 55.0 },
    ],
    total: 55.0,
    tracking: "GB987654321",
  },
  {
    id: "ORD-3104",
    date: "14 Jan 2026",
    status: "Delivered",
    items: [
      { name: "Odo Hands · Frankincense · 100g", qty: 2, price: 36.0 },
      { name: "Odo Pumice · Standard",            qty: 1, price: 12.0 },
    ],
    total: 48.0,
    tracking: "GB456123789",
  },
];

const MOCK_REFERRALS = [
  { name: "Sarah M.",  date: "22 Apr 2026", status: "Converted", earned: 10 },
  { name: "James O.",  date: "14 Apr 2026", status: "Converted", earned: 10 },
  { name: "Fatima D.", date: "3 Apr 2026",  status: "Pending",   earned: 0  },
  { name: "Yaa S.",    date: "19 Mar 2026", status: "Converted", earned: 10 },
  { name: "Tom B.",    date: "7 Mar 2026",  status: "Converted", earned: 10 },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode      = "signin" | "signup";
type DashTab   = "orders" | "affiliate";

// ── Main component ────────────────────────────────────────────────────────────

export default function AccountPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  if (loggedIn) {
    return <Dashboard email={userEmail} onLogout={() => setLoggedIn(false)} />;
  }
  return <AuthForm onLogin={(email) => { setUserEmail(email); setLoggedIn(true); }} />;
}

// ── Auth form ─────────────────────────────────────────────────────────────────

function AuthForm({ onLogin }: { onLogin: (email: string) => void }) {
  const [mode,     setMode]     = useState<Mode>("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [busy,     setBusy]     = useState(false);

  const isSignIn = mode === "signin";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(email); }, 700);
  }

  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black min-h-screen">
        <div className="w-full max-w-md mx-auto px-6 sm:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Account</span>
          </div>
          <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-3">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-brand-cream/65 leading-relaxed mb-8">
            {isSignIn
              ? "Sign in to view your orders and your affiliate dashboard."
              : "Create an account to track orders, earn referral credit, and join the Odo community."}
          </p>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 mb-8 rounded-xl bg-brand-black-card p-1 border border-white/5">
            {(["signin", "signup"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? "bg-brand-orange text-white" : "text-brand-cream/55 hover:text-brand-cream"
                }`}
              >
                {m === "signin" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <Field label="Name">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  required placeholder="Your name" className={inputCls} />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field label="Password" right={isSignIn ? <a href="#" className="text-[11px] text-brand-orange hover:underline">Forgot?</a> : undefined}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={8} placeholder={isSignIn ? "Your password" : "At least 8 characters"}
                className={inputCls} />
            </Field>

            <button type="submit" disabled={busy}
              className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-50 text-white text-sm font-semibold tracking-wide shadow-lg shadow-brand-orange/15 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
              {busy ? "Working…" : isSignIn ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-brand-cream/40 mt-6 text-center">
            By continuing you agree to our{" "}
            <a href="/privacy" className="text-brand-cream/60 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<DashTab>("orders");

  const firstName  = email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black">

        {/* Header bar */}
        <section className="w-full pt-24 pb-10 sm:pt-28 sm:pb-12 bg-brand-black-soft border-b border-white/5">
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
                <p className="text-brand-cream/40 text-sm mt-1">{email}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-xs tracking-wide text-brand-cream/40 hover:text-brand-cream border border-white/10 px-4 py-2 rounded-lg transition-colors"
              >
                Log out
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-8 p-1 bg-brand-black-card border border-white/8 rounded-xl w-fit">
              {([
                { id: "orders",    label: "Orders" },
                { id: "affiliate", label: "Affiliate Dashboard" },
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
            {tab === "affiliate" && <AffiliateTab email={email} />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-bold text-brand-cream text-xl sm:text-2xl">Your Orders</h2>
        <span className="text-brand-cream/40 text-sm">{MOCK_ORDERS.length} orders</span>
      </div>

      {MOCK_ORDERS.map(order => {
        const open = expanded === order.id;
        return (
          <div key={order.id} className="rounded-2xl bg-brand-black-card border border-white/5 overflow-hidden">
            {/* Row summary */}
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

            {/* Expanded detail */}
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

      {MOCK_ORDERS.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-brand-cream/40 text-lg mb-2">No orders yet.</p>
          <Link href="/products" className="text-brand-orange text-sm underline underline-offset-4 mt-2">
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Affiliate tab ─────────────────────────────────────────────────────────────

const TIERS = [
  { label: "Glow Getter",   min: 1,  max: 4,  reward: "£10 / referral" },
  { label: "Skin Advocate", min: 5,  max: 9,  reward: "£15 / referral" },
  { label: "Odo Ambassador",min: 10, max: Infinity, reward: "£20 + free product" },
];

function AffiliateTab({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const slug = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  const referralLink = `https://luv-and-ker.com/ref/${slug}`;

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
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

      {/* Tier + progress */}
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

      {/* Referral link */}
      <div className="p-6 rounded-2xl bg-brand-black-card border border-white/5">
        <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-3">Your referral link</p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-brand-amber text-sm truncate">
            {referralLink}
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
            href={`https://wa.me/?text=I've been using Odo by Felicia and it's genuinely changed my skin. Try it with £10 off: ${referralLink}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share on WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=My skin has never felt this good. Try Odo by Felicia with £10 off: ${referralLink}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share on X
          </a>
          <a
            href={`mailto:?subject=You need to try this&body=I've been using Odo by Felicia — it's genuinely the best soap I've ever used. Get £10 off your first order: ${referralLink}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs transition-colors"
          >
            Share by Email
          </a>
        </div>
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

// ── Shared helpers ────────────────────────────────────────────────────────────

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
