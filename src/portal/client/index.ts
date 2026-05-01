"use client";

// Portal client — HTTP-typed bindings for the /api/portal/* surface plus
// the framework-agnostic D-1 manifest helpers (definePortal /
// loadPortalContent / ResolvedPortal).
//
// Use sub-namespaces directly when you can; this module is for browsers,
// edge functions, or a separated admin app where direct module imports
// aren't available.

import type { Product } from "@/lib/products";
import type {
  ManifestField, ManifestSchema, OverrideType,
} from "@/portal/server/types";

// ─── Legacy PortalClient (Phase A) ──────────────────────────────────────

export interface PortalHealth {
  ok: boolean;
  portal: string;
  version: number;
  ts: number;
  capabilities: Record<string, boolean>;
}

export interface ProductSummary {
  slug: string;
  id: string;
  range: string;
  name: string;
  tagline: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  image?: string;
  formats: string[];
  sizes: { id: string; label: string }[];
  fragrances: string[];
  rating: number;
  reviewCount: number;
}

export interface PortalClientOptions {
  baseUrl?: string;     // default: same-origin /api/portal
  headers?: Record<string, string>;
}

export class PortalClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(opts: PortalClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? "/api/portal").replace(/\/$/, "");
    this.headers = opts.headers ?? {};
  }

  async health(): Promise<PortalHealth> {
    return this.json<PortalHealth>(`/health`);
  }

  async listProducts(filter?: { range?: string; format?: string; includeHidden?: boolean }): Promise<{ count: number; items: ProductSummary[] }> {
    const params = new URLSearchParams();
    if (filter?.range)         params.set("range", filter.range);
    if (filter?.format)        params.set("format", filter.format);
    if (filter?.includeHidden) params.set("includeHidden", "1");
    const qs = params.toString();
    return this.json(`/products${qs ? `?${qs}` : ""}`);
  }

  async getProduct(slug: string): Promise<Product> {
    return this.json<Product>(`/products/${encodeURIComponent(slug)}`);
  }

  private async json<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });
    if (!res.ok) {
      throw new Error(`Portal ${path}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
}

// Default singleton for in-app same-origin usage.
export const portalClient = new PortalClient();

// ─── D-1 manifest helpers ───────────────────────────────────────────────
//
// `definePortal` is an identity function — its only job is to lock the
// schema's literal types so callers get full IntelliSense on the values
// returned by `loadPortalContent` / `usePortalContent`.
//
// Example:
//   const portal = definePortal({
//     hero: { headline: { type: "text", default: "Hi" } },
//   });
//   const c = await loadPortalContent({ siteId, portal: "/", schema: portal });
//   c.hero.headline           // typed as string

export type { ManifestField, ManifestSchema, OverrideType };

export function definePortal<T extends ManifestSchema>(schema: T): T {
  return schema;
}

// Map ManifestField → resolved value type. Today everything is a string
// (text, html, image-src, href all serialize as strings) but the indirection
// keeps the door open for typed widgets later.
export type ResolvedField<F extends ManifestField> =
  F["type"] extends OverrideType ? string : never;

// Turn a section-grouped schema into the same nesting of resolved values.
//   { hero: { headline: { type: "text", default: "..." } } }
//     → { hero: { headline: string } }
export type ResolvedPortal<T extends ManifestSchema> = {
  [Section in keyof T]: {
    [Key in keyof T[Section]]:
      T[Section][Key] extends ManifestField
        ? ResolvedField<T[Section][Key]>
        : never;
  };
};

// Build the defaults-only resolved object from a schema. Used both as
// the synchronous fallback and as the merge base when the portal answers.
function buildDefaults<T extends ManifestSchema>(schema: T): ResolvedPortal<T> {
  const out = {} as Record<string, Record<string, string>>;
  for (const [section, fields] of Object.entries(schema)) {
    out[section] = {};
    for (const [key, field] of Object.entries(fields)) {
      out[section][key] = field.default;
    }
  }
  return out as ResolvedPortal<T>;
}

// Tiny in-memory cache so multiple loadPortalContent calls in one render
// (e.g. several components mounted in parallel) don't re-fetch. Keyed by
// the resolved URL; entries expire after 30s.
type CacheEntry = { ts: number; promise: Promise<Record<string, { value: string; type: OverrideType }>> };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000;

function fetchOverrides(url: string, signal?: AbortSignal): Promise<Record<string, { value: string; type: OverrideType }>> {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < CACHE_TTL_MS) return hit.promise;
  const promise = fetch(url, { signal, mode: "cors", credentials: "omit" })
    .then(r => r.ok ? r.json() : {})
    .then(j => (j && typeof j === "object" ? j as Record<string, { value: string; type: OverrideType }> : {}))
    .catch(() => ({}));
  cache.set(url, { ts: now, promise });
  return promise;
}

export interface LoadPortalContentOptions<T extends ManifestSchema> {
  siteId: string;
  portal: string;          // origin or origin+path of the portal deployment
  schema: T;
  signal?: AbortSignal;
}

// Fetch overrides for `siteId`, merge into the schema defaults and return
// the section-grouped resolved object. Errors are swallowed — the caller
// always gets a usable value (defaults) so a portal outage never breaks
// the host site.
export async function loadPortalContent<T extends ManifestSchema>(
  opts: LoadPortalContentOptions<T>,
): Promise<ResolvedPortal<T>> {
  const { siteId, portal, schema, signal } = opts;
  const base = portal.replace(/\/$/, "");
  const url = `${base}/api/portal/content/${encodeURIComponent(siteId)}`;
  const defaults = buildDefaults(schema);

  let overrides: Record<string, { value: string; type: OverrideType }> = {};
  try {
    overrides = await fetchOverrides(url, signal);
  } catch {
    return defaults;
  }

  // Deep-clone the defaults so callers can't see a shared reference.
  const merged = {} as Record<string, Record<string, string>>;
  for (const [section, fields] of Object.entries(defaults as Record<string, Record<string, string>>)) {
    merged[section] = { ...fields };
  }
  for (const [flatKey, rule] of Object.entries(overrides)) {
    if (!rule || typeof rule.value !== "string") continue;
    const dot = flatKey.indexOf(".");
    if (dot < 0) continue;            // schema speaks section.key only
    const section = flatKey.slice(0, dot);
    const key = flatKey.slice(dot + 1);
    if (!merged[section] || !(key in merged[section])) continue;  // unknown key → ignore
    merged[section][key] = rule.value;
  }
  return merged as ResolvedPortal<T>;
}

// Test/maintenance hook — drops the in-memory fetch cache. Exposed for
// the React adapter's refresh() path.
export function clearPortalContentCache(): void {
  cache.clear();
}
