"use client";

// Custom page builder. Felicia can create new pages from the admin panel —
// each page is a sequence of typed blocks (hero, rich text, image, gallery,
// quote, embed, divider, CTA). Public route /p/[slug] renders them.
//
// TODO Database (Supabase):
//   table custom_pages (id text pk, slug text unique, title text, status text,
//     blocks jsonb, seo jsonb, created_at, updated_at);

const STORAGE_KEY = "lk_admin_pages_v1";
const CHANGE_EVENT = "lk-admin-pages-change";

export type BlockType = "hero" | "richText" | "image" | "gallery" | "quote" | "embed" | "divider" | "cta" | "html";

export interface BlockHero      { type: "hero"; eyebrow?: string; title: string; intro?: string; image?: string; }
export interface BlockRichText  { type: "richText"; html: string; }
export interface BlockImage     { type: "image"; src: string; caption?: string; alt?: string; }
export interface BlockGallery   { type: "gallery"; images: { src: string; alt?: string }[]; }
export interface BlockQuote     { type: "quote"; quote: string; attribution?: string; }
export interface BlockEmbed     { type: "embed"; url: string; caption?: string; }
export interface BlockDivider   { type: "divider"; }
export interface BlockCta       { type: "cta"; headline: string; subhead?: string; buttonLabel: string; buttonHref: string; }
export interface BlockHtml      { type: "html"; html: string; }

export type Block = (BlockHero | BlockRichText | BlockImage | BlockGallery | BlockQuote | BlockEmbed | BlockDivider | BlockCta | BlockHtml) & { id: string };

export type PageStatus = "draft" | "published";

export interface CustomPageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  jsonld?: string;
  canonical?: string;
  robots?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  hidden?: boolean;
  blocks: Block[];
  seo: CustomPageSeo;
  showInNav: boolean;
  navLabel?: string;
  createdAt: number;
  updatedAt: number;
}

interface Store { [id: string]: CustomPage; }

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store; }
  catch { return {}; }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function bid() { return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`; }
function pid() { return `pg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`; }

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function uniqueSlug(base: string, ignoreId?: string): string {
  const used = new Set(Object.values(read()).filter(p => p.id !== ignoreId).map(p => p.slug));
  let s = base || "page";
  let i = 1;
  while (used.has(s)) s = `${base}-${++i}`;
  return s;
}

export function listPages(): CustomPage[] {
  return Object.values(read()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listPublishedNavPages(): CustomPage[] {
  return listPages().filter(p => p.status === "published" && p.showInNav);
}

export function getPage(id: string): CustomPage | null {
  return read()[id] ?? null;
}

export function getPageBySlug(slug: string): CustomPage | null {
  return Object.values(read()).find(p => p.slug === slug) ?? null;
}

export function createPage(title = "Untitled page"): CustomPage {
  const now = Date.now();
  const page: CustomPage = {
    id: pid(),
    slug: uniqueSlug(slugify(title)),
    title,
    status: "draft",
    blocks: [
      { id: bid(), type: "hero", title, intro: "" },
    ],
    seo: {},
    showInNav: false,
    createdAt: now,
    updatedAt: now,
  };
  const s = read();
  s[page.id] = page;
  write(s);
  return page;
}

export function updatePage(id: string, patch: Partial<CustomPage>) {
  const s = read();
  const cur = s[id];
  if (!cur) return;
  const slug = patch.slug && patch.slug !== cur.slug ? uniqueSlug(slugify(patch.slug), id) : cur.slug;
  s[id] = { ...cur, ...patch, slug, updatedAt: Date.now() };
  write(s);
}

export function deletePage(id: string) {
  const s = read();
  delete s[id];
  write(s);
}

export function addBlock(pageId: string, type: BlockType): Block | null {
  const s = read();
  const p = s[pageId];
  if (!p) return null;
  let block: Block;
  switch (type) {
    case "hero":     block = { id: bid(), type, title: "Heading" }; break;
    case "richText": block = { id: bid(), type, html: "<p>Write something…</p>" }; break;
    case "image":    block = { id: bid(), type, src: "" }; break;
    case "gallery":  block = { id: bid(), type, images: [] }; break;
    case "quote":    block = { id: bid(), type, quote: "" }; break;
    case "embed":    block = { id: bid(), type, url: "" }; break;
    case "divider":  block = { id: bid(), type }; break;
    case "cta":      block = { id: bid(), type, headline: "Ready?", buttonLabel: "Shop", buttonHref: "/#shop" }; break;
    case "html":     block = { id: bid(), type, html: "" }; break;
  }
  p.blocks.push(block);
  p.updatedAt = Date.now();
  write(s);
  return block;
}

export function updateBlock(pageId: string, blockId: string, patch: Partial<Block>) {
  const s = read();
  const p = s[pageId];
  if (!p) return;
  const i = p.blocks.findIndex(b => b.id === blockId);
  if (i < 0) return;
  p.blocks[i] = { ...p.blocks[i], ...patch } as Block;
  p.updatedAt = Date.now();
  write(s);
}

export function deleteBlock(pageId: string, blockId: string) {
  const s = read();
  const p = s[pageId];
  if (!p) return;
  p.blocks = p.blocks.filter(b => b.id !== blockId);
  p.updatedAt = Date.now();
  write(s);
}

export function moveBlock(pageId: string, blockId: string, dir: -1 | 1) {
  const s = read();
  const p = s[pageId];
  if (!p) return;
  const i = p.blocks.findIndex(b => b.id === blockId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= p.blocks.length) return;
  [p.blocks[i], p.blocks[j]] = [p.blocks[j], p.blocks[i]];
  p.updatedAt = Date.now();
  write(s);
}

export function publishPage(id: string) { updatePage(id, { status: "published" }); }
export function unpublishPage(id: string) { updatePage(id, { status: "draft" }); }
export function togglePageHidden(id: string) {
  const p = getPage(id);
  if (p) updatePage(id, { hidden: !p.hidden });
}
export function getPublishedPage(slug: string): CustomPage | null {
  const p = getPageBySlug(slug);
  return p && p.status === "published" && !p.hidden ? p : null;
}

export function onPagesChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
