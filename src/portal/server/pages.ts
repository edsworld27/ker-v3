// Server-side editor-page store (V-A). One slot per (siteId, pageId), with
// pages keyed by slug for easy lookup at the renderer side. Draft / publish
// workflow mirrors content overrides (D-2): writes go to `blocks`, publish
// snapshots into `publishedBlocks`. Revert restores from the snapshot.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type { Block, EditorPage, PortalRole } from "./types";

function makePageId(): string {
  return `page_${crypto.randomBytes(6).toString("hex")}`;
}

function ensureBucket(state: { pages: Record<string, Record<string, EditorPage>> }, siteId: string): Record<string, EditorPage> {
  if (!state.pages[siteId]) state.pages[siteId] = {};
  return state.pages[siteId];
}

export function listPages(siteId: string): EditorPage[] {
  const bucket = getState().pages[siteId] ?? {};
  return Object.values(bucket).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getPage(siteId: string, pageId: string): EditorPage | null {
  return getState().pages[siteId]?.[pageId] ?? null;
}

export function getPageBySlug(siteId: string, slug: string): EditorPage | null {
  const bucket = getState().pages[siteId] ?? {};
  for (const page of Object.values(bucket)) {
    if (page.slug === slug) return page;
  }
  return null;
}

export interface CreatePageInput {
  siteId: string;
  slug: string;
  title: string;
  description?: string;
  blocks?: Block[];
  portalRole?: PortalRole;
}

export function createPage(input: CreatePageInput): EditorPage {
  const id = makePageId();
  const page: EditorPage = {
    id,
    siteId: input.siteId,
    slug: input.slug,
    title: input.title,
    description: input.description,
    blocks: input.blocks ?? [],
    status: "draft",
    updatedAt: Date.now(),
    portalRole: input.portalRole,
  };
  mutate(state => {
    const bucket = ensureBucket(state, input.siteId);
    bucket[id] = page;
  });
  return page;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  description?: string;
  blocks?: Block[];
  themeId?: string;
  customHead?: string;
  customFoot?: string;
  seo?: EditorPage["seo"];
  layoutOverrides?: EditorPage["layoutOverrides"];
  portalRole?: PortalRole;
}

export function updatePage(siteId: string, pageId: string, patch: UpdatePageInput): EditorPage | null {
  let result: EditorPage | null = null;
  mutate(state => {
    const existing = state.pages[siteId]?.[pageId];
    if (!existing) return;
    const next: EditorPage = {
      ...existing,
      ...patch,
      blocks: patch.blocks ?? existing.blocks,
      updatedAt: Date.now(),
    };
    state.pages[siteId][pageId] = next;
    result = next;
  });
  return result;
}

export function deletePage(siteId: string, pageId: string): boolean {
  let removed = false;
  mutate(state => {
    if (state.pages[siteId]?.[pageId]) {
      delete state.pages[siteId][pageId];
      removed = true;
    }
  });
  return removed;
}

export function publishPage(siteId: string, pageId: string): EditorPage | null {
  let result: EditorPage | null = null;
  mutate(state => {
    const existing = state.pages[siteId]?.[pageId];
    if (!existing) return;
    const next: EditorPage = {
      ...existing,
      status: "published",
      publishedAt: Date.now(),
      publishedBlocks: existing.blocks,
      updatedAt: Date.now(),
    };
    state.pages[siteId][pageId] = next;
    result = next;
  });
  return result;
}

export function revertPage(siteId: string, pageId: string): EditorPage | null {
  let result: EditorPage | null = null;
  mutate(state => {
    const existing = state.pages[siteId]?.[pageId];
    if (!existing || !existing.publishedBlocks) return;
    const next: EditorPage = {
      ...existing,
      blocks: existing.publishedBlocks,
      updatedAt: Date.now(),
    };
    state.pages[siteId][pageId] = next;
    result = next;
  });
  return result;
}

// ─── Portal variants ──────────────────────────────────────────────────────
//
// Operators design customer-facing portals (login, affiliates, orders,
// account) as ordinary EditorPages with a portalRole tag. Multiple
// pages can share a role — the variant flagged isActivePortal=true is
// what the customer route renders.

export function listVariantsForPortal(siteId: string, role: PortalRole): EditorPage[] {
  const bucket = getState().pages[siteId] ?? {};
  return Object.values(bucket)
    .filter(p => p.portalRole === role)
    .sort((a, b) => Number(b.isActivePortal ?? false) - Number(a.isActivePortal ?? false) || a.title.localeCompare(b.title));
}

export function getActivePortalVariant(siteId: string, role: PortalRole): EditorPage | null {
  const bucket = getState().pages[siteId] ?? {};
  for (const page of Object.values(bucket)) {
    if (page.portalRole === role && page.isActivePortal) return page;
  }
  return null;
}

// Sets exactly one variant active for (siteId, role). Pass pageId=null
// to clear (no variant active — the customer route falls back to its
// built-in default).
export function setActivePortalVariant(siteId: string, role: PortalRole, pageId: string | null): boolean {
  let ok = false;
  mutate(state => {
    const bucket = state.pages[siteId];
    if (!bucket) return;
    // First pass: clear the flag on every variant of this role.
    for (const id of Object.keys(bucket)) {
      const page = bucket[id];
      if (page.portalRole === role && page.isActivePortal) {
        bucket[id] = { ...page, isActivePortal: false, updatedAt: Date.now() };
      }
    }
    // Second pass: set on the chosen variant (if any).
    if (pageId) {
      const target = bucket[pageId];
      if (target && target.portalRole === role) {
        bucket[pageId] = { ...target, isActivePortal: true, updatedAt: Date.now() };
        ok = true;
      }
    } else {
      ok = true;
    }
  });
  return ok;
}
