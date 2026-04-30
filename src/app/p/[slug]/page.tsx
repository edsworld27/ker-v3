"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPageBySlug, onPagesChange, type CustomPage, type Block } from "@/lib/admin/customPages";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";
import { isPreviewMode } from "@/lib/admin/content";

export default function CustomPageView() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const [page, setPage] = useState<CustomPage | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () => setPage(getPageBySlug(slug) ?? null);
    refresh();
    const o1 = onPagesChange(refresh);
    const o2 = onMediaChange(refresh);
    return () => { o1(); o2(); };
  }, [slug]);

  if (page === undefined) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black" />
        <Footer />
      </>
    );
  }

  const visible = page && (page.status === "published" || isPreviewMode());

  if (!page || !visible) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">404</p>
            <h1 className="font-display text-3xl text-brand-cream mb-3">Page not found</h1>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold">← Home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {page.seo.jsonld && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: page.seo.jsonld }} />
      )}
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black">
        {page.blocks.map(block => (
          <BlockView key={block.id} block={block} />
        ))}
      </main>
      <Footer />

      <style jsx global>{`
        .lk-rich h2 { font-family: var(--font-playfair); font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; color: #f5e9d4; }
        .lk-rich h3 { font-family: var(--font-playfair); font-size: 1.35rem; font-weight: 600; margin: 1.75rem 0 0.75rem; color: #f5e9d4; }
        .lk-rich p { margin: 1rem 0; }
        .lk-rich ul, .lk-rich ol { padding-left: 1.5rem; margin: 1rem 0; }
        .lk-rich blockquote { border-left: 3px solid #ff6b35; padding-left: 1rem; color: rgba(245,233,212,0.65); font-style: italic; margin: 1.5rem 0; }
        .lk-rich a { color: #ff6b35; text-decoration: underline; }
        .lk-rich img { border-radius: 12px; margin: 1.5rem 0; max-width: 100%; height: auto; }
      `}</style>
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "hero": return (
      <section className="w-full bg-brand-black-soft border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
          {block.eyebrow && <p className="text-xs tracking-[0.28em] uppercase text-brand-amber mb-4">{block.eyebrow}</p>}
          <h1 className="font-display font-bold text-brand-cream text-4xl sm:text-5xl xl:text-6xl leading-tight mb-5">{block.title}</h1>
          {block.intro && <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-2xl">{block.intro}</p>}
          {block.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={resolveMediaRef(block.image)} alt="" className="mt-8 w-full rounded-2xl border border-white/5 max-h-[28rem] object-cover" />
          )}
        </div>
      </section>
    );
    case "richText": return (
      <section className="w-full">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-14 lk-rich text-brand-cream/80 text-base sm:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: block.html }} />
      </section>
    );
    case "image": return (
      <section className="w-full">
        <figure className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveMediaRef(block.src)} alt={block.alt ?? ""} className="w-full rounded-2xl border border-white/5" />
          {block.caption && <figcaption className="text-xs text-brand-cream/45 mt-3 text-center italic">{block.caption}</figcaption>}
        </figure>
      </section>
    );
    case "gallery": return (
      <section className="w-full">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {block.images.map((img, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={i} src={resolveMediaRef(img.src)} alt={img.alt ?? ""} className="w-full aspect-square object-cover rounded-xl border border-white/5" />
          ))}
        </div>
      </section>
    );
    case "quote": return (
      <section className="w-full">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 py-12">
          <blockquote className="border-l-4 border-brand-orange pl-6 text-xl sm:text-2xl font-display italic text-brand-cream/85 leading-relaxed">
            “{block.quote}”
          </blockquote>
          {block.attribution && <p className="mt-4 text-xs tracking-widest uppercase text-brand-cream/40 pl-6">— {block.attribution}</p>}
        </div>
      </section>
    );
    case "embed": {
      const yt = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/);
      const vm = block.url.match(/vimeo\.com\/(\d+)/);
      const src = yt ? `https://www.youtube.com/embed/${yt[1]}` : vm ? `https://player.vimeo.com/video/${vm[1]}` : block.url;
      return (
        <section className="w-full">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-8">
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, borderRadius: 12 }} allowFullScreen />
            </div>
            {block.caption && <p className="text-xs text-brand-cream/45 mt-3 text-center italic">{block.caption}</p>}
          </div>
        </section>
      );
    }
    case "divider": return (
      <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12">
        <hr className="border-0 border-t border-white/10 my-8" />
      </div>
    );
    case "cta": return (
      <section className="w-full bg-brand-black-soft border-y border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-14 text-center">
          <h2 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl mb-3">{block.headline}</h2>
          {block.subhead && <p className="text-brand-cream/60 mb-6">{block.subhead}</p>}
          <Link href={block.buttonHref} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold">
            {block.buttonLabel} →
          </Link>
        </div>
      </section>
    );
    case "html": return (
      <section className="w-full">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-8" dangerouslySetInnerHTML={{ __html: block.html }} />
      </section>
    );
  }
}
