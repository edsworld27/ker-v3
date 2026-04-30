"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, listPublished, onBlogChange, type BlogPost } from "@/lib/admin/blog";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";

export default function BlogPostPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    const refresh = () => {
      const p = getPostBySlug(slug);
      setPost(p);
      if (p) {
        setRelated(listPublished().filter(x => x.id !== p.id && x.category === p.category).slice(0, 3));
      }
    };
    refresh();
    const o1 = onBlogChange(refresh);
    const o2 = onMediaChange(refresh);
    return () => { o1(); o2(); };
  }, [slug]);

  if (post === undefined) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black" />
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">404</p>
            <h1 className="font-display text-3xl text-brand-cream mb-3">Post not found</h1>
            <p className="text-brand-cream/60 mb-6 text-sm">It may have been unpublished or the URL was mistyped.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold">← Back to journal</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const seo = post.seo ?? {};
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seo.description ?? post.excerpt,
    image: post.coverImage ? resolveMediaRef(post.coverImage) : undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    author: { "@type": "Person", name: post.author },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.jsonld || JSON.stringify(articleSchema) }} />
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black">
        <article>
          {/* Hero */}
          <header className="w-full bg-brand-black-soft border-b border-white/5">
            <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
              <Link href="/blog" className="text-xs text-brand-cream/40 hover:text-brand-cream">← Journal</Link>
              <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mt-6 mb-3">{post.category}</p>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-5">
                {post.title}
              </h1>
              <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed mb-6">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-brand-cream/40">
                <span className="text-brand-cream/65">{post.author}</span>
                <span>·</span>
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Recent"}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>

          {post.coverImage && (
            <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 -mt-2 sm:-mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveMediaRef(post.coverImage)} alt="" className="w-full rounded-2xl border border-white/5 object-cover max-h-[28rem]" />
            </div>
          )}

          {/* Body */}
          <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
            <div
              className="prose-blog text-brand-cream/80 text-base sm:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </div>
        </article>

        {related.length > 0 && (
          <aside className="w-full bg-brand-black-soft border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-20">
              <h2 className="font-display text-2xl sm:text-3xl text-brand-cream mb-6">More like this</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map(p => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="block rounded-2xl border border-white/8 bg-brand-black-card hover:border-white/16 p-5 transition-colors">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/45 mb-2">{p.category}</p>
                    <h3 className="font-display text-brand-cream font-semibold leading-snug mb-2">{p.title}</h3>
                    <p className="text-xs text-brand-cream/50 line-clamp-2">{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </main>
      <Footer />

      <style jsx global>{`
        .prose-blog h2 { font-family: var(--font-playfair); font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; color: #f5e9d4; }
        .prose-blog h3 { font-family: var(--font-playfair); font-size: 1.35rem; font-weight: 600; margin: 1.75rem 0 0.75rem; color: #f5e9d4; }
        .prose-blog p { margin: 1rem 0; }
        .prose-blog ul, .prose-blog ol { padding-left: 1.5rem; margin: 1rem 0; }
        .prose-blog blockquote { border-left: 3px solid #ff6b35; padding-left: 1rem; color: rgba(245,233,212,0.65); font-style: italic; margin: 1.5rem 0; }
        .prose-blog a { color: #ff6b35; text-decoration: underline; }
        .prose-blog img { border-radius: 12px; margin: 1.5rem 0; }
      `}</style>
    </>
  );
}
