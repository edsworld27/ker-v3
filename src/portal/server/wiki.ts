// Wiki runtime — backs the Wiki plugin.
// Pages with revision history. Pages keyed by org + slug.
// Each save creates a Revision record so previous versions
// can be diffed and restored.

import "server-only";
import { getState, mutate } from "./storage";

export interface WikiPage {
  id: string;
  orgId: string;
  slug: string;
  title: string;
  body: string;             // markdown
  parentSlug?: string;      // for sidebar tree nesting
  authorEmail?: string;
  createdAt: number;
  updatedAt: number;
  revisionCount: number;
}

export interface WikiRevision {
  id: string;
  orgId: string;
  pageId: string;
  body: string;
  authorEmail?: string;
  createdAt: number;
}

interface WikiState {
  wikiPages?: WikiPage[];
  wikiRevisions?: WikiRevision[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
}

// ─── Pages ─────────────────────────────────────────────────────────────────

export function listWikiPages(orgId: string): WikiPage[] {
  const s = getState() as unknown as WikiState;
  return (s.wikiPages ?? [])
    .filter(p => p.orgId === orgId)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getWikiPage(orgId: string, slug: string): WikiPage | undefined {
  return listWikiPages(orgId).find(p => p.slug === slug);
}

export interface UpsertWikiInput {
  orgId: string;
  title: string;
  body: string;
  parentSlug?: string;
  authorEmail?: string;
  slug?: string;             // explicit override; otherwise auto from title
}

export function upsertWikiPage(input: UpsertWikiInput): WikiPage {
  const slug = input.slug ?? slugify(input.title);
  let result!: WikiPage;
  mutate(state => {
    const s = state as unknown as WikiState;
    if (!s.wikiPages) s.wikiPages = [];
    if (!s.wikiRevisions) s.wikiRevisions = [];

    const existing = s.wikiPages.find(p => p.orgId === input.orgId && p.slug === slug);
    if (existing) {
      // Snapshot the previous body before overwriting.
      s.wikiRevisions.push({
        id: makeId("rev"),
        orgId: input.orgId,
        pageId: existing.id,
        body: existing.body,
        authorEmail: existing.authorEmail,
        createdAt: existing.updatedAt,
      });
      existing.title = input.title;
      existing.body = input.body;
      existing.parentSlug = input.parentSlug ?? existing.parentSlug;
      existing.authorEmail = input.authorEmail ?? existing.authorEmail;
      existing.updatedAt = Date.now();
      existing.revisionCount++;
      result = existing;
      return;
    }
    result = {
      id: makeId("wp"),
      orgId: input.orgId,
      slug,
      title: input.title,
      body: input.body,
      parentSlug: input.parentSlug,
      authorEmail: input.authorEmail,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      revisionCount: 0,
    };
    s.wikiPages.push(result);
  });
  return result;
}

export function deleteWikiPage(orgId: string, slug: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as WikiState;
    if (!s.wikiPages) return;
    const before = s.wikiPages.length;
    s.wikiPages = s.wikiPages.filter(p => !(p.orgId === orgId && p.slug === slug));
    removed = s.wikiPages.length < before;
  });
  return removed;
}

export function listRevisions(orgId: string, pageId: string): WikiRevision[] {
  const s = getState() as unknown as WikiState;
  return (s.wikiRevisions ?? [])
    .filter(r => r.orgId === orgId && r.pageId === pageId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
