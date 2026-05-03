"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SupportInvoice, Plan, Subscription, OrgRecord } from "@/portal/server/types";
import { getActiveOrgId, loadOrgs, listOrgs, getActiveOrg } from "@/lib/admin/orgs";
import { listInvoices, formatMoney, onSupportChange, createInvoice } from "@/lib/admin/support";
import { loadBilling, setPlan, cancelPlan } from "@/lib/admin/billing";

export default function BillingPage() {
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [orgId, setOrgId] = useState("");
  const [invoices, setInvoices] = useState<SupportInvoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  // Mock-invoice generator (until Stripe webhook lands).
  const [mockAmount, setMockAmount] = useState<number>(4900);
  const [mockDesc, setMockDesc] = useState("Pro plan — monthly");

  async function refresh(id?: string) {
    const target = id ?? orgId;
    if (!target) return;
    const billing = await loadBilling(target, true);
    setSubscription(billing.subscription);
    setFeatures(billing.features);
    setPlans(billing.plans);
    setInvoices(await listInvoices(target));
  }

  useEffect(() => {
    void loadOrgs(true).then(list => {
      setOrgs(list);
      const id = getActiveOrgId();
      setOrgId(id);
      void refresh(id);
    });
    return onSupportChange(() => { if (orgId) void refresh(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePlan(planId: string) {
    if (!orgId) return;
    setBusy(planId);
    try { await setPlan(orgId, planId); void refresh(); } finally { setBusy(null); }
  }

  async function handleCancelSub() {
    if (!orgId) return;
    setBusy("cancel");
    try { await cancelPlan(orgId); void refresh(); } finally { setBusy(null); }
  }

  async function handleAddInvoice() {
    if (!orgId) return;
    await createInvoice({ orgId, amountTotal: mockAmount, description: mockDesc });
    void refresh();
  }

  const activePlanId = subscription?.status === "active" || subscription?.status === "trialing" ? subscription.planId : "starter";
  const orgName = orgs.find(o => o.id === orgId)?.name ?? orgId;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <header>
        <Link href="/aqua/support" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Aqua support</Link>
        <h1 className="font-display text-3xl text-brand-cream mt-2">Plan + invoices</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">{orgName}</p>
      </header>

      {/* Current subscription */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Current plan</p>
        {subscription ? (
          <div className="flex items-center gap-3">
            <p className="font-display text-xl text-brand-cream">{plans.find(p => p.id === subscription.planId)?.name ?? subscription.planId}</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber">{subscription.status}</span>
            <button onClick={handleCancelSub} disabled={!!busy || subscription.status === "canceled"} className="ml-auto text-[11px] text-brand-cream/55 hover:text-red-400 disabled:opacity-40">
              {busy === "cancel" ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        ) : (
          <p className="text-[12px] text-brand-cream/55">On the free Starter tier.</p>
        )}
      </section>

      {/* Plan switcher */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Switch plan</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map(plan => {
            const active = plan.id === activePlanId;
            return (
              <div key={plan.id} className={`rounded-2xl border p-4 ${active ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.02]"}`}>
                <p className="font-display text-xl text-brand-cream">{plan.name}</p>
                <p className="text-[12px] text-brand-cream/55 mb-3">
                  {plan.priceMonthly === 0 ? "Free" : `£${(plan.priceMonthly / 100).toFixed(2)}/mo`}
                </p>
                <ul className="text-[11px] text-brand-cream/65 space-y-0.5 mb-3">
                  {plan.features.slice(0, 6).map(f => <li key={f}>· {f}</li>)}
                </ul>
                <button
                  onClick={() => handlePlan(plan.id)}
                  disabled={!!busy || active}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 ${active ? "bg-white/10 text-brand-cream/60 cursor-default" : "bg-brand-orange text-white hover:opacity-90"}`}
                >
                  {active ? "Current" : busy === plan.id ? "Switching…" : "Switch"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Active features</p>
        <div className="flex flex-wrap gap-2">
          {features.map(f => <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-brand-amber/15 text-brand-amber border border-brand-amber/25">{f}</span>)}
        </div>
      </section>

      {/* Invoices */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/55">Invoices ({invoices.length})</p>
          <details className="relative">
            <summary className="text-[11px] text-brand-cream/55 hover:text-brand-orange cursor-pointer list-none">+ Add manual invoice</summary>
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-brand-black-soft p-3 z-10 space-y-2">
              <input type="number" value={mockAmount} onChange={e => setMockAmount(Number(e.target.value) || 0)} placeholder="Amount in pence" className={INPUT} />
              <input value={mockDesc} onChange={e => setMockDesc(e.target.value)} placeholder="Description" className={INPUT} />
              <button onClick={handleAddInvoice} className="w-full px-2 py-1.5 rounded-lg bg-brand-orange text-white text-[11px] font-semibold">Add invoice</button>
              <p className="text-[10px] text-brand-cream/40">Stripe webhook will replace this when wired.</p>
            </div>
          </details>
        </div>
        {invoices.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-brand-cream/45 text-center">No invoices yet.</p>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-brand-cream/45 border-b border-white/5">
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Number</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Description</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px] text-right">Amount</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 font-mono text-brand-cream/85">{inv.number}</td>
                  <td className="px-3 py-2 text-brand-cream/65">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-brand-cream/85">{inv.description ?? inv.lines[0]?.description ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      inv.status === "paid" ? "bg-green-500/15 text-green-400"
                      : inv.status === "open" ? "bg-brand-amber/15 text-brand-amber"
                      : "bg-white/5 text-brand-cream/55"
                    }`}>{inv.status}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-brand-cream font-bold tabular-nums">{formatMoney(inv.amountTotal, inv.currency)}</td>
                  <td className="px-3 py-2 text-right">
                    {inv.hostedUrl && <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline">View ↗</a>}
                    {inv.pdfUrl && <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[11px] text-cyan-400 hover:underline">PDF</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";
