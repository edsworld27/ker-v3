"use client";

// ── Types ─────────────────────────────────────────────────────────────────────
interface IgStory  { type: "story";   handle: string; caption: string; views: string; bg: string; }
interface IgPost   { type: "post";    handle: string; location: string; likes: string; comment: string; bg: string; }
interface IgReel   { type: "reel";    handle: string; caption: string; plays: string; bg: string; }
interface DmThread { type: "dm";      handle: string; avatar: string; color: string; messages: { from: "them"|"us"; text: string }[]; }
interface TikTok   { type: "tiktok";  handle: string; caption: string; likes: string; comments: string; bg: string; }
interface StarCard { type: "review";  name: string; location: string; stars: number; quote: string; }
type Tile = IgStory | IgPost | IgReel | DmThread | TikTok | StarCard;

// ── Data ──────────────────────────────────────────────────────────────────────
const SKYLINE: { tile: Tile; width: string; height: string; rotate: string; offsetY: string }[] = [
  {
    tile: { type: "post", handle: "nana.glow_", location: "Accra, Ghana", likes: "2,841", comment: "Finally switched and my skin is GLOWING 🧡 zero sulphates, zero regrets #odo #cleanbeauty", bg: "from-amber-800 via-orange-900 to-stone-950" },
    width: "w-52", height: "h-64", rotate: "-rotate-2", offsetY: "translate-y-6",
  },
  {
    tile: { type: "story", handle: "@abenak.london", caption: "Week 3 update 🧡 my skin has never been this calm, no exaggeration", views: "6.4k", bg: "from-rose-900 via-pink-950 to-purple-950" },
    width: "w-44", height: "h-80", rotate: "rotate-2", offsetY: "translate-y-1",
  },
  {
    tile: { type: "dm", handle: "ktr_____", avatar: "K", color: "from-orange-500 to-pink-600", messages: [
      { from: "us",   text: "Have you tried Odo yet?" },
      { from: "them", text: "YES omg I'm obsessed 😭" },
      { from: "them", text: "my skin is so soft I don't even need moisturiser anymore" },
      { from: "us",   text: "that's literally the whole point 🙌🏾" },
      { from: "them", text: "the transparency thing is what got me. I can actually read the ingredients 🙏🏾" },
    ]},
    width: "w-56", height: "h-72", rotate: "-rotate-1", offsetY: "translate-y-8",
  },
  {
    tile: { type: "reel", handle: "@drsarah_skin", caption: "As a dermatologist I rarely endorse products. This ingredient list is one I can actually stand behind ✅", plays: "124k", bg: "from-slate-800 via-zinc-900 to-stone-950" },
    width: "w-44", height: "h-80", rotate: "rotate-1", offsetY: "translate-y-2",
  },
  {
    tile: { type: "story", handle: "@feliciasodo", caption: "Made by hand in Accra, every single batch 🇬🇭 this is what we do every morning", views: "18.2k", bg: "from-yellow-800 via-amber-900 to-stone-950" },
    width: "w-48", height: "h-96", rotate: "-rotate-2", offsetY: "translate-y-0",
  },
  {
    tile: { type: "review", name: "James O.", location: "Leeds, UK", stars: 5, quote: "Razor burn completely gone after two weeks. My skin feels different — actually different. I've recommended this to every man I know." },
    width: "w-56", height: "h-60", rotate: "rotate-2", offsetY: "translate-y-3",
  },
  {
    tile: { type: "tiktok", handle: "@akosua.m", caption: "switching to Odo was the single best skincare decision I've ever made #cleanbeauty #ghana #skincareroutine", likes: "34.2k", comments: "1.8k", bg: "from-indigo-900 via-purple-950 to-black" },
    width: "w-44", height: "h-80", rotate: "-rotate-1", offsetY: "translate-y-2",
  },
  {
    tile: { type: "dm", handle: "tom__982", avatar: "T", color: "from-blue-500 to-indigo-600", messages: [
      { from: "them", text: "bought the ritual set for my mum's birthday" },
      { from: "them", text: "she called me literally crying 😭 best £35 I've spent in my life" },
      { from: "us",   text: "this genuinely made our whole team's day 🧡" },
      { from: "them", text: "she's already asked me to order her another one lol" },
    ]},
    width: "w-56", height: "h-64", rotate: "rotate-3", offsetY: "translate-y-5",
  },
  {
    tile: { type: "post", handle: "priya.radha", location: "Manchester, UK", likes: "1,103", comment: "My partner stole mine so I had to order two. Not even mad 😂 best soap I've ever used and I don't say that lightly", bg: "from-stone-700 via-amber-950 to-stone-950" },
    width: "w-52", height: "h-64", rotate: "-rotate-2", offsetY: "translate-y-7",
  },
];

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
            ${i === 0 ? "" : "-ml-6 xl:-ml-8"}
            transition-all duration-500 hover:rotate-0 hover:-translate-y-3 hover:z-50 cursor-pointer`}
        >
          <TileEl tile={s.tile} />
        </div>
      ))}
    </div>
  );
}

export default function SocialStrip() {
  return (
    <div className="w-full bg-brand-black pb-10 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="hidden lg:block">
          <SkylineRow tiles={SKYLINE} />
          <SkylineRow
            tiles={SKYLINE.slice(3).concat(SKYLINE.slice(0, 3)).map(s => ({ ...s, rotate: flipRotate(s.rotate) }))}
            shift="translate-x-6 xl:translate-x-10"
            mt="-mt-40"
          />
          <SkylineRow
            tiles={SKYLINE.slice(5).concat(SKYLINE.slice(0, 5))}
            shift="-translate-x-6 xl:-translate-x-10"
            mt="-mt-40"
          />
        </div>
        <div className="lg:hidden -mx-6 sm:-mx-10 px-6 sm:px-10">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar">
            {SKYLINE.map((s, i) => (
              <div key={i} className={`shrink-0 snap-center ${s.width} ${s.height}`}>
                <TileEl tile={s.tile} />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] tracking-widest uppercase text-brand-cream/30 mt-2">← Swipe →</p>
        </div>
      </div>
    </div>
  );
}

// ── Renderers ─────────────────────────────────────────────────────────────────
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
    <div className="h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/70 relative">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${tile.bg}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,160,50,0.15),transparent_60%)]" />
      {/* Story bar at top */}
      <div className="relative z-10 px-3 pt-3 shrink-0">
        <div className="w-full h-0.5 bg-white/30 rounded-full mb-2.5">
          <div className="w-2/3 h-full bg-white rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple ring-2 ring-white shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-white leading-none">{tile.handle}</p>
            <p className="text-[9px] text-white/60 mt-0.5">{tile.views} views</p>
          </div>
          <div className="ml-auto flex gap-2.5 text-white/70">
            <span className="text-base">···</span>
            <span className="text-base">✕</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="relative z-10 flex-1" />
      {/* Caption */}
      <div className="relative z-10 px-3 pb-4 shrink-0">
        <p className="text-[11px] text-white leading-relaxed drop-shadow-md">{tile.caption}</p>
      </div>
      {/* Reply bar */}
      <div className="relative z-10 px-3 pb-3 flex items-center gap-2 shrink-0">
        <div className="flex-1 rounded-full border border-white/40 px-3 py-1.5">
          <p className="text-[10px] text-white/50">Send message…</p>
        </div>
        <span className="text-white/60 text-lg">♡</span>
        <span className="text-white/60 text-lg">↗</span>
      </div>
    </div>
  );
}

function PostTile({ tile }: { tile: IgPost }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden bg-white flex flex-col shadow-2xl shadow-black/70">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple ring-1 ring-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gray-900 truncate">{tile.handle}</p>
          <p className="text-[9px] text-gray-500">{tile.location}</p>
        </div>
        <span className="text-gray-400 text-lg font-bold leading-none">···</span>
      </div>
      {/* Photo area */}
      <div className={`flex-1 bg-gradient-to-br ${tile.bg} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(255,180,50,0.12),transparent_70%)]" />
        {/* ODO watermark */}
        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-[9px] font-bold text-white/80 tracking-widest">ODO</p>
        </div>
      </div>
      {/* Actions */}
      <div className="px-3 pt-2.5 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">🤍</span>
          <span className="text-xl">💬</span>
          <span className="text-xl">↗</span>
          <span className="ml-auto text-xl">🔖</span>
        </div>
        <p className="text-[11px] font-bold text-gray-900 mb-1">{tile.likes} likes</p>
        <p className="text-[10px] text-gray-700 leading-snug line-clamp-3">
          <span className="font-bold">{tile.handle} </span>{tile.comment}
        </p>
        <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">2 hours ago</p>
      </div>
    </div>
  );
}

