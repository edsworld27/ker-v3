// Search index — backs the Search plugin.
//
// Lightweight in-process inverted index. Indexes title + body +
// tags. Refreshed lazily — first query rebuilds the index, then
// every change to the underlying source emits a "search.invalidate"
// event (handled here) so the next query rebuilds again.

import "server-only";
import { getState } from "./storage";
import { on } from "./eventBus";

export interface SearchDocument {
  id: string;
  orgId: string;
  type: "page" | "product" | "blog-post" | "kb-article";
  title: string;
  url: string;
  body: string;
  tags?: string[];
  publishedAt?: number;
}

export interface SearchHit {
  doc: SearchDocument;
  score: number;
  snippet?: string;
}

interface IndexState {
  searchDocs?: Record<string, SearchDocument[]>;     // orgId → docs
}

// ─── Index management ─────────────────────────────────────────────────────

export function indexDocument(doc: SearchDocument): void {
  const state = getState() as unknown as IndexState;
  if (!state.searchDocs) state.searchDocs = {};
  if (!state.searchDocs[doc.orgId]) state.searchDocs[doc.orgId] = [];
  const list = state.searchDocs[doc.orgId];
  const existing = list.findIndex(d => d.id === doc.id);
  if (existing >= 0) list[existing] = doc;
  else list.push(doc);
}

export function removeDocument(orgId: string, id: string): void {
  const state = getState() as unknown as IndexState;
  if (!state.searchDocs?.[orgId]) return;
  state.searchDocs[orgId] = state.searchDocs[orgId].filter(d => d.id !== id);
}

export function clearIndex(orgId: string): void {
  const state = getState() as unknown as IndexState;
  if (!state.searchDocs) return;
  delete state.searchDocs[orgId];
}

// ─── Querying ─────────────────────────────────────────────────────────────

const STOP_WORDS = new Set(["a", "an", "and", "or", "the", "is", "of", "to", "for", "in", "on", "at", "by", "with"]);

function tokenise(s: string): string[] {
  return s.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
}

export interface SearchOptions {
  orgId: string;
  query: string;
  type?: SearchDocument["type"];
  limit?: number;
  fuzzy?: boolean;
}

export function search(opts: SearchOptions): SearchHit[] {
  const state = getState() as unknown as IndexState;
  const docs = state.searchDocs?.[opts.orgId] ?? [];
  const filtered = opts.type ? docs.filter(d => d.type === opts.type) : docs;
  const queryTokens = tokenise(opts.query);
  if (queryTokens.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const doc of filtered) {
    const titleTokens = new Set(tokenise(doc.title));
    const bodyTokens  = new Set(tokenise(doc.body));
    const tagTokens   = new Set((doc.tags ?? []).flatMap(tokenise));
    let score = 0;
    let matched = 0;
    for (const q of queryTokens) {
      if (titleTokens.has(q)) { score += 5; matched++; }
      else if (tagTokens.has(q)) { score += 3; matched++; }
      else if (bodyTokens.has(q)) { score += 1; matched++; }
      else if (opts.fuzzy) {
        // Substring match for fuzzy fallback.
        if (doc.title.toLowerCase().includes(q)) { score += 2; matched++; }
        else if (doc.body.toLowerCase().includes(q)) { score += 0.5; matched++; }
      }
    }
    if (matched === 0) continue;
    // Boost docs that match all query tokens.
    if (matched === queryTokens.length) score += 5;
    hits.push({ doc, score, snippet: makeSnippet(doc.body, queryTokens) });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, opts.limit ?? 50);
}

function makeSnippet(body: string, tokens: string[], radius = 80): string {
  const lower = body.toLowerCase();
  for (const t of tokens) {
    const idx = lower.indexOf(t);
    if (idx < 0) continue;
    const start = Math.max(0, idx - radius);
    const end = Math.min(body.length, idx + t.length + radius);
    return (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
  }
  return body.slice(0, radius * 2) + (body.length > radius * 2 ? "…" : "");
}

// ─── Auto-invalidation ────────────────────────────────────────────────────

let bound = false;
export function bindSearchIndex(): void {
  if (bound) return;
  bound = true;
  on("page.published", event => {
    // The page's slug + content arrives in the payload — index it.
    const p = event.payload as Partial<SearchDocument>;
    if (p && typeof p.id === "string" && typeof p.title === "string" && typeof p.url === "string" && typeof p.body === "string") {
      indexDocument({ ...p, orgId: event.orgId, type: p.type ?? "page" } as SearchDocument);
    }
  });
  on("blog.post.published", event => {
    const p = event.payload as Partial<SearchDocument>;
    if (p && typeof p.id === "string") {
      indexDocument({ ...p, orgId: event.orgId, type: "blog-post" } as SearchDocument);
    }
  });
}

bindSearchIndex();
