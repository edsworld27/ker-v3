export default function Manifesto() {
  return (
    <section className="relative w-full overflow-hidden bg-brand-black">
      {/* Soft ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/30 via-brand-black to-brand-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-brand-orange/[0.04] blur-3xl pointer-events-none" />

      {/* Decorative silhouette — stylised woman with raised arms, baobab on each side */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-[0.07] sm:opacity-[0.09]">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full max-w-5xl"
          preserveAspectRatio="xMidYEnd meet"
          aria-hidden
        >
          {/* Sun rays */}
          <g stroke="#F2A23C" strokeWidth="1" opacity="0.5">
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i / 18) * Math.PI;
              const x2 = 400 + Math.cos(angle - Math.PI) * 600;
              const y2 = 480 + Math.sin(angle - Math.PI) * 600;
              return <line key={i} x1="400" y1="480" x2={x2} y2={y2} />;
            })}
          </g>
          {/* Sun */}
          <circle cx="400" cy="480" r="60" fill="#F2A23C" opacity="0.7" />
          {/* Baobab left */}
          <g fill="#1a0d24">
            <path d="M120,600 L120,440 Q110,420 130,400 Q105,380 130,360 Q115,340 145,330 Q160,360 165,400 L165,600 Z" />
            <circle cx="135" cy="320" r="28" />
            <circle cx="160" cy="305" r="22" />
            <circle cx="115" cy="310" r="20" />
          </g>
          {/* Baobab right */}
          <g fill="#1a0d24">
            <path d="M680,600 L680,440 Q690,420 670,400 Q695,380 670,360 Q685,340 655,330 Q640,360 635,400 L635,600 Z" />
            <circle cx="665" cy="320" r="28" />
            <circle cx="640" cy="305" r="22" />
            <circle cx="685" cy="310" r="20" />
          </g>
          {/* Woman silhouette — raised arms, flowing dress */}
          <g fill="#0a0410">
            <circle cx="400" cy="170" r="28" />
            {/* Raised arms */}
            <path d="M400,200 Q380,180 360,140 Q355,120 365,115 Q372,118 380,140 Q392,165 400,200 Z" />
            <path d="M400,200 Q420,180 440,140 Q445,120 435,115 Q428,118 420,140 Q408,165 400,200 Z" />
            {/* Body / flowing dress */}
            <path d="M400,200 Q380,210 372,260 L356,420 Q340,540 360,600 L440,600 Q460,540 444,420 L428,260 Q420,210 400,200 Z" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-24 sm:py-28 lg:py-36 2xl:py-44">

        {/* Eyebrow */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="adinkra-line w-10" />
            <span className="text-xs tracking-[0.32em] uppercase text-brand-amber">A Reminder</span>
            <div className="adinkra-line w-10" />
          </div>
        </div>

        {/* Main headline */}
        <h2 className="font-display font-bold text-brand-cream text-center leading-[1.05] mb-10 sm:mb-12
          text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl">
          They told us beauty <br className="hidden sm:block" />
          was <span className="italic gradient-text">pain.</span>
        </h2>

        <p className="font-display text-brand-cream/85 text-center text-xl sm:text-2xl xl:text-3xl leading-relaxed mb-12 sm:mb-14 max-w-3xl mx-auto">
          They lied.
        </p>

        {/* Body — three poetic verses */}
        <div className="max-w-2xl mx-auto space-y-7 sm:space-y-8 text-center">
          <p className="text-brand-cream/70 text-base sm:text-lg xl:text-xl leading-[1.85]">
            For centuries women have been sold the same story —
            that to be radiant, you must suffer. That to be soft, you must burn.
            That to glow, you must absorb a hundred chemicals you cannot pronounce.
          </p>

          <div className="flex justify-center">
            <div className="adinkra-line w-16 opacity-60" />
          </div>

          <p className="text-brand-cream/70 text-base sm:text-lg xl:text-xl leading-[1.85]">
            But our grandmothers&apos; grandmothers had skin like the morning sun.
            They walked through the heat of Ghana with shea butter on their hands
            and black soap by the river. No parabens. No phthalates. No promises in plastic bottles.
          </p>

          <div className="flex justify-center">
            <div className="adinkra-line w-16 opacity-60" />
          </div>

          <p className="text-brand-cream/70 text-base sm:text-lg xl:text-xl leading-[1.85]">
            They were beautiful because the earth had already given them everything they needed.
            <br />
            <span className="text-brand-amber/90 italic">It still has.</span>
          </p>
        </div>

        {/* Closing affirmation */}
        <div className="flex flex-col items-center text-center mt-16 sm:mt-20">
          <p className="font-display italic text-brand-cream text-2xl sm:text-3xl xl:text-4xl leading-relaxed max-w-2xl">
            Beauty was never the wound. <br className="hidden sm:block" />
            <span className="gradient-text not-italic font-bold">It was always the inheritance.</span>
          </p>
          <p className="text-[11px] tracking-[0.32em] uppercase text-brand-cream/35 mt-8">
            Odo · the Twi word for love
          </p>
        </div>

      </div>
    </section>
  );
}
