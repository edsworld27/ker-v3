"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { computeStats, type DashboardStats } from "@/lib/admin/stats";
import { listOrders, type Order } from "@/lib/admin/orders";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    setStats(computeStats());
    setRecent(listOrders().slice(0, 6));
  }, []);

  if (!stats) return <div className="p-8 text-brand-cream/40 text-sm">Loading…</div>;

  const max = Math.max(1, ...stats.revenueByDay.map(d => d.revenue));

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Dashboard</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Overview</h1>
        <p className="text-brand-cream/45 text-sm mt-1">Last 30 days · GBP</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Revenue (30d)" value={`£${stats.revenue30d.toFixed(2)}`} />
        <Kpi label="Orders (30d)"  value={stats.orders30d.toString()} />
        <Kpi label="Avg. order"    value={`£${stats.averageOrderValue.toFixed(2)}`} />
        <Kpi label="Customers"     value={stats.totalCustomers.toString()} />
        <Kpi label="To fulfil"     value={stats.pending.toString()} accent={stats.pending > 0 ? "amber" : undefined} />
        <Kpi label="Fulfilled"     value={stats.fulfilled.toString()} />
        <Kpi label="Low stock"     value={stats.lowStock.toString()} accent={stats.lowStock > 0 ? "orange" : undefined} />
        <Kpi label="Top product"   value={stats.topProducts[0]?.name.split("·")[0]?.trim() ?? "—"} small />
      </div>

      {/* Revenue chart */}
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
        <h2 className="text-sm tracking-wide text-brand-cream/80 mb-4">Daily revenue</h2>
        <div className="flex items-end gap-1 h-32">
          {stats.revenueByDay.map(d => (
            <div key={d.day} className="flex-1 group relative">
              <div
                className="w-full bg-brand-orange/40 hover:bg-brand-orange rounded-t transition-colors"
                style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? "3px" : "1px" }}
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-brand-black text-[10px] text-brand-cream opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {d.day} · £{d.revenue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-brand-cream/40 mt-2">
          <span>{stats.revenueByDay[0]?.day}</span>
          <span>{stats.revenueByDay[stats.revenueByDay.length - 1]?.day}</span>
        </div>
      </section>

      {/* Two columns: recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm tracking-wide text-brand-cream/80">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand-cream/55 hover:text-brand-cream">View all →</Link>
          </div>
          <div className="space-y-1">
            {recent.length === 0 && <p className="text-sm text-brand-cream/45">No orders yet.</p>}
            {recent.map(o => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-brand-cream truncate">{o.id} · {o.customerName}</p>
                  <p className="text-[11px] text-brand-cream/40">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={o.status} />
                  <span className="text-sm text-brand-cream w-16 text-right">£{o.total.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
          <h2 className="text-sm tracking-wide text-brand-cream/80 mb-4">Top products</h2>
          <div className="space-y-3">
            {stats.topProducts.length === 0 && <p className="text-sm text-brand-cream/45">No sales yet.</p>}
            {stats.topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-brand-cream truncate mr-2">{i + 1}. {p.name}</span>
                  <span className="text-brand-cream/55 shrink-0">£{p.revenue.toFixed(0)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange/70" style={{ width: `${(p.revenue / (stats.topProducts[0]?.revenue || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent, small }: { label: string; value: string; accent?: "amber" | "orange"; small?: boolean }) {
  const colour = accent === "amber" ? "text-brand-amber" : accent === "orange" ? "text-brand-orange" : "text-brand-cream";
  return (
    <div className="rounded-xl border border-white/8 bg-brand-black-card p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">{label}</p>
      <p className={`font-display ${small ? "text-base" : "text-xl sm:text-2xl"} ${colour} truncate`}>{value}</p>
    </div>
  );
}

export function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    pending:   "bg-brand-cream/10 text-brand-cream/70",
    paid:      "bg-brand-amber/15 text-brand-amber",
    fulfilled: "bg-brand-orange/15 text-brand-orange",
    refunded:  "bg-white/5 text-brand-cream/50",
    cancelled: "bg-white/5 text-brand-cream/40 line-through",
  };
  return <span className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded ${map[status]}`}>{status}</span>;
}
