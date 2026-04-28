export default function Solution() {
  const ingredients = [
    { name: "Shea Butter",     origin: "Northern Ghana",  benefit: "Deep moisture & skin barrier repair" },
    { name: "Black Soap Base", origin: "Kumasi, Ashanti", benefit: "Gentle cleanse, antimicrobial properties" },
    { name: "Cocoa Pod Ash",   origin: "Eastern Region",  benefit: "Natural exfoliant, balances skin pH" },
    { name: "Palm Kernel Oil", origin: "Western Ghana",   benefit: "Rich in antioxidants, protects skin" },
    { name: "Plantain Skin",   origin: "Brong-Ahafo",     benefit: "Vitamins A, E & K for skin health" },
    { name: "Coconut Oil",     origin: "Volta Region",    benefit: "Anti-inflammatory, promotes healing" },
  ];

  return (
    <section id="heritage" className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black-soft relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Two-column split — text left, orbital visual right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 xl:gap-16 items-center mb-20 sm:mb-24 lg:mb-28">

          {/* Left column — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-3 mb-5">
              <div className="adinkra-line w-10" />
              <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">The Answer</span>
            </div>
            <h2 className="font-display font-bold text-brand-cream leading-tight mb-5
              text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl
              max-w-xl">
              A gift carried across <span className="gradient-text">generations</span>
            </h2>
            <p className="text-brand-cream/60 text-base sm:text-lg xl:text-xl leading-relaxed max-w-xl mb-5">
              Odo is the Twi word for love. It is more than a name — it is the philosophy behind every bar.
              Created by Felicia, drawing on centuries of Ghanaian skincare wisdom passed from grandmother
              to daughter, generation to generation.
            </p>
            <p className="text-brand-cream/60 text-base sm:text-lg xl:text-xl leading-relaxed max-w-xl mb-8">
              Every ingredient is sourced directly from Ghanaian farmers. No middlemen. No shortcuts.
              No compromises. Just the earth in its purest form, pressed into your palms.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3">
              {["Hormone-Safe","Fertility-Friendly","100% Natural","Vegan","Ethically Sourced","Cruelty-Free"].map((tag) => (
                <span key={tag} className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm tracking-wide border border-brand-orange/30 text-brand-orange bg-brand-orange/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — orbital visual */}
          <div className="flex items-center justify-center order-first lg:order-last">
            <OrbitalVisual />
          </div>
        </div>

        {/* Ingredients */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <h3 className="font-display font-bold text-brand-cream mb-3
            text-2xl sm:text-3xl xl:text-4xl max-w-2xl mx-auto">
            Every ingredient has a name, a region, a story
          </h3>
          <p className="text-brand-cream/40 text-sm sm:text-base max-w-lg mx-auto">
            We don&apos;t hide behind &ldquo;fragrance&rdquo;. We celebrate every element.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
          {ingredients.map(({ name, origin, benefit }) => (
            <div key={name} className="flex flex-col items-center text-center p-6 sm:p-7 xl:p-8 rounded-xl bg-brand-black-card border border-white/5 hover:border-brand-amber/25 transition-all duration-300 group">
              <div className="flex items-center justify-between w-full gap-3 mb-3">
                <h4 className="font-display text-base sm:text-lg font-semibold text-brand-cream group-hover:text-brand-amber transition-colors">
                  {name}
                </h4>
                <span className="shrink-0 text-[10px] tracking-wide text-brand-cream/30 bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {origin}
                </span>
              </div>
              <p className="text-sm xl:text-base text-brand-cream/50 leading-relaxed w-full">{benefit}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function OrbitalVisual() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[22rem] lg:h-[22rem] xl:w-[26rem] xl:h-[26rem] 2xl:w-[30rem] 2xl:h-[30rem]">
      <div className="absolute inset-0 rounded-full border border-dashed border-brand-purple/20 animate-spin" style={{ animationDuration: "30s" }} />
      <div className="absolute inset-6 xl:inset-8 rounded-full bg-gradient-to-br from-brand-purple-dark via-brand-black-card to-brand-purple-muted flex flex-col items-center justify-center border border-brand-purple/20 shadow-2xl">
        <div className="text-center px-8">
          <p className="font-display text-4xl xl:text-5xl font-bold text-brand-cream mb-1">ODO</p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-brand-amber to-transparent mx-auto mb-2" />
          <p className="text-brand-cream/40 text-xs tracking-[0.3em] uppercase">by Felicia</p>
          <p className="text-brand-amber/60 text-[10px] tracking-widest uppercase mt-3">Crafted in Ghana</p>
        </div>
      </div>
      {[0,60,120,180,240,300].map((deg, i) => (
        <div key={i} className="absolute w-2.5 h-2.5 rounded-full"
          style={{
            background: deg % 120 === 0 ? "#E8621A" : deg % 60 === 0 ? "#6B2D8B" : "#F2A23C",
            top:  `calc(50% + ${Math.sin((deg*Math.PI)/180)*48}% - 5px)`,
            left: `calc(50% + ${Math.cos((deg*Math.PI)/180)*48}% - 5px)`,
          }} />
      ))}
    </div>
  );
}
