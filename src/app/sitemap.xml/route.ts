import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPages } from "@/portal/server/pages";

// GET /sitemap.xml — generated from the visual editor's published pages
// for the resolved site. Pages with `seo.excludeFromSitemap` are skipped.
// `hostname` is read from request headers when no explicit base URL is
// configured (works behind proxies like Vercel).

export const dynamic = "force-dynamic";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function siteIdFromHost(_host: string): string {
  // The host site uses a single static siteId in this codebase. Tenants
  // hosted on a different deploy would resolve via Site.domains; left
  // as a placeholder so the route works in the demo.
  return process.env.PORTAL_SITE_ID ?? "luvandker";
}

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`.replace(/\/$/, "");
  const siteId = siteIdFromHost(host);
  const pages = listPages(siteId).filter(p => !p.seo?.excludeFromSitemap && (p.publishedBlocks || p.blocks.length > 0));

  const urls = pages.map(p => {
    const loc = `${base}${p.slug === "/" ? "" : p.slug}`;
    const lastmod = new Date(p.publishedAt ?? p.updatedAt).toISOString();
    const changefreq = p.seo?.changefreq ?? "weekly";
    const priority = (p.seo?.priority ?? 0.7).toFixed(1);
    return `  <url>
    <loc>${escape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  // Always include the home page even if there's no portal-managed page
  // there yet, so search engines find something.
  const homeIncluded = pages.some(p => p.slug === "/");
  const home = homeIncluded ? "" : `  <url>
    <loc>${escape(base + "/")}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[home, urls].filter(Boolean).join("\n")}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
