"use client";

// /admin/donations — overview of donations + goals + donor list.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Donation {
  id: string; donorEmail: string; donorName?: string;
  amount: number; currency: string; recurring: boolean;
  giftAid: boolean; anonymous: boolean; message?: string;
  goalId?: string; status: string; createdAt: number;
}
interface Stats {
  totalRaised: number; totalDonors: number; recurringDonors: number;
  recentDonations: Donation[];
}

function fmt(amount: number, currency: string): string {
  const sym = currency.toUpperCase() === "GBP" ? "£" : currency.toUpperCase() === "USD" ? "$" : currency.toUpperCase() === "EUR" ? "€" : "";
  return `${sym}${(amount / 100).toFixed(2)}`;
}

export default function DonationsPage() {
  return <PluginRequired plugin="donations"><DonationsPageInner /></PluginRequired>;
}

function DonationsPageInner() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/donations?orgId=${orgId}`);
      const data = await res.json();
      if (!cancelled) {
        setStats(data.stats);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageSpinner />;
  if (!stats) return <main className="p-6 text-[12px] text-brand-cream/45">No data.</main>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Donations</p>
          <h1 className="font-display text-3xl text-brand-cream">Donor activity</h1>
        </div>
        <Link href="/admin/donations/goals" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Manage goals →</Link>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Total raised" value={fmt(stats.totalRaised, "GBP")} />
        <Stat label="Total donors" value={stats.totalDonors.toLocaleString()} />
        <Stat label="Recurring donors" value={stats.recurringDonors.toLocaleString()} />
      </section>

      <section>
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Recent donations</h2>
        {stats.recentDonations.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No donations yet.</p>
        ) : (
          <div className="space-y-1">
            {stats.recentDonations.map(d => (
              <article key={d.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
                <span className="text-[15px] font-display text-brand-cream tabular-nums w-20">{fmt(d.amount, d.currency)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-brand-cream truncate">
                    {d.anonymous ? "Anonymous" : (d.donorName ?? d.donorEmail)}
                    {d.recurring && <span className="ml-2 text-[9px] tracking-wider uppercase text-cyan-300">monthly</span>}
                    {d.giftAid && <span className="ml-2 text-[9px] tracking-wider uppercase text-amber-300">gift aid</span>}
                  </p>
                  {d.message && <p className="text-[10px] text-brand-cream/55 truncate">&ldquo;{d.message}&rdquo;</p>}
                </div>
                <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1">{value}</p>
    </div>
  );
}
