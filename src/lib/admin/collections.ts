"use client";

// Custom collections/ranges beyond the built-in odo | nkrabea | unisex.
// Collections appear as filter tabs on the /products page.
//
// TODO Database (Supabase):
//   table collections (id, slug, label, sub, color, sort_order, archived)

const STORAGE_KEY = "lk_admin_collections_v1";
const CHANGE_EVENT = "lk-admin-products-change";

export interface Collection {
  slug: string;         // used as the range value on products
  label: string;        // e.g. "Gift Sets"
  sub: string;          // subtitle shown on filter tab
  archived?: boolean;
  sortOrder?: number;
}

const BUILT_IN: Collection[] = [
  { slug: "odo",     label: "Odo · For Her",         sub: "Heritage skincare for women" },
  { slug: "nkrabea", label: "Nkrabea · For Him",     sub: "Strength rituals for men" },
  { slug: "unisex",  label: "Felicia's Black Soap",  sub: "World renowned formula" },
];

function read(): Collection[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function write(cols: Collection[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** All collections: built-in + admin-created custom ones */
export function listCollections(): Collection[] {
  const custom = read().filter(c => !c.archived);
  const customSlugs = new Set(custom.map(c => c.slug));
  return [
    ...BUILT_IN.filter(c => !customSlugs.has(c.slug)),
    ...custom,
  ].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

/** Only admin-managed (editable) collections */
export function listCustomCollections(): Collection[] {
  return read();
}

export function upsertCollection(col: Collection) {
  const all = read();
  const idx = all.findIndex(c => c.slug === col.slug);
  if (idx >= 0) all[idx] = col;
  else all.push(col);
  write(all);
}

export function deleteCollection(slug: string) {
  write(read().filter(c => c.slug !== slug));
}

export function getCollectionLabel(slug: string): string {
  return listCollections().find(c => c.slug === slug)?.label ?? slug;
}

export function onCollectionsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
