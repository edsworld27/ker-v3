"use client";

// Blog / journal store. Felicia writes, edits, and publishes posts entirely
// from the admin panel. Posts hold a rich HTML body (with embedded images,
// videos, iframes from YouTube etc.) plus metadata for SEO.
//
// TODO Database (Supabase):
//   table blog_posts (
//     id text primary key,
//     slug text unique not null,
//     title text not null,
//     excerpt text,
//     body_html text,
//     cover_image text,
//     category text,
//     author text,
//     read_time text,
//     status text,             -- draft | published | scheduled
//     published_at timestamptz,
//     scheduled_for timestamptz,
//     seo jsonb,               -- { title, description, ogImage, jsonld, canonical }
//     created_at timestamptz default now(),
//     updated_at timestamptz default now()
//   );

const STORAGE_KEY = "lk_admin_blog_v1";
const CHANGE_EVENT = "lk-admin-blog-change";

export type PostStatus = "draft" | "published" | "scheduled";

export interface BlogPostSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  jsonld?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;          // sanitised on render — admin trusts itself
  coverImage: string;        // path / data URL / media:id
  category: string;
  author: string;
  readTime: string;          // "5 min read"
  status: PostStatus;
  featured: boolean;
  publishedAt?: number;
  scheduledFor?: number;
  seo: BlogPostSeo;
  createdAt: number;
  updatedAt: number;
}

interface Store { [id: string]: BlogPost; }

function read(): Store {
  if (typeof window === "undefined") return seedIfEmpty({});
  try { return seedIfEmpty(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store); }
  catch { return seedIfEmpty({}); }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function seedIfEmpty(s: Store): Store {
  if (Object.keys(s).length > 0) return s;
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const seed: BlogPost[] = [
    {
      id: "p_seed_black_soap",
      slug: "what-is-african-black-soap",
      title: "What actually is African black soap — and why does it work so well?",
      excerpt: "Plantain ash. Cocoa pod ash. Raw shea. These aren't marketing words — they're the reason black soap has been working for centuries.",
      bodyHtml: "<p>Real African black soap starts with plantain skins, cocoa pods and palm leaves. They're sun-dried, then carefully roasted to ash in clay ovens — a process that can take a full day, and it's where the soap gets its colour, scent, and most of its mineral content.</p><p>The ash is filtered through water, mixed with raw shea butter and palm kernel oil, and left to cure for weeks. No lye is added; saponification happens slowly and the bar stays alive.</p><h2>Why it works</h2><p>The plantain ash is rich in potassium and Vitamin E. The shea butter rebuilds the lipid barrier instead of stripping it. There are no sulphates, no synthetic fragrance, and nothing to mimic oestrogen.</p><p>That's the entire formulation. Three ingredients. Centuries of practice.</p>",
      coverImage: "/images/hero/elephants.png",
      category: "Ingredients",
      author: "Felicia",
      readTime: "6 min read",
      status: "published",
      featured: true,
      publishedAt: now - day * 7,
      seo: {},
      createdAt: now - day * 14,
      updatedAt: now - day * 7,
    },
    {
      id: "p_seed_felicia",
      slug: "felicia-story",
      title: "From Accra to your bathroom: how Felicia built Odo from a single bar of soap",
      excerpt: "She started by giving bars to neighbours. Then market stalls. Then everything changed.",
      bodyHtml: "<p>Felicia learned to make soap on her grandmother's veranda in Kumasi. The first bars she sold were given away as gifts to neighbours; the second batch she pressed into squares and sold from a wicker basket at the corner of Oxford Street in Accra.</p><p>What started as a way to keep her grandmother's recipe alive is now a co-operative of fifteen women across Greater Accra and the Upper West Region.</p>",
      coverImage: "",
      category: "Our Story",
      author: "Editorial",
      readTime: "8 min read",
      status: "published",
      featured: false,
      publishedAt: now - day * 30,
      seo: {},
      createdAt: now - day * 35,
      updatedAt: now - day * 30,
    },
  ];
  const next: Store = {};
  seed.forEach(p => { next[p.id] = p; });
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listPosts(opts: { status?: PostStatus | "all" } = {}): BlogPost[] {
  const all = Object.values(read()).sort((a, b) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt));
  if (!opts.status || opts.status === "all") return all;
  return all.filter(p => p.status === opts.status);
}

export function listPublished(): BlogPost[] {
  const now = Date.now();
  return listPosts().filter(p => p.status === "published" || (p.status === "scheduled" && (p.scheduledFor ?? Infinity) <= now));
}

export function getPost(id: string): BlogPost | null {
  return read()[id] ?? null;
}

export function getPostBySlug(slug: string): BlogPost | null {
  return Object.values(read()).find(p => p.slug === slug) ?? null;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function uniqueSlug(base: string, ignoreId?: string): string {
  const used = new Set(Object.values(read()).filter(p => p.id !== ignoreId).map(p => p.slug));
  let s = base || "post";
  let i = 1;
  while (used.has(s)) s = `${base}-${++i}`;
  return s;
}

export function createPost(seed: Partial<BlogPost> = {}): BlogPost {
  const now = Date.now();
  const title = seed.title ?? "Untitled post";
  const post: BlogPost = {
    id: `p_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    slug: uniqueSlug(seed.slug ?? slugify(title)),
    title,
    excerpt: seed.excerpt ?? "",
    bodyHtml: seed.bodyHtml ?? "",
    coverImage: seed.coverImage ?? "",
    category: seed.category ?? "Journal",
    author: seed.author ?? "Felicia",
    readTime: seed.readTime ?? "3 min read",
    status: seed.status ?? "draft",
    featured: seed.featured ?? false,
    publishedAt: seed.publishedAt,
    scheduledFor: seed.scheduledFor,
    seo: seed.seo ?? {},
    createdAt: now,
    updatedAt: now,
  };
  const s = read();
  s[post.id] = post;
  write(s);
  return post;
}

export function updatePost(id: string, patch: Partial<BlogPost>) {
  const s = read();
  const cur = s[id];
  if (!cur) return;
  const slug = patch.slug && patch.slug !== cur.slug ? uniqueSlug(slugify(patch.slug), id) : cur.slug;
  s[id] = { ...cur, ...patch, slug, updatedAt: Date.now() };
  write(s);
}

export function publishPost(id: string) {
  updatePost(id, { status: "published", publishedAt: Date.now() });
}

export function unpublishPost(id: string) {
  updatePost(id, { status: "draft" });
}

export function deletePost(id: string) {
  const s = read();
  delete s[id];
  write(s);
}

export function setFeatured(id: string) {
  const s = read();
  if (!s[id]) return;
  for (const p of Object.values(s)) p.featured = false;
  s[id].featured = true;
  write(s);
}

export function onBlogChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
