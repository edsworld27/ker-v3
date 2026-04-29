"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";

const FEATURED_SLUGS = ["black-soap", "odo-face", "nkrabea-shave"];

const PRODUCT_VISUALS: Record<string, { gradient: string; accent: string; symbol: string }> = {
  "black-soap": {
    gradient: "from-stone-800/40 via-brand-black-card to-brand-black-card",
    accent: "text-brand-cream",
    symbol: "◆",
  },
  "odo-face": {
    gradient: "from-brand-purple/20 via-rose-900/10 to-brand-black-card",
    accent: "text-brand-amber",
    symbol: "◈",
  },
  "nkrabea-shave": {
    gradient: "from-slate-700/20 via-brand-black-card to-brand-black-card",
    accent: "text-brand-amber",
    symbol: "⬡",
  },
};

export default function FeaturedProducts() {
  const { addItem } = useCart();

  const products = FEATURED_SLUGS.map((slug) =>
    PRODUCTS.find((p) => p.slug === slug)
  ).filter(Boolean) as (typeof PRODUCTS)[number][];

  return (
    <section className="w-full py-20 sm:py-24 bg-brand-black relative overflow-hidden">
      {/* top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />

      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Featured</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream text-4xl sm:text-5xl xl:text-6xl mb-3">
            Start your ritual.
          </h2>
          <p className="text-brand-cream/50 text-base sm:text-lg max-w-sm mx-auto">
            Three products. One for every skin need.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 xl:gap-6">
          {products.map((product) => {
            const visual = PRODUCT_VISUALS[product.slug];
            const isOdo = product.range === "odo";

            return (
              <div
                key={product.slug}
                className={`relative flex flex-col rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br ${visual.gradient} hover:border-white/16 transition-all duration-300 group`}
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-5 left-5 z-10">
                    <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-medium ${product.badgeColor ?? "bg-brand-orange"} text-white`}>
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Visual area */}
                <div className="relative flex items-center justify-center h-44 sm:h-48 overflow-hidden">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-36 h-36 rounded-full border ${isOdo ? "border-brand-orange/10" : "border-brand-amber/10"}`} />
                    <div className={`absolute w-24 h-24 rounded-full border ${isOdo ? "border-brand-orange/10" : "border-brand-amber/10"}`} />
                  </div>
                  <span className={`${visual.accent} text-6xl sm:text-7xl font-light select-none group-hover:scale-110 transition-transform duration-500`}>
                    {visual.symbol}
                  </span>
                  {/* Range label */}
                  <span className={`absolute bottom-4 right-5 text-[10px] tracking-[0.24em] uppercase ${visual.accent} opacity-60`}>
                    {product.range === "odo" ? "Odo · For Her" : product.range === "nkrabea" ? "Nkrabea · For Him" : "For Everyone"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 pt-0 gap-4">
                  <div>
                    <h3 className="font-display font-bold text-brand-cream text-2xl mb-1">{product.name}</h3>
                    <p className="text-brand-cream/50 text-sm">{product.tagline}</p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-1.5 flex-1">
                    {product.shortBullets.slice(0, 3).map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-brand-cream/60 text-sm leading-snug">
                        <span className={`${visual.accent} mt-0.5 text-xs`}>—</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Price + actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/8">
                    <div>
                      {product.salePrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-display font-bold text-brand-cream text-xl">£{product.salePrice.toFixed(2)}</span>
                          <span className="text-brand-cream/30 text-sm line-through">£{product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-display font-bold text-brand-cream text-xl">from £{product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-brand-cream/50 hover:text-brand-cream text-sm transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() =>
                          addItem({
                            id: `${product.id}-default`,
                            name: product.name,
                            price: product.salePrice ?? product.price,
                          })
                        }
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          product.range === "odo"
                            ? "bg-brand-orange hover:bg-brand-orange/90 text-white"
                            : product.range === "nkrabea"
                            ? "bg-brand-amber hover:bg-brand-amber/90 text-brand-black"
                            : "bg-brand-cream hover:bg-white text-brand-black"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all link */}
        <div className="flex justify-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-cream/50 hover:text-brand-cream text-sm transition-colors group"
          >
            Browse all products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
