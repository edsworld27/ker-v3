"use client";

import { useEffect, useState } from "react";
import { listCustomers, type CustomerSummary } from "@/lib/admin/customers";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => { setCustomers(listCustomers()); }, []);

  const filtered = customers.filter(c =>
    !query.trim()
    || c.email.toLowerCase().includes(query.toLowerCase())
    || c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Customers</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Everyone who's ordered</h1>
          <p className="text-brand-cream/45 text-sm mt-1">{customers.length} customers</p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_90px_110px_140px] gap-4 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
          <span>Name</span>
          <span>Email</span>
          <span className="text-right">Orders</span>
          <span className="text-right">Spend</span>
          <span className="text-right">Last order</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-brand-cream/45">No customers yet.</p>
          )}
          {filtered.map(c => (
            <div key={c.email} className="px-5 py-4">
              <div className="md:grid md:grid-cols-[1fr_1fr_90px_110px_140px] md:gap-4 md:items-center flex flex-col gap-1">
                <span className="text-sm text-brand-cream truncate">{c.name}</span>
                <span className="text-xs text-brand-cream/55 truncate">{c.email}</span>
                <span className="text-sm text-brand-cream md:text-right">{c.orders}</span>
                <span className="text-sm text-brand-cream md:text-right">£{c.spend.toFixed(2)}</span>
                <span className="text-xs text-brand-cream/55 md:text-right">
                  {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
