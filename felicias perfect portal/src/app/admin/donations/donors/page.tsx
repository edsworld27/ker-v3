"use client";

// /admin/donations/donors — donor directory.
//
// Aggregates the raw donation list per donor email so operators see
// one row per donor with their lifetime total + most recent gift.
// Supports search, recurring/Gift Aid filters, and CSV export for
// thank-you mailings or HMRC Gift Aid claims.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { notify } from "@/components/admin/Toaster";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Donation {
  id: string;
  donorEmail: string;
  donorName?: string;
  amount: number;
  currency: string;
  recurring: boolean;
  giftAid: boolean;
  anonymous: boolean;
  message?: string;
  goalId?: string;
  status: "pending" | "completed" | "refunded";
  createdAt: number;
}

interface DonorRow {
  email: string;
  displayName: string;        // best-effort name, "Anonymous" when every gift was anonymous
  totalAmount: number;        // smallest unit (sum across currencies that match — see below)
  currency: string;           // most-frequent currency for this donor
  donationCount: number;
  recurring: boolean;
  giftAidCount: number;
  lastGiftAt: number;
  alwaysAnonymous: boolean;
}

type FilterMode = "all" | "recurring" | "giftaid" | "onetime";

function fmt(amount: number, currency: string): string {
  const sym =
    currency.toUpperCase() === "GBP" ? "£" :
    currency.toUpperCase() === "USD" ? "$" :
    currency.toUpperCase() === "EUR" ? "€" : "";
  return `${sym}${(amount / 100).toFixed(2)}`;
}

function aggregate(donations: Donation[]): DonorRow[] {
  const completed = donations.filter(d => d.status === "completed");
  const byEmail = new Map<string, Donation[]>();
  for (const d of completed) {
    const key = d.donorEmail.toLowerCase();
    const arr = byEmail.get(key);
    if (arr) arr.push(d);
    else byEmail.set(key, [d]);
  }
  const rows: DonorRow[] = [];
  for (const [email, gifts] of byEmail) {
    const named = gifts.find(g => !g.anonymous && g.donorName)?.donorName;
    const alwaysAnonymous = gifts.every(g => g.anonymous);
    const currencyCounts = new Map<string, number>();
    for (const g of gifts) {
      currencyCounts.set(g.currency, (currencyCounts.get(g.currency) ?? 0) + 1);
    }
    let topCurrency = "GBP";
    let topCount = 0;
    for (const [c, n] of currencyCounts) {
      if (n > topCount) { topCurrency = c; topCount = n; }
    }
    const sameCurrency = gifts.filter(g => g.currency === topCurrency);
    const totalAmount = sameCurrency.reduce((s, g) => s + g.amount, 0);
    rows.push({
      email,
      displayName: alwaysAnonymous ? "Anonymous" : (named ?? email),
      totalAmount,
      currency: topCurrency,
      donationCount: gifts.length,
      recurring: gifts.some(g => g.recurring),
      giftAidCount: gifts.filter(g => g.giftAid).length,
      lastGiftAt: Math.max(...gifts.map(g => g.createdAt)),
      alwaysAnonymous,
    });
  }
  rows.sort((a, b) => b.totalAmount - a.totalAmount);
  return rows;
}

export default function DonorsPage() {
  return (
    <PluginRequired plugin="donations">
      <DonorsPageInner />
    </PluginRequired>
  );
}

function DonorsPageInner() {
  const [orgId, setOrgId] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    setOrgId(getActiveOrgId());
  }, []);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/portal/donations?orgId=${orgId}&donations=1`, { cache: "no-store" });
        const data = await res.json() as { donations?: Donation[] };
        if (!cancelled) setDonations(data.donations ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const allDonors = useMemo(() => aggregate(donations), [donations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDonors.filter(d => {
      if (filter === "recurring" && !d.recurring) return false;
      if (filter === "giftaid" && d.giftAidCount === 0) return false;
      if (filter === "onetime" && d.recurring) return false;
      if (!q) return true;
      return d.email.toLowerCase().includes(q) ||
        d.displayName.toLowerCase().includes(q);
    });
  }, [allDonors, query, filter]);

  function exportCsv() {
    if (filtered.length === 0) {
      notify("Nothing to export with these filters.");
      return;
    }
    const header = ["email", "name", "total", "currency", "gifts", "recurring", "gift_aid_eligible_gifts", "last_gift"].join(",");
    const rows = filtered.map(d => [
      d.email,
      d.alwaysAnonymous ? "" : d.displayName,
      (d.totalAmount / 100).toFixed(2),
      d.currency,
      d.donationCount,
      d.recurring ? "yes" : "no",
      d.giftAidCount,
      new Date(d.lastGiftAt).toISOString(),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donors-${orgId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalRaised = filtered.reduce((s, d) => s + d.totalAmount, 0);
  const giftAidEligibleTotal = filtered.reduce((s, d) => {
    const giftAidGifts = donations.filter(g =>
      g.donorEmail.toLowerCase() === d.email && g.giftAid && g.status === "completed"
    );
    return s + giftAidGifts.reduce((a, g) => a + g.amount, 0);
  }, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <Link href="/admin/donations" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Donations
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Donations</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Donors</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Everyone who&rsquo;s donated, with their lifetime total, recurring status, and Gift Aid count. Export for thank-you mailings or HMRC claims.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 disabled:opacity-40 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search donors by name or email…"
          className="flex-1 min-w-[12rem] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterMode)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        >
          <option value="all">All donors</option>
          <option value="recurring">Recurring only</option>
          <option value="onetime">One-time only</option>
          <option value="giftaid">With Gift Aid</option>
        </select>
      </div>

      {!loading && filtered.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Donors shown" value={filtered.length.toLocaleString()} />
          <Stat label="Total (filtered)" value={fmt(totalRaised, filtered[0]?.currency ?? "GBP")} />
          <Stat label="Gift Aid eligible" value={fmt(giftAidEligibleTotal, filtered[0]?.currency ?? "GBP")} />
        </section>
      )}

      {loading ? (
        <PageSpinner wrap={false} />
      ) : allDonors.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No donors yet</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto leading-relaxed">
            Once people donate via the storefront&rsquo;s Donation block they&rsquo;ll appear here, with opt-in display preferences and Gift Aid status.
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No matches</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">Try clearing the filters above.</p>
        </section>
      ) : (
        <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
          {filtered.map(d => (
            <li key={d.email} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[12rem]">
                <div className="text-[13px] text-brand-cream">
                  {d.alwaysAnonymous ? <em className="text-brand-cream/65">Anonymous</em> : d.displayName}
                </div>
                <Link
                  href={`/admin/customers/${encodeURIComponent(d.email)}`}
                  className="text-[11px] text-brand-cream/55 hover:text-cyan-200 font-mono"
                >
                  {d.email}
                </Link>
              </div>

              <div className="text-right">
                <div className="text-[14px] text-brand-cream font-display tabular-nums">
                  {fmt(d.totalAmount, d.currency)}
                </div>
                <div className="text-[10px] text-brand-cream/45 tabular-nums">
                  {d.donationCount} {d.donationCount === 1 ? "gift" : "gifts"}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {d.recurring && (
                  <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                    Monthly
                  </span>
                )}
                {d.giftAidCount > 0 && (
                  <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                    Gift Aid
                  </span>
                )}
              </div>

              <div className="text-[10px] text-brand-cream/45 tabular-nums w-24 text-right">
                {new Date(d.lastGiftAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-brand-black-card p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1 tabular-nums">{value}</p>
    </div>
  );
}