function ReelTile({ tile }: { tile: IgReel }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/70 relative">
      <div className={`absolute inset-0 bg-gradient-to-b ${tile.bg}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(120,80,200,0.2),transparent_60%)]" />
      {/* Top bar */}
      <div className="relative z-10 px-3 pt-3 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-black/50 rounded-full px-2 py-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 7h20M2 17h20"/>
          </svg>
          <span className="text-[10px] text-white font-semibold">Reels</span>
        </div>
      </div>
      {/* Centre play */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-xl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
        </div>
      </div>
      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple ring-2 ring-white" />
          <div className="w-5 h-5 rounded-full bg-brand-orange -mt-2 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">+</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-2xl">🤍</span>
          <span className="text-[9px] text-white/80">84k</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-2xl">💬</span>
          <span className="text-[9px] text-white/80">2.1k</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-2xl">↗</span>
          <span className="text-[9px] text-white/80">Share</span>
        </div>
      </div>
      {/* Bottom info */}
      <div className="relative z-10 px-3 pb-4 pr-14 shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple ring-1 ring-white shrink-0" />
          <p className="text-[11px] font-bold text-white">{tile.handle}</p>
          <div className="border border-white/60 rounded px-1.5 py-0.5">
            <span className="text-[9px] text-white">Follow</span>
          </div>
        </div>
        <p className="text-[10px] text-white/90 leading-snug">{tile.caption}</p>
        <p className="text-[9px] text-white/50 mt-1.5">▶ {tile.plays} plays</p>
      </div>
    </div>
  );
}

function DmTile({ tile }: { tile: DmThread }) {
  return (
    <div className="h-full rounded-2xl bg-white shadow-2xl shadow-black/70 overflow-hidden flex flex-col">
      {/* iOS-style header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg font-light">‹</span>
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center`}>
              <span className="text-sm font-bold text-white">{tile.avatar}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-1 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900">{tile.handle}</p>
            <p className="text-[9px] text-green-500 font-medium">Active now</p>
          </div>
          <div className="flex gap-3 text-blue-500">
            <span className="text-base">📞</span>
            <span className="text-base">📹</span>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 px-3 py-3 flex flex-col justify-end gap-2 overflow-hidden bg-white">
        {tile.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "us" ? "justify-end" : "justify-start"} items-end gap-1.5`}>
            {m.from === "them" && (
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center shrink-0 mb-0.5`}>
                <span className="text-[7px] font-bold text-white">{tile.avatar}</span>
              </div>
            )}
            <div className={`max-w-[82%] px-3 py-2 rounded-2xl ${
              m.from === "us"
                ? "bg-blue-500 rounded-br-md"
                : "bg-gray-100 rounded-bl-md"
            }`}>
              <p className={`text-[10px] leading-relaxed ${m.from === "us" ? "text-white" : "text-gray-800"}`}>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Input bar */}
      <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
        <span className="text-blue-500 text-lg">⊕</span>
        <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5">
          <p className="text-[10px] text-gray-400">Message…</p>
        </div>
        <span className="text-blue-500 text-lg">🎤</span>
      </div>
    </div>
  );
}

