"use client";

import { useEffect, useState } from "react";
import { adjustStock, listInventory, type InventoryItem } from "@/lib/admin/inventory";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => { setItems(listInventory()); }, []);

  function bump(sku: string, delta: number) {
    adjustStock(sku, delta);
    setItems(listInventory());
  }

  const filtered = items.filter(i =>
    !query.trim()
    || i.name.toLowerCase().includes(query.toLowerCase())
    || i.sku.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Inventory</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Stock</h1>
          <p className="text-brand-cream/45 text-sm mt-1">{items.length} SKUs</p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search SKU or name…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_90px_90px_90px_140px] gap-4 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
          <span>Product</span>
          <span>SKU</span>
          <span className="text-right">On hand</span>
          <span className="text-right">Reserved</span>
          <span className="text-right">Available</span>
          <span className="text-right">Adjust</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map(i => {
            const available = i.onHand - i.reserved;
            const low = available <= i.lowAt;
            return (
              <div key={i.sku} className="px-5 py-4">
                <div className="md:grid md:grid-cols-[1fr_140px_90px_90px_90px_140px] md:gap-4 md:items-center flex flex-col gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-brand-cream truncate">{i.name}</p>
                    <p className="text-[11px] text-brand-cream/45 capitalize">{i.range} · £{i.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs text-brand-cream/55 font-mono">{i.sku}</span>
                  <span className="text-sm text-brand-cream md:text-right">{i.onHand}</span>
                  <span className="text-sm text-brand-cream/55 md:text-right">{i.reserved}</span>
                  <span className={`text-sm md:text-right ${low ? "text-brand-orange font-semibold" : "text-brand-cream"}`}>
                    {available}{low && " · low"}
                  </span>
                  <div className="flex items-center md:justify-end gap-1">
                    <button onClick={() => bump(i.sku, -1)} className="w-8 h-8 rounded border border-white/10 text-brand-cream/70 hover:border-white/30">−</button>
                    <button onClick={() => bump(i.sku, +1)} className="w-8 h-8 rounded border border-white/10 text-brand-cream/70 hover:border-white/30">+</button>
                    <button onClick={() => bump(i.sku, +10)} className="px-2 h-8 rounded border border-white/10 text-[11px] text-brand-cream/70 hover:border-white/30">+10</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
