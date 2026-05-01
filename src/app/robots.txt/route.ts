import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPages } from "@/portal/server/pages";

// GET /robots.txt — derives disallow rules from any page with
// seo.noindex set. Always allows /api routes and points at the
// generated sitemap.

export const dynamic = "force-dynamic";

function siteIdFromHost(_host: string): string {
  return process.env.PORTAL_SITE_ID ?? "luvandker";
}

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`.replace(/\/$/, "");
  const siteId = siteIdFromHost(host);
  const pages = listPages(siteId);
  const noindex = pages.filter(p => p.seo?.noindex).map(p => p.slug);

  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /aqua/",
    "Disallow: /api/",
    ...noindex.map(slug => `Disallow: ${slug}`),
    "",
    `Sitemap: ${base}/sitemap.xml`,
  ];

  return new NextResponse(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
