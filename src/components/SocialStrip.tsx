import Image from "next/image";

// ── Tile types ──────────────────────────────────────────────────────────────
interface IgStory  { type: "story";   handle: string; image: string; alt: string; caption: string; views?: string; }
interface IgPost   { type: "post";    handle: string; image: string; alt: string; likes: string; comment: string; }
interface IgReel   { type: "reel";    handle: string; image: string; alt: string; plays: string; caption: string; }
interface DmThread { type: "dm";      handle: string; avatar: string; messages: { from: "them" | "us"; text: string }[]; }
interface TikTok   { type: "tiktok";  handle: string; image: string; alt: string; likes: string; caption: string; }
interface StarCard { type: "review";  name: string;   location: string; stars: number; quote: string; }
type Tile = IgStory | IgPost | IgReel | DmThread | TikTok | StarCard;

// ── Skyline data ─────────────────────────────────────────────────────────────
const SKYLINE: { tile: Tile; width: string; height: string; rotate: string; offsetY: string }[] = [
  {
    tile: { type: "post", handle: "nana.glow", image: "/images/testimonials/photo-1.png", alt: "Odo soap unboxing", likes: "1,204", comment: "Finally a soap that doesn't strip me 🙌🏾" },
    width: "w-40", height: "h-52", rotate: "-rotate-2", offsetY: "translate-y-5",
  },
  {
    tile: { type: "story", handle: "@abenak.london", image: "/images/testimonials/story-2.png", alt: "Selfie", caption: "Three weeks in 🧡 skin has never been calmer", views: "4.2k" },
    width: "w-36", height: "h-64", rotate: "rotate-2", offsetY: "translate-y-1",
  },
  {
    tile: { type: "dm", handle: "ktr_____", avatar: "K", messages: [
      { from: "us",   text: "have you tried odo soap?" },
      { from: "them", text: "YES and I'm obsessed 😭 my skin is so soft" },
      { from: "them", text: "the transparency is a relief honestly 🙏🏾" },
    ]},
    width: "w-44", height: "h-52", rotate: "-rotate-1", offsetY: "translate-y-6",
  },
  {
    tile: { type: "reel", handle: "@drsarah_skin", image: "/images/testimonials/story-4.png", alt: "Dermatologist review", plays: "84k", caption: "An ingredient list I can actually stand behind 👩‍⚕️" },
    width: "w-36", height: "h-64", rotate: "rotate-1", offsetY: "translate-y-2",
  },
  {
    tile: { type: "story", handle: "@feliciasodo", image: "/images/testimonials/story-3.png", alt: "Felicia at work", caption: "Made by hand, every single batch 🇬🇭", views: "12.1k" },
    width: "w-40", height: "h-72", rotate: "-rotate-2", offsetY: "translate-y-0",
  },
  {
    tile: { type: "review", name: "James O.", location: "Leeds, UK", stars: 5, quote: "Razor burn is gone. I'm a convert. My skin actually feels different." },
    width: "w-44", height: "h-48", rotate: "rotate-2", offsetY: "translate-y-3",
  },
  {
    tile: { type: "tiktok", handle: "@akosua.m", image: "/images/testimonials/story-1.png", alt: "Skin routine", likes: "22.4k", caption: "switching to Odo was the best thing I did for my skin #cleanbeauty #ghana" },
    width: "w-36", height: "h-64", rotate: "-rotate-1", offsetY: "translate-y-2",
  },
  {
    tile: { type: "dm", handle: "tom__982", avatar: "T", messages: [
      { from: "them", text: "bought the ritual set for my mum" },
      { from: "them", text: "she called me crying 😭 best £35 ever spent" },
      { from: "us",   text: "that genuinely made our day 🧡" },
    ]},
    width: "w-44", height: "h-52", rotate: "rotate-3", offsetY: "translate-y-4",
  },
  {
    tile: { type: "post", handle: "priya.r", image: "/images/testimonials/photo-2.png", alt: "Soap bars", likes: "876", comment: "My partner has stolen mine so I had to order two 😂" },
    width: "w-40", height: "h-52", rotate: "-rotate-2", offsetY: "translate-y-6",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function flipRotate(r: string) {
  if (r.startsWith("-rotate-")) return r.replace("-rotate-", "rotate-");
  if (r.startsWith("rotate-"))  return r.replace("rotate-", "-rotate-");
  return r;
}

function SkylineRow({ tiles, shift = "", mt = "" }: { tiles: typeof SKYLINE; shift?: string; mt?: string }) {
  return (
    <div className={`relative flex items-end justify-center gap-0 ${shift} ${mt}`}>
      {tiles.map((s, i) => (
        <div
          key={i}
          style={{ zIndex: tiles.length - Math.abs(i - tiles.length / 2) }}
          className={`relative ${s.width} ${s.height} ${s.rotate} ${s.offsetY}
            ${i === 0 ? "" : "-ml-5 xl:-ml-6"}
            transition-all duration-500 hover:rotate-0 hover:-translate-y-2 hover:z-50`}
        >
          <TileEl tile={s.tile} />
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SocialStrip() {
  return (
    <div className="w-full bg-brand-black pb-8 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Desktop — 3 overlapping rows */}
        <div className="hidden lg:block">
          <SkylineRow tiles={SKYLINE} />
          <SkylineRow
            tiles={SKYLINE.slice(3).concat(SKYLINE.slice(0, 3)).map(s => ({ ...s, rotate: flipRotate(s.rotate) }))}
            shift="translate-x-5 xl:translate-x-8"
            mt="-mt-32"
          />
          <SkylineRow
            tiles={SKYLINE.slice(5).concat(SKYLINE.slice(0, 5))}
            shift="-translate-x-5 xl:-translate-x-8"
            mt="-mt-32"
          />
        </div>

        {/* Mobile — horizontal scroll */}
        <div className="lg:hidden -mx-6 sm:-mx-10 px-6 sm:px-10">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar">
            {SKYLINE.map((s, i) => (
              <div key={i} className={`shrink-0 snap-center ${s.width} ${s.height} ${s.rotate}`}>
                <TileEl tile={s.tile} />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] tracking-widest uppercase text-brand-cream/30 mt-1">← Swipe →</p>
        </div>

      </div>
    </div>
  );
}

// ── Tile renderers ────────────────────────────────────────────────────────────
function TileEl({ tile }: { tile: Tile }) {
  if (tile.type === "story")  return <StoryTile  tile={tile} />;
  if (tile.type === "post")   return <PostTile   tile={tile} />;
  if (tile.type === "reel")   return <ReelTile   tile={tile} />;
  if (tile.type === "dm")     return <DmTile     tile={tile} />;
  if (tile.type === "tiktok") return <TikTokTile tile={tile} />;
  return <ReviewTile tile={tile as StarCard} />;
}

function StoryTile({ tile }: { tile: IgStory }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-black flex flex-col shadow-2xl shadow-black/60 border border-white/10">
      {/* Story header */}
      <div className="px-2.5 py-2 flex items-center gap-2 bg-gradient-to-r from-brand-orange via-pink-500 to-brand-purple shrink-0">
        <div className="w-5 h-5 rounded-full bg-white/30 ring-1 ring-white shrink-0" />
        <span className="text-[9px] font-semibold text-white truncate flex-1">{tile.handle}</span>
        {tile.views && <span className="text-[8px] text-white/70">{tile.views} views</span>}
      </div>
      <div className="relative flex-1">
        <Image src={tile.image} alt={tile.alt} fill sizes="200px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-2.5">
          <p className="text-[10px] text-white font-medium leading-snug drop-shadow">{tile.caption}</p>
        </div>
      </div>
      {/* Reply bar */}
      <div className="px-2.5 py-1.5 bg-black/80 flex items-center gap-1.5 shrink-0">
        <div className="flex-1 rounded-full bg-white/10 px-2 py-1">
          <p className="text-[8px] text-white/40">Send message…</p>
        </div>
        <span className="text-white/50 text-sm">♡</span>
      </div>
    </div>
  );
}

function PostTile({ tile }: { tile: IgPost }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-white flex flex-col shadow-2xl shadow-black/60">
      {/* Post header */}
      <div className="px-2.5 py-2 flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold text-gray-900 truncate">{tile.handle}</p>
          <p className="text-[8px] text-gray-400">Accra, Ghana</p>
        </div>
        <span className="text-gray-400 text-base leading-none">···</span>
      </div>
      {/* Image */}
      <div className="relative flex-1">
        <Image src={tile.image} alt={tile.alt} fill sizes="200px" className="object-cover" />
      </div>
      {/* Actions */}
      <div className="px-2.5 pt-2 pb-2.5 shrink-0">
        <div className="flex gap-2.5 mb-1.5">
          <span className="text-sm">🤍</span>
          <span className="text-sm">💬</span>
          <span className="text-sm">↗</span>
        </div>
        <p className="text-[9px] font-semibold text-gray-900">{tile.likes} likes</p>
        <p className="text-[8px] text-gray-600 mt-0.5 leading-snug line-clamp-2">{tile.comment}</p>
      </div>
    </div>
  );
}

function ReelTile({ tile }: { tile: IgReel }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-black flex flex-col shadow-2xl shadow-black/60 relative border border-white/10">
      <div className="relative flex-1">
        <Image src={tile.image} alt={tile.alt} fill sizes="200px" className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        {/* Reel badge */}
        <div className="absolute top-2 left-2 bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-1">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M4 4h16v16H4z M8 4v16 M16 4v16 M4 8h16 M4 16h16"/></svg>
          <span className="text-[8px] text-white font-semibold">Reels</span>
        </div>
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
          </div>
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-[9px] text-white font-semibold mb-0.5">{tile.handle}</p>
          <p className="text-[8px] text-white/80 leading-snug line-clamp-2">{tile.caption}</p>
          <p className="text-[8px] text-white/50 mt-1">▶ {tile.plays} plays</p>
        </div>
      </div>
    </div>
  );
}

function DmTile({ tile }: { tile: DmThread }) {
  return (
    <div className="h-full rounded-2xl bg-white shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <span className="text-blue-500 text-sm leading-none font-light">‹</span>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center shrink-0">
          <span className="text-[8px] font-bold text-white">{tile.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold text-gray-900 truncate">{tile.handle}</p>
          <p className="text-[7px] text-green-500">Active now</p>
        </div>
        <span className="text-gray-300 text-sm">📞</span>
      </div>
      {/* Messages */}
      <div className="flex-1 px-2.5 py-2 flex flex-col justify-end gap-1.5 overflow-hidden">
        {tile.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "us" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-2.5 py-1.5 rounded-2xl ${
              m.from === "us"
                ? "bg-blue-500 rounded-br-sm"
                : "bg-gray-100 rounded-bl-sm"
            }`}>
              <p className={`text-[9px] leading-snug ${m.from === "us" ? "text-white" : "text-gray-800"}`}>{m.text}</p>
            </div>
          </div>
        ))}
        <p className="text-[7px] text-gray-300 text-right mt-0.5">Delivered</p>
      </div>
    </div>
  );
}

function TikTokTile({ tile }: { tile: TikTok }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-black flex flex-col shadow-2xl shadow-black/60 relative">
      <div className="relative flex-1">
        <Image src={tile.image} alt={tile.alt} fill sizes="200px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        {/* TikTok badge */}
        <div className="absolute top-2 right-2 bg-black rounded px-1.5 py-0.5">
          <span className="text-[8px] font-black text-white tracking-tight">TikTok</span>
        </div>
        {/* Play */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
          </div>
        </div>
        {/* Side actions */}
        <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-lg">♥</span>
            <span className="text-[7px] text-white">{tile.likes}</span>
          </div>
          <span className="text-lg">💬</span>
          <span className="text-lg">↗</span>
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 pr-10">
          <p className="text-[9px] font-semibold text-white mb-0.5">{tile.handle}</p>
          <p className="text-[8px] text-white/80 leading-snug line-clamp-2">{tile.caption}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewTile({ tile }: { tile: StarCard }) {
  return (
    <div className="h-full rounded-2xl bg-brand-black-card border border-white/10 shadow-2xl shadow-black/60 flex flex-col p-4">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: tile.stars }).map((_, i) => (
          <span key={i} className="text-brand-amber text-sm">★</span>
        ))}
      </div>
      <p className="text-[10px] text-brand-cream/80 leading-relaxed flex-1 italic">&ldquo;{tile.quote}&rdquo;</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/8">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center shrink-0">
          <span className="text-[8px] font-bold text-white">{tile.name[0]}</span>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-brand-cream">{tile.name}</p>
          <p className="text-[8px] text-brand-cream/40">{tile.location}</p>
        </div>
      </div>
    </div>
  );
}
