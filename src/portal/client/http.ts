"use client";

// Typed client for /api/portal/*. Use this to fetch portal data from
// browsers, edge functions, or a separated admin app once the portal
// is lifted into its own deployment.
//
// Today the same data is also available via direct module imports from
// @/portal/ecommerce etc. — those are faster (no network) but require
// being in the same Next.js process. Use the HTTP client when you can't
// guarantee that (eg. external integrations, cross-origin admin).

import type { Product } from "@/lib/products";

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
