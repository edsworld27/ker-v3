"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { computeStats, type DashboardStats } from "@/lib/admin/stats";
import { listOrders, type Order } from "@/lib/admin/orders";
import { listAllSources, type OrderSource } from "@/lib/admin/marketing";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [sources, setSources] = useState<OrderSource[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    setStats(computeStats());
    const all = listOrders();
    setAllOrders(all);
    setRecent(all.slice(0, 6));
    setSources(listAllSources());
  }, []);

  // Source breakdown over the last 30 days
  const sourceBreakdown = useMemo(() => {
    if (!stats) return [];
    const since = Date.now() - 30 * 86400000;
    const recent30 = allOrders.filter(o => o.createdAt >= since);
    const m = new Map<string, { count: number; revenue: number; label: string }>();
    recent30.forEach(o => {
      const id = o.source ?? "unknown";
      const label = sources.find(s => s.id === id)?.label ?? "Unknown";
      const cur = m.get(id) ?? { count: 0, revenue: 0, label };
      cur.count += 1; cur.revenue += o.total;
      m.set(id, cur);
    });
    return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [stats, allOrders, sources]);

  if (!stats) return <DashboardSkeleton />;

  const max = Math.max(1, ...stats.revenueByDay.map(d => d.revenue));
  const topSourceRev = Math.max(1, ...sourceBreakdown.map(s => s.revenue));

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

      {/* Source breakdown */}
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm tracking-wide text-brand-cream/80">Where orders came from (30d)</h2>
          <Link href="/admin/marketing" className="text-xs text-brand-cream/55 hover:text-brand-cream">Manage →</Link>
        </div>
        {sourceBreakdown.length === 0 ? (
          <p className="text-sm text-brand-cream/45">
            No source data yet. <Link href="/admin/marketing" className="text-brand-amber hover:underline">Set up tracking links →</Link>
          </p>
        ) : (
          <div className="space-y-2.5">
            {sourceBreakdown.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-brand-cream truncate mr-2">{s.label}</span>
                  <span className="text-brand-cream/55 shrink-0 text-xs">{s.count} order{s.count === 1 ? "" : "s"} · £{s.revenue.toFixed(0)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-amber/60" style={{ width: `${(s.revenue / topSourceRev) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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

// Skeleton matching the dashboard layout — shows the operator that the
// page is loading, not broken. Animates a soft shimmer across the cards.
function DashboardSkeleton() {
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl">
      <div>
        <div className="h-3 w-20 rounded bg-white/5 mb-3 animate-pulse" />
        <div className="h-9 w-44 rounded bg-white/5 animate-pulse" />
        <div className="h-3 w-32 rounded bg-white/5 mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-brand-black-card p-4 animate-pulse">
            <div className="h-2.5 w-16 rounded bg-white/5 mb-2" />
            <div className="h-7 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 animate-pulse">
        <div className="h-3 w-28 rounded bg-white/5 mb-4" />
        <div className="h-32 rounded bg-white/[0.03]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 animate-pulse space-y-2">
          <div className="h-3 w-32 rounded bg-white/5 mb-4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-white/[0.03]" />
          ))}
        </div>
        <div className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 animate-pulse space-y-2">
          <div className="h-3 w-24 rounded bg-white/5 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-white/[0.03]" />
          ))}
        </div>
      </div>
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
