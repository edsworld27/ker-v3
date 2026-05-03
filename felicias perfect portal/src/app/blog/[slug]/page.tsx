"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  // Body may be HTML (admin's RichEditor output) or, for posts authored
  // elsewhere, raw markdown. We detect markdown heuristically and run a
  // tiny in-file converter so both render.
  const renderedBody = useMemo(() => {
    if (!post) return "";
    return looksLikeHtml(post.bodyHtml) ? post.bodyHtml : renderMarkdown(post.bodyHtml);
  }, [post?.bodyHtml]);

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
  const heroImage = post.coverImage ? resolveMediaRef(post.coverImage) : undefined;
  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seo.description ?? post.excerpt,
    image: heroImage,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    author: { "@type": "Person", name: post.author || "The Luv & Ker team" },
    publisher: { "@type": "Organization", name: "Luv & Ker" },
    keywords: post.tags && post.tags.length ? post.tags.join(", ") : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `/blog/${post.slug}` },
  };
  // Strip undefined keys so the schema stays clean.
  for (const k of Object.keys(articleSchema)) if (articleSchema[k] === undefined) delete articleSchema[k];

  const byline = post.author?.trim() ? post.author : "The Luv & Ker team";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.jsonld || JSON.stringify(articleSchema) }} />
      <Navbar />
      <main className="w-full pt-20 sm:pt-24 bg-brand-black">
        <article>
          {/* Hero */}
          <header className="w-full bg-brand-black-soft border-b border-white/5">
            <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
              <Link href="/blog" className="inline-flex items-center gap-2 text-xs text-brand-cream/40 hover:text-brand-cream transition-colors">
                <span aria-hidden>←</span> Back to blog
              </Link>
              <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mt-6 mb-3">{post.category}</p>
              <h1 className="font-display font-bold text-brand-cream text-3xl sm:text-4xl xl:text-5xl leading-tight mb-5">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-brand-cream/60 text-base sm:text-lg leading-relaxed mb-6">{post.excerpt}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(t => (
                    <span key={t} className="text-[10px] tracking-wide px-2.5 py-1 rounded-full bg-brand-amber/10 text-brand-amber border border-brand-amber/20">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-brand-cream/40 flex-wrap">
                <span className="text-brand-cream/65 font-medium">{byline}</span>
                <span>·</span>
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : "Recent"}
                </span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>

          {heroImage && (
            <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 -mt-2 sm:-mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" className="w-full rounded-2xl border border-white/5 object-cover max-h-[28rem]" />
            </div>
          )}

          {/* Body */}
          <div className="max-w-2xl mx-auto px-6 sm:px-10 lg:px-12 py-14 sm:py-20">
            <div
              className="prose-blog text-brand-cream/80 text-base sm:text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedBody }}
            />

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
              <Link href="/blog" className="text-xs text-brand-cream/45 hover:text-brand-cream inline-flex items-center gap-2">
                <span aria-hidden>←</span> Back to blog
              </Link>
              <a href="/blog/rss.xml" className="text-[11px] tracking-[0.18em] uppercase text-brand-amber/70 hover:text-brand-amber">
                Subscribe via RSS
              </a>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <aside className="w-full bg-brand-black-soft border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-20">
              <h2 className="font-display text-2xl sm:text-3xl text-brand-cream mb-6">More like this</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        .prose-blog h1 { font-family: var(--font-playfair); font-size: 2rem; font-weight: 700; margin: 2.25rem 0 1rem; color: #f5e9d4; }
        .prose-blog h2 { font-family: var(--font-playfair); font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; color: #f5e9d4; }
        .prose-blog h3 { font-family: var(--font-playfair); font-size: 1.35rem; font-weight: 600; margin: 1.75rem 0 0.75rem; color: #f5e9d4; }
        .prose-blog p { margin: 1rem 0; }
        .prose-blog ul, .prose-blog ol { padding-left: 1.5rem; margin: 1rem 0; }
        .prose-blog blockquote { border-left: 3px solid #ff6b35; padding-left: 1rem; color: rgba(245,233,212,0.65); font-style: italic; margin: 1.5rem 0; }
        .prose-blog a { color: #ff6b35; text-decoration: underline; }
        .prose-blog img { border-radius: 12px; margin: 1.5rem 0; }
        .prose-blog code { background: rgba(255,255,255,0.06); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
      `}</style>
    </>
  );
}

// HTML detection: if the body has a leading tag, treat it as HTML. The admin
// editor always emits HTML so this is the common path.
function looksLikeHtml(s: string): boolean {
  return /<\/?(p|h[1-6]|div|ul|ol|li|figure|img|iframe|blockquote|table)[\s>]/i.test(s);
}

// Tiny markdown renderer — handles the subset the brief calls out
// (#/##/### headings, paragraphs, **bold**, *italic*, [text](url), `inline code`).
// No new dep; deliberately minimal because the admin authors write HTML.
function renderMarkdown(src: string): string {
  if (!src) return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const blocks = src.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html: string[] = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    // Headings (# / ## / ### at line start).
    const h = block.match(/^(#{1,3})\s+(.+)$/m);
    if (h && block === h[0]) {
      const level = h[1].length;
      html.push(`<h${level}>${inline(escape(h[2]))}</h${level}>`);
      continue;
    }

    // Default: paragraph. Single newlines inside a paragraph become spaces.
    html.push(`<p>${inline(escape(block.replace(/\n/g, " ")))}</p>`);
  }

  return html.join("\n");

  function inline(text: string): string {
    // Inline code first (so its contents aren't re-formatted).
    text = text.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
    // Links [text](url). Only http(s) and / paths allowed for safety.
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      (_m, label, url) => `<a href="${url}">${label}</a>`);
    // Bold **text** (run before italic so the asterisks pair correctly).
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Italic *text*.
    text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    return text;
  }
}
