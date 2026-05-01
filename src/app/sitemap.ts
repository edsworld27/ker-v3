import { PRODUCTS } from "@/lib/products";

// Minimal local mirror of Next 16's Sitemap. We define this
// inline to avoid a `import type { MetadataRoute } from "next"` that breaks
// the project's tsc check (the project's Next install doesn't ship .d.ts).
// Shape mirrors https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
};
type Sitemap = SitemapEntry[];

// App Router native sitemap (Next 16). Returns the full URL set the search
// engines should know about. Includes:
//
//   - Static storefront routes (home, about, products, ingredients, etc.)
//   - All static products from the catalog
//   - Per-deploy blog posts and custom pages — see the LIMITATION below
//
// LIMITATION (intentional, follow-up coming):
// Blog posts and custom pages live in localStorage today via
// src/lib/admin/blog.ts and src/lib/admin/customPages.ts. Those modules are
// "use client" stores and will not work when imported into this server
// function — there is no `window`, so calling listPosts() crashes the build.
//
// We therefore include only data that is statically available on the server:
// the product catalog (a plain TS module, server-safe) and the static page
// list. When the admin data layer migrates server-side (Cloud / Supabase /
// portal cloud, see OMEGA_LAUNCH_PLAN.md G-2), this file should be updated
// to fetch the lists from there. Until then, the sitemap is still better
// than nothing — every landing page that matters for SEO is here.
//
// Auto-discovers absolute URLs from process.env.NEXT_PUBLIC_SITE_URL falling
// back to the canonical luvandker.com so dev and preview builds still work.

export const dynamic = "force-static";
export const revalidate = 3600; // re-render hourly so new products appear

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/",                  changeFrequency: "weekly",  priority: 1.0 },
  { path: "/about",             changeFrequency: "monthly", priority: 0.8 },
  { path: "/our-story",         changeFrequency: "monthly", priority: 0.7 },
  { path: "/our-philosophy",    changeFrequency: "monthly", priority: 0.7 },
  { path: "/the-problem",       changeFrequency: "monthly", priority: 0.6 },
  { path: "/products",          changeFrequency: "weekly",  priority: 0.95 },
  { path: "/ingredients",       changeFrequency: "monthly", priority: 0.7 },
  { path: "/lab-tests",         changeFrequency: "monthly", priority: 0.6 },
  { path: "/sustainability",    changeFrequency: "monthly", priority: 0.6 },
  { path: "/reviews",           changeFrequency: "weekly",  priority: 0.6 },
  { path: "/faq",               changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact",           changeFrequency: "yearly",  priority: 0.5 },
  { path: "/blog",              changeFrequency: "weekly",  priority: 0.7 },
  { path: "/shipping-returns",  changeFrequency: "yearly",  priority: 0.4 },
  { path: "/privacy",           changeFrequency: "yearly",  priority: 0.3 },
];

function siteOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://luvandker.com";
}

export default function sitemap(): Sitemap {
  const origin = siteOrigin();
  const now = new Date();

  const staticEntries: Sitemap = STATIC_ROUTES.map(r => ({
    url: `${origin}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Products are statically defined in src/lib/products.ts and survive SSR.
  // Hidden / archived products are excluded from the sitemap to avoid
  // orphan URLs being indexed.
  const productEntries: Sitemap = PRODUCTS
    .filter(p => !p.hidden && !p.archived)
    .map(p => ({
      url: `${origin}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  return [...staticEntries, ...productEntries];
}
