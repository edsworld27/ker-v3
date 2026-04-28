"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/Shop";
import { useCart } from "@/context/CartContext";

type Tab = "all" | "odo" | "nkrabea";

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: "all", label: "All Products", sub: "The full collection" },
  { id: "odo", label: "Odo · For Her", sub: "Heritage skincare for women" },
  { id: "nkrabea", label: "Nkrabea · For Him", sub: "Strength rituals for men" },
];

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range");
  const initialTab: Tab =
    rangeParam === "odo" || rangeParam === "nkrabea" ? rangeParam : "all";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (rangeParam === "odo" || rangeParam === "nkrabea") {
      setActiveTab(rangeParam);
    }
  }, [rangeParam]);

  function handleAdd(product: (typeof PRODUCTS)[0]) {
    addItem({ id: product.id, name: product.name, price: product.price });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }

  const visible =
    activeTab === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.range === activeTab);

  const odoProducts = PRODUCTS.filter((p) => p.range === "odo");
  const nkrabeaProducts = PRODUCTS.filter((p) => p.range === "nkrabea");

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black">

        {/* Hero */}
        <section className="w-full pt-28 pb-16 sm:pt-32 sm:pb-20 bg-brand-black-soft relative overflow-hidden">
          <div className="absolute inset-0 hero-glow pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="adinkra-line w-8 sm:w-10" />
                <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">The Shop</span>
                <div className="adinkra-line w-8 sm:w-10" />
              </div>
              <h1 className="font-display font-bold text-brand-cream leading-tight mb-5 text-4xl sm:text-5xl md:text-6xl xl:text-7xl">
                Begin your ritual
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
                Handcrafted in Accra. Two ranges — one rooted in love, one in destiny. Both made with intention.
              </p>

              {/* Range split teaser */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <button
                  onClick={() => setActiveTab("odo")}
                  className="group flex flex-col p-6 rounded-2xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/5 to-brand-purple/5 hover:border-brand-orange/50 transition-all text-left"
                >
                  <span className="text-xs tracking-[0.2em] uppercase text-brand-orange mb-2">Odo · For Her</span>
                  <span className="font-display text-xl font-bold text-brand-cream mb-1">Heritage skincare</span>
                  <span className="text-sm text-brand-cream/50">Rooted in love &amp; Ghanaian tradition</span>
                  <span className="mt-4 text-brand-orange text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Shop Odo →
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("nkrabea")}
                  className="group flex flex-col p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-brand-black-card to-brand-purple-muted/30 hover:border-brand-amber/30 transition-all text-left"
                >
                  <span className="text-xs tracking-[0.2em] uppercase text-brand-amber mb-2">Nkrabea · For Him</span>
                  <span className="font-display text-xl font-bold text-brand-cream mb-1">Strength &amp; destiny</span>
                  <span className="text-sm text-brand-cream/50">Power rituals built for men</span>
                  <span className="mt-4 text-brand-amber text-sm group-hover:translate-x-1 transition-transform inline-block">
                    Shop Nkrabea →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab bar + products */}
        <section className="w-full py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-brand-black-card border border-white/8 rounded-2xl w-fit mb-12 sm:mb-14">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start px-5 py-3 rounded-xl transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? "bg-brand-black-soft border border-white/10 shadow-sm"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className={`text-sm font-medium transition-colors ${activeTab === tab.id ? "text-brand-cream" : "text-brand-cream/50"}`}>
                    {tab.label}
                  </span>
                  <span className="text-[10px] tracking-wide text-brand-cream/30 hidden sm:block mt-0.5">
                    {tab.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Range header when filtered */}
            {activeTab === "odo" && (
              <RangeHeader
                name="Odo"
                tagline="For Her"
                colour="brand-orange"
                description="Odo — meaning 'love' in Twi — is our women's range. Every formula is built on centuries of Ghanaian skincare tradition: raw shea, black soap, and plant actives sourced from named farms across Ghana. No synthetic ingredients, ever."
                count={odoProducts.length}
              />
            )}
            {activeTab === "nkrabea" && (
              <RangeHeader
                name="Nkrabea"
                tagline="For Him"
                colour="brand-amber"
                description="Nkrabea — meaning 'destiny' in Twi — is our men's range. Built on the same heritage black soap base, engineered for stronger skin, closer shaves, and a daily ritual that actually works. No fuss. No synthetic fragrance. Just results."
                count={nkrabeaProducts.length}
              />
            )}

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdded={added === product.id}
                  onAdd={() => handleAdd(product)}
                />
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
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

            {/* Gift card nudge */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-brand-purple/20 bg-brand-purple-muted/20">
              <div>
                <p className="font-display font-bold text-brand-cream text-lg">Not sure which range?</p>
                <p className="text-brand-cream/50 text-sm mt-1">Give the gift of choice — our digital gift cards work across both ranges.</p>
              </div>
              <Link
                href="/products/odo-gift-card"
                className="shrink-0 px-6 py-3 rounded-xl border border-brand-purple/50 text-brand-purple-light text-sm font-medium hover:bg-brand-purple/10 transition-colors whitespace-nowrap"
              >
                Get a Gift Card →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RangeHeader({ name, tagline, colour, description, count }: {
  name: string;
  tagline: string;
  colour: string;
  description: string;
  count: number;
}) {
  return (
    <div className="mb-10 pb-10 border-b border-white/8">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className={`font-display font-bold text-3xl sm:text-4xl text-${colour}`}>{name}</h2>
        <span className="text-sm tracking-[0.2em] uppercase text-brand-cream/40">{tagline}</span>
        <span className="ml-auto text-xs text-brand-cream/30">{count} products</span>
      </div>
      <p className="text-brand-cream/55 text-sm sm:text-base leading-relaxed max-w-3xl">{description}</p>
    </div>
  );
}
