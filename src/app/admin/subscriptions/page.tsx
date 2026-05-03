"use client";

// /admin/subscriptions — Subscriptions plugin landing page.
// Operator overview of recurring billing across the org. Surfaces the
// configured plans, links to plan management, and a "Send portal link"
// affordance the operator can use to push any customer (by email) into
// the Stripe-hosted billing portal for self-serve plan changes.

import { useState } from "react";
import Link from "next/link";
import PluginPageScaffold from "@/components/admin/PluginPageScaffold";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { notify } from "@/components/admin/Toaster";

export default function AdminSubscriptionsPage() {
  return (
    <PluginPageScaffold
      pluginId="subscriptions"
      eyebrow="Recurring billing"
      title="Subscriptions"
      description="Active subscribers, MRR, churn, and the plans you offer. Powered by Stripe via the E-commerce plugin's keys."
      actions={<Link href="/admin/subscriptions/plans" className="text-xs px-3 py-2 rounded-lg border border-brand-orange/40 bg-brand-orange/10 text-brand-orange/90 hover:bg-brand-orange/20">Manage plans →</Link>}
    >
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Active subscribers" value="—" hint="Once subscribers exist they'll count here." />
        <Stat label="Monthly recurring" value="—" hint="MRR aggregates active plan amounts." />
        <Stat label="Churn (30d)" value="—" hint="Cancellations as a share of starting active." />
      </section>

      <BillingPortalCard />

      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-6 sm:p-8 space-y-3">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Get started</h2>
        <ol className="text-[13px] text-brand-cream/85 list-decimal list-inside space-y-2">
          <li>Configure your plans on <Link href="/admin/subscriptions/plans" className="text-cyan-300 hover:text-cyan-200 underline">/admin/subscriptions/plans</Link>.</li>
          <li>Make sure the E-commerce plugin has Stripe keys saved — Subscriptions reuses them.</li>
          <li>
            Enable the hosted billing portal on the Subscriptions plugin's <Link
              href={`/aqua/${getActiveOrgId()}/plugins/subscriptions`}
              className="text-cyan-300 hover:text-cyan-200 underline"
            >settings</Link> so customers can self-serve plan changes.
          </li>
        </ol>
      </section>
    </PluginPageScaffold>
  );
}

function BillingPortalCard() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const target = email.trim();
    if (!target) return;
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerEmail: target }),
      });
      const data = await res.json() as { ok: boolean; url?: string; error?: string };
      if (!data.ok || !data.url) {
        notify({ tone: "error", title: "Couldn't mint portal link", message: data.error ?? `HTTP ${res.status}` });
        return;
      }
      window.open(data.url, "_blank", "noopener");
      notify({ tone: "ok", message: `Portal opened for ${target}` });
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-brand-black-card p-6 sm:p-8 space-y-3">
      <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Stripe billing portal</h2>
      <p className="text-[12px] text-brand-cream/55 max-w-prose">
        Mint a one-shot Stripe Customer Portal URL for a subscriber. They can change plans, swap card, cancel — without you rebuilding any of it.
      </p>
      <form
        onSubmit={e => { e.preventDefault(); void send(); }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="customer@example.com"
          className="flex-1 min-w-[16rem] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        />
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Working…" : "Open portal"}
        </button>
      </form>
      <p className="text-[10px] text-brand-cream/40">
        Requires <code className="font-mono">STRIPE_SECRET_KEY</code> + a Stripe customer record matching the email.
      </p>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-brand-black-card px-4 py-4">
      <p className="font-display text-2xl text-brand-cream tabular-nums">{value}</p>
      <p className="text-[11px] tracking-wide text-brand-cream/55 mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-brand-cream/40 mt-1">{hint}</p>}
    </article>
  );
}
