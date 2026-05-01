// App Router native robots.txt. Lets crawlers index the storefront while
// keeping admin / API / account / cart / checkout out of the public index.
//
// Sitemap link points to the same origin's /sitemap.xml — Next renders
// /sitemap.xml from src/app/sitemap.ts automatically.
//
// Minimal local mirror of Next 16's MetadataRoute.Robots — see sitemap.ts
// for why we define this locally rather than importing from "next".
type RobotsRule = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};
type Robots = {
  rules: RobotsRule | RobotsRule[];
  sitemap?: string | string[];
  host?: string;
};

export const dynamic = "force-static";

function siteOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://luvandker.com";
}

export default function robots(): Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/checkout/",
          "/cart",
          "/embed/",
          "/portal/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
