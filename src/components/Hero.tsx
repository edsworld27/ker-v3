"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="story"
      className="relative w-full min-h-screen flex items-center bg-brand-black overflow-hidden"
      style={{ paddingTop: "var(--navbar-h, 5rem)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/25 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">

          {/* Left column — text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Pure Ghanaian black soap · Handcrafted in Accra</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-brand-cream leading-[1.05] text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl mb-6">
              All natural <span className="gradient-text">African soap</span>
            </h1>

            {/* Tagline */}
            <p className="text-brand-cream/65 text-base sm:text-lg xl:text-xl leading-relaxed mb-5">
              A ritual born from the soil of Ghana. Pure, sacred, and alive with
              ancestral wisdom — crafted to restore what modern life has taken.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-3 mb-10">
              <a
                href="#shop"
                className="inline-flex items-center justify-center gap-2.5
                  px-8 py-4 rounded-full bg-brand-orange hover:bg-brand-orange-light
                  transition-all duration-200 text-white font-semibold tracking-wide
                  text-sm shadow-xl shadow-brand-orange/25 hover:-translate-y-0.5"
              >
                Explore the Odo range
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#why-odo"
                className="inline-flex items-center justify-center
                  px-8 py-4 rounded-full border border-white/20 text-brand-cream/75
                  hover:text-brand-cream hover:border-white/40
                  transition-all duration-200 text-sm tracking-wide"
              >
                Our Story
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-10 xl:gap-14 pt-8 border-t border-white/10">
              {[
                { value: "100%", label: "Natural ingredients" },
                { value: "0",    label: "Sulphates or synthetics" },
                { value: "3",    label: "Independent lab partners" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold text-brand-amber">
                    {value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-brand-cream/40 mt-1.5 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right column — image */}
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-square rounded-3xl overflow-hidden border border-white/5">
            <Image
              src="/images/sustainability/hero.png"
              alt="A Ghanaian woman in traditional dress at sunset"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent" />
          </div>

        </div>
      </div>
    </section>
  );
}
