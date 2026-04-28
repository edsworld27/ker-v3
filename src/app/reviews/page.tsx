"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { REVIEWS, PRODUCTS, type ProductFilter } from "@/lib/reviews";

export default function ReviewsPage() {
  const [productFilter, setProductFilter] = useState<ProductFilter>("All Products");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");

  const filtered = useMemo(() => {
    let result = [...REVIEWS];
    if (productFilter !== "All Products") {
      result = result.filter((r) => r.product === productFilter);
    }
    if (starFilter !== null) {
      result = result.filter((r) => r.stars === starFilter);
    }
    if (sortBy === "rating") {
      result = result.sort((a, b) => b.stars - a.stars);
    }
    return result;
  }, [productFilter, starFilter, sortBy]);

  const avgRating = (REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length).toFixed(1);

  return (
    <>
      <Navbar />
      <main className="w-full bg-brand-black min-h-screen">
        {/* Hero header */}
        <section className="w-full pt-28 pb-16 sm:pt-32 sm:pb-20 bg-brand-black-soft">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="adinkra-line w-8 sm:w-10" />
                <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">Verified reviews</span>
                <div className="adinkra-line w-8 sm:w-10" />
              </div>
              <h1 className="font-display font-bold text-brand-cream leading-tight mb-5 text-4xl sm:text-5xl md:text-6xl xl:text-7xl">
                What people are <span className="gradient-text">actually saying</span>
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
                Real customers. Real results. We don&apos;t pay for testimonials and we don&apos;t curate them.
              </p>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/5 w-full max-w-2xl">
                {[
                  { big: avgRating, small: "Average rating" },
                  { big: `${REVIEWS.length}+`, small: "Verified reviews" },
                  { big: "100%", small: "5-star reviews" },
                ].map((s) => (
                  <div key={s.small} className="bg-brand-black-card px-5 py-5 flex flex-col items-center text-center">
                    <span className="font-display text-2xl sm:text-3xl font-bold text-brand-amber leading-none mb-1">
                      {s.big}
                    </span>
                    <span className="text-[11px] sm:text-xs tracking-wide text-brand-cream/50">{s.small}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filters + reviews */}
        <section className="w-full py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 sm:mb-12">
              {/* Product filter */}
              <div className="flex-1">
                <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-2">Product</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProductFilter(p)}
                      className={`px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                        productFilter === p
                          ? "bg-brand-orange border-brand-orange text-white"
                          : "bg-transparent border-white/15 text-brand-cream/60 hover:border-brand-orange/50 hover:text-brand-cream"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star filter */}
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-2">Rating</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStarFilter(null)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                      starFilter === null
                        ? "bg-brand-amber border-brand-amber text-brand-black"
                        : "bg-transparent border-white/15 text-brand-cream/60 hover:border-brand-amber/50 hover:text-brand-cream"
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStarFilter(s)}
                      className={`px-4 py-1.5 rounded-full text-xs sm:text-sm border transition-all duration-200 ${
                        starFilter === s
                          ? "bg-brand-amber border-brand-amber text-brand-black"
                          : "bg-transparent border-white/15 text-brand-cream/60 hover:border-brand-amber/50 hover:text-brand-cream"
                      }`}
                    >
                      {"★".repeat(s)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/40 mb-2">Sort by</p>
                <div className="flex gap-2">
                  {(["recent", "rating"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-4 py-1.5 rounded-full text-xs sm:text-sm border capitalize transition-all duration-200 ${
                        sortBy === s
                          ? "bg-brand-purple border-brand-purple text-white"
                          : "bg-transparent border-white/15 text-brand-cream/60 hover:border-brand-purple/50 hover:text-brand-cream"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result count */}
            <p className="text-brand-cream/40 text-sm mb-8">
              Showing <span className="text-brand-cream font-medium">{filtered.length}</span> of {REVIEWS.length} reviews
            </p>

            {/* Review grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <p className="text-brand-cream/40 text-lg mb-2">No reviews match your filters.</p>
                <button
                  onClick={() => { setProductFilter("All Products"); setStarFilter(null); }}
                  className="text-brand-orange text-sm underline underline-offset-4 mt-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                {filtered.map((review, i) => (
                  <div
                    key={`${review.name}-${i}`}
                    className="flex flex-col p-7 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-purple/30 transition-colors"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: review.stars }).map((_, j) => (
                        <span key={j} className="text-brand-amber text-lg">★</span>
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-brand-cream/70 text-sm leading-relaxed flex-1 mb-6">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    {/* Author */}
                    <div className="flex items-center gap-3 pt-5 border-t border-white/8">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {review.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-brand-cream truncate">{review.name}</p>
                        <p className="text-xs text-brand-cream/30 truncate">{review.location}</p>
                      </div>
                      {review.product && (
                        <span className="text-[10px] tracking-wide uppercase text-brand-purple-light bg-brand-purple/10 px-2.5 py-1 rounded-full shrink-0">
                          {review.product}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Back to home */}
            <div className="flex justify-center mt-16">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-brand-cream/40 text-sm hover:text-brand-cream transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
