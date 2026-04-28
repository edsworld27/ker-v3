import Image from "next/image";

interface IgStory { type: "story"; handle: string; image: string; caption: string; alt: string; }
interface DmBubble { type: "dm"; handle: string; body: string; }
interface PhotoTile { type: "photo"; image: string; alt: string; }
type Tile = IgStory | DmBubble | PhotoTile;

const SKYLINE: { tile: Tile; width: string; height: string; rotate: string; offsetY: string }[] = [
  { tile: { type: "photo", image: "/images/testimonials/photo-1.png", alt: "Hand holding skincare" }, width: "w-44", height: "h-56", rotate: "-rotate-3", offsetY: "translate-y-6" },
  { tile: { type: "story", handle: "@nana.glow", image: "/images/testimonials/story-1.png", caption: "Glow is BACK ✨", alt: "Smiling woman" }, width: "w-48", height: "h-72", rotate: "rotate-2", offsetY: "translate-y-2" },
  { tile: { type: "dm", handle: "ktr_____", body: "Reading your story now and I'm already obsessed. Your transparency is a relief 🙏🏾" }, width: "w-56", height: "h-64", rotate: "-rotate-1", offsetY: "translate-y-8" },
  { tile: { type: "story", handle: "@abenak.london", image: "/images/testimonials/story-2.png", caption: "Three weeks in. My skin has never been calmer 🧡", alt: "Selfie" }, width: "w-52", height: "h-80", rotate: "rotate-1", offsetY: "translate-y-1" },
  { tile: { type: "story", handle: "@feliciasodo", image: "/images/testimonials/story-3.png", caption: "From Accra with love. Made by hand, every batch.", alt: "Felicia at work" }, width: "w-56 lg:w-60", height: "h-96", rotate: "-rotate-2", offsetY: "translate-y-0" },
  { tile: { type: "dm", handle: "tom__", body: "Bought the Ritual Set for my mum's birthday — she actually called me crying. Best £35 I've ever spent." }, width: "w-56", height: "h-72", rotate: "rotate-2", offsetY: "translate-y-3" },
  { tile: { type: "story", handle: "@drsarah_skin", image: "/images/testimonials/story-4.png", caption: "An ingredient list I can stand behind.", alt: "Dermatologist" }, width: "w-48", height: "h-80", rotate: "-rotate-1", offsetY: "translate-y-2" },
  { tile: { type: "dm", handle: "akosua.m", body: "As a Ghanaian woman this feels like coming home. Felicia has bottled something truly special 🇬🇭" }, width: "w-52", height: "h-64", rotate: "rotate-3", offsetY: "translate-y-7" },
  { tile: { type: "photo", image: "/images/testimonials/photo-2.png", alt: "Handmade soap bars" }, width: "w-44", height: "h-56", rotate: "-rotate-2", offsetY: "translate-y-9" },
];

export default function SocialStrip() {
  return (
    <div className="w-full bg-brand-black pb-4 overflow-hidden">
      {/* Desktop — single centred row */}
      <div className="hidden lg:flex items-end justify-center gap-0 px-4">
        {SKYLINE.map((s, i) => (
          <div
            key={i}
            style={{ zIndex: SKYLINE.length - Math.abs(i - SKYLINE.length / 2) }}
            className={`relative ${s.width} ${s.height} ${s.rotate} ${s.offsetY}
              ${i === 0 ? "" : "-ml-6 xl:-ml-8"}
              transition-all duration-500 hover:rotate-0 hover:-translate-y-2 hover:z-50`}
          >
            <TileEl tile={s.tile} />
          </div>
        ))}
      </div>

      {/* Mobile — horizontal scroll */}
      <div className="lg:hidden -mx-6 sm:-mx-10 px-6 sm:px-10">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar">
          {SKYLINE.map((s, i) => (
            <div key={i} className={`shrink-0 snap-center ${s.width} ${s.height} ${s.rotate}`}>
              <TileEl tile={s.tile} />
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] tracking-widest uppercase text-brand-cream/30 mt-1">← Swipe →</p>
      </div>
    </div>
  );
}

function TileEl({ tile }: { tile: Tile }) {
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
