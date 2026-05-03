"use client";

import { useEffect, useState } from "react";
import { adjustStock, listInventory, updateInventoryFields, type InventoryItem } from "@/lib/admin/inventory";
import PluginRequired from "@/components/admin/PluginRequired";

export default function AdminInventoryPage() {
  return <PluginRequired plugin="ecommerce" feature="inventory"><AdminInventoryPageInner /></PluginRequired>;
}

function AdminInventoryPageInner() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => { setItems(listInventory()); }, []);

  function refresh() { setItems(listInventory()); }

  function bump(sku: string, delta: number) {
    adjustStock(sku, delta);
    refresh();
  }

  function setLowAt(sku: string, value: number) {
    updateInventoryFields(sku, { lowAt: Math.max(0, value) });
    refresh();
  }

  function toggleUnlimited(sku: string, unlimited: boolean) {
    updateInventoryFields(sku, { unlimited });
    refresh();
  }

  const filtered = items.filter(i =>
    !query.trim()
    || i.name.toLowerCase().includes(query.toLowerCase())
    || i.sku.toLowerCase().includes(query.toLowerCase()),
  );

  const lowCount = items.filter(i => !i.unlimited && i.onHand - i.reserved <= i.lowAt).length;
  const soldOutCount = items.filter(i => !i.unlimited && i.onHand - i.reserved <= 0).length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Inventory</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Stock</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            {items.length} SKUs
            {lowCount > 0 && <span className="text-brand-amber"> · {lowCount} low</span>}
            {soldOutCount > 0 && <span className="text-brand-orange"> · {soldOutCount} sold out</span>}
          </p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search SKU or name…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-brand-amber/20 bg-brand-amber/5 px-4 py-3 text-xs text-brand-cream/65 leading-relaxed">
        <span className="text-brand-amber font-semibold">Tip · </span>
        Set a custom low-stock threshold per SKU (the &quot;Low at&quot; column). Toggle <span className="text-brand-amber">Unlimited</span> for digital goods, gift cards or made-to-order items so they never go sold-out.
      </div>

      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_80px_80px_80px_80px_100px_140px] gap-3 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
          <span>Product</span>
          <span>SKU</span>
          <span className="text-right">On hand</span>
          <span className="text-right">Reserved</span>
          <span className="text-right">Available</span>
          <span className="text-right">Low at</span>
          <span className="text-center">Unlimited</span>
          <span className="text-right">Adjust</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map(i => {
            const available = i.onHand - i.reserved;
            const low = !i.unlimited && available <= i.lowAt;
            const out = !i.unlimited && available <= 0;
            return (
              <div key={i.sku} className="px-5 py-4">
                <div className="md:grid md:grid-cols-[1fr_140px_80px_80px_80px_80px_100px_140px] md:gap-3 md:items-center flex flex-col gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-brand-cream truncate">{i.name}</p>
                    <p className="text-[11px] text-brand-cream/45 capitalize">{i.range} · £{i.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs text-brand-cream/55 font-mono truncate">{i.sku}</span>
                  <span className={`text-sm md:text-right ${i.unlimited ? "text-brand-amber" : "text-brand-cream"}`}>
                    {i.unlimited ? "∞" : i.onHand}
                  </span>
                  <span className="text-sm text-brand-cream/55 md:text-right">{i.unlimited ? "—" : i.reserved}</span>
                  <span className={`text-sm md:text-right ${out ? "text-brand-orange font-semibold" : low ? "text-brand-amber font-semibold" : i.unlimited ? "text-brand-amber" : "text-brand-cream"}`}>
                    {i.unlimited ? "∞" : `${available}${out ? " · out" : low ? " · low" : ""}`}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={i.lowAt}
                    disabled={i.unlimited}
                    onChange={e => setLowAt(i.sku, parseInt(e.target.value || "0", 10))}
                    className="md:text-right text-sm text-brand-cream bg-transparent border-b border-white/15 focus:outline-none focus:border-brand-orange/50 w-16 md:w-full disabled:opacity-30"
                  />
                  <label className="flex md:justify-center items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!i.unlimited}
                      onChange={e => toggleUnlimited(i.sku, e.target.checked)}
                      className="w-4 h-4 accent-brand-amber"
                    />
                    <span className="md:hidden text-xs text-brand-cream/55">Unlimited</span>
                  </label>
                  <div className="flex items-center md:justify-end gap-1">
                    <button onClick={() => bump(i.sku, -1)} disabled={i.unlimited} className="w-8 h-8 rounded border border-white/10 text-brand-cream/70 hover:border-white/30 disabled:opacity-30">−</button>
                    <button onClick={() => bump(i.sku, +1)} disabled={i.unlimited} className="w-8 h-8 rounded border border-white/10 text-brand-cream/70 hover:border-white/30 disabled:opacity-30">+</button>
                    <button onClick={() => bump(i.sku, +10)} disabled={i.unlimited} className="px-2 h-8 rounded border border-white/10 text-[11px] text-brand-cream/70 hover:border-white/30 disabled:opacity-30">+10</button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-brand-cream/40 text-sm py-8 text-center">No SKUs match.</p>
          )}
        </div>
      </div>
    </div>
  );
}
