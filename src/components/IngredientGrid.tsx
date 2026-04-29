"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { INGREDIENTS, type IngredientDetail } from "@/lib/ingredients";

export default function IngredientGrid({ limit, showViewAll }: { limit?: number; showViewAll?: boolean }) {
  const [active, setActive] = useState<IngredientDetail | null>(null);
  const visible = limit ? INGREDIENTS.slice(0, limit) : INGREDIENTS;

  // Lock body scroll while modal is open + close on Escape
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 not-prose">
        {visible.map((ing) => (
          <li key={ing.slug}>
            <button
              onClick={() => setActive(ing)}
              className="group w-full text-left overflow-hidden rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-amber/30 transition-all"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <Image
                  src={ing.image}
                  alt={ing.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] tracking-wide text-brand-cream/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {ing.origin}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h3 className="font-display text-lg font-semibold text-brand-cream group-hover:text-brand-amber transition-colors">
                    {ing.name}
                  </h3>
                  <span className="text-brand-cream/30 group-hover:text-brand-amber transition-colors text-sm">→</span>
                </div>
                <p className="text-sm text-brand-cream/55 leading-relaxed">{ing.oneLiner}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {showViewAll && (
        <div className="mt-10 flex justify-center">
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-brand-amber/40 bg-brand-black-card text-brand-amber text-sm font-medium hover:border-brand-amber/70 hover:bg-brand-amber/5 transition-all duration-200 group"
          >
            View every ingredient we use
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>
      )}

      {active && <IngredientModal ingredient={active} onClose={() => setActive(null)} />}
    </>
  );
}

function IngredientModal({
  ingredient,
  onClose,
}: {
  ingredient: IngredientDetail;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ingredient.name}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-brand-black-soft border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header image */}
        <div className="relative aspect-[16/9] sm:aspect-[2/1] shrink-0">
          <Image
            src={ingredient.image}
            alt={ingredient.imageAlt}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black-soft via-brand-black-soft/40 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-5 left-5 right-5 sm:left-7 sm:right-7">
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-2">{ingredient.origin}</p>
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl leading-tight">
              {ingredient.name}
            </h2>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 sm:py-7 space-y-6">
          <p className="text-brand-cream/80 text-base sm:text-lg italic leading-relaxed">
            {ingredient.oneLiner}
          </p>

          {/* Benefits */}
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-3">Why we use it</p>
            <ul className="space-y-2.5">
              {ingredient.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm sm:text-base text-brand-cream/75 leading-relaxed">
                  <span className="text-brand-amber shrink-0 mt-0.5">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sourcing */}
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-purple-light mb-2">Where it's from</p>
            <p className="font-display text-brand-cream font-medium mb-2">{ingredient.partner}</p>
            <p className="text-sm sm:text-base text-brand-cream/65 leading-relaxed">{ingredient.sourcing}</p>
          </div>

          {/* Processing */}
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-purple-light mb-2">How it's processed</p>
            <p className="text-sm sm:text-base text-brand-cream/65 leading-relaxed">{ingredient.processing}</p>
          </div>

          {/* Used in */}
          <div className="pt-2">
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/40 mb-3">Found in</p>
            <div className="flex flex-wrap gap-2">
              {ingredient.usedIn.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 text-xs rounded-full border border-brand-orange/25 bg-brand-orange/5 text-brand-orange"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
