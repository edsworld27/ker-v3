"use client";

// Per-user referral DISCOUNT CODE store.
//
// In production this is replaced by a Shopify Admin API call that creates a
// real `discountCodeBasic` so the friend's checkout actually applies the
// discount and Shopify tracks who referred who.
//
// TODO Shopify Admin API:
//   mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//     discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//       codeDiscountNode { id }
//       userErrors { field message }
//     }
//   }
//   — fixed £10 off first order, single-use per customer, code = the string we generate below.
//   Tag the price rule with the referrer's customer id (or store a metafield)
//   so the affiliate dashboard can read usage from Shopify reports / the
//   `priceRule.usageCount` field.

const STORE_KEY = "lk_ref_codes_v1";

export interface ReferralCode {
  email: string;       // referrer
  code: string;        // human-friendly discount code
  createdAt: number;
  // The number Shopify reports — left local until wired.
  uses: number;
}

interface Store { byEmail: Record<string, ReferralCode>; byCode: Record<string, string>; }

function read(): Store {
  if (typeof window === "undefined") return { byEmail: {}, byCode: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { byEmail: {}, byCode: {} };
    return JSON.parse(raw) as Store;
  } catch {
    return { byEmail: {}, byCode: {} };
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

const norm = (s: string) => s.trim().toLowerCase();

// Build a memorable code from the user's email/name.
//   "sarah.miller@gmail.com" → "SARAH10"
//   "luv@ker.co"             → "LUV10"  (and "LUV10-7XQ4" if collision)
function buildCode(email: string): string {
  const handle = email.split("@")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 8) || "FRIEND";
  return `${handle}10`;
}

function disambiguate(code: string): string {
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${code}-${tail}`;
}

export function getOrCreateCodeForUser(email: string): ReferralCode {
  const e = norm(email);
  const store = read();
  if (store.byEmail[e]) return store.byEmail[e];

  let code = buildCode(e);
  while (store.byCode[code] && store.byCode[code] !== e) code = disambiguate(code);

  const record: ReferralCode = { email: e, code, createdAt: Date.now(), uses: 0 };
  store.byEmail[e] = record;
  store.byCode[code] = e;
  write(store);

  // TODO Shopify Admin: discountCodeBasicCreate({ title: code, code, ... })
  return record;
}

export function findCode(code: string): ReferralCode | null {
  const c = code.trim().toUpperCase();
  const store = read();
  const owner = store.byCode[c];
  if (!owner) return null;
  return store.byEmail[owner] ?? null;
}

// Used by checkout to claim a use against the code. In production this is
// driven by Shopify's order-creation webhook reading the discount applied to
// the order; we'd never increment client-side.
export function incrementCodeUse(code: string) {
  const c = code.trim().toUpperCase();
  const store = read();
  const owner = store.byCode[c];
  if (!owner) return;
  const rec = store.byEmail[owner];
  if (!rec) return;
  rec.uses += 1;
  store.byEmail[owner] = rec;
  write(store);
}
