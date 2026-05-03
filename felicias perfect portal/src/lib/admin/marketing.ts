"use client";

// Marketing store — order sources, discount codes, affiliates, and the
// attribution captured from tracking links (?src= / ?aff=).
// localStorage-backed for dev. Production swaps these for DB tables; the
// read/write API stays the same.

const SOURCES_KEY    = "lk_admin_sources_v1";
const DISCOUNTS_KEY  = "lk_admin_discounts_v1";
const AFFILIATES_KEY = "lk_admin_affiliates_v1";
const ATTRIBUTION_KEY = "lk_attribution_v1";

const SOURCES_EVENT    = "lk:sources:change";
const DISCOUNTS_EVENT  = "lk:discounts:change";
const AFFILIATES_EVENT = "lk:affiliates:change";

// ── Sources ─────────────────────────────────────────────────────────────────
export interface OrderSource {
  id: string;
  label: string;
  trackingSlug?: string;   // ?src=<slug> attributes orders to this source
  description?: string;
  archived?: boolean;
  createdAt: number;
}

const DEFAULT_SOURCES: OrderSource[] = [
  { id: "instagram", label: "Instagram",      trackingSlug: "ig",        createdAt: 0 },
  { id: "tiktok",    label: "TikTok",         trackingSlug: "tt",        createdAt: 0 },
  { id: "google",    label: "Google search",  trackingSlug: "google",    createdAt: 0 },
  { id: "friend",    label: "From a friend",                              createdAt: 0 },
  { id: "press",     label: "Press / article",trackingSlug: "press",     createdAt: 0 },
  { id: "other",     label: "Somewhere else",                             createdAt: 0 },
];

