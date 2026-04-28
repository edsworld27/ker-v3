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

const TILES: Tile[] = [
  {
    type: "story",
    handle: "@abenak.london",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=70",
    caption: "Three weeks in. My skin has never been calmer 🧡 #odobyfelicia",
    alt: "Selfie of woman holding Odo bar",
  },
  {
    type: "dm",
    handle: "ktr_____",
    body: "Reading your story now and I'm already obsessed. I bought a £40 ‘clean’ soap last month that turned out to be full of phthalates — your transparency is a relief. Thank you 🙏🏾",
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=70",
    alt: "Woman applying skincare",
  },
  {
    type: "dm",
    handle: "tom__",
    body: "Hey — bought the Ritual Set for my mum's birthday and she actually called me crying. The handwoven pouch sealed it. Best £35 I've ever spent.",
  },
  {
    type: "story",
    handle: "@nana.glow",
    image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=800&q=70",
    caption: "Glow is BACK. This bar is unreal ✨",
    alt: "Smiling woman with radiant skin",
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=900&q=70",
    alt: "Hand holding a bar of natural soap",
  },
  {
    type: "story",
    handle: "@drsarah_skin",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=70",
    caption: "An ingredient list I can stand behind. Recommending to all my sensitive-skin patients.",
    alt: "Dermatologist headshot",
  },
  {
    type: "dm",
    handle: "akosua.m",
    body: "As a Ghanaian woman this feels like coming home. The scent, the texture, the story behind it — Felicia has bottled something truly special 🇬🇭",
  },
  {
    type: "photo",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=70",
    alt: "Handmade soap bars",
  },
];

// Subtle, deterministic rotations so the page is the same on every load
const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-1"];

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
];

export default function Testimonials() {
  return (
    <section className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black-soft overflow-hidden">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-14">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/5 mb-16 sm:mb-20">
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

        {/* Collage — masonry columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 sm:gap-6 mb-20 sm:mb-24">
          {TILES.map((tile, i) => (
            <div
              key={i}
              className={`mb-5 sm:mb-6 break-inside-avoid ${ROTATIONS[i % ROTATIONS.length]} transition-all duration-300 hover:rotate-0 hover:scale-[1.02] hover:z-10 relative`}
            >
              <Tile tile={tile} />
            </div>
          ))}
        </div>

        {/* Verified review cards */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">Verified reviews</span>
          <h3 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl">
            Felt by those who know
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6 2xl:gap-8">
          {REVIEWS.map(({ quote, name, location, stars }) => (
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

function Tile({ tile }: { tile: Tile }) {
  if (tile.type === "story") return <StoryTile tile={tile} />;
  if (tile.type === "dm") return <DmTile tile={tile} />;
  return <PhotoTileEl tile={tile} />;
}

function StoryTile({ tile }: { tile: IgStory }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-brand-black border-[3px] border-white shadow-2xl shadow-black/40">
      <div className="px-3 py-2.5 flex items-center gap-2 bg-gradient-to-r from-brand-orange to-brand-purple">
        <div className="w-7 h-7 rounded-full bg-white/30 border-2 border-white shrink-0" />
        <span className="text-[11px] sm:text-xs font-semibold text-white truncate">{tile.handle}</span>
      </div>
      <div className="relative aspect-[4/5] bg-brand-black-card">
        <Image src={tile.image} alt={tile.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="text-xs sm:text-sm text-white font-medium leading-snug">{tile.caption}</p>
        </div>
      </div>
    </div>
  );
}

function DmTile({ tile }: { tile: DmBubble }) {
  return (
    <div className="rounded-2xl bg-white shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2.5">
        <span className="text-blue-500 text-base leading-none">‹</span>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple shrink-0" />
        <span className="text-xs sm:text-sm text-gray-900 font-semibold truncate flex-1">{tile.handle}</span>
        <span className="text-gray-300 text-sm">ⓘ</span>
      </div>
      {/* Bubble */}
      <div className="px-4 pt-4 pb-5 bg-white">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{tile.body}</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 ml-1">delivered · just now</p>
      </div>
    </div>
  );
}

function PhotoTileEl({ tile }: { tile: PhotoTile }) {
  return (
    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-brand-black-card border-[3px] border-white shadow-2xl shadow-black/40">
      <Image src={tile.image} alt={tile.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}
