"use client";

// /admin/affiliates/stats — program performance.
//
// Program totals + per-affiliate leaderboard. Each row carries clicks,
// conversions, conversion rate, earned, paid, outstanding. Sortable
// by any column.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Row {
  id: string;
  name: string;
  code: string;
  email: string;
  status: "pending" | "approved" | "suspended";
  commissionRate: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  totalEarned: number;
  totalPaid: number;
}

interface Totals {
  affiliates: number;
  approved: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  earned: number;
  paid: number;
  outstanding: number;
}

type SortKey = "earned" | "paid" | "outstanding" | "clicks" | "conversions" | "rate";

function fmt(amount: number, currency = "GBP"): string {
  const sym =
    currency.toUpperCase() === "GBP" ? "£" :
    currency.toUpperCase() === "USD" ? "$" :
    currency.toUpperCase() === "EUR" ? "€" : "";
  return `${sym}${(amount / 100).toFixed(2)}`;
}

export default function AffiliateStatsPage() {
  return (
    <PluginRequired plugin="affiliates">
      <StatsPageInner />
    </PluginRequired>
  );
}

function StatsPageInner() {
  const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("earned");

  useEffect(() => { setOrgId(getActiveOrgId()); }, []);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/portal/affiliates/stats?orgId=${orgId}`, { cache: "no-store" });
        const data = await res.json() as { rows?: Row[]; totals?: Totals };
        if (cancelled) return;
        setRows(data.rows ?? []);
        setTotals(data.totals ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      switch (sortKey) {
        case "earned": return b.totalEarned - a.totalEarned;
        case "paid": return b.totalPaid - a.totalPaid;
        case "outstanding": return (b.totalEarned - b.totalPaid) - (a.totalEarned - a.totalPaid);
        case "clicks": return b.clicks - a.clicks;
        case "conversions": return b.conversions - a.conversions;
        case "rate": return b.conversionRate - a.conversionRate;
        default: return 0;
      }
    });
    return copy;
  }, [rows, sortKey]);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <Link href="/admin/affiliates" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Affiliate program
      </Link>

      <header>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Affiliates</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Stats</h1>
        <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
          Program performance — top performers, click-through rates, conversion rates, total commission paid out vs. still owed.
        </p>
      </header>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : !totals ? (
        <p className="text-[12px] text-brand-cream/45">No data.</p>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Affiliates" value={`${totals.approved} / ${totals.affiliates}`} hint="approved / total" />
            <Stat label="Clicks" value={totals.clicks.toLocaleString()} />
            <Stat label="Conversions" value={`${totals.conversions.toLocaleString()} (${totals.conversionRate.toFixed(1)}%)`} />
            <Stat label="Outstanding" value={fmt(totals.outstanding)} hint={`${fmt(totals.earned)} earned · ${fmt(totals.paid)} paid`} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
              <h2 className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/55">
                Leaderboard
              </h2>
              <label className="flex items-center gap-2 text-[11px] text-brand-cream/65">
                Sort by
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as SortKey)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[12px] text-brand-cream focus:outline-none focus:border-brand-orange/50"
                >
                  <option value="earned">Earned</option>
                  <option value="paid">Paid</option>
                  <option value="outstanding">Outstanding</option>
                  <option value="clicks">Clicks</option>
                  <option value="conversions">Conversions</option>
                  <option value="rate">Conversion rate</option>
                </select>
              </label>
            </div>

            {sorted.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-brand-black-card p-6 text-center">
                <p className="text-[13px] text-brand-cream/85">No affiliates yet</p>
                <p className="text-[12px] text-brand-cream/55 mt-2">
                  Once you approve some on <Link href="/admin/affiliates" className="text-cyan-300/80 hover:text-cyan-200">/admin/affiliates →</Link>{" "}
                  their numbers will roll up here.
                </p>
              </div>
            ) : (
              <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
                {sorted.map((r, idx) => {
                  const owed = r.totalEarned - r.totalPaid;
                  return (
                    <li key={r.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-12 sm:col-span-4 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-brand-cream/40 w-5 tabular-nums">#{idx + 1}</span>
                          <span className="text-[13px] text-brand-cream truncate">{r.name}</span>
                          <span className="text-[10px] font-mono text-cyan-300/80">{r.code}</span>
                          {r.status !== "approved" && (
                            <span className={`text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ${
                              r.status === "pending"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-red-500/15 text-red-300"
                            }`}>
                              {r.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-cream/45 truncate">{r.email} · {r.commissionRate}%</p>
                      </div>

                      <Cell className="col-span-3 sm:col-span-1" label="Clicks" value={r.clicks.toLocaleString()} />
                      <Cell className="col-span-3 sm:col-span-1" label="Conv" value={r.conversions.toLocaleString()} />
                      <Cell className="col-span-3 sm:col-span-2" label="Rate" value={`${r.conversionRate.toFixed(1)}%`} />
                      <Cell className="col-span-3 sm:col-span-2" label="Earned" value={fmt(r.totalEarned)} />
                      <Cell className="col-span-6 sm:col-span-2" label="Owed" value={fmt(owed)} tone={owed > 0 ? "amber" : "muted"} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
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

function Cell({
  label, value, className = "", tone,
}: { label: string; value: string; className?: string; tone?: "amber" | "muted" }) {
  const valueClass =
    tone === "amber" ? "text-brand-amber" :
    tone === "muted" ? "text-brand-cream/45" :
    "text-brand-cream";
  return (
    <div className={`text-right ${className}`}>
      <div className="text-[9px] uppercase tracking-[0.18em] text-brand-cream/40">{label}</div>
      <div className={`text-[12px] tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}
