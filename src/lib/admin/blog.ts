// Blog / journal store. Felicia writes, edits, and publishes posts entirely
// from the admin panel. Posts hold a rich HTML body (with embedded images,
// videos, iframes from YouTube etc.) plus metadata for SEO.
//
// This module is intentionally NOT marked "use client" — every IO function
// guards on `typeof window`. That makes the SSR-only seed data importable
// from server route handlers (e.g. /blog/rss.xml) without breaking client
// code that mutates the localStorage-backed store.
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
  coverImage: string;        // path / data URL / media:id (a.k.a. featured image)
  category: string;
  author: string;
  readTime: string;          // "5 min read" — auto-derived if blank
  tags: string[];            // free-form tag chips
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
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store;
    return migrate(seedIfEmpty(raw));
  } catch { return migrate(seedIfEmpty({})); }
}

// Back-fill any new fields onto older posts read from localStorage. Cheap;
// keeps the store forward-compatible without forcing the user to re-save.
function migrate(s: Store): Store {
  let dirty = false;
  for (const id of Object.keys(s)) {
    const p = s[id] as Partial<BlogPost>;
    if (!Array.isArray(p.tags)) { p.tags = []; dirty = true; }
  }
  if (dirty && typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  return s;
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Default seed data — exported so server-side route handlers (RSS feed,
// future sitemap, OG generators) can fall back to it when localStorage
// (the live edit store) isn't available.
export function defaultSeedPosts(nowMs: number = Date.now()): BlogPost[] {
  const now = nowMs;
  const day = 1000 * 60 * 60 * 24;
  return [
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
      tags: ["black soap", "ingredients", "skincare"],
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
      tags: ["our story", "accra"],
      status: "published",
      featured: false,
      publishedAt: now - day * 30,
      seo: {},
      createdAt: now - day * 35,
      updatedAt: now - day * 30,
    },
  ];
}

function seedIfEmpty(s: Store): Store {
  if (Object.keys(s).length > 0) return s;
  const seed = defaultSeedPosts();
  const next: Store = {};
  seed.forEach(p => { next[p.id] = p; });
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

// effectiveStatus folds time-of-read into the persisted status. A post saved
// as "scheduled" with scheduledFor in the past is treated as "published" by
// every consumer (storefront, RSS, listings) — no cron needed.
export function effectiveStatus(post: BlogPost, nowMs: number = Date.now()): PostStatus {
  if (post.status === "scheduled" && post.scheduledFor != null && post.scheduledFor <= nowMs) {
    return "published";
  }
  return post.status;
}

export function listPosts(opts: { status?: PostStatus | "all" } = {}): BlogPost[] {
  const now = Date.now();
  const all = Object.values(read()).sort((a, b) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt));
  if (!opts.status || opts.status === "all") return all;
  return all.filter(p => effectiveStatus(p, now) === opts.status);
}

// Public-facing list: only posts whose effective status is "published",
// sorted newest-first by publishedAt (fallback to scheduledFor / updatedAt).
export function listPublished(): BlogPost[] {
  const now = Date.now();
  return Object.values(read())
    .filter(p => effectiveStatus(p, now) === "published")
    .sort((a, b) => {
      const av = a.publishedAt ?? a.scheduledFor ?? a.updatedAt;
      const bv = b.publishedAt ?? b.scheduledFor ?? b.updatedAt;
      return bv - av;
    });
}

// Alias matching the spec ("listPublishedPosts").
export const listPublishedPosts = listPublished;

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
    tags: seed.tags ?? [],
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
  // Publishing now clears any future-dated schedule.
  updatePost(id, { status: "published", publishedAt: Date.now(), scheduledFor: undefined });
}

export function unpublishPost(id: string) {
  updatePost(id, { status: "draft" });
}

// Renamed to avoid colliding with `saveDraft` in admin/theme.ts when both
// modules are re-exported from src/portal/website/index.ts.
export function saveBlogDraft(id: string) {
  updatePost(id, { status: "draft", scheduledFor: undefined });
}

export function schedulePost(id: string, whenMs: number) {
  updatePost(id, { status: "scheduled", scheduledFor: whenMs, publishedAt: undefined });
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

// Strip HTML tags / markdown decoration and count whitespace-separated words.
// Cheap; works for the editor's word-count UI and the reading-time estimate.
export function wordCount(body: string): number {
  if (!body) return 0;
  const text = body
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

// Average adult reading speed ~225 wpm; clamp to a 1-min minimum.
export function estimatedReadTime(body: string): { minutes: number; label: string } {
  const words = wordCount(body);
  const minutes = Math.max(1, Math.round(words / 225));
  return { minutes, label: `${minutes} min read` };
}

// Comma-separated input → trimmed, lowercased, deduplicated tag list.
export function parseTags(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const t = part.trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
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
