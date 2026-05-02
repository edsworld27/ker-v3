"use client";

// /admin/subscriptions — Subscriptions plugin landing page.
// Operator overview of recurring billing across the org. Real data
// flows in once the Stripe billing-portal handoff lands; until then
// the page surfaces the configured plans and a stub empty state.

import Link from "next/link";
import PluginPageScaffold from "@/components/admin/PluginPageScaffold";
import { getActiveOrgId } from "@/lib/admin/orgs";

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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-brand-black-card px-4 py-4">
      <p className="font-display text-2xl text-brand-cream tabular-nums">{value}</p>
      <p className="text-[11px] tracking-wide text-brand-cream/55 mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-brand-cream/40 mt-1">{hint}</p>}
    </article>
  );
}
