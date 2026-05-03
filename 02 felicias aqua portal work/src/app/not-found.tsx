import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page Not Found — Luv & Ker",
  description: "This page doesn't exist, but the earth's purest soap does.",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Decorative adinkra-style circle */}
        <div className="relative mb-10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-brand-orange/20 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border border-brand-orange/30 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-brand-orange/10 border border-brand-orange/40 flex items-center justify-center">
                <span className="font-display text-5xl text-brand-orange select-none">4</span>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            {/* Orbiting dots */}
            {[0, 90, 180, 270].map((deg) => (
              <span
                key={deg}
                className="absolute w-2 h-2 rounded-full bg-brand-orange/50"
                style={{
                  top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
                  left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}
          </div>
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-brand-orange mb-3">
          404 — Lost in the earth
        </p>
        <h1 className="font-display text-4xl sm:text-6xl text-brand-cream mb-4 leading-tight">
          This page doesn&apos;t<br className="hidden sm:block" /> exist yet
        </h1>
        <p className="max-w-md text-brand-cream/60 text-base mb-10 leading-relaxed">
          Like an undiscovered ingredient, some things take time to surface.
          The page you&apos;re looking for may have moved, or perhaps it never existed.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange-dark transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 rounded-full border border-brand-orange/30 text-brand-cream/80 text-sm hover:border-brand-orange/60 hover:text-brand-cream transition-colors"
          >
            Shop the collection
          </Link>
          <Link
            href="/our-story"
            className="px-6 py-3 rounded-full border border-white/10 text-brand-cream/50 text-sm hover:border-white/20 hover:text-brand-cream/70 transition-colors"
          >
            Our story
          </Link>
        </div>

        {/* Subtle divider + tagline */}
        <div className="mt-20 flex items-center gap-4 text-brand-cream/20">
          <div className="w-16 h-px bg-brand-cream/20" />
          <span className="text-xs tracking-widest uppercase">Luv &amp; Ker</span>
          <div className="w-16 h-px bg-brand-cream/20" />
        </div>
        <p className="mt-3 text-xs text-brand-cream/25 italic">
          Pure, natural, hormone-safe — from Ghanaian ancestral wisdom
        </p>
      </main>
      <Footer />
    </>
  );
}
