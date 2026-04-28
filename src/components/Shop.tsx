"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

import { PRODUCTS } from "@/lib/products";

export default function Shop() {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  function handleAdd(product: (typeof PRODUCTS)[0]) {
    addItem({ id: product.id, name: product.name, price: product.price });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <section id="shop" className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/20 to-transparent" />

      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header — always centered */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-18 lg:mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Shop</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream mb-4
            text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            Begin your ritual
          </h2>
          <p className="text-brand-cream/50 text-base sm:text-lg xl:text-xl leading-relaxed max-w-sm sm:max-w-md xl:max-w-lg mx-auto">
            Handcrafted in small batches. Every bar made with intention.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
          {PRODUCTS.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} isAdded={added === product.id} onAdd={() => handleAdd(product)} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/products" className="px-8 py-4 rounded-xl font-bold tracking-widest uppercase text-xs border border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white transition-all">
            Shop All Products
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-14 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
          {[
            { icon: "🌍", label: "Shipped from Ghana" },
            { icon: "♻️", label: "Zero-waste packaging" },
            { icon: "🔒", label: "Secure checkout" },
            { icon: "💌", label: "Free UK shipping over £30" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2.5 p-5 sm:p-6 rounded-xl bg-brand-black-card border border-white/5">
              <span className="text-2xl sm:text-3xl">{icon}</span>
              <p className="text-xs sm:text-sm text-brand-cream/40 leading-snug">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export function ProductCard({ product, isAdded, onAdd }: { product: (typeof PRODUCTS)[0]; isAdded: boolean; onAdd: () => void }) {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-orange/20 transition-all duration-300 overflow-hidden card-glow">
      <div className="absolute top-4 left-4 z-10">
        <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white ${product.badgeColor}`}>
          {product.badge}
        </span>
      </div>

      {/* Image area */}
      <Link href={`/products/${product.id}`} className="relative h-52 sm:h-56 xl:h-60 2xl:h-72 bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-brand-purple/30"
              style={{ width: `${(i+1)*80}px`, height: `${(i+1)*80}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
        </div>
        <div className="relative z-10 w-32 h-20 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-purple/30 border border-white/10 flex flex-col items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
          <p className="font-display text-brand-cream text-xs font-bold tracking-widest">ODO</p>
          <div className="w-8 h-px bg-brand-amber/50 my-1.5" />
          <p className="text-brand-cream/40 text-[8px] tracking-widest uppercase">by Felicia</p>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-6 xl:p-7">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <Link href={`/products/${product.id}`} className="font-display text-xl sm:text-2xl font-bold text-brand-cream hover:text-brand-orange transition-colors">
            {product.name}
          </Link>
          <span className="font-display text-xl sm:text-2xl font-bold text-brand-orange shrink-0">£{product.price.toFixed(2)}</span>
        </div>
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/30 mb-4">{product.tagline}</p>
        <p className="text-sm xl:text-base text-brand-cream/55 leading-relaxed flex-1 mb-4">{product.description[0]}</p>
        <p className="text-xs sm:text-sm italic text-brand-amber/60 mb-5">✦ {product.note}</p>
        <Link
          href={`/products/${product.id}`}
          className="w-full py-3 mb-2.5 rounded-xl text-center text-sm font-medium text-brand-cream/70 border border-white/10 hover:border-brand-cream/30 hover:text-brand-cream transition-colors"
        >
          View details
        </Link>
        <button
          onClick={onAdd}
          className={`w-full py-4 rounded-xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 ${
            isAdded
              ? "bg-brand-purple text-white"
              : "bg-brand-orange hover:bg-brand-orange-light text-white hover:-translate-y-0.5 shadow-lg shadow-brand-orange/15"
          }`}
        >
          {isAdded ? "✓ Added to Bag" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
