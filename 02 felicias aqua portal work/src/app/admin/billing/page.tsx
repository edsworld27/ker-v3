"use client";

import { useEffect, useState } from "react";
import { loadBilling, setPlan, cancelPlan } from "@/lib/admin/billing";
import { getActiveOrg, getActiveOrgId, onOrgsChange } from "@/lib/admin/orgs";
import type { Plan, Subscription, PlanId } from "@/portal/server/types";

// /admin/billing — current subscription + plan switcher for the active org.
//
// Stripe checkout is stubbed: clicking "Switch plan" mutates the local
// subscription record so the UI demonstrates the gating behaviour. The
// real Stripe portal lands in a follow-up alongside the webhook handler.

export default function BillingPage() {
  const [orgId, setOrgId] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(id: string) {
    if (!id) return;
    const data = await loadBilling(id, true);
    setSubscription(data.subscription);
    setFeatures(data.features);
    setPlans(data.plans);
  }

  useEffect(() => {
    const id = getActiveOrgId();
    setOrgId(id);
    setOrgName(getActiveOrg()?.name ?? id);
    if (id) void refresh(id);
    return onOrgsChange(() => {
      const next = getActiveOrgId();
      setOrgId(next);
      setOrgName(getActiveOrg()?.name ?? next);
      if (next) void refresh(next);
    });
  }, []);

  async function handlePick(planId: PlanId) {
    if (busy) return;
    setBusy(planId); setError(null);
    try {
      const data = await setPlan(orgId, planId);
      setSubscription(data.subscription);
      setFeatures(data.features);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  async function handleCancel() {
    if (busy) return;
    setBusy("cancel"); setError(null);
    try {
      const data = await cancelPlan(orgId);
      setSubscription(data.subscription);
      setFeatures(data.features);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  const activePlanId: string = subscription?.status === "active" || subscription?.status === "trialing"
    ? subscription.planId : "starter";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Billing</p>
          <h1 className="font-display text-3xl text-brand-cream">Plan & subscription</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Org: <span className="text-brand-cream/85 font-medium">{orgName || "—"}</span></p>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Current</p>
        {subscription ? (
          <div className="space-y-2">
            <p className="text-brand-cream font-medium">
              {plans.find(p => p.id === subscription.planId)?.name ?? subscription.planId}
              <span className="ml-2 text-[11px] text-brand-amber/80">{subscription.status}</span>
            </p>
            <p className="text-[12px] text-brand-cream/55">Started {new Date(subscription.startedAt).toLocaleDateString()}</p>
            <button
              onClick={handleCancel}
              disabled={!!busy || subscription.status === "canceled"}
              className="text-[11px] text-brand-cream/55 hover:text-red-400 disabled:opacity-40"
            >
              {busy === "cancel" ? "Cancelling…" : "Cancel subscription"}
            </button>
          </div>
        ) : (
          <p className="text-[12px] text-brand-cream/55">On the free Starter tier.</p>
        )}
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Plans</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map(plan => {
            const active = plan.id === activePlanId;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 ${active ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.02]"}`}
              >
                <p className="font-display text-xl text-brand-cream">{plan.name}</p>
                <p className="text-[12px] text-brand-cream/55 mb-3">
                  {plan.priceMonthly === 0
                    ? "Free"
                    : `£${(plan.priceMonthly / 100).toFixed(2)}/mo`}
                </p>
                <ul className="text-[11px] text-brand-cream/65 space-y-0.5 mb-3">
                  {plan.features.map(f => <li key={f}>· {f}</li>)}
                </ul>
                <button
                  onClick={() => handlePick(plan.id)}
                  disabled={!!busy || active}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
                    active
                      ? "bg-white/10 text-brand-cream/60 cursor-default"
                      : "bg-brand-orange text-white hover:opacity-90"
                  }`}
                >
                  {active ? "Current plan" : busy === plan.id ? "Switching…" : "Switch"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45 mb-3">Active features</p>
        <div className="flex flex-wrap gap-2">
          {features.map(f => (
            <span key={f} className="text-[11px] px-2 py-1 rounded-full bg-brand-amber/15 text-brand-amber border border-brand-amber/25">{f}</span>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>
      )}
    </div>
  );
}
