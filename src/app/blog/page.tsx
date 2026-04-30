"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContent } from "@/lib/useContent";

interface Post {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    slug: "what-is-african-black-soap",
    category: "Ingredients",
    title: "What actually is African black soap — and why does it work so well?",
    excerpt: "Plantain ash. Cocoa pod ash. Raw shea. These aren't marketing words — they're the reason black soap has been working for centuries. We break down the chemistry.",
    date: "April 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "felicia-story",
    category: "Our Story",
    title: "From Accra to your bathroom: how Felicia built Odo from a single bar of soap",
    excerpt: "She started by giving bars to neighbours. Then market stalls. Then everything changed. This is the story Felicia doesn't tell enough.",
    date: "March 2026",
    readTime: "8 min read",
  },
  {
    slug: "sulphate-free-explained",
    category: "Skin Education",
    title: "SLS, SLES, and sulphate-free: what the labels actually mean for your skin",
    excerpt: "Most high-street soaps strip your skin barrier every time you wash. Here's why, and what to look for instead.",
    date: "March 2026",
    readTime: "5 min read",
  },
  {
    slug: "shea-butter-northern-ghana",
    category: "Sourcing",
    title: "Inside the shea farms of northern Ghana — where our shea butter comes from",
    excerpt: "We visited the women-led cooperatives in the Upper West Region who supply every bar we make. This is what we found.",
    date: "February 2026",
    readTime: "7 min read",
  },
  {
    slug: "black-soap-for-men",
    category: "Nkrabea",
    title: "Why black soap is the best thing men can put on their skin",
    excerpt: "Stronger, thicker skin still needs cleansing without stripping. Here's how the Nkrabea range approaches the problem differently.",
    date: "February 2026",
    readTime: "4 min read",
  },
  {
    slug: "zero-waste-packaging",
    category: "Sustainability",
    title: "How we get to zero-waste packaging — and what it actually costs us",
    excerpt: "Kraft paper, compostable wraps, refill sachets. We're honest about the trade-offs and why we think it's worth it.",
    date: "January 2026",
    readTime: "5 min read",
  },
];

const CATEGORY_COLOURS: Record<string, string> = {
  "Ingredients":    "text-brand-amber bg-brand-amber/10",
  "Our Story":      "text-brand-orange bg-brand-orange/10",
  "Skin Education": "text-brand-purple-light bg-brand-purple/10",
  "Sourcing":       "text-green-400 bg-green-400/10",
  "Nkrabea":        "text-brand-amber bg-brand-amber/10",
  "Sustainability": "text-teal-400 bg-teal-400/10",
};

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const eyebrow  = useContent("blog.hero.eyebrow",  "Journal");
  const headline = useContent("blog.hero.headline", "The Luv & Ker Journal");
  const intro    = useContent("blog.hero.intro",    "Stories, ingredients, sourcing, and skin — written by the people who make the soap.");
  const rest = POSTS.filter(p => !p.featured);

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-brand-black">

        {/* Hero */}
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

            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-3xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/8 via-brand-black-card to-brand-purple/8 hover:border-brand-orange/40 transition-all duration-300 overflow-hidden"
              >
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
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                    <span className="ml-2 text-brand-orange group-hover:translate-x-1 transition-transform inline-block">Read →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Post grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
              {rest.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/8 bg-brand-black-card hover:border-white/16 transition-all duration-300 overflow-hidden"
                >
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
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Coming soon nudge */}
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
