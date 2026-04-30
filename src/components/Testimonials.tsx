"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { REVIEWS, type Review } from "@/lib/reviews";
import { getGlobalReviews, onReviewsChange } from "@/lib/admin/reviews";
import { useContent } from "@/lib/useContent";

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
      image: "/images/testimonials/photo-1.png",
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
      image: "/images/testimonials/story-1.png",
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
      image: "/images/testimonials/story-2.png",
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
      image: "/images/testimonials/story-3.png",
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
      image: "/images/testimonials/story-4.png",
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
      image: "/images/testimonials/photo-2.png",
      alt: "Handmade soap bars",
    },
    width: "w-44",
    height: "h-56",
    rotate: "-rotate-2",
    offsetY: "translate-y-9",
    z: "z-10",
  },
];


export default function Testimonials() {
  const [extraReviews, setExtraReviews] = useState<Review[]>([]);
  const eyebrow   = useContent("home.testimonials.eyebrow",   "Stories");
  const headline1 = useContent("home.testimonials.headline1", "What people are");
  const headline2 = useContent("home.testimonials.headline2", "actually saying");
  const intro     = useContent("home.testimonials.intro",     "Real DMs. Real reposts. Real customers — men and women, mothers and fathers, dermatologists and daughters. We don't pay for testimonials and we don't curate them.");
  const stat1Big  = useContent("home.testimonials.stat1Big",  "4.9");
  const stat1Small= useContent("home.testimonials.stat1Small","Average rating");
  const stat2Big  = useContent("home.testimonials.stat2Big",  "3,400+");
  const stat2Small= useContent("home.testimonials.stat2Small","Happy customers");
  const stat3Big  = useContent("home.testimonials.stat3Big",  "91%");
  const stat3Small= useContent("home.testimonials.stat3Small","Buy again within 90 days");
  const stat4Big  = useContent("home.testimonials.stat4Big",  "0");
  const stat4Small= useContent("home.testimonials.stat4Small","Synthetic ingredients · ever");

  useEffect(() => {
    function load() {
      const mapped: Review[] = getGlobalReviews().map(r => ({
        quote: r.body,
        name: r.name,
        location: r.location,
        stars: r.stars,
      }));
      setExtraReviews(mapped);
    }
    load();
    return onReviewsChange(load);
  }, []);

  const allReviews = [...REVIEWS, ...extraReviews];

  return (
    <section className="w-full py-20 sm:py-24 lg:py-32 2xl:py-40 bg-brand-black-soft overflow-hidden">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="adinkra-line w-8 sm:w-10" />
            <span className="text-xs tracking-[0.28em] uppercase text-brand-purple-light">{eyebrow}</span>
            <div className="adinkra-line w-8 sm:w-10" />
          </div>
          <h2 className="font-display font-bold text-brand-cream leading-tight mb-5
            text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl">
            {headline1} <span className="gradient-text">{headline2}</span>
          </h2>
          <p className="text-brand-cream/60 text-base sm:text-lg xl:text-xl leading-relaxed max-w-2xl">
            {intro}
          </p>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/5 mb-14 sm:mb-16">
          {[
            { big: stat1Big, small: stat1Small },
            { big: stat2Big, small: stat2Small },
            { big: stat3Big, small: stat3Small },
            { big: stat4Big, small: stat4Small },
          ].map((s) => (
            <div key={s.small} className="bg-brand-black-card px-5 py-6 sm:py-7 flex flex-col items-center text-center">
              <span className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-brand-amber leading-none mb-2">
                {s.big}
              </span>
              <span className="text-[11px] sm:text-xs tracking-wide text-brand-cream/50">{s.small}</span>
            </div>
          ))}
        </div>

        {/* Verified review cards — two auto-scrolling rows in opposite directions */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <span className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-3">Verified reviews</span>
          <h3 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl xl:text-4xl">
            Felt by those who know
          </h3>
          <p className="text-[11px] tracking-widest uppercase text-brand-cream/30 mt-3">Hover any card to pause</p>
        </div>

        {/* Break out of the max-width container so the marquee runs the full viewport width */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] space-y-5 xl:space-y-6">
          <ReviewMarquee
            reviews={[...allReviews.slice(0, Math.ceil(allReviews.length / 2)), ...allReviews.slice(Math.ceil(allReviews.length / 2))]}
            direction="left"
          />
          <ReviewMarquee
            reviews={[...allReviews.slice(Math.floor(allReviews.length / 2)), ...allReviews.slice(0, Math.floor(allReviews.length / 2))]}
            direction="right"
          />
        </div>

        {/* Read all reviews CTA */}
        <div className="flex flex-col items-center mt-12 sm:mt-14">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-brand-amber/40 bg-brand-black-card text-brand-amber text-sm sm:text-base font-medium tracking-wide hover:bg-brand-amber hover:text-brand-black transition-all duration-300 group"
          >
            Read all {allReviews.length} reviews
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <p className="text-brand-cream/30 text-xs mt-3 tracking-wide">
            Unfiltered. Unsponsored. All verified.
          </p>
        </div>

      </div>
    </section>
  );
}

function ReviewMarquee({
  reviews,
  direction,
}: {
  reviews: Review[];
  direction: "left" | "right";
}) {
  // Duplicate the list so the animation loops seamlessly
  const loop = [...reviews, ...reviews];
  return (
    <div className="marquee-pause overflow-hidden">
      <div className={`marquee gap-5 xl:gap-6 ${direction === "left" ? "marquee-left" : "marquee-right"}`}>
        {loop.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} review={r} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { quote, name, location, stars } = review;
  return (
    <div className="shrink-0 w-[85vw] sm:w-[26rem] xl:w-[28rem] flex flex-col p-7 xl:p-8 rounded-2xl bg-brand-black-card border border-white/5 hover:border-brand-purple/30 transition-colors">
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
  );
}

function flipRotate(r: string): string {
  if (r.startsWith("-rotate-")) return r.replace("-rotate-", "rotate-");
  if (r.startsWith("rotate-")) return r.replace("rotate-", "-rotate-");
  return r;
}

function SkylineRow({
  tiles,
  shift,
  opacity,
  zBase,
  mt = "",
}: {
  tiles: typeof SKYLINE;
  shift: string;
  opacity: string;
  zBase: 1 | 10 | 20;
  mt?: string;
}) {
  // Map base z to a Tailwind class so hover:z-50 on the row reliably wins
  const baseZ = zBase === 20 ? "z-20" : zBase === 10 ? "z-10" : "z-0";
  return (
    <div
      className={`relative ${baseZ} hover:z-50 flex items-end justify-center gap-0 px-4 transition-[z-index] ${shift} ${opacity} ${mt}`}
    >
      {tiles.map((s, i) => (
        <div
          key={i}
          style={{ zIndex: tiles.length - Math.abs(i - tiles.length / 2) }}
          className={`relative ${s.width} ${s.height} ${s.rotate} ${s.offsetY}
            ${i === 0 ? "" : "-ml-6 xl:-ml-8"}
            transition-all duration-500 hover:rotate-0 hover:-translate-y-2 hover:!z-50`}
        >
          <Tile tile={s.tile} />
        </div>
      ))}
    </div>
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
