import Link from "next/link";

export default function Problem() {
  const issues = [
    {
      icon: "⚗️",
      title: "Hormone disruptors",
      body: "Parabens, phthalates, and synthetic fragrances mimic hormones in the body — quietly undermining the balance that keeps you sharp, strong, and clear-skinned.",
    },
    {
      icon: "🧪",
      title: "Stripping your strength",
      body: "SLS, triclosan, and artificial preservatives don't just clean — they strip the skin barrier that protects you, leaving you more exposed with every wash.",
    },
    {
      icon: "🏭",
      title: "Engineered for margin",
      body: "Mass-market soaps are formulated for shelf life and profit. Every ingredient is chosen for cost — not for what it does to our bodies.",
    },
    {
      icon: "🚫",
      title: "Hidden by design",
      body: "\"Fragrance\" can legally conceal hundreds of undisclosed chemicals. It's not an oversight — it's a deliberate loophole that keeps you in the dark.",
    },
  ];

  return (
    <section id="why-odo" className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header — left aligned */}
        <div className="flex flex-col items-start text-left mb-14 sm:mb-18 lg:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Problem</span>
          </div>
          <h2 className="font-display font-bold text-brand-cream leading-[1.05] mb-7
            text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl w-full">
            They called it <span className="italic gradient-text">care.</span> Take it back.
          </h2>
          <p className="text-brand-cream/65 text-base sm:text-lg xl:text-xl leading-relaxed">
            Mass-market brands have spent decades loading our skin with sulphates, phthalates, and synthetic
            chemicals hidden behind the word &ldquo;fragrance.&rdquo; Raw, clean power for men. Divine, untouched
            skin for women. Odo strips it back to what our bodies actually deserve — and nothing they don&apos;t.
          </p>
        </div>

        {/* Cards — always centered text inside each card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 mb-12 sm:mb-14">
          {issues.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-orange/25 transition-all duration-300 card-glow">
              <div className="text-3xl sm:text-4xl mb-4">{icon}</div>
              <h3 className="font-display text-lg xl:text-xl font-semibold text-brand-cream mb-3">{title}</h3>
              <p className="text-sm xl:text-base text-brand-cream/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Find out more CTA */}
        <div className="flex flex-col items-center text-center">
          <p className="text-brand-cream/55 text-sm sm:text-base max-w-xl mb-5 leading-relaxed">
            We dig into the research behind phthalates, parabens, and the &ldquo;fragrance&rdquo; loophole — with sources you can read for yourself.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/the-problem"
              className="group inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-brand-orange hover:bg-brand-orange-light transition-all duration-300 text-sm sm:text-base font-semibold text-white shadow-lg shadow-brand-orange/15 hover:-translate-y-0.5"
            >
              Find out more
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/lab-tests"
              className="group inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/15 hover:border-brand-amber/50 transition-all duration-300 text-sm sm:text-base font-semibold text-brand-cream/85 hover:text-brand-cream"
            >
              View our lab tests
              <span className="text-brand-amber transition-transform group-hover:translate-x-1">↗</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
