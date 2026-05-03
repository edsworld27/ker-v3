"use client";

// Admin-created products — stored entirely in localStorage.
// These live alongside the static PRODUCTS catalog in products.ts.
// getProduct() / getProducts() in products.ts merge both sources.
//
// TODO Database (Supabase): replace readStore/writeStore with
//   SELECT * FROM products WHERE custom = true

import type { Product } from "@/lib/products";

const STORAGE_KEY = "lk_admin_custom_products_v1";
const CHANGE_EVENT = "lk-admin-products-change";

export type CustomProduct = Omit<Product,
  "available" | "shopifyVariants" | "fragranceContent" | "formatContent" | "formatSizes"
> & { _custom: true };

function read(): CustomProduct[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function write(products: CustomProduct[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listCustomProducts(): CustomProduct[] {
  return read();
}

export function getCustomProduct(slug: string): CustomProduct | undefined {
  return read().find(p => p.slug === slug);
}

export function upsertCustomProduct(product: CustomProduct) {
  const all = read();
  const idx = all.findIndex(p => p.slug === product.slug);
  if (idx >= 0) all[idx] = product;
  else all.push(product);
  write(all);
}

export function deleteCustomProduct(slug: string) {
  write(read().filter(p => p.slug !== slug));
}

export function makeBlankProduct(slug: string, range: string): CustomProduct {
  return {
    _custom: true,
    slug,
    id: slug,
    range,
    name: "",
    tagline: "",
    price: 0,
    rating: 5,
    reviewCount: 0,
    origin: "Ghana",
    shortBullets: [],
    description: [],
    note: "",
    formats: ["bar"],
    sizes: [{ label: "Standard", price: 0 }],
    fragrances: [],
    ingredients: [],
    directions: "",
    benefits: [],
    reviews: [],
  };
}
