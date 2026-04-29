import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IngredientGrid from "@/components/IngredientGrid";

export const metadata = {
  title: "About — The Full Story | Luv & Ker",
  description:
    "The journey from a kitchen in Accra to your bathroom — Felicia's story, the chemical problem we built Odo without, our ingredients, sustainability commitments, and the culture at the heart of Luv & Ker.",
};

const SECTIONS = [
  { id: "journey",        label: "The Journey" },
  { id: "the-problem",   label: "The Problem" },
  { id: "ingredients",   label: "Ingredients" },
  { id: "sustainability", label: "Sustainability" },
  { id: "culture",       label: "Our Culture" },
];

const CHEM_SECTIONS = [
  {
    eyebrow: "01",
    title: "Phthalates",
    summary:
      "Added to fragrances as fixatives, phthalates are endocrine disruptors detected in over 95% of the population. They mimic oestrogen and interfere with hormonal signalling. The EU has restricted the most harmful — many others remain unregulated.",
  },
  {
    eyebrow: "02",
    title: "Parabens",
    summary:
      "Cheap preservatives that penetrate skin readily and act as weak xenoestrogens, binding to oestrogen receptors and accumulating in tissue. Found in breast tissue and urine in routine biomonitoring studies.",
  },
  {
    eyebrow: "03",
    title: "Sulphates (SLS / SLES)",
    summary:
      "Surfactants that create rich foam but strip the skin's natural lipid barrier — leaving it more permeable to other chemicals and prone to irritation, dryness, and contact dermatitis.",
  },
  {
    eyebrow: "04",
    title: "Triclosan",
    summary:
      "Banned from US hand soaps in 2016 after manufacturers failed to prove it was safe. Still found in some body washes. Accumulates in human tissue, disrupts thyroid signalling, and persists in waterways.",
  },
  {
    eyebrow: "05",
    title: "The Fragrance Loophole",
    summary:
      "A single word — 'fragrance' — can legally conceal hundreds of ingredients. The IFRA list contains over 3,000 permissible chemicals under that umbrella. Phthalates hide here most often.",
  },
  {
    eyebrow: "06",
    title: "Daily Absorption",
    summary:
      "The average woman uses 12 products with 168 unique ingredients daily. The average man, 6 products with 85. Skin absorbs what you put on it — and what washes off lives in waterways for decades.",
  },
];

const PILLARS = [
  {
    title: "Sourced direct",
    body: "Every ingredient is bought direct from the women and farmers who grow it. Named co-operatives. Above-market rates. No middlemen.",
  },
  {
    title: "Made by hand",
    body: "Every Odo bar is hand-cut and cold-processed in Accra. We never outsource production.",
  },
  {
    title: "Compostable packaging",
    body: "Bars ship in 100% compostable paper. Glass dispensers refill with sachets. No single-use plastic.",
  },
  {
    title: "Carbon-aware shipping",
    body: "73% sea-freighted in 2025. Every air-freighted order is offset through verified reforestation in northern Ghana.",
  },
];

const CO_OPS = [
  {
    region: "Northern Ghana",
    name: "Bolgatanga Women's Shea Co-operative",
    detail: "47 women press raw shea butter from karité nuts hand-collected during the rainy season.",
    img: "/images/sustainability/coop-shea.png",
  },
  {
    region: "Eastern Region",
    name: "Suhum Cocoa Pod Collective",
    detail: "23 farmers using previously-discarded cocoa pods — turning waste into the ash that powers Odo Radiance.",
    img: "/images/sustainability/coop-cocoa.png",
  },
  {
    region: "Volta Region",
    name: "Keta Coast Coconut Farmers",
    detail: "Smallholder farmers pressing virgin coconut oil via the wet-mill method that retains more antioxidants.",
    img: "/images/sustainability/coop-coconut.png",
  },
];

