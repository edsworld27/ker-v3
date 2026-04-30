"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/useContent";
import { listPublished, onBlogChange, type BlogPost } from "@/lib/admin/blog";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";

const CATEGORY_COLOURS: Record<string, string> = {
  "Ingredients":    "text-brand-amber bg-brand-amber/10",
  "Our Story":      "text-brand-orange bg-brand-orange/10",
  "Skin Education": "text-brand-purple-light bg-brand-purple/10",
  "Sourcing":       "text-green-400 bg-green-400/10",
  "Nkrabea":        "text-brand-amber bg-brand-amber/10",
  "Sustainability": "text-teal-400 bg-teal-400/10",
  "Journal":        "text-brand-cream/60 bg-white/5",
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const eyebrow  = useContent("blog.hero.eyebrow",  "Journal");
  const headline = useContent("blog.hero.headline", "The Luv & Ker Journal");
  const intro    = useContent("blog.hero.intro",    "Stories, ingredients, sourcing, and skin — written by the people who make the soap.");

  useEffect(() => {
    const refresh = () => setPosts(listPublished());
    refresh();
    const o1 = onBlogChange(refresh);
    const o2 = onMediaChange(refresh);
    return () => { o1(); o2(); };
  }, []);

  const featured = posts.find(p => p.featured);
  const rest = posts.filter(p => !p.featured);

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black">
        <section className="w-full pt-28 pb-16 sm:pt-32 sm:pb-20 bg-brand-black-soft relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-muted/20 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="adinkra-line w-8 sm:w-10" />
                <span className="text-xs tracking-[0.28em] uppercase text-brand-amber">{eyebrow}</span>
                <div className="adinkra-line w-8 sm:w-10" />
              </div>
              <h1 className="font-display font-bold text-brand-cream leading-[1.05] mb-5 text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl">
                {headline}
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed max-w-xl">
                {intro}
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-12">
            {posts.length === 0 && (
              <div className="text-center py-12 text-brand-cream/40 text-sm">No posts published yet.</div>
            )}

            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-3xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/8 via-brand-black-card to-brand-purple/8 hover:border-brand-orange/40 transition-all duration-300 overflow-hidden"
              >
                {featured.coverImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={resolveMediaRef(featured.coverImage)} alt="" className="w-full h-64 sm:h-80 object-cover" />
                )}
                <div className="p-8 sm:p-10 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-medium ${CATEGORY_COLOURS[featured.category] ?? "text-brand-cream/60 bg-white/5"}`}>
                      {featured.category}
                    </span>
                    <span className="text-brand-orange text-xs tracking-widest uppercase font-medium">Featured</span>
                  </div>
                  <h2 className="font-display font-bold text-brand-cream text-2xl sm:text-3xl lg:text-4xl leading-snug mb-4 max-w-3xl group-hover:text-brand-orange transition-colors duration-200">
                    {featured.title}
                  </h2>
                  <p className="text-brand-cream/55 text-base leading-relaxed max-w-2xl mb-6">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-brand-cream/30 tracking-wide">
                    <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recent"}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                    <span className="ml-2 text-brand-orange group-hover:translate-x-1 transition-transform inline-block">Read →</span>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                {rest.map(post => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-white/8 bg-brand-black-card hover:border-white/16 transition-all duration-300 overflow-hidden"
                  >
                    {post.coverImage && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resolveMediaRef(post.coverImage)} alt="" className="w-full h-44 object-cover" />
                    )}
                    <div className="flex flex-col flex-1 p-6 gap-4">
                      <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-medium w-fit ${CATEGORY_COLOURS[post.category] ?? "text-brand-cream/60 bg-white/5"}`}>
                        {post.category}
                      </span>
                      <h3 className="font-display font-bold text-brand-cream text-lg leading-snug group-hover:text-brand-orange transition-colors duration-200 flex-1">
                        {post.title}
                      </h3>
                      <p className="text-brand-cream/50 text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-brand-cream/30 tracking-wide pt-2 border-t border-white/5">
                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recent"}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col items-center text-center py-10 border-t border-white/5">
              <p className="text-brand-cream/30 text-sm mb-1">More stories coming soon.</p>
              <p className="text-brand-cream/20 text-xs">Follow us on Instagram for the latest from Accra.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
