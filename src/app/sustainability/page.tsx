import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Sustainability — How Odo is sourced, made and shipped | Luv & Ker",
  description:
    "From shea co-operatives in northern Ghana to compostable packaging and sea-freight shipping — how Luv & Ker keeps Odo radically transparent and low-impact.",
};

const PILLARS = [
  {
    title: "Sourced direct",
    body: "Every ingredient is bought direct from the women and farmers who grow it. Named co-operatives. Above-market rates. No middlemen taking a cut.",
    img: "/images/sustainability/sourced-direct.png",
    alt: "Bowls of raw shea butter being hand-pressed",
  },
  {
    title: "Made by hand",
    body: "Every Odo bar is hand-cut and cold-processed in Accra. We never outsource production. The women who make Odo are paid a living wage and own equity in the company.",
    img: "/images/sustainability/handmade.png",
    alt: "Handmade soap bars cooling on a wooden tray",
  },
  {
    title: "Compostable packaging",
    body: "Bars ship in 100% compostable paper. Glass dispensers refill with sachets. No single-use plastic. No microplastics. Nothing in our supply chain ends up in the ocean.",
    img: "/images/sustainability/packaging.png",
    alt: "Brown kraft paper packaging tied with twine",
  },
  {
    title: "Carbon-aware shipping",
    body: "We consolidate shipments from Accra to the UK by sea where possible, and offset every air-freighted order through verified reforestation projects in northern Ghana.",
    img: "/images/sustainability/shipping.png",
    alt: "Cargo ship at sunset on calm water",
  },
];

const CO_OPS = [
  {
    region: "Northern Ghana",
    name: "Bolgatanga Women's Shea Co-operative",
    detail: "47 women press raw shea butter from karité nuts hand-collected during the rainy season. We are their largest UK buyer.",
    img: "/images/sustainability/coop-shea.png",
  },
  {
    region: "Eastern Region",
    name: "Suhum Cocoa Pod Collective",
    detail: "A men-and-women collective of 23 farmers using cocoa pods that were previously discarded as waste — turning them into the ash that powers Odo Radiance.",
    img: "/images/sustainability/coop-cocoa.png",
  },
  {
    region: "Volta Region",
    name: "Keta Coast Coconut Farmers",
    detail: "Smallholder farmers along the Volta coastline pressing virgin coconut oil traditionally — using the wet-mill method that retains more antioxidants.",
    img: "/images/sustainability/coop-coconut.png",
  },
];

const STATS = [
  { number: "100%", label: "Compostable packaging" },
  { number: "0", label: "Single-use plastic" },
  { number: "73%", label: "Sea-freighted volume in 2025" },
];

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">

        {/* Hero with image */}
        <section className="w-full bg-brand-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/25 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="adinkra-line w-10" />
                  <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Sustainability</span>
                </div>
                <h1 className="font-display font-bold text-brand-cream leading-[1.05] text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl mb-6">
                  The earth in its <span className="gradient-text">purest form</span>
                </h1>
                <p className="text-brand-cream/65 text-base sm:text-lg xl:text-xl leading-relaxed mb-5">
                  Every decision at Luv &amp; Ker — from how we buy raw shea butter to how we ship our bars — is made with the planet
                  and the women of Ghana in mind. We were founded on a single conviction: that you cannot make something honest if any
                  step in the supply chain is hidden.
                </p>
                <p className="text-brand-cream/65 text-base sm:text-lg leading-relaxed">
                  Below is exactly how Odo gets from a co-operative in northern Ghana to your bathroom — every step, every name, every
                  trade-off. If something here doesn&apos;t add up, we want to hear about it.
                </p>
              </div>
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-square rounded-3xl overflow-hidden border border-white/5">
                <Image
                  src="/images/sustainability/hero.png"
                  alt="A Ghanaian woman in traditional dress at sunset"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="w-full bg-brand-black-soft border-y border-white/5">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-10 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-brand-amber mb-1">{s.number}</p>
                  <p className="text-xs sm:text-sm tracking-wide text-brand-cream/55">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The four pillars */}
        <section className="w-full bg-brand-black">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">
            <div className="flex flex-col items-center text-center mb-14 sm:mb-16">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">Our four commitments</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl">From the earth to your hands</h2>
            </div>

            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center"
                >
                  <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 ${i % 2 === 1 ? "lg:order-last" : ""}`}>
                    <Image
                      src={p.img}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-3">0{i + 1}</p>
                    <h3 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-4 leading-tight">
                      {p.title}
                    </h3>
                    <p className="text-brand-cream/70 text-base sm:text-lg leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Co-operatives */}
        <section className="w-full bg-brand-black-soft">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light mb-3">Our partners</span>
              <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-4">Three co-operatives, named</h2>
              <p className="text-brand-cream/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Most ‘ethical’ skincare brands hide behind certifications. We name the women and farms our ingredients come from.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {CO_OPS.map((c) => (
                <div
                  key={c.name}
                  className="rounded-2xl bg-brand-black-card border border-white/5 overflow-hidden hover:border-brand-amber/25 transition-colors"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={c.img}
                      alt={c.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-2">{c.region}</p>
                    <h3 className="font-display text-lg font-semibold text-brand-cream mb-2">{c.name}</h3>
                    <p className="text-sm text-brand-cream/60 leading-relaxed">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honest trade-offs */}
        <section className="w-full bg-brand-black">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20">
            <span className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3 inline-block">Honest about the hard parts</span>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-7 leading-tight">
              The trade-offs we&apos;re still working on
            </h2>
            <div className="space-y-6 text-brand-cream/70 text-base sm:text-lg leading-relaxed">
              <p>
                <span className="text-brand-cream font-medium">Air freight.</span> About 27% of our shipments still travel by air to
                meet UK delivery times. We&apos;re working with our logistics partner to move that to under 10% by the end of 2026 by
                consolidating monthly sea shipments.
              </p>
              <p>
                <span className="text-brand-cream font-medium">Glass weight.</span> Glass dispensers are heavier to ship than plastic.
                We&apos;ve made the trade because they last a lifetime — but it does mean a higher per-unit shipping footprint on the
                first delivery. Refill sachets ship far lighter.
              </p>
              <p>
                <span className="text-brand-cream font-medium">Certifications.</span> We don&apos;t hold most major ‘fair-trade’ or
                ‘organic’ certifications. We chose to put that money into paying co-operatives above-market rates instead. We think
                it&apos;s the right trade — but we know it costs us shoppers who filter by labels.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full bg-brand-black-soft border-t border-white/5">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20 text-center">
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl mb-4">
              Honesty is the only luxury that lasts
            </h2>
            <p className="text-brand-cream/60 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Read more about the ingredients, the women, and the philosophy behind every Odo bar.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/our-story"
                className="px-7 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
              >
                Read our story
              </Link>
              <Link
                href="/ingredients"
                className="px-7 py-3.5 rounded-full border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
              >
                Browse ingredients
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
