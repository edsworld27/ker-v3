import Link from "next/link";

export default function Problem() {
  const issues = [
    {
      icon: "⚗️",
      title: "Endocrine Disruptors",
      body: "Parabens, phthalates, and synthetic fragrances mimic oestrogen in the body — quietly disrupting hormonal balance with every wash.",
    },
    {
      icon: "🧪",
      title: "Fertility Under Threat",
      body: "Triclosan, SLS, and artificial preservatives have been linked to reduced fertility and reproductive harm in ongoing research.",
    },
    {
      icon: "🏭",
      title: "Manufactured for Profit",
      body: "Mass-market soaps prioritise shelf life and margin over your wellbeing. Ingredients are chosen for cost, not care.",
    },
    {
      icon: "🚫",
      title: "Hidden on the Label",
      body: "\"Fragrance\" alone can legally conceal hundreds of undisclosed chemicals — a loophole brands exploit daily.",
    },
  ];

  return (
    <section id="why-odo" className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header — always centered */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-18 lg:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Problem</span>
            <div className="adinkra-line w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream leading-[1.05] mb-7
            text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl
            max-w-3xl mx-auto">
            They told us beauty was <span className="italic gradient-text">pain.</span>
            <br />
            <span className="text-brand-cream/85 text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">They lied.</span>
          </h2>
          <p className="text-brand-cream/65 text-base sm:text-lg xl:text-xl leading-relaxed max-w-2xl mx-auto">
            For centuries women have been sold the same story — that to glow, you must absorb a hundred chemicals
            you can&apos;t pronounce. The soap you&apos;ve been using your whole life may be working against you.
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
          <Link
            href="/the-problem"
            className="group inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-brand-orange hover:bg-brand-orange-light transition-all duration-300 text-sm sm:text-base font-semibold text-white shadow-lg shadow-brand-orange/15 hover:-translate-y-0.5"
          >
            Find out more
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
