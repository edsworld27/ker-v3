import Image from "next/image";

interface IgStory {
  type: "story";
  handle: string;
  image: string;
  caption: string;
  alt: string;
}

interface DmBubble {
  type: "dm";
  handle: string;
  body: string;
}

interface PhotoTile {
  type: "photo";
  image: string;
  alt: string;
}

type Tile = IgStory | DmBubble | PhotoTile;

// Tiles ordered to form a skyline silhouette: short → tall → tallest centre → tall → short.
// Heights are tuned to create a peaked/triangle shape.
const SKYLINE: { tile: Tile; width: string; height: string; rotate: string; offsetY: string; z: string }[] = [
  {
    tile: {
      type: "photo",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=70",
      alt: "Hand holding skincare",
    },
    width: "w-44",
    height: "h-56",
    rotate: "-rotate-3",
    offsetY: "translate-y-6",
    z: "z-10",
  },
  {
    tile: {
      type: "story",
      handle: "@nana.glow",
      image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=800&q=70",
      caption: "Glow is BACK ✨",
      alt: "Smiling woman",
    },
    width: "w-48",
    height: "h-72",
    rotate: "rotate-2",
    offsetY: "translate-y-2",
    z: "z-20",
  },
  {
    tile: {
      type: "dm",
      handle: "ktr_____",
      body: "Reading your story now and I'm already obsessed. Your transparency is a relief 🙏🏾",
    },
    width: "w-56",
    height: "h-64",
    rotate: "-rotate-1",
    offsetY: "translate-y-8",
    z: "z-30",
  },
  {
    tile: {
      type: "story",
      handle: "@abenak.london",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=70",
      caption: "Three weeks in. My skin has never been calmer 🧡",
      alt: "Selfie",
    },
    width: "w-52",
    height: "h-80",
    rotate: "rotate-1",
    offsetY: "translate-y-1",
    z: "z-40",
  },
  // Centre — tallest tile
  {
    tile: {
      type: "story",
      handle: "@feliciasodo",
      image: "https://images.unsplash.com/photo-1535450059599-94d49bbab07d?auto=format&fit=crop&w=800&q=70",
      caption: "From Accra with love. Made by hand, every batch.",
      alt: "Felicia at work",
    },
    width: "w-56 lg:w-60",
    height: "h-96",
    rotate: "-rotate-2",
    offsetY: "translate-y-0",
    z: "z-50",
  },
  {
    tile: {
      type: "dm",
      handle: "tom__",
      body: "Bought the Ritual Set for my mum's birthday — she actually called me crying. Best £35 I've ever spent.",
    },
    width: "w-56",
    height: "h-72",
    rotate: "rotate-2",
    offsetY: "translate-y-3",
    z: "z-40",
  },
  {
    tile: {
      type: "story",
      handle: "@drsarah_skin",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=70",
      caption: "An ingredient list I can stand behind.",
      alt: "Dermatologist",
    },
    width: "w-48",
    height: "h-80",
    rotate: "-rotate-1",
    offsetY: "translate-y-2",
    z: "z-30",
  },
  {
    tile: {
      type: "dm",
      handle: "akosua.m",
      body: "As a Ghanaian woman this feels like coming home. Felicia has bottled something truly special 🇬🇭",
    },
    width: "w-52",
    height: "h-64",
    rotate: "rotate-3",
    offsetY: "translate-y-7",
    z: "z-20",
  },
  {
    tile: {
      type: "photo",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=70",
      alt: "Handmade soap bars",
    },
    width: "w-44",
    height: "h-56",
    rotate: "-rotate-2",
    offsetY: "translate-y-9",
    z: "z-10",
  },
];

