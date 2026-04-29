"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listOrders, type Order, type OrderStatus } from "@/lib/admin/orders";
import { StatusPill } from "../page";

const FILTERS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "pending",   label: "Pending" },
  { id: "paid",      label: "To fulfil" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "refunded",  label: "Refunded" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");

  useEffect(() => { setOrders(listOrders()); }, []);

  const filtered = useMemo(() => {
    let xs = orders;
    if (filter !== "all") xs = xs.filter(o => o.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      xs = xs.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q),
      );
    }
    return xs;
  }, [orders, filter, query]);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Orders</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">All orders</h1>
        <p className="text-brand-cream/45 text-sm mt-1">{orders.length} total · {filtered.length} shown</p>
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
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by order id, email, name…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[110px_1fr_140px_110px_90px] gap-4 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
          <span>Order</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-brand-cream/45">No orders match.</p>
          )}
          {filtered.map(o => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="block px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="md:grid md:grid-cols-[110px_1fr_140px_110px_90px] md:gap-4 md:items-center flex flex-col gap-1">
                <span className="text-sm text-brand-cream font-mono">{o.id}</span>
                <div className="min-w-0">
                  <p className="text-sm text-brand-cream truncate">{o.customerName}</p>
                  <p className="text-[11px] text-brand-cream/45 truncate">{o.customerEmail}</p>
                </div>
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
