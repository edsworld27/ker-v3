"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/Shop";
import { useCart } from "@/context/CartContext";
import ProductDetail from "@/components/ProductDetail";

type Tab = "all" | "odo" | "nkrabea" | "unisex" | "gift-cards" | "accessories" | "clothing";

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: "all",     label: "All Products",      sub: "Odo + Nkrabea + everything else" },
  { id: "odo",     label: "Odo · For Her",     sub: "Heritage skincare for women" },
  { id: "nkrabea", label: "Nkrabea · For Him", sub: "Strength rituals for men" },
  { id: "unisex",  label: "Felicia's Black Soap", sub: "World renowned formula" },
  { id: "gift-cards", label: "Gift Cards", sub: "Give the gift of ritual" },
  { id: "accessories", label: "Accessories", sub: "Tools that complete the ritual" },
  { id: "clothing", label: "Clothing", sub: "Support tees and merch" },
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
  const tabParam = searchParams.get("tab");
  const initial: Tab =
    tabParam === "gift-cards" || tabParam === "accessories" || tabParam === "clothing"
      ? tabParam
      : rangeParam === "odo" || rangeParam === "nkrabea" || rangeParam === "unisex"
        ? rangeParam
        : "all";
  const [activeTab, setActiveTab] = useState<Tab>(initial);

  function handleAdd(product: (typeof PRODUCTS)[0]) {
    addItem({ id: product.id, name: product.name, price: product.price });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  }

  const visible = (() => {
    if (activeTab === "all") return PRODUCTS;
    if (activeTab === "gift-cards") return PRODUCTS.filter((p) => p.slug.includes("gift-card"));
    if (activeTab === "accessories") return PRODUCTS.filter((p) => p.formats.includes("stone"));
    if (activeTab === "clothing") return [];
    return PRODUCTS.filter((p) => p.range === activeTab);
  })();
  const odoCount     = PRODUCTS.filter(p => p.range === "odo").length;
  const nkrabeaCount = PRODUCTS.filter(p => p.range === "nkrabea").length;

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black">

        {/* Hero */}
        <section className="w-full pt-28 pb-16 sm:pt-32 sm:pb-20 bg-brand-black-soft relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/25 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="adinkra-line w-8 sm:w-10" />
                <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">The Shop</span>
                <div className="adinkra-line w-8 sm:w-10" />
              </div>
              <h1 className="font-display font-bold text-brand-cream leading-[1.05] mb-5
                text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl">
                Begin your ritual
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
                Handcrafted in Accra. Two ranges — one rooted in love, one in destiny.
              </p>

              {/* Range cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
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
                <button
                  onClick={() => setActiveTab("unisex")}
                  className="group flex flex-col p-6 rounded-2xl border border-brand-cream/10 bg-gradient-to-br from-stone-900/40 to-brand-black-card hover:border-brand-cream/30 transition-all text-left"
                >
                  <span className="text-xs tracking-[0.2em] uppercase text-brand-cream/50 mb-2">For Everyone</span>
                  <span className="font-display text-xl font-bold text-brand-cream mb-1">African Black Soap</span>
                  <span className="text-sm text-brand-cream/50">World renowned. One formula.</span>
                  <span className="mt-4 text-brand-cream/60 text-sm group-hover:translate-x-1 group-hover:text-brand-cream transition-all inline-block">
                    Shop Black Soap →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs + grid */}
        <section className="w-full py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

            {/* Tab bar */}
            <div className="overflow-x-auto pb-1 mb-12 sm:mb-14">
              <div className="flex gap-1 p-1 bg-brand-black-card border border-white/8 rounded-2xl w-max min-w-full">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-start px-5 py-3 rounded-xl transition-all duration-200 text-left whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-brand-black-soft border border-white/10"
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
            </div>

            {/* Range header */}
            {activeTab === "odo" && (
              <RangeHeader
                name="Odo" tagline="For Her" colour="text-brand-orange"
                description="Odo — meaning 'love' in Twi — is our women's range. Every formula is built on centuries of Ghanaian skincare tradition: raw shea, black soap, and plant actives sourced from named farms across Ghana. No synthetic ingredients, ever."
                count={odoCount}
              />
            )}
            {activeTab === "nkrabea" && (
              <RangeHeader
                name="Nkrabea" tagline="For Him" colour="text-brand-amber"
                description="Nkrabea — meaning 'destiny' in Twi — is our men's range. Built on the same heritage black soap base, engineered for stronger skin, closer shaves, and a daily ritual that actually works. No fuss. No synthetic fragrance. Just results."
                count={nkrabeaCount}
              />
            )}

            {/* Black Soap — inline product configurator */}
            {activeTab === "all" && (
              <div className="mb-6">
                <label className="text-xs tracking-[0.2em] uppercase text-brand-cream/40 mr-3">All products selector</label>
                <select
                  value={allSelector}
                  onChange={(e) => setAllSelector(e.target.value as AllSelector)}
                  className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream"
                >
                  <option value="all">All Products</option>
                  <option value="gift-cards">Buying for a friend (Gift Cards)</option>
                  <option value="accessories">Accessories</option>
                  <option value="clothing">Clothing (Coming Soon)</option>
                </select>
              </div>
            )}

            {activeTab === "unisex" ? (
              <ProductDetail product={PRODUCTS.find(p => p.slug === "black-soap")!} />
            ) : activeTab === "all" && allSelector === "clothing" ? (
            ) : activeTab === "clothing" ? (
              <div className="rounded-2xl border border-brand-amber/30 bg-gradient-to-br from-brand-amber/10 to-brand-black-card p-8 sm:p-10">
                <p className="text-xs tracking-[0.2em] uppercase text-brand-amber mb-3">Coming soon</p>
                <h3 className="font-display font-bold text-brand-cream text-3xl mb-3">Support Tees</h3>
                <p className="text-brand-cream/60 max-w-2xl">
                  We&apos;re adding a limited run of Luv &amp; Ker t-shirts so you can support the mission through what you wear.
                  Proceeds help us invest in farmer partnerships across Africa and clean, health-first formulations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
                {visible.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdded={added === product.id}
                    onAdd={() => handleAdd(product)}
                  />
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "🌍", label: "Shipped from Ghana" },
                { icon: "♻️", label: "Zero-waste packaging" },
                { icon: "🔒", label: "Secure checkout" },
                { icon: "💌", label: "Free UK shipping over £30" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2.5 p-5 rounded-xl bg-brand-black-card border border-white/5">
                  <span className="text-2xl sm:text-3xl">{icon}</span>
                  <p className="text-xs sm:text-sm text-brand-cream/40 leading-snug">{label}</p>
                </div>
              ))}
            </div>

            {/* Gift card nudge */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-brand-purple/20 bg-brand-purple-muted/20">
              <div>
                <p className="font-display font-bold text-brand-cream text-lg">Not sure which range?</p>
                <p className="text-brand-cream/50 text-sm mt-1">Give the gift of choice — Luv &amp; Ker Gift Cards work across both Odo and Nkrabea.</p>
              </div>
              <Link
                href="/products/odo-gift-card"
                className="shrink-0 px-6 py-3 rounded-xl border border-brand-purple/50 text-brand-purple-light text-sm font-medium hover:bg-brand-purple/10 transition-colors whitespace-nowrap"
              >
                Luv &amp; Ker Gift Card →
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
  name: string; tagline: string; colour: string; description: string; count: number;
}) {
  return (
    <div className="mb-10 pb-10 border-b border-white/8">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className={`font-display font-bold text-3xl sm:text-4xl ${colour}`}>{name}</h2>
        <span className="text-sm tracking-[0.2em] uppercase text-brand-cream/40">{tagline}</span>
        <span className="ml-auto text-xs text-brand-cream/30">{count} products</span>
      </div>
      <p className="text-brand-cream/55 text-sm sm:text-base leading-relaxed max-w-3xl">{description}</p>
    </div>
  );
}