const REVIEWS = [
  {
    quote:
      "I'd struggled with hormone imbalances for years and had no idea my soap could be a contributing factor. Since switching to Odo, my skin feels completely different — softer, calmer, alive. I'll never go back.",
    name: "Abena K.",
    location: "London, UK",
    stars: 5,
  },
  {
    quote:
      "As a Ghanaian woman, this soap feels like coming home. The scent, the texture, the story behind it — Felicia has bottled something truly special. It's ancestral wisdom in your hands.",
    name: "Akosua M.",
    location: "Accra, Ghana",
    stars: 5,
  },
  {
    quote:
      "I'm a dermatologist and I'm genuinely impressed. The ingredient list is something I can actually stand behind — no parabens, no sulphates, no synthetic fragrance. My patients with sensitive skin love it.",
    name: "Dr. Sarah T.",
    location: "Birmingham, UK",
    stars: 5,
  },
  {
    quote:
      "I've tried every ‘clean’ soap on the market and nothing comes close. The shea butter is so rich my skin doesn't need a moisturiser after. My partner has stolen mine, so I had to order two.",
    name: "Priya R.",
    location: "Manchester, UK",
    stars: 5,
  },
  {
    quote:
      "Bought this on a friend's recommendation while pregnant. The peace of mind from knowing exactly what's in it is worth the price alone. Skin is happier than it's been in years.",
    name: "Hannah L.",
    location: "Bristol, UK",
    stars: 5,
  },
  {
    quote:
      "The handwoven pouch in the Ritual Set is a piece of art. The bars themselves are unreal. This is the first brand I've actually felt good about being a customer of.",
    name: "Nana A.",
    location: "Accra, Ghana",
    stars: 5,
  },
  {
    quote:
      "Genuinely the best soap I've ever used and I don't say that lightly. I'm 47 and my skin has the bounce back it had at 27. I will keep buying this for the rest of my life.",
    name: "Marie D.",
    location: "Edinburgh, UK",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black-soft overflow-hidden">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">Stories</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream leading-tight mb-5
            text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
            What women are <span className="gradient-text">actually saying</span>
          </h2>
          <p className="text-brand-cream/60 text-base sm:text-lg xl:text-xl leading-relaxed max-w-2xl">
            Real DMs. Real reposts. Real women. We don&apos;t pay for testimonials and we don&apos;t curate them.
          </p>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/5 mb-14 sm:mb-16">
          {[
            { big: "4.9", small: "Average rating" },
            { big: "3,400+", small: "Happy customers" },
            { big: "91%", small: "Buy again within 90 days" },
            { big: "0", small: "Synthetic ingredients · ever" },
          ].map((s) => (
            <div key={s.small} className="bg-brand-black-card px-5 py-6 sm:py-7 flex flex-col items-center text-center">
              <span className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-brand-amber leading-none mb-2">
                {s.big}
              </span>
              <span className="text-[11px] sm:text-xs tracking-wide text-brand-cream/50">{s.small}</span>
            </div>
          ))}
        </div>

        {/* Skyline collage — desktop only (overlapping, varied heights) */}
        <div className="hidden lg:block relative mb-20">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-end justify-center gap-0 px-4">
            {SKYLINE.map((s, i) => (
              <div
                key={i}
                className={`relative ${s.width} ${s.height} ${s.rotate} ${s.offsetY} ${s.z}
                  ${i === 0 ? "" : "-ml-6 xl:-ml-8"}
                  transition-all duration-500 hover:rotate-0 hover:-translate-y-2 hover:z-50`}
              >
                <Tile tile={s.tile} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/tablet — horizontal scroll collage */}
        <div className="lg:hidden -mx-6 sm:-mx-10 px-6 sm:px-10 mb-14 sm:mb-16">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 scroll-smooth no-scrollbar">
            {SKYLINE.map((s, i) => (
              <div
                key={i}
                className={`shrink-0 snap-center ${s.width} ${s.height} ${s.rotate}`}
              >
                <Tile tile={s.tile} />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] tracking-widest uppercase text-brand-cream/30 mt-2">
            ← Swipe →
          </p>
        </div>

        {/* Verified review cards — horizontal scroll on all sizes */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">Verified reviews</span>
          <h3 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl">
            Felt by those who know
          </h3>
        </div>
        <div className="-mx-6 sm:-mx-10 lg:-mx-12 xl:-mx-16 px-6 sm:px-10 lg:px-12 xl:px-16">
          <div className="flex gap-5 xl:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar">
            {REVIEWS.map(({ quote, name, location, stars }) => (
              <div
                key={name}
                className="snap-start shrink-0 w-[85%] sm:w-[55%] lg:w-[32%] xl:w-[30%] flex flex-col p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-purple/20 transition-all duration-300"
              >
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
          <p className="text-center text-[11px] tracking-widest uppercase text-brand-cream/30 mt-3">
            ← Scroll for more reviews →
          </p>
        </div>

      </div>
    </section>
  );
}

function Tile({ tile }: { tile: Tile }) {
  if (tile.type === "story") return <StoryTile tile={tile} />;
  if (tile.type === "dm") return <DmTile tile={tile} />;
  return <PhotoTileEl tile={tile} />;
}

function StoryTile({ tile }: { tile: IgStory }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-brand-black border-[3px] border-white shadow-2xl shadow-black/50 flex flex-col">
      <div className="px-3 py-2 flex items-center gap-2 bg-gradient-to-r from-brand-orange to-brand-purple shrink-0">
        <div className="w-6 h-6 rounded-full bg-white/30 border-2 border-white shrink-0" />
        <span className="text-[11px] font-semibold text-white truncate">{tile.handle}</span>
      </div>
      <div className="relative flex-1 bg-brand-black-card">
        <Image src={tile.image} alt={tile.alt} fill sizes="240px" className="object-cover" />
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="text-[11px] text-white font-medium leading-snug">{tile.caption}</p>
        </div>
      </div>
    </div>
  );
}

function DmTile({ tile }: { tile: DmBubble }) {
  return (
    <div className="h-full rounded-2xl bg-white shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
      <div className="px-3 py-2.5 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <span className="text-blue-500 text-base leading-none">‹</span>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple shrink-0" />
        <span className="text-xs text-gray-900 font-semibold truncate flex-1">{tile.handle}</span>
        <span className="text-gray-300 text-sm">ⓘ</span>
      </div>
      <div className="flex-1 px-3 pt-3 pb-4 bg-white flex flex-col justify-end">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
          <p className="text-[11px] sm:text-xs text-gray-800 leading-relaxed">{tile.body}</p>
        </div>
        <p className="text-[9px] text-gray-400 mt-1.5 ml-1">delivered · just now</p>
      </div>
    </div>
  );
}

function PhotoTileEl({ tile }: { tile: PhotoTile }) {
  return (
    <div className="relative h-full rounded-xl overflow-hidden bg-brand-black-card border-[3px] border-white shadow-2xl shadow-black/50">
      <Image src={tile.image} alt={tile.alt} fill sizes="220px" className="object-cover" />
    </div>
  );
}
