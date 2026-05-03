"use client";

// Admin-managed reviews. Storefront merges these on top of the static
// reviews defined inline in src/lib/products.ts and src/lib/reviews.ts.
//
// TODO Database (Supabase):
//   table reviews (
//     id text primary key,
//     product_slug text,           -- can be "*" for global testimonial
//     name text,
//     location text,
//     stars int,
//     title text,
//     body text,
//     created_at timestamptz default now(),
//     featured boolean default false,
//     hidden boolean default false
//   );

const STORAGE_KEY = "lk_admin_reviews_v1";
const CHANGE_EVENT = "lk-admin-reviews-change";

export interface AdminReview {
  id: string;
  productSlug: string;     // product slug, or "*" for site-wide testimonial
  name: string;
  location: string;
  stars: number;           // 1–5
  title?: string;          // optional headline
  body: string;
  createdAt: number;
  featured?: boolean;
  hidden?: boolean;
}

function read(): AdminReview[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function write(reviews: AdminReview[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listReviews(): AdminReview[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getReviewsForProduct(slug: string): AdminReview[] {
  return read().filter(r => !r.hidden && (r.productSlug === slug || r.productSlug === "*"));
}

export function getGlobalReviews(): AdminReview[] {
  return read().filter(r => !r.hidden && r.productSlug === "*");
}

export function upsertReview(review: AdminReview) {
  const all = read();
  const idx = all.findIndex(r => r.id === review.id);
  if (idx >= 0) all[idx] = review;
  else all.push(review);
  write(all);
}

export function deleteReview(id: string) {
  write(read().filter(r => r.id !== id));
}

export function nextReviewId(): string {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function onReviewsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
