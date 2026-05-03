"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { type Product } from "@/lib/products";

export default function Shop() {
  return (
    <section id="shop" className="w-full py-20 sm:py-24 lg:py-32 bg-brand-black relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/20 to-transparent" />

      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Shop</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream mb-4 text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl">
            Shop the full ritual.
          </h2>
          <p className="text-brand-cream/50 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Handcrafted in Accra — built on centuries of Ghanaian skincare wisdom.
          </p>
        </div>

        {/* Range cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">

          {/* Odo — For Her */}
          <Link
            href="/products?range=odo"
            className="group relative flex flex-col justify-end p-8 rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] border border-brand-orange/20 bg-gradient-to-br from-brand-orange/10 via-brand-black-card to-brand-purple/10 hover:border-brand-orange/50 transition-all duration-300"
          >
            {/* Decorative rings */}
            <div className="absolute top-6 right-6 w-32 h-32 rounded-full border border-brand-orange/10 pointer-events-none" />
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-brand-orange/10 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-3 block">For Her</span>
              <h3 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl mb-2">Odo</h3>
              <p className="text-brand-cream/50 text-sm leading-relaxed mb-6">
                Rooted in love. Heritage black soap formulas for women — face, hands, and body.
              </p>
              <span className="inline-flex items-center gap-2 text-brand-orange text-sm font-medium group-hover:gap-3 transition-all">
                Shop Odo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Nkrabea — For Him */}
          <Link
            href="/products?range=nkrabea"
            className="group relative flex flex-col justify-end p-8 rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] border border-white/8 bg-gradient-to-br from-brand-black-card via-brand-black-card to-brand-purple-muted/40 hover:border-brand-amber/30 transition-all duration-300"
          >
            {/* Decorative rings */}
            <div className="absolute top-6 right-6 w-32 h-32 rounded-full border border-brand-amber/10 pointer-events-none" />
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-brand-amber/10 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-3 block">For Him</span>
              <h3 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl mb-2">Nkrabea</h3>
              <p className="text-brand-cream/50 text-sm leading-relaxed mb-6">
                Rooted in destiny. Strength rituals for men — face, body, and shave.
              </p>
              <span className="inline-flex items-center gap-2 text-brand-amber text-sm font-medium group-hover:gap-3 transition-all">
                Shop Nkrabea
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Black Soap — Unisex */}
          <Link
            href="/products/black-soap"
            className="group relative flex flex-col justify-end p-8 rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] border border-brand-cream/10 bg-gradient-to-br from-stone-900/60 via-brand-black-card to-brand-black-card hover:border-brand-cream/30 transition-all duration-300"
          >
            {/* Decorative rings */}
            <div className="absolute top-6 right-6 w-32 h-32 rounded-full border border-brand-cream/8 pointer-events-none" />
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full border border-brand-cream/8 pointer-events-none" />
            {/* Badge */}
            <div className="absolute top-6 left-6">
              <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-medium bg-brand-purple text-white">
                Felicia&apos;s Original
              </span>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/50 mb-3 block">For Everyone</span>
              <h3 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl mb-2">Black Soap</h3>
              <p className="text-brand-cream/50 text-sm leading-relaxed mb-6">
                The original formula. One soap for face, body, and hands — bar, jar, or sachet.
              </p>
              <span className="inline-flex items-center gap-2 text-brand-cream/70 text-sm font-medium group-hover:text-brand-cream group-hover:gap-3 transition-all">
                Shop Black Soap
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

        </div>

        {/* Browse all + buying for a friend */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 bg-brand-black-card hover:border-white/25 hover:bg-white/[0.02] text-center text-sm text-brand-cream/70 hover:text-brand-cream transition-all"
          >
            Browse all products — pick by range, gift card, accessory or clothing →
          </Link>
          <Link
            href="/products?tab=gift-cards"
            className="px-6 py-4 rounded-2xl border border-brand-purple/30 bg-brand-purple-muted/20 hover:bg-brand-purple/20 text-center text-sm text-brand-purple-light font-medium transition-all whitespace-nowrap"
          >
            🎁 Buying for a Friend →
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-14 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
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

// ProductCard is exported for use on the /products page
export function ProductCard({ product, isAdded, onAdd }: { product: Product; isAdded: boolean; onAdd: () => void }) {
  const soldOut = product.available === 0;
  const lowStockQty = product.showLowStock && product.available !== undefined && product.available > 0 && product.available <= 8
    ? product.available
    : null;
  const activePrice = product.onSale && product.salePrice ? product.salePrice : product.price;

  return (
    <div className={`group relative flex flex-col rounded-2xl bg-brand-black-card border transition-all duration-300 overflow-hidden card-glow ${
      soldOut ? "border-white/5 opacity-70" : "border-white/5 hover:border-brand-orange/20"
    }`}>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {soldOut && (
          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white bg-white/20">
            Sold out
          </span>
        )}
        {!soldOut && product.badge && (
          <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white ${product.badgeColor ?? "bg-brand-purple"}`}>
            {product.badge}
          </span>
        )}
        {!soldOut && lowStockQty !== null && (
          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white bg-brand-orange/80">
            Only {lowStockQty} left
          </span>
        )}
        {!soldOut && product.onSale && product.salePrice && (
          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white bg-brand-orange">
            Sale
          </span>
        )}
      </div>

      {/* Image area */}
      <Link href={`/products/${product.id}`} className="relative h-52 sm:h-56 xl:h-60 2xl:h-72 bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark flex items-center justify-center overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
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
          </>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-6 xl:p-7">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <Link href={`/products/${product.id}`} className="font-display text-xl sm:text-2xl font-bold text-brand-cream hover:text-brand-orange transition-colors">
            {product.name}
          </Link>
          <div className="shrink-0 text-right">
            {product.onSale && product.salePrice ? (
              <>
                <span className="font-display text-xl sm:text-2xl font-bold text-brand-orange">£{activePrice.toFixed(2)}</span>
                <span className="block text-xs text-brand-cream/40 line-through">£{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-display text-xl sm:text-2xl font-bold text-brand-orange">£{product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/30 mb-4">{product.tagline}</p>
        <p className="text-sm xl:text-base text-brand-cream/55 leading-relaxed flex-1 mb-4">{product.description[0]}</p>
        {product.note && <p className="text-xs sm:text-sm italic text-brand-amber/60 mb-5">✦ {product.note}</p>}
        <Link
          href={`/products/${product.id}`}
          className="w-full py-3 mb-2.5 rounded-xl text-center text-sm font-medium text-brand-cream/70 border border-white/10 hover:border-brand-cream/30 hover:text-brand-cream transition-colors"
        >
          View details
        </Link>
        <button
          onClick={onAdd}
          disabled={soldOut}
          className={`w-full py-4 rounded-xl font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 ${
            soldOut
              ? "bg-white/10 text-brand-cream/30 cursor-not-allowed"
              : isAdded
              ? "bg-brand-purple text-white"
              : "bg-brand-orange hover:bg-brand-orange-light text-white hover:-translate-y-0.5 shadow-lg shadow-brand-orange/15"
          }`}
        >
          {soldOut ? "Sold out" : isAdded ? "✓ Added to Bag" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