const STATS = [
  { number: "100%", label: "Compostable packaging" },
  { number: "0", label: "Single-use plastic" },
  { number: "73%", label: "Sea-freighted volume" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20 sm:pt-24">

        {/* ── HERO ── */}
        <section className="w-full bg-brand-black relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-muted/30 via-transparent to-brand-orange/5 pointer-events-none" />
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-24 lg:py-32">
            <div className="flex items-center gap-3 mb-6">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">About Luv &amp; Ker</span>
            </div>
            <h1 className="font-display font-bold text-brand-cream leading-[1.05] mb-6 text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl">
              Everything we are,<br />
              <span className="italic gradient-text">nothing we hide.</span>
            </h1>
            <p className="text-brand-cream/65 text-base sm:text-xl leading-relaxed max-w-2xl mb-10">
              The journey from a kitchen in Accra to your bathroom. The chemicals we built Odo without.
              The farmers who grow what goes inside. The way we ship it. The culture that holds it all together.
            </p>
            {/* Section nav pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-4 py-2 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-xs sm:text-sm tracking-wide transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE JOURNEY ── */}
        <section id="journey" className="w-full bg-brand-black-soft scroll-mt-20">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">

            <div className="flex items-center gap-3 mb-4">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Journey</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-6 leading-tight">
              A gift carried across generations
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
              <div className="space-y-5 text-brand-cream/70 text-base sm:text-lg leading-relaxed">
                <p>
                  Odo is the Twi word for love. Every bar is built on Ghanaian skincare wisdom passed from grandmother
                  to daughter, generation to generation — recipes that were never written down, because they lived in
                  the hands and memory of the women who made them.
                </p>
                <p>
                  Felicia grew up watching her grandmother hand-press shea butter and cold-process black soap in a small
                  kitchen in Accra. When she moved to the UK, she could not find a soap that matched the integrity of
                  what she grew up with. So she made her own.
                </p>
                <p>
                  Today, every Odo bar is still made in small batches in Accra. Every ingredient is sourced direct from
                  named Ghanaian farmers — no middlemen, no synthetic shortcuts. The result is a soap that does not just
                  clean. It honours.
                </p>
                <h3 className="font-display text-xl text-brand-cream pt-4">What we stand for</h3>
                <p>
                  Pure ingredients. Honest labels. Fair pay for the women and farmers who make our products possible.
                  Heritage, not trend.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  <Link
                    href="/our-story"
                    className="px-5 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
                  >
                    Read the full story
                  </Link>
                  <Link
                    href="/products"
                    className="px-5 py-2.5 rounded-full border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
                  >
                    Shop the range
                  </Link>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {[
                  {
                    year: "Accra, Ghana",
                    heading: "The grandmother's kitchen",
                    body: "Shea butter, black soap, and the Volta river. Recipes passed through touch, not text.",
                    color: "text-brand-amber",
                  },
                  {
                    year: "London, UK",
                    heading: "The problem becomes personal",
                    body: "Unable to find soap made with the same honesty she grew up with, Felicia starts making her own.",
                    color: "text-brand-orange",
                  },
                  {
                    year: "Luv & Ker",
                    heading: "The brand is born",
                    body: "Odo · For Her and Nkrabea · For Him — two ranges, one conviction: your skin deserves the truth.",
                    color: "text-brand-purple-light",
                  },
                ].map((item, i, arr) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${item.color.replace("text-", "bg-")}`} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-white/10 my-2" />}
                    </div>
                    <div className={`pb-8 ${i === arr.length - 1 ? "" : ""}`}>
                      <p className={`text-[11px] tracking-[0.25em] uppercase mb-1 ${item.color}`}>{item.year}</p>
                      <h4 className="font-display text-lg text-brand-cream mb-1">{item.heading}</h4>
                      <p className="text-brand-cream/55 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section id="the-problem" className="w-full bg-brand-black scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">

            <div className="flex items-center gap-3 mb-4">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Problem</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-4 leading-tight">
              They told us beauty was{" "}
              <span className="italic gradient-text">pain.</span>
              <br />
              <span className="text-brand-cream/80 text-2xl sm:text-3xl xl:text-4xl">They lied.</span>
            </h2>
            <p className="text-brand-cream/65 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
              Our grandmothers had skin like the morning sun — and they did it without a single paraben, phthalate, or
              synthetic fragrance. What follows is an honest look at the chemicals we built Odo without, and the
              research behind each decision.
            </p>

            {/* EWG callout */}
            <div className="relative rounded-2xl overflow-hidden mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-muted/60 to-brand-black-card" />
              <div className="relative z-10 px-6 sm:px-8 py-7 sm:py-8">
                <p className="font-display text-base sm:text-lg lg:text-xl text-brand-cream/90 leading-relaxed">
                  Studies estimate the average person absorbs over{" "}
                  <span className="text-brand-orange font-bold">130 synthetic chemicals</span>{" "}
                  through personal care products each day. Most have never been tested for long-term safety.
                </p>
                <p className="text-[10px] sm:text-xs text-brand-cream/35 mt-3 tracking-widest uppercase">
                  Environmental Working Group (EWG)
                </p>
              </div>
            </div>

            {/* 6 chemical cards — 2 col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
              {CHEM_SECTIONS.map((s) => (
                <div
                  key={s.eyebrow}
                  className="rounded-2xl bg-brand-black-card border border-white/5 p-5 sm:p-6 hover:border-brand-purple-light/20 transition-colors"
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-brand-amber mb-2">{s.eyebrow}</p>
                  <h3 className="font-display font-bold text-brand-cream text-lg sm:text-xl mb-2">{s.title}</h3>
                  <p className="text-brand-cream/60 text-sm leading-relaxed">{s.summary}</p>
                </div>
              ))}
            </div>

            <Link
              href="/the-problem"
              className="inline-flex items-center gap-2 text-sm text-brand-purple-light hover:text-brand-cream transition-colors"
            >
              Read the full research breakdown with citations →
            </Link>
          </div>
        </section>

        {/* ── INGREDIENTS ── */}
        <section id="ingredients" className="w-full bg-brand-black-soft scroll-mt-20">
          <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">

            <div className="flex items-center gap-3 mb-4">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">Ingredients</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-4 leading-tight">
              Every element has a name,<br />a region, a story
            </h2>
            <p className="text-brand-cream/65 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl">
              We don&apos;t hide behind &lsquo;fragrance&rsquo;. Tap any ingredient to see the co-operative that grows it, how
              it&apos;s processed, and why we use it. What you see on the label is what is in the bar.
            </p>

            <IngredientGrid />

            <p className="mt-10 text-brand-cream/55 text-sm leading-relaxed">
              We never use parabens, phthalates, sulphates (SLS / SLES), synthetic fragrance, triclosan, or hidden
              preservatives.
            </p>
            <Link
              href="/ingredients"
              className="inline-flex items-center gap-2 mt-4 text-sm text-brand-purple-light hover:text-brand-cream transition-colors"
            >
              View full ingredient explorer →
            </Link>
          </div>
        </section>

        {/* ── SUSTAINABILITY ── */}
        <section id="sustainability" className="w-full bg-brand-black scroll-mt-20">

          {/* Stats strip */}
          <div className="w-full border-b border-white/5 bg-brand-black-soft">
            <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-10">
              <div className="grid grid-cols-3 gap-6">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold text-brand-amber mb-1">{s.number}</p>
                    <p className="text-[10px] sm:text-xs tracking-wide text-brand-cream/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">

            <div className="flex items-center gap-3 mb-4">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">Sustainability</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-4 leading-tight">
              The earth in its <span className="gradient-text">purest form</span>
            </h2>
            <p className="text-brand-cream/65 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl">
              From sourcing to shipping, every decision is made with the planet and the women of Ghana in mind. We were
              founded on a single conviction: you cannot make something honest if any step in the supply chain is hidden.
            </p>

            {/* Four pillars grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-14">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className="rounded-2xl bg-brand-black-card border border-white/5 p-5 sm:p-6 hover:border-brand-amber/20 transition-colors"
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-brand-amber mb-2">0{i + 1}</p>
                  <h3 className="font-display font-bold text-brand-cream text-lg mb-2">{p.title}</h3>
                  <p className="text-brand-cream/60 text-sm leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>

            {/* Co-operatives */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">Our partners</span>
              </div>
              <h3 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl mb-3">
                Three co-operatives, named
              </h3>
              <p className="text-brand-cream/55 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
                Most &lsquo;ethical&rsquo; skincare brands hide behind certifications. We name the women and farms our
                ingredients come from.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    <div className="p-5">
                      <p className="text-[10px] tracking-[0.28em] uppercase text-brand-amber mb-1">{c.region}</p>
                      <h4 className="font-display text-base font-semibold text-brand-cream mb-1">{c.name}</h4>
                      <p className="text-xs text-brand-cream/55 leading-relaxed">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/sustainability"
              className="inline-flex items-center gap-2 text-sm text-brand-purple-light hover:text-brand-cream transition-colors"
            >
              See the full sustainability report including trade-offs →
            </Link>
          </div>
        </section>

        {/* ── OUR CULTURE ── */}
        <section id="culture" className="w-full bg-brand-black-soft scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-purple-muted/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-16 sm:py-20 lg:py-24">

            <div className="flex items-center gap-3 mb-4">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">Our Culture</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl mb-6 leading-tight">
              One philosophy.<br />
              <span className="gradient-text">Two ranges.</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start mb-12">
              <div className="space-y-5 text-brand-cream/70 text-base sm:text-lg leading-relaxed">
                <p>
                  Luv &amp; Ker was built on a single belief: that skincare should honour the body, not compromise it.
                  Whether you reach for Odo — our women&apos;s range rooted in love — or Nkrabea, our men&apos;s range
                  built on strength and destiny, the promise underneath is identical.
                </p>
                <p>
                  Every bar is made in Accra from ingredients that have names, regions, and stories. Our grandmothers&apos;
                  grandmothers cared for their skin with shea butter and black soap long before the cosmetics industry
                  existed — and they did it without a single synthetic chemical.
                </p>
                <p>
                  We believe that transparency is not a marketing position. It is the only honest way to make skincare.
                  If we cannot tell you exactly what is in the bar, exactly who grew it, and exactly how it got to you —
                  it should not be in the bar.
                </p>
              </div>

              {/* Values grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "✦", label: "Pure Ingredients", desc: "Named, traced, explained" },
                  { icon: "✦", label: "Honest Labels", desc: "No fragrance loophole" },
                  { icon: "✦", label: "Fair Pay", desc: "Above-market rates, always" },
                  { icon: "✦", label: "Heritage", desc: "Ghanaian ancestral wisdom" },
                  { icon: "✦", label: "Transparency", desc: "Every step disclosed" },
                  { icon: "✦", label: "Craft", desc: "Hand-made, never outsourced" },
                ].map((v) => (
                  <div
                    key={v.label}
                    className="rounded-xl bg-brand-black-card border border-white/5 p-4 hover:border-brand-purple-light/20 transition-colors"
                  >
                    <span className="text-brand-purple-light text-xs mb-2 block">{v.icon}</span>
                    <p className="font-display text-brand-cream text-sm font-semibold mb-0.5">{v.label}</p>
                    <p className="text-brand-cream/45 text-xs leading-snug">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Range pills */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products?range=odo"
                className="px-6 py-3 rounded-full border border-brand-orange/40 text-brand-orange text-sm font-medium hover:bg-brand-orange/10 transition-colors"
              >
                Odo · For Her →
              </Link>
              <Link
                href="/products?range=nkrabea"
                className="px-6 py-3 rounded-full border border-brand-amber/40 text-brand-amber text-sm font-medium hover:bg-brand-amber/10 transition-colors"
              >
                Nkrabea · For Him →
              </Link>
              <Link
                href="/our-philosophy"
                className="px-6 py-3 rounded-full border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30 text-sm font-medium transition-colors"
              >
                Our full philosophy →
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full bg-brand-black border-t border-white/5">
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20 text-center">
            <p className="font-display italic text-brand-cream text-xl sm:text-2xl xl:text-3xl leading-relaxed max-w-2xl mx-auto mb-3">
              Beauty was never the wound.
            </p>
            <p className="font-display text-2xl sm:text-3xl xl:text-4xl font-bold mb-10">
              <span className="gradient-text">It was always the inheritance.</span>
            </p>
            <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl mb-4">
              Built without compromise
            </h2>
            <p className="text-brand-cream/55 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              No phthalates. No parabens. No sulphates. No synthetic fragrance. Just shea butter, black soap base, and
              named essential oils — exactly as Felicia&apos;s grandmother made it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-light transition-colors text-sm sm:text-base font-semibold text-white shadow-lg shadow-brand-orange/15"
              >
                Shop the range →
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
