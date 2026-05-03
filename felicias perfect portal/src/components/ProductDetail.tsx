"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product, ProductFormat } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";
import { getReviewsForProduct } from "@/lib/admin/reviews";
import DiscountPopup from "@/components/DiscountPopup";
import GiftCardPurchaseForm from "@/components/GiftCardPurchaseForm";

interface DisplayReview {
  name: string;
  location: string;
  stars: number;
  title?: string;
  body: string;
}

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [format, setFormat] = useState<ProductFormat>(product.formats?.[0] || "bar");
  const [size, setSize] = useState(product.sizes[0]);
  const [fragrance, setFragrance] = useState(product.fragrances[0]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [readMore, setReadMore] = useState(false);

  useEffect(() => {
    const initialFormat = product.formats?.[0] || "bar";
    const initialSizes = product.formatSizes?.[initialFormat] ?? product.sizes;
    setFormat(initialFormat);
    setSize(initialSizes[0]);
    setFragrance(product.fragrances[0]);
    setQty(1);
    setActiveImage(0);
    setAdded(false);
    setReadMore(false);
  }, [product]);

  const activeSizes = product.formatSizes?.[format] ?? product.sizes;

  // Reset size when format changes
  useEffect(() => {
    setSize(activeSizes[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  const displayPrice = size.price;

  const related = PRODUCTS.filter((p) => p.slug !== product.slug);

  // Merge: base → format override → fragrance override (fragrance wins)
  const fc = product.formatContent?.[format];
  const frag = product.fragranceContent?.[fragrance];
  const activeContent = {
    tagline: frag?.note ? `${fc?.tagline ?? product.tagline}` : (fc?.tagline ?? product.tagline),
    description: frag?.description ?? fc?.description ?? product.description,
    shortBullets: frag?.shortBullets ?? fc?.shortBullets ?? product.shortBullets,
    note: frag?.note ?? fc?.note ?? product.note,
    ingredients: fc?.ingredients ?? product.ingredients,
    directions: fc?.directions ?? product.directions,
  };

  const globalReviews: DisplayReview[] = getProductReviews(product.slug).map((r) => ({
    name: r.name,
    location: r.location,
    stars: r.stars,
    body: r.quote,
  }));
  const inlineReviews: DisplayReview[] = product.reviews.map((r) => ({
    name: r.name,
    location: r.location,
    stars: r.stars,
    title: r.title,
    body: r.body,
  }));
  const adminReviews: DisplayReview[] = getReviewsForProduct(product.slug).map((r) => ({
    name: r.name,
    location: r.location,
    stars: r.stars,
    title: r.title,
    body: r.body,
  }));
  // Merge: admin-created (newest) first, then global reviews, then inline. Dedupe by name.
  const seen = new Set<string>();
  const displayReviews: DisplayReview[] = [...adminReviews, ...globalReviews, ...inlineReviews].filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  });

  const getDisplaySize = (sLabel: string) => {
    if (sLabel === "Gift Set") return sLabel;
    const formatLabel = format.charAt(0).toUpperCase() + format.slice(1);
    return `${sLabel} ${formatLabel}`;
  };

  function handleAdd() {
    const shopifyVariantId = product.shopifyVariants?.find(
      (v) => v.format === format && v.size === size.label && v.fragrance === fragrance
    )?.id;

    for (let i = 0; i < qty; i++) {
      addItem({
        id: `${product.id}-${format}-${size.label}-${fragrance}`,
        name: `${product.name} — ${getDisplaySize(size.label)}`,
        price: displayPrice,
        variant: fragrance,
        shopifyVariantId,
        stockSku: product.stockSku,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="w-full bg-brand-black border-b border-white/5">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-4">
          <nav className="text-xs tracking-[0.18em] uppercase text-brand-cream/40">
            <Link href="/" className="hover:text-brand-cream transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#shop" className="hover:text-brand-cream transition-colors">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-cream/70">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Top: gallery + info */}
      <section className="w-full bg-brand-black">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark border border-white/5">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full border border-brand-purple/30"
                      style={{
                        width: `${(i + 1) * 18}%`,
                        height: `${(i + 1) * 18}%`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                      }}
                    />
                  ))}
                </div>
                {product.badge && (
                  <span
                    className={`absolute top-5 left-5 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white ${product.badgeColor}`}
                  >
                    {product.badge}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* PRODUCT IMAGE PLACEHOLDER — replace with <img src={...} /> when images arrive */}
                  {format === "bar" ? (
                    <div className="w-52 h-36 sm:w-64 sm:h-44 rounded-2xl bg-gradient-to-br from-brand-orange/25 to-brand-purple/35 border border-white/10 flex flex-col items-center justify-center shadow-2xl">
                      <p className="font-display text-brand-cream text-base sm:text-lg font-bold tracking-[0.3em]">ODO</p>
                      <div className="w-10 h-px bg-brand-amber/60 my-2" />
                      <p className="text-brand-cream/50 text-[10px] tracking-widest uppercase">Bar · by Felicia</p>
                      <p className="text-brand-cream/40 text-[9px] mt-1 tracking-widest uppercase">
                        {product.name.replace("Odo ", "")}
                      </p>
                    </div>
                  ) : (
                    <div className="w-40 h-48 sm:w-48 sm:h-60 rounded-b-[1.75rem] rounded-t-xl bg-gradient-to-br from-brand-amber/25 to-brand-orange/30 border border-white/10 flex flex-col items-center justify-center shadow-2xl relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 rounded-md bg-brand-black-card border border-white/10" />
                      <p className="font-display text-brand-cream text-base sm:text-lg font-bold tracking-[0.3em]">ODO</p>
                      <div className="w-10 h-px bg-brand-amber/60 my-2" />
                      <p className="text-brand-cream/50 text-[10px] tracking-widest uppercase">Jar · by Felicia</p>
                      <p className="text-brand-cream/40 text-[9px] mt-1 tracking-widest uppercase">
                        {product.name.replace("Odo ", "")}
                      </p>
                    </div>
                  )}
                </div>
                <p className="absolute bottom-5 right-5 text-[10px] tracking-widest uppercase text-brand-cream/30">
                  {format === "bar" ? "Bar" : "Jar"} · View {activeImage + 1} / 4
                </p>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl border overflow-hidden transition-all ${
                      activeImage === i
                        ? "border-brand-orange/60"
                        : "border-white/5 hover:border-white/20"
                    } bg-gradient-to-br from-brand-purple-muted/60 via-brand-black-card to-brand-purple-dark/60 flex items-center justify-center`}
                  >
                    <span className="font-display text-brand-cream/40 text-xs tracking-widest">0{i + 1}</span>
                  </button>
                ))}
              </div>

              {/* Enhanced Description — desktop only, lives under images */}
              <div className="hidden lg:block mt-2 space-y-4">
                {/* Base story — always shown */}
                {product.description.map((p, i) => (
                  <p key={i} className="text-sm xl:text-base text-brand-cream/60 leading-relaxed">{p}</p>
                ))}

                {/* Contextual add-on — fades in when format or scent has specific content */}
                {(fc?.description || frag?.description) && (
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-brand-amber">
                      {frag?.note ?? fc?.tagline ?? "About this option"}
                    </p>
                    {(frag?.description ?? fc?.description ?? []).map((p, i) => (
                      <p key={i} className="text-sm xl:text-base text-brand-cream/60 leading-relaxed">{p}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            {format === "card" ? (
              <GiftCardPurchaseForm product={product} />
            ) : (
            <div className="flex flex-col">
              <p className="text-[11px] tracking-[0.3em] uppercase text-brand-amber mb-3">{product.origin}</p>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/40 mb-5">{activeContent.tagline}</p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-base ${i < Math.round(product.rating) ? "text-brand-amber" : "text-brand-cream/15"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-brand-cream/50">
                  {product.rating.toFixed(2)} · {product.reviewCount} reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-3xl xl:text-4xl font-bold text-brand-orange">
                  £{displayPrice.toFixed(2)}
                </span>
                {product.badge === "Save £3" && (
                  <span className="text-sm text-brand-cream/40 line-through">£38.00</span>
                )}
              </div>
              <p className="text-xs text-brand-cream/40 mb-7">
                Or 4 interest-free payments of £{(displayPrice / 4).toFixed(2)} with{" "}
                <span className="text-brand-cream/60 font-medium">Klarna</span>
              </p>

              {/* Bullets */}
              <ul className="space-y-2.5 mb-8">
                {activeContent.shortBullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm xl:text-base text-brand-cream/70 leading-relaxed">
                    <span className="text-brand-amber shrink-0 mt-0.5">✦</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Mobile description — Read More toggle (hidden on lg+) */}
              <div className="lg:hidden mb-6">
                <p className="text-sm xl:text-base text-brand-cream/60 leading-relaxed">
                  {product.description[0]}
                </p>
                {readMore && (
                  <div className="mt-3 space-y-3">
                    {product.description.slice(1).map((p, i) => (
                          <p key={i} className="text-sm xl:text-base text-brand-cream/60 leading-relaxed">{p}</p>
                    ))}
                    {(frag?.description ?? fc?.description) && (
                      <div className="border-t border-white/5 pt-3 space-y-2">
                        <p className="text-[10px] tracking-[0.25em] uppercase text-brand-amber">
                          {frag?.note ?? fc?.tagline ?? "About this option"}
                        </p>
                        {(frag?.description ?? fc?.description ?? []).map((p, i) => (
                              <p key={i} className="text-sm xl:text-base text-brand-cream/60 leading-relaxed">{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setReadMore((v) => !v)}
                  className="mt-2 text-xs text-brand-orange/80 hover:text-brand-orange transition-colors tracking-wide"
                >
                  {readMore ? "Read less ↑" : "Read more →"}
                </button>
              </div>


              {product.fragrances.length > 1 && (
                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2.5">Scent</label>
                  <div className="flex flex-wrap gap-2">
                    {product.fragrances.map((f) => {
                      const emoji = f === "Wild Orange" ? "🍊" : f === "Lavender" ? "💜" : f === "Frankincense" ? "🌿" : "";
                      return (
                        <button
                          key={f}
                          onClick={() => setFragrance(f)}
                          className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all tracking-wide ${
                            fragrance === f
                              ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                              : "border-white/10 bg-brand-black-card text-brand-cream/55 hover:border-white/25 hover:text-brand-cream"
                          }`}
                        >
                          {emoji && <span className="mr-1">{emoji}</span>}{f}
                        </button>
                      );
                    })}
                  </div>
                  {product.fragranceContent?.[fragrance]?.note && (
                    <p className="mt-2 text-[11px] text-brand-amber/70 italic tracking-wide">
                      ✦ {product.fragranceContent[fragrance].note}
                    </p>
                  )}
                </div>
              )}

              {/* Format selector — SECOND */}
              {product.formats && product.formats.length > 0 && (
                <div className="mb-5">
                  <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2.5">Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    {product.formats.map((f) => {
                      let icon = "▬";
                      let desc = "Solid · Classic";
                      if (f === "jar") { icon = "◉"; desc = "Whipped · Creamy"; }
                      if (f === "dispenser") { icon = "💧"; desc = "Liquid · Pump"; }
                      if (f === "sachet") { icon = "♻️"; desc = "Liquid · Refill"; }
                      if (f === "stone") { icon = "🌋"; desc = "Volcanic · Exfoliant"; }
                      return (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                            format === f
                              ? "border-brand-orange bg-brand-orange/10"
                              : "border-white/10 bg-brand-black-card hover:border-white/25"
                          }`}
                        >
                          <div className="shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-brand-purple-muted to-brand-black-card border border-white/5 flex items-center justify-center">
                            <span className="text-xl text-brand-cream/40">{icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-brand-cream capitalize">{f}</p>
                            <p className="text-[10px] tracking-wide uppercase text-brand-cream/40 mt-0.5">{desc}</p>
                          </div>
                          {format === f && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size selector — THIRD */}
              <div className="mb-5">
                <label className="block text-[11px] tracking-[0.22em] uppercase text-brand-cream/50 mb-2.5">Size</label>
                <div className="flex flex-wrap gap-2.5">
                  {activeSizes.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setSize(s)}
                      className={`px-5 py-3 rounded-xl text-sm font-medium border transition-all ${
                        size.label === s.label
                          ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                          : "border-white/10 bg-brand-black-card text-brand-cream/60 hover:border-white/25"
                      }`}
                    >
                      {getDisplaySize(s.label)} · £{s.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add */}
              <div className="flex items-stretch gap-3 mb-4">
                <div className="flex items-center bg-brand-black-card border border-white/10 rounded-xl">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-12 h-full text-brand-cream/60 hover:text-brand-cream transition-colors text-lg"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-brand-cream font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-12 h-full text-brand-cream/60 hover:text-brand-cream transition-colors text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className={`flex-1 rounded-xl font-semibold text-sm sm:text-base tracking-wide py-4 transition-all duration-300 ${
                    added
                      ? "bg-brand-purple text-white"
                      : "bg-brand-orange hover:bg-brand-orange-light text-white hover:-translate-y-0.5 shadow-lg shadow-brand-orange/20"
                  }`}
                >
                  {added ? "✓ Added to Bag" : `Add to Bag · £${(displayPrice * qty).toFixed(2)}`}
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-cream/40 mb-6">
                <span className="flex items-center gap-1.5"><span>🔒</span> Secure checkout</span>
                <span className="flex items-center gap-1.5"><span>💌</span> Free UK shipping £30+</span>
                <span className="flex items-center gap-1.5"><span>↩</span> 30-day returns</span>
              </div>

              {/* Certification */}
              <div className="flex items-center gap-4 p-5 rounded-xl bg-brand-black-card border border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-amber/30 to-brand-orange/20 border border-brand-amber/30 flex items-center justify-center shrink-0">
                  <span className="text-brand-amber text-lg">✧</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-cream">Ethical by nature</p>
                  <p className="text-xs text-brand-cream/45 leading-relaxed">
                    Sourced direct from Ghanaian farmers. No middlemen. No synthetic shortcuts.
                  </p>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="w-full bg-brand-black-soft">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">The Story</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl leading-tight mt-3">
                Why {product.name}
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              {activeContent.description.map((p, i) => (
                <p key={i} className="text-sm xl:text-base text-brand-cream/70 leading-relaxed">{p}</p>
              ))}
              <p className="text-sm italic text-brand-amber/70">✦ {activeContent.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full bg-brand-black">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">Benefits</span>
            <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl mt-3">What it does</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6">
            {product.benefits.map((b) => (
              <div
                key={b.title}
                className="flex flex-col items-center text-center p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-orange/25 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-display text-lg font-semibold text-brand-cream mb-2.5">{b.title}</h3>
                <p className="text-sm text-brand-cream/55 leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients + Directions */}
      <section className="w-full bg-brand-black-soft">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            <div>
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Ingredients</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl mt-3 mb-7">Every element, named</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeContent.ingredients.map((ing) => (
                  <li
                    key={ing.name}
                    className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-brand-black-card border border-white/5"
                  >
                    <span className="text-sm text-brand-cream font-medium">{ing.name}</span>
                    {ing.note && (
                      <span className="text-[10px] tracking-wide text-brand-cream/40 bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {ing.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">How to use</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl mt-3 mb-7">The ritual</h2>
              <div className="p-7 xl:p-8 rounded-2xl bg-gradient-to-br from-brand-purple-muted/40 to-brand-black-card border border-white/5">
                <p className="text-sm xl:text-base text-brand-cream/75 leading-relaxed">{activeContent.directions}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-5 rounded-xl bg-brand-black-card border border-white/5">
                  <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-1">Shipping</p>
                  <p className="text-sm text-brand-cream">£4.99 standard · free over £30</p>
                </div>
                <div className="p-5 rounded-xl bg-brand-black-card border border-white/5">
                  <p className="text-[10px] tracking-widest uppercase text-brand-cream/40 mb-1">Returns</p>
                  <p className="text-sm text-brand-cream">30-day, no questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="w-full bg-brand-black">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">Reviews</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl mt-3 mb-5">
                Felt by those who know
              </h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-display text-4xl font-bold text-brand-cream">{product.rating.toFixed(1)}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-base ${i < Math.round(product.rating) ? "text-brand-amber" : "text-brand-cream/15"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-brand-cream/50">Based on {product.reviewCount} verified reviews</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {displayReviews.length === 0 ? (
                <p className="text-brand-cream/40 text-sm py-8">No reviews yet — be the first.</p>
              ) : displayReviews.map((r, idx) => (
                <div
                  key={r.name + idx}
                  className="p-6 xl:p-7 rounded-2xl bg-brand-black-card border border-white/5"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <span key={i} className="text-brand-amber text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-[10px] tracking-widest uppercase text-brand-cream/30">Verified</span>
                  </div>
                  {r.title && (
                    <h4 className="font-display text-lg font-semibold text-brand-cream mb-2">{r.title}</h4>
                  )}
                  <p className="text-sm xl:text-base text-brand-cream/60 leading-relaxed mb-4">&ldquo;{r.body}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-xs font-bold text-white">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-cream">{r.name}</p>
                      <p className="text-xs text-brand-cream/40">{r.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="w-full bg-brand-black-soft">
        <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">You might also love</span>
            <h2 className="font-display font-bold text-brand-cream text-3xl xl:text-4xl mt-3">Complete the ritual</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group flex items-center gap-5 p-5 xl:p-6 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-orange/25 transition-all"
              >
                <div className="shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark flex items-center justify-center border border-white/5">
                  <span className="font-display text-brand-cream/50 text-xs tracking-[0.25em]">ODO</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/30 mb-1">{p.tagline}</p>
                  <h3 className="font-display text-lg font-bold text-brand-cream group-hover:text-brand-orange transition-colors truncate">
                    {p.name}
                  </h3>
                  <p className="text-sm text-brand-orange mt-1">£{p.price.toFixed(2)}</p>
                </div>
                <span className="shrink-0 text-brand-cream/40 group-hover:text-brand-orange transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DiscountPopup />
    </>
  );
}
