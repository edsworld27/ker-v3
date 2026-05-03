"use client";

// /admin/affiliates/payouts — record + review affiliate payouts.
//
// Each approved affiliate shows their outstanding balance (totalEarned -
// totalPaid). Operator clicks "Record payout" → modal asks for amount /
// method / reference, posts it, server bumps totalPaid + appends a payout
// record to the ledger. History table below shows every payout posted.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { notify } from "@/components/admin/Toaster";
import Tip from "@/components/admin/Tip";
import { friendlyError } from "@/lib/admin/friendlyError";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Affiliate {
  id: string; email: string; name: string; code: string;
  commissionRate: number; status: "pending" | "approved" | "suspended";
  payoutMethod?: "manual" | "stripe-connect" | "paypal";
  totalEarned: number; totalPaid: number;
}

interface Payout {
  id: string; affiliateId: string;
  amount: number; currency: string;
  method: "manual" | "stripe-connect" | "paypal";
  reference?: string; note?: string;
  createdAt: number;
}

function fmt(amount: number, currency = "GBP"): string {
  const sym =
    currency.toUpperCase() === "GBP" ? "£" :
    currency.toUpperCase() === "USD" ? "$" :
    currency.toUpperCase() === "EUR" ? "€" : "";
  return `${sym}${(amount / 100).toFixed(2)}`;
}

export default function AffiliatePayoutsPage() {
  return (
    <PluginRequired plugin="affiliates">
      <PayoutsPageInner />
    </PluginRequired>
  );
}

