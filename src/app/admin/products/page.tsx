"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, onProductsChange, type Product } from "@/lib/products";
import { saveOverride } from "@/lib/admin/productOverrides";
import { deleteCustomProduct } from "@/lib/admin/customProducts";
import { getCollectionLabel, listCollections, onCollectionsChange } from "@/lib/admin/collections";

function rangeLabel(range: string): string {
  const map: Record<string, string> = { odo: "Odo · For Her", nkrabea: "Nkrabea · For Him", unisex: "Signature" };
  return map[range] ?? getCollectionLabel(range);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState(() => listCollections());
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("all");

  useEffect(() => {
    const refresh = () => { setProducts(getProducts()); setCollections(listCollections()); };
    refresh();
    const u1 = onProductsChange(refresh);
    const u2 = onCollectionsChange(refresh);
    return () => { u1(); u2(); };
  }, []);

  function toggleSale(p: Product) {
    saveOverride(p.slug, { onSale: !p.onSale });
  }

  const filtered = products.filter(p => {
    if (range !== "all" && p.range !== range) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Catalogue</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Products</h1>
          <p className="text-brand-cream/45 text-sm mt-1">{products.length} products · click any to edit</p>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
        >
          + Add product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-brand-black-card border border-white/8 w-fit">
          {["all", ...collections.map(c => c.slug)].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === r ? "bg-brand-orange/20 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"
              }`}
            >
              {r === "all" ? "All ranges" : rangeLabel(r)}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or slug…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const activePrice = p.onSale && p.salePrice ? p.salePrice : p.price;
          return (
            <div
              key={p.slug}
              className={`rounded-2xl border bg-brand-black-card overflow-hidden transition-colors ${
                p.archived ? "border-white/5 opacity-50" : "border-white/8 hover:border-white/15"
              }`}
            >
              <Link href={`/admin/products/${p.slug}`} className="block">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark flex items-center justify-center">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl text-brand-cream/20">◆</span>
                  )}
                  {p.onSale && p.salePrice && (
                    <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded bg-brand-orange text-white">
                      On sale
                    </span>
                  )}
                  {p.badge && (
                    <span className={`absolute top-3 right-3 text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded text-white ${p.badgeColor ?? "bg-brand-purple"}`}>
                      {p.badge}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40">{rangeLabel(p.range)}</p>
                  <Link href={`/admin/products/${p.slug}`} className="block">
                    <h3 className="text-sm font-semibold text-brand-cream truncate">{p.name}</h3>
                  </Link>
                  <p className="text-[11px] text-brand-cream/45 truncate font-mono">{p.slug}</p>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    {p.onSale && p.salePrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg text-brand-orange">£{activePrice.toFixed(2)}</span>
                        <span className="text-xs text-brand-cream/40 line-through">£{p.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-display text-lg text-brand-cream">£{p.price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSale(p)}
                    className={`text-[10px] tracking-widest uppercase px-2.5 py-1.5 rounded transition-colors ${
                      p.onSale
                        ? "bg-brand-orange/20 border border-brand-orange/40 text-brand-orange"
                        : "border border-white/15 text-brand-cream/55 hover:text-brand-cream hover:border-white/30"
                    }`}
                  >
                    {p.onSale ? "On sale" : "Put on sale"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/${p.slug}`}
                    className="flex-1 block text-center py-2 rounded-lg border border-white/10 text-xs text-brand-cream/70 hover:border-white/30 hover:text-brand-cream transition-colors"
                  >
                    Edit details →
                  </Link>
                  {"_custom" in p && (
                    <button
                      onClick={() => { if (confirm(`Delete "${p.name}"?`)) { deleteCustomProduct(p.slug); setProducts(getProducts()); } }}
                      className="px-2.5 py-2 rounded-lg border border-white/10 text-xs text-brand-cream/40 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {p.available === 0 && <p className="text-[10px] text-brand-orange text-center">Sold out</p>}
                {p.available !== undefined && p.available > 0 && p.available <= 10 && <p className="text-[10px] text-brand-amber text-center">Only {p.available} left</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
