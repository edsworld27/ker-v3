"use client";

// Editable product fields, layered on top of the static catalog in
// src/lib/products.ts. Admin edits write to localStorage; getProduct() and
// getProducts() apply the overrides at read time — so storefront pages reflect
// edits as soon as the user refreshes.
//
// Production replacement: a `products` table with the same shape, served by
// a /api/products endpoint. Replace readStore/writeStore with fetch calls.
//
// TODO Database (Supabase):
//   table product_overrides (
//     slug text primary key,
//     price numeric,
//     sale_price numeric,
//     on_sale boolean default false,
//     description jsonb,           -- string[]
//     image text,
//     badge text,
//     badge_color text,
//     archived boolean default false,
//     updated_at timestamptz default now()
//   );

const STORAGE_KEY = "lk_admin_product_overrides_v1";
const CHANGE_EVENT = "lk-products-change";

export interface ProductOverride {
  slug: string;
  price?: number;
  salePrice?: number;
  onSale?: boolean;            // when true, salePrice is the active price
  description?: string[];
  image?: string;              // URL or data URL
  badge?: string;
  badgeColor?: string;
  archived?: boolean;
  hidden?: boolean;            // hidden from storefront but visible in admin
  scheduledPublishAt?: number; // timestamp — auto-publish at this date
  stockSku?: string;
  showLowStock?: boolean;
  updatedAt: number;
}

interface Store { [slug: string]: ProductOverride; }

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store; }
  catch { return {}; }
}

function writeStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getOverride(slug: string): ProductOverride | null {
  return readStore()[slug] ?? null;
}

export function listOverrides(): ProductOverride[] {
  return Object.values(readStore());
}

export function saveOverride(slug: string, patch: Omit<Partial<ProductOverride>, "slug" | "updatedAt">) {
  const s = readStore();
  const current = s[slug] ?? { slug, updatedAt: 0 };
  s[slug] = { ...current, ...patch, slug, updatedAt: Date.now() };
  writeStore(s);
}

export function clearOverride(slug: string) {
  const s = readStore();
  delete s[slug];
  writeStore(s);
}

// Subscribe to change events so client components re-render after admin saves.
// Returns an unsubscribe function.
export function onProductsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
