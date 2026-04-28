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
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-orange">The Problem</span>
            <div className="adinkra-line w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream leading-tight mb-5
            text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl
            max-w-2xl xl:max-w-3xl mx-auto">
            What&apos;s really in your <span className="gradient-text">everyday soap?</span>
          </h2>
          <p className="text-brand-cream/60 text-base sm:text-lg xl:text-xl leading-relaxed max-w-xl xl:max-w-2xl mx-auto">
            The soap you&apos;ve been using your whole life may be working against you. The
            mainstream beauty industry has flooded our bathrooms with chemicals that were
            never meant to be on human skin.
          </p>
        </div>

        {/* Cards — always centered text inside each card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 mb-14 sm:mb-16 lg:mb-20">
          {issues.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-orange/25 transition-all duration-300 card-glow">
              <div className="text-3xl sm:text-4xl mb-4">{icon}</div>
              <h3 className="font-display text-lg xl:text-xl font-semibold text-brand-cream mb-3">{title}</h3>
              <p className="text-sm xl:text-base text-brand-cream/50 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Pull quote — centered */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple-muted to-brand-black-card" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-orange/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col items-center text-center px-8 py-12 sm:px-14 sm:py-14 lg:px-20 lg:py-16">
            <div className="text-6xl font-display font-bold text-brand-purple/30 leading-none select-none mb-4">&ldquo;</div>
            <p className="font-display text-lg sm:text-xl lg:text-2xl xl:text-3xl text-brand-cream/90 leading-relaxed max-w-3xl mx-auto">
              Studies estimate that the average person absorbs over{" "}
              <span className="text-brand-orange font-bold">130 synthetic chemicals</span>{" "}
              through personal care products each day. Most have never been tested for long-term safety.
            </p>
            <p className="text-xs sm:text-sm text-brand-cream/30 mt-6 tracking-widest uppercase">
              Environmental Working Group (EWG)
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
