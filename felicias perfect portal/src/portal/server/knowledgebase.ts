// Knowledge base runtime — backs the KB plugin.
//
// Articles organised by category, with vote totals and a published
// flag. Auto-indexes into the Search plugin's index when published
// (via the page.published event the Search plugin already listens to).

import "server-only";
import { getState, mutate } from "./storage";
import { emit } from "./eventBus";

export interface KBCategory {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: number;
}

export interface KBArticle {
  id: string;
  orgId: string;
  categoryId: string;
  title: string;
  slug: string;
  body: string;                // markdown
  published: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

interface KBState {
  kbCategories?: KBCategory[];
  kbArticles?: KBArticle[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
}

// ─── Categories ────────────────────────────────────────────────────────────

export function listCategories(orgId: string): KBCategory[] {
  const s = getState() as unknown as KBState;
  return (s.kbCategories ?? [])
    .filter(c => c.orgId === orgId)
    .sort((a, b) => a.order - b.order);
}

export function createCategory(orgId: string, name: string, description?: string): KBCategory {
  const c: KBCategory = {
    id: makeId("kbc"),
    orgId,
    name,
    slug: slugify(name),
    description,
    order: listCategories(orgId).length,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as KBState;
    if (!s.kbCategories) s.kbCategories = [];
    s.kbCategories.push(c);
  });
  return c;
}

// ─── Articles ──────────────────────────────────────────────────────────────

export function listArticles(orgId: string, categoryId?: string, publishedOnly = false): KBArticle[] {
  const s = getState() as unknown as KBState;
  return (s.kbArticles ?? [])
    .filter(a => a.orgId === orgId &&
      (!categoryId || a.categoryId === categoryId) &&
      (!publishedOnly || a.published))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getArticle(orgId: string, slug: string): KBArticle | undefined {
  return listArticles(orgId).find(a => a.slug === slug);
}

export interface CreateArticleInput {
  orgId: string;
  categoryId: string;
  title: string;
  body: string;
}

export function createArticle(input: CreateArticleInput): KBArticle {
  const a: KBArticle = {
    id: makeId("kba"),
    orgId: input.orgId,
    categoryId: input.categoryId,
    title: input.title,
    slug: slugify(input.title),
    body: input.body,
    published: false,
    upvotes: 0,
    downvotes: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as KBState;
    if (!s.kbArticles) s.kbArticles = [];
    s.kbArticles.push(a);
  });
  return a;
}

export function publishArticle(orgId: string, id: string): void {
  let publishedArticle: KBArticle | undefined;
  mutate(state => {
    const s = state as unknown as KBState;
    const a = (s.kbArticles ?? []).find(x => x.orgId === orgId && x.id === id);
    if (a) {
      a.published = true;
      a.publishedAt = Date.now();
      a.updatedAt = Date.now();
      publishedArticle = a;
    }
  });
  // Hand off to the Search plugin via the event bus — its index
  // listener will pick up the published article without us needing
  // to call indexDocument here.
  if (publishedArticle) {
    emit(orgId, "blog.post.published", {
      id: publishedArticle.id,
      title: publishedArticle.title,
      url: `/help/${publishedArticle.slug}`,
      body: publishedArticle.body,
      type: "kb-article",
    });
  }
}

export function voteArticle(orgId: string, id: string, direction: "up" | "down"): void {
  mutate(state => {
    const s = state as unknown as KBState;
    const a = (s.kbArticles ?? []).find(x => x.orgId === orgId && x.id === id);
    if (!a) return;
    if (direction === "up") a.upvotes++;
    else a.downvotes++;
  });
}