function TikTokTile({ tile }: { tile: TikTok }) {
  return (
    <div className="h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/70 relative">
      <div className={`absolute inset-0 bg-gradient-to-b ${tile.bg}`} />
      {/* TikTok header */}
      <div className="relative z-10 px-3 pt-3 flex items-center justify-between shrink-0">
        <span className="text-white/60 text-sm">Following</span>
        <div className="flex items-center gap-1">
          <span className="text-white font-bold text-sm">For You</span>
          <div className="w-4 h-0.5 bg-white rounded-full mt-0.5 mx-auto" />
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>
      {/* Play area */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
        </div>
      </div>
      {/* Right side */}
      <div className="absolute right-2.5 bottom-28 z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple ring-2 ring-white" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#ff0050] flex items-center justify-center">
            <span className="text-[9px] text-white font-black">+</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">❤️</span>
          <span className="text-[10px] text-white font-semibold">{tile.likes}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">💬</span>
          <span className="text-[10px] text-white font-semibold">{tile.comments}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">↗</span>
          <span className="text-[10px] text-white font-semibold">Share</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-purple-600 border-4 border-black animate-spin" style={{ animationDuration: "4s" }} />
      </div>
      {/* Bottom */}
      <div className="relative z-10 px-3 pb-4 pr-14 shrink-0">
        <p className="text-[11px] font-bold text-white mb-1">{tile.handle}</p>
        <p className="text-[10px] text-white/90 leading-snug">{tile.caption}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-white/80 text-xs">♫</span>
          <p className="text-[9px] text-white/70 truncate">Original sound — {tile.handle}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewTile({ tile }: { tile: StarCard }) {
  return (
    <div className="h-full rounded-2xl bg-brand-black-card border border-white/8 shadow-2xl shadow-black/70 flex flex-col p-5">
      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: tile.stars }).map((_, i) => (
          <span key={i} className="text-brand-amber text-base">★</span>
        ))}
      </div>
      {/* Quote */}
      <p className="text-[11px] sm:text-xs text-brand-cream/80 leading-relaxed flex-1 italic">
        &ldquo;{tile.quote}&rdquo;
      </p>
      {/* Divider */}
      <div className="border-t border-white/8 mt-4 pt-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white">{tile.name[0]}</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-brand-cream">{tile.name}</p>
          <p className="text-[9px] text-brand-cream/40">{tile.location}</p>
        </div>
        <div className="ml-auto">
          <div className="flex gap-0.5">
            {["🟢","🟢","🟢"].map((_, i) => <span key={i} className="text-[6px]">✓</span>)}
          </div>
          <p className="text-[8px] text-green-500/70">Verified</p>
        </div>
      </div>
    </div>
  );
}