function PayoutsPageInner() {
  const [orgId, setOrgId] = useState("");
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAffiliate, setModalAffiliate] = useState<Affiliate | null>(null);

  useEffect(() => { setOrgId(getActiveOrgId()); }, []);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    void load();
    async function load() {
      setLoading(true);
      try {
        const [affRes, payRes] = await Promise.all([
          fetch(`/api/portal/affiliates?orgId=${orgId}`, { cache: "no-store" }),
          fetch(`/api/portal/affiliates/payouts?orgId=${orgId}`, { cache: "no-store" }),
        ]);
        const affData = await affRes.json() as { affiliates?: Affiliate[] };
        const payData = await payRes.json() as { payouts?: Payout[] };
        if (cancelled) return;
        setAffiliates(affData.affiliates ?? []);
        setPayouts(payData.payouts ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    return () => { cancelled = true; };
  }, [orgId]);

  const approved = useMemo(
    () => affiliates.filter(a => a.status === "approved"),
    [affiliates],
  );

  const owedTotal = useMemo(
    () => approved.reduce((s, a) => s + (a.totalEarned - a.totalPaid), 0),
    [approved],
  );

  const affiliateById = useMemo(() => {
    const m: Record<string, Affiliate> = {};
    for (const a of affiliates) m[a.id] = a;
    return m;
  }, [affiliates]);

  function recordSuccess(affiliateId: string, amountPaid: number, payout: Payout) {
    setAffiliates(prev => prev.map(a =>
      a.id === affiliateId ? { ...a, totalPaid: a.totalPaid + amountPaid } : a,
    ));
    setPayouts(prev => [payout, ...prev]);
    setModalAffiliate(null);
    notify({ tone: "ok", message: `Recorded ${fmt(amountPaid, payout.currency)} payout` });
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <Link href="/admin/affiliates" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Affiliate program
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Affiliates</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Payouts</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Settle outstanding commission balances. Recording a payout bumps the affiliate&rsquo;s paid total
            and appends to the ledger below — Stripe Connect / PayPal automation lives in the plugin config.
          </p>
        </div>
      </header>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Approved affiliates" value={approved.length.toLocaleString()} />
            <Stat label="Total owed" value={fmt(owedTotal)} hint="Sum of all outstanding balances." />
            <Stat label="Payouts on file" value={payouts.length.toLocaleString()} />
          </section>

          <section>
            <h2 className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/55 mb-2">
              Outstanding balances
            </h2>
            {approved.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-brand-black-card p-6 text-center">
                <p className="text-[13px] text-brand-cream/85">No approved affiliates yet</p>
                <p className="text-[12px] text-brand-cream/55 mt-2">
                  Approve a pending affiliate from <Link href="/admin/affiliates" className="text-cyan-300/80 hover:text-cyan-200">/admin/affiliates →</Link>
                </p>
              </div>
            ) : (
              <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
                {approved.map(a => {
                  const owed = a.totalEarned - a.totalPaid;
                  return (
                    <li key={a.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[12rem]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-brand-cream">{a.name}</span>
                          <span className="text-[10px] font-mono text-cyan-300/80">{a.code}</span>
                        </div>
                        <p className="text-[11px] text-brand-cream/55">
                          {a.email} · {a.commissionRate}% commission · earned {fmt(a.totalEarned)} · paid {fmt(a.totalPaid)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-[14px] font-display tabular-nums ${owed > 0 ? "text-brand-amber" : "text-brand-cream/45"}`}>
                          {fmt(owed)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45">
                          {owed > 0 ? "outstanding" : "settled"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalAffiliate(a)}
                        disabled={owed <= 0}
                        className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Record payout
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/55 mb-2">
              Payout history
            </h2>
            {payouts.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-brand-black-card p-6 text-center">
                <p className="text-[13px] text-brand-cream/85">No payouts recorded yet</p>
                <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto">
                  When you settle an outstanding balance it&rsquo;ll appear here as an audit trail.
                </p>
              </div>
            ) : (
              <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
                {payouts.map(p => {
                  const aff = affiliateById[p.affiliateId];
                  return (
                    <li key={p.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[12rem]">
                        <div className="text-[13px] text-brand-cream">
                          {aff?.name ?? <em className="text-brand-cream/55">Unknown affiliate ({p.affiliateId})</em>}
                        </div>
                        <p className="text-[11px] text-brand-cream/55">
                          {p.method}{p.reference ? ` · ${p.reference}` : ""}
                          {p.note ? ` · ${p.note}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] text-brand-cream font-display tabular-nums">
                          {fmt(p.amount, p.currency)}
                        </div>
                        <div className="text-[10px] text-brand-cream/45 tabular-nums">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {modalAffiliate && orgId && (
        <PayoutModal
          orgId={orgId}
          affiliate={modalAffiliate}
          onClose={() => setModalAffiliate(null)}
          onSuccess={recordSuccess}
        />
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-brand-black-card p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[10px] text-brand-cream/40 mt-1">{hint}</p>}
    </div>
  );
}

interface PayoutModalProps {
  orgId: string;
  affiliate: Affiliate;
  onClose: () => void;
  onSuccess: (affiliateId: string, amount: number, payout: Payout) => void;
}

function PayoutModal({ orgId, affiliate, onClose, onSuccess }: PayoutModalProps) {
  const owed = affiliate.totalEarned - affiliate.totalPaid;
  const [amount, setAmount] = useState((owed / 100).toFixed(2));
  const [method, setMethod] = useState<NonNullable<Affiliate["payoutMethod"]>>(affiliate.payoutMethod ?? "manual");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) { e.preventDefault(); onClose(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const pence = Math.round(Number(amount) * 100);
    if (!Number.isFinite(pence) || pence <= 0) {
      notify({ tone: "warn", message: "Amount must be a positive number." });
      return;
    }
    if (pence > owed) {
      notify({ tone: "warn", title: "Exceeds outstanding", message: `Outstanding balance is ${fmt(owed)}.` });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/portal/affiliates/payouts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgId,
          affiliateId: affiliate.id,
          amount: pence,
          method,
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json() as
        | { ok: true; payout: Payout; outstandingAfter: number }
        | { ok: false; error: string; outstanding?: number };
      if (!data.ok) {
        // exceeds-outstanding carries a live `outstanding` figure; we
        // surface it inline since the friendly-error catalog doesn't
        // know the org's currency.
        if (data.error === "exceeds-outstanding") {
          notify({
            tone: "error",
            title: "Amount too high",
            message: `Outstanding balance is ${fmt(data.outstanding ?? 0)}.`,
          });
        } else {
          const f = friendlyError(data.error, "Couldn't record payout");
          notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        }
        return;
      }
      onSuccess(affiliate.id, pence, data.payout);
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={busy ? undefined : onClose}
    >
      <form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-title"
        className="w-full max-w-md bg-brand-black-soft border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <div>
          <h2 id="payout-title" className="font-display text-xl text-brand-cream">Record payout</h2>
          <p className="text-[11px] text-brand-cream/55 mt-1">
            {affiliate.name} · {affiliate.code} · outstanding {fmt(owed)}
          </p>
        </div>

        <Field
          label="Amount"
          hint="In your billing currency. Defaults to the full outstanding balance."
          tip="The full outstanding balance is pre-filled. Lower it if you're paying in instalments. You can't pay more than what's owed — the form prevents over-payment."
        >
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream tabular-nums focus:outline-none focus:border-brand-orange/50"
          />
        </Field>

        <Field
          label="Method"
          tip="How you actually moved the money. 'Manual' = you sent a bank transfer outside the system. Stripe Connect / PayPal options are for when those integrations are wired up — today they're labels-only."
        >
          <select
            value={method}
            onChange={e => setMethod(e.target.value as NonNullable<Affiliate["payoutMethod"]>)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          >
            <option value="manual">Manual (bank transfer)</option>
            <option value="stripe-connect">Stripe Connect</option>
            <option value="paypal">PayPal</option>
          </select>
        </Field>

        <Field
          label="Reference"
          hint="Optional — Stripe transfer id, PayPal txn, bank reference."
          tip="So you can match the entry to your bank or Stripe statement when reconciling. Operators reading the audit log will see this verbatim."
        >
          <input
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="po_..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>

        <Field
          label="Note"
          hint="Optional internal note."
          tip="Anything you want to remember next time you look. Never shown to the affiliate."
        >
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/65 hover:text-brand-cream px-3 py-1.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {busy ? "Recording…" : "Record payout"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, tip, children }: { label: string; hint?: string; tip?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/55 inline-flex items-center gap-1.5">
        {label}
        {tip && <Tip text={tip} />}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-brand-cream/40">{hint}</span>}
    </label>
  );
}
