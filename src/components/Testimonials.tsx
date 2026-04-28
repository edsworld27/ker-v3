export default function Testimonials() {
  const reviews = [
    {
      quote: "I'd struggled with hormone imbalances for years and had no idea my soap could be a contributing factor. Since switching to Odo, my skin feels completely different — softer, calmer, alive. I'll never go back.",
      name: "Abena K.",
      location: "London, UK",
      stars: 5,
    },
    {
      quote: "As a Ghanaian woman, this soap feels like coming home. The scent, the texture, the story behind it — Felicia has bottled something truly special. It's ancestral wisdom in your hands.",
      name: "Akosua M.",
      location: "Accra, Ghana",
      stars: 5,
    },
    {
      quote: "I'm a dermatologist and I'm genuinely impressed. The ingredient list is something I can actually stand behind — no parabens, no sulphates, no synthetic fragrance. My patients with sensitive skin love it.",
      name: "Dr. Sarah T.",
      location: "Birmingham, UK",
      stars: 5,
    },
  ];

  return (
    <section className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black-soft">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header — always centered */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-18 lg:mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">Stories</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream
            text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            Felt by those who know
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
          {reviews.map(({ quote, name, location, stars }) => (
            <div key={name} className="flex flex-col p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-purple/20 transition-all duration-300">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: stars }).map((_, i) => (
                  <span key={i} className="text-brand-amber text-lg">★</span>
                ))}
              </div>
              <p className="text-brand-cream/70 text-sm xl:text-base leading-relaxed flex-1 mb-6">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-white/8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm xl:text-base font-medium text-brand-cream truncate">{name}</p>
                  <p className="text-xs xl:text-sm text-brand-cream/30 truncate">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
