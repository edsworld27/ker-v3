"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;
    setTimeout(() => el.classList.add("opacity-100", "translate-y-0"), 600);
  }, []);

  return (
    <section
      id="story"
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-brand-black"
      style={{ paddingTop: "var(--navbar-h, 5rem)" }}
    >
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      {/* Decorative rings — purely atmospheric, never affect layout */}
      <div className="hidden lg:block absolute top-[8%] right-[4%] w-80 xl:w-[26rem] h-80 xl:h-[26rem] rounded-full border border-brand-purple/10 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-[12%] left-[3%] w-56 h-56 rounded-full border border-brand-purple/8 pointer-events-none" />

      {/* Two-column layout: text left, visual right (stacks on mobile) */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 xl:gap-16 items-center">

          {/* Left column — text */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-brand-purple/30 bg-brand-purple-muted/50 mb-7 sm:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-brand-cream/60">
                From Ghana, with love
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold leading-[0.88] mb-6 sm:mb-7
              text-[3.75rem] sm:text-7xl md:text-8xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
              <span className="block text-brand-cream">ODO</span>
              <span className="block gradient-text">by Felicia</span>
            </h1>

            {/* Accent */}
            <div className="adinkra-line w-24 sm:w-32 mb-6 sm:mb-7" />

            {/* Tagline */}
            <p
              ref={taglineRef}
              className="text-base sm:text-lg xl:text-xl text-brand-cream/70 leading-relaxed max-w-md xl:max-w-lg mb-9 sm:mb-10 opacity-0 translate-y-4 transition-all duration-700"
            >
              A ritual born from the soil of Ghana. Pure, sacred, and alive with
              ancestral wisdom — crafted to restore what modern life has taken.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 mb-12 sm:mb-14 w-full max-w-sm sm:max-w-none lg:w-auto">
              <a
                href="#shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5
                  px-10 sm:px-12 py-4 sm:py-5
                  rounded-full bg-brand-orange hover:bg-brand-orange-light
                  transition-all duration-200 text-white font-semibold tracking-wide
                  text-sm sm:text-base shadow-xl shadow-brand-orange/25 hover:-translate-y-0.5"
              >
                Shop Odo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#why-odo"
                className="w-full sm:w-auto inline-flex items-center justify-center
                  px-10 sm:px-12 py-4 sm:py-5
                  rounded-full border border-white/20 text-brand-cream/75
                  hover:text-brand-cream hover:border-white/40
                  transition-all duration-200 text-sm sm:text-base tracking-wide"
              >
                Our Story
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-start justify-center lg:justify-start gap-10 sm:gap-14 xl:gap-16 pt-8 sm:pt-10 border-t border-white/10 w-full">
              {[
                { value: "100%", label: "Natural Ingredients" },
                { value: "0",    label: "Harsh Chemicals" },
                { value: "∞",   label: "Generations of Heritage" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center lg:items-start text-center lg:text-left">
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

          {/* Right column — hero photo */}
          <div className="flex items-center justify-center order-first lg:order-last">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/8">
              <Image
                src="/hero-elephants.png"
                alt="Elephants — spirit of Odo by Felicia"
                fill
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 560px"
                className="object-cover"
              />
              {/* Subtle gradient overlay to blend with the dark layout */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll nudge */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-cream/30 animate-bounce">
        <span className="text-[10px] tracking-[0.24em] uppercase">Scroll</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