function readSources(): OrderSource[] {
  if (typeof window === "undefined") return DEFAULT_SOURCES;
  try {
    const raw = localStorage.getItem(SOURCES_KEY);
    if (!raw) {
      localStorage.setItem(SOURCES_KEY, JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    }
    return JSON.parse(raw);
  } catch { return DEFAULT_SOURCES; }
}
function writeSources(xs: OrderSource[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOURCES_KEY, JSON.stringify(xs));
  window.dispatchEvent(new Event(SOURCES_EVENT));
}

export function listSources(): OrderSource[] {
  return readSources().filter(s => !s.archived);
}
export function listAllSources(): OrderSource[] { return readSources(); }
export function createSource(input: Omit<OrderSource, "id" | "createdAt">): OrderSource {
  const id = input.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `src-${Date.now()}`;
  const s: OrderSource = { ...input, id, createdAt: Date.now() };
  const xs = readSources();
  if (xs.some(x => x.id === id)) s.id = `${id}-${Date.now().toString(36).slice(-4)}`;
  xs.push(s); writeSources(xs);
  return s;
}
export function updateSource(id: string, patch: Partial<OrderSource>) {
  const xs = readSources().map(s => s.id === id ? { ...s, ...patch } : s);
  writeSources(xs);
}
export function deleteSource(id: string) {
  writeSources(readSources().filter(s => s.id !== id));
}
export function onSourcesChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(SOURCES_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(SOURCES_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
export function findSourceBySlug(slug: string): OrderSource | undefined {
  return readSources().find(s => s.trackingSlug === slug);
}

// ── Discount codes ──────────────────────────────────────────────────────────
export type DiscountType = "percent" | "fixed" | "freeship";
export interface DiscountCode {
  code: string;             // uppercase
  type: DiscountType;
  value: number;            // percent (0-100) or £
  minSubtotal?: number;
  usageLimit?: number;
  uses: number;
  affiliateId?: string;
  expiresAt?: number;
  archived?: boolean;
  createdAt: number;
  note?: string;
}

const DEFAULT_DISCOUNTS: DiscountCode[] = [
  { code: "WELCOME10", type: "percent", value: 10, uses: 0, createdAt: 0, note: "First-order discount" },
  { code: "SHIPFREE",  type: "freeship", value: 0, uses: 0, createdAt: 0 },
];

function readDiscounts(): DiscountCode[] {
  if (typeof window === "undefined") return DEFAULT_DISCOUNTS;
  try {
    const raw = localStorage.getItem(DISCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(DEFAULT_DISCOUNTS));
      return DEFAULT_DISCOUNTS;
    }
    return JSON.parse(raw);
  } catch { return DEFAULT_DISCOUNTS; }
}
function writeDiscounts(xs: DiscountCode[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(xs));
  window.dispatchEvent(new Event(DISCOUNTS_EVENT));
}

export function listDiscounts(): DiscountCode[] {
  return readDiscounts().sort((a, b) => b.createdAt - a.createdAt);
}
export function getDiscount(code: string): DiscountCode | undefined {
  return readDiscounts().find(d => d.code.toUpperCase() === code.toUpperCase());
}
export function createDiscount(input: Omit<DiscountCode, "uses" | "createdAt">): DiscountCode {
  const d: DiscountCode = { ...input, code: input.code.toUpperCase(), uses: 0, createdAt: Date.now() };
  const xs = readDiscounts();
  if (xs.some(x => x.code === d.code)) throw new Error("Code already exists");
  xs.push(d); writeDiscounts(xs);
  return d;
}
export function updateDiscount(code: string, patch: Partial<DiscountCode>) {
  const xs = readDiscounts().map(d => d.code.toUpperCase() === code.toUpperCase() ? { ...d, ...patch } : d);
  writeDiscounts(xs);
}
export function deleteDiscount(code: string) {
  writeDiscounts(readDiscounts().filter(d => d.code.toUpperCase() !== code.toUpperCase()));
}
export function recordDiscountUse(code: string) {
  const xs = readDiscounts().map(d => d.code.toUpperCase() === code.toUpperCase() ? { ...d, uses: d.uses + 1 } : d);
  writeDiscounts(xs);
}
export function applyDiscount(code: string, subtotal: number, shipping: number): { ok: false; reason: string } | { ok: true; discount: number; freeShipping: boolean; rec: DiscountCode } {
  const d = getDiscount(code);
  if (!d) return { ok: false, reason: "Code not recognised." };
  if (d.archived) return { ok: false, reason: "This code is no longer active." };
  if (d.expiresAt && d.expiresAt < Date.now()) return { ok: false, reason: "This code has expired." };
  if (d.usageLimit && d.uses >= d.usageLimit) return { ok: false, reason: "This code has reached its usage limit." };
  if (d.minSubtotal && subtotal < d.minSubtotal) return { ok: false, reason: `Minimum spend £${d.minSubtotal.toFixed(2)} required.` };
  let discount = 0;
  let freeShipping = false;
  if (d.type === "percent")  discount = Math.round(subtotal * (d.value / 100) * 100) / 100;
  if (d.type === "fixed")    discount = Math.min(d.value, subtotal);
  if (d.type === "freeship") freeShipping = true;
  return { ok: true, discount, freeShipping, rec: d };
}
export function onDiscountsChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(DISCOUNTS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(DISCOUNTS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// ── Affiliates ──────────────────────────────────────────────────────────────
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  commissionPct: number;     // % of order subtotal
  code?: string;             // linked discount code
  trackingSlug?: string;     // ?aff=<slug>
  payoutMethod?: string;
  earnedTotal: number;
  paidTotal: number;
  archived?: boolean;
  createdAt: number;
  notes?: string;
}

function readAffiliates(): Affiliate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AFFILIATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function writeAffiliates(xs: Affiliate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AFFILIATES_KEY, JSON.stringify(xs));
  window.dispatchEvent(new Event(AFFILIATES_EVENT));
}

export function listAffiliates(): Affiliate[] {
  return readAffiliates().sort((a, b) => b.createdAt - a.createdAt);
}
export function getAffiliate(id: string): Affiliate | undefined {
  return readAffiliates().find(a => a.id === id);
}
export function findAffiliateBySlug(slug: string): Affiliate | undefined {
  return readAffiliates().find(a => a.trackingSlug === slug);
}
export function findAffiliateByCode(code: string): Affiliate | undefined {
  if (!code) return undefined;
  return readAffiliates().find(a => a.code?.toUpperCase() === code.toUpperCase());
}
export function createAffiliate(input: Omit<Affiliate, "id" | "createdAt" | "earnedTotal" | "paidTotal">): Affiliate {
  const id = `aff_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const a: Affiliate = { ...input, id, earnedTotal: 0, paidTotal: 0, createdAt: Date.now() };
  const xs = readAffiliates();
  xs.push(a); writeAffiliates(xs);
  return a;
}
export function updateAffiliate(id: string, patch: Partial<Affiliate>) {
  const xs = readAffiliates().map(a => a.id === id ? { ...a, ...patch } : a);
  writeAffiliates(xs);
}
export function deleteAffiliate(id: string) {
  writeAffiliates(readAffiliates().filter(a => a.id !== id));
}
export function recordAffiliateEarning(id: string, amount: number) {
  const xs = readAffiliates().map(a => a.id === id ? { ...a, earnedTotal: a.earnedTotal + amount } : a);
  writeAffiliates(xs);
}
export function recordAffiliatePayout(id: string, amount: number) {
  const xs = readAffiliates().map(a => a.id === id ? { ...a, paidTotal: a.paidTotal + amount } : a);
  writeAffiliates(xs);
}
// Sum of unpaid commissions across all active affiliates — used for the
// sidebar badge and overview KPI.
export function unpaidCommissionsTotal(): number {
  return readAffiliates()
    .filter(a => !a.archived)
    .reduce((s, a) => s + Math.max(0, a.earnedTotal - a.paidTotal), 0);
}
export function onAffiliatesChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(AFFILIATES_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AFFILIATES_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// ── Attribution capture (client-side) ───────────────────────────────────────
// Reads ?src= and ?aff= from the URL on page load and stashes them in
// localStorage so that whichever checkout path the customer takes, we can
// attribute their order back to a source / affiliate.
export interface Attribution {
  source?: string;       // source slug (matches OrderSource.trackingSlug or .id)
  affiliate?: string;    // affiliate slug
  capturedAt: number;
  landing?: string;      // first page URL
}

export function captureAttribution(url?: string) {
  if (typeof window === "undefined") return;
  const u = url ? new URL(url, window.location.origin) : new URL(window.location.href);
  const src = u.searchParams.get("src") || u.searchParams.get("utm_source");
  const aff = u.searchParams.get("aff") || u.searchParams.get("ref");
  if (!src && !aff) return;
  const existing = readAttribution();
  // First-touch attribution: don't overwrite once captured
  if (existing) return;
  const a: Attribution = {
    source:    src ? src.toLowerCase() : undefined,
    affiliate: aff ? aff.toLowerCase() : undefined,
    capturedAt: Date.now(),
    landing: u.pathname + u.search,
  };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(a));
}
export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function clearAttribution() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ATTRIBUTION_KEY);
}
