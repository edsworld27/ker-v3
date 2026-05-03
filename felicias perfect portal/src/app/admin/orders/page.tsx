"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listOrders, type Order, type OrderStatus } from "@/lib/admin/orders";
import { listAllSources, type OrderSource } from "@/lib/admin/marketing";
import { StatusPill } from "../page";
import PluginRequired from "@/components/admin/PluginRequired";

const FILTERS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "pending",   label: "Pending" },
  { id: "paid",      label: "To fulfil" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "refunded",  label: "Refunded" },
];

type RangePreset = "today" | "7d" | "30d" | "90d" | "mtd" | "qtd" | "ytd" | "all" | "custom";

const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d",    label: "7d" },
  { id: "30d",   label: "30d" },
  { id: "90d",   label: "90d" },
  { id: "mtd",   label: "MTD" },
  { id: "qtd",   label: "QTD" },
  { id: "ytd",   label: "YTD" },
  { id: "all",   label: "All time" },
  { id: "custom",label: "Custom" },
];

function rangeBounds(preset: RangePreset, customFrom?: string, customTo?: string): { from: number; to: number } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
  const today = startOfDay(now);
  switch (preset) {
    case "today": return { from: today, to: endOfDay(now) };
    case "7d":    return { from: today - 6  * 86400000, to: endOfDay(now) };
    case "30d":   return { from: today - 29 * 86400000, to: endOfDay(now) };
    case "90d":   return { from: today - 89 * 86400000, to: endOfDay(now) };
    case "mtd":   return { from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), to: endOfDay(now) };
    case "qtd": {
      const q = Math.floor(now.getMonth() / 3) * 3;
      return { from: new Date(now.getFullYear(), q, 1).getTime(), to: endOfDay(now) };
    }
    case "ytd":   return { from: new Date(now.getFullYear(), 0, 1).getTime(), to: endOfDay(now) };
    case "all":   return { from: 0, to: endOfDay(now) };
    case "custom": {
      const from = customFrom ? new Date(customFrom).getTime() : 0;
      const to   = customTo   ? endOfDay(new Date(customTo)) : Date.now();
      return { from, to };
    }
  }
}

export default function AdminOrdersPage() {
  return <PluginRequired plugin="ecommerce"><AdminOrdersPageInner /></PluginRequired>;
}

function AdminOrdersPageInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sources, setSources] = useState<OrderSource[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [range, setRange] = useState<RangePreset>("30d");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOrders(listOrders());
    setSources(listAllSources());
    const handler = () => setOrders(listOrders());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const bounds = useMemo(() => rangeBounds(range, from, to), [range, from, to]);

  const filtered = useMemo(() => {
    let xs = orders.filter(o => o.createdAt >= bounds.from && o.createdAt <= bounds.to);
    if (filter !== "all") xs = xs.filter(o => o.status === filter);
    if (sourceFilter) xs = xs.filter(o => (o.source ?? "") === sourceFilter);
    if (hasDiscount) xs = xs.filter(o => o.discountCode || o.discount > 0);
    if (query.trim()) {
      const q = query.toLowerCase();
      xs = xs.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.discountCode?.toLowerCase().includes(q) ?? false),
      );
    }
    return xs;
  }, [orders, bounds, filter, sourceFilter, hasDiscount, query]);

  // Aggregate stats for the filtered range
  const totals = useMemo(() => ({
    revenue:  filtered.reduce((s, o) => s + o.total, 0),
    discount: filtered.reduce((s, o) => s + o.discount, 0),
    count:    filtered.length,
    avg:      filtered.length ? filtered.reduce((s, o) => s + o.total, 0) / filtered.length : 0,
  }), [filtered]);

  const sourceLabel = (id?: string) => {
    if (!id) return "—";
    return sources.find(s => s.id === id)?.label ?? id;
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Orders</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">All orders</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          {orders.length} total · {filtered.length} shown · £{totals.revenue.toFixed(2)} in range
        </p>
      </div>

      {/* Range presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-brand-black-card border border-white/8">
          {RANGE_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setRange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === p.id ? "bg-brand-amber/20 text-brand-amber" : "text-brand-cream/55 hover:text-brand-cream"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {range === "custom" && (
          <div className="flex gap-2 items-center">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-brand-black-card border border-white/10 rounded-lg px-2 py-1.5 text-xs text-brand-cream" />
            <span className="text-brand-cream/40 text-xs">→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-brand-black-card border border-white/10 rounded-lg px-2 py-1.5 text-xs text-brand-cream" />
          </div>
        )}
      </div>

      {/* Range KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Revenue"   value={`£${totals.revenue.toFixed(2)}`} />
        <Kpi label="Orders"    value={totals.count.toString()} />
        <Kpi label="Avg order" value={`£${totals.avg.toFixed(2)}`} />
        <Kpi label="Discounts" value={`£${totals.discount.toFixed(2)}`} />
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-brand-black-card border border-white/8 w-fit">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.id ? "bg-brand-orange/20 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream">
            <option value="">All sources</option>
            {sources.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-black-card border border-white/10 text-xs text-brand-cream cursor-pointer">
            <input type="checkbox" checked={hasDiscount} onChange={e => setHasDiscount(e.target.checked)} className="accent-brand-amber" />
            Used discount
          </label>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search id, email, name, code…"
            className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[110px_1fr_120px_120px_110px_100px] gap-4 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
          <span>Order</span>
          <span>Customer</span>
          <span>Source</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              {orders.length === 0 ? (
                <>
                  <p className="text-sm text-brand-cream/65">No orders yet.</p>
                  <p className="text-xs text-brand-cream/40 mt-1.5">
                    Orders show up here when customers check out. Make sure{" "}
                    <Link href="/admin/products" className="text-brand-orange/80 hover:text-brand-orange">products</Link>{" "}exist and your storefront is reachable.
                  </p>
                </>
              ) : (
                <p className="text-sm text-brand-cream/65">No orders match the current filter.</p>
              )}
            </div>
          )}
          {filtered.map(o => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="block px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="md:grid md:grid-cols-[110px_1fr_120px_120px_110px_100px] md:gap-4 md:items-center flex flex-col gap-1">
                <span className="text-sm text-brand-cream font-mono">{o.id}</span>
                <div className="min-w-0">
                  <p className="text-sm text-brand-cream truncate">{o.customerName}</p>
                  <p className="text-[11px] text-brand-cream/45 truncate">{o.customerEmail}</p>
                </div>
                <span className="text-[11px] text-brand-cream/55 truncate">
                  {sourceLabel(o.source)}
                  {o.discountCode && <span className="block text-brand-amber font-mono">{o.discountCode}</span>}
                </span>
                <span className="text-xs text-brand-cream/55">{new Date(o.createdAt).toLocaleDateString()}</span>
                <StatusPill status={o.status} />
                <span className="text-sm text-brand-cream md:text-right">£{o.total.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-brand-black-card p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">{label}</p>
      <p className="font-display text-xl text-brand-cream truncate">{value}</p>
    </div>
  );
}
