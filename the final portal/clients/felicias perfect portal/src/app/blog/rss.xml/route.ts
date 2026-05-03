import { NextRequest } from "next/server";
import { defaultSeedPosts, effectiveStatus, type BlogPost } from "@/lib/admin/blog";

// GET /blog/rss.xml
// Serves an RSS 2.0 feed of the latest 20 published blog posts.
//
// The blog store currently lives in browser localStorage (see lib/admin/blog).
// A server-rendered route can't reach that store, so this handler falls back
// to the canonical seed posts shipped with the repo. Once the blog is backed
// by a real database (Supabase / KV) replace `defaultSeedPosts()` with a
// server-side fetch — the rest of the RSS XML pipeline stays as-is.
//
// `dynamic = "force-dynamic"` so each hit re-evaluates effective status,
// which lets scheduled posts appear at the moment they go live without a
// separate revalidation tick.

export const dynamic = "force-dynamic";

const FEED_LIMIT = 20;

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const now = Date.now();

  const posts: BlogPost[] = defaultSeedPosts(now)
    .filter(p => effectiveStatus(p, now) === "published")
    .sort((a, b) => {
      const av = a.publishedAt ?? a.scheduledFor ?? a.updatedAt;
      const bv = b.publishedAt ?? b.scheduledFor ?? b.updatedAt;
      return bv - av;
    })
    .slice(0, FEED_LIMIT);

  const channelTitle = "The Luv & Ker Journal";
  const channelLink = `${origin}/blog`;
  const channelDescription = "Stories, ingredients, sourcing, and skin — written by the people who make the soap.";
  const buildDate = posts[0]?.publishedAt ?? now;

  const itemsXml = posts.map(p => itemXml(origin, p)).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en-gb</language>
    <lastBuildDate>${rfc822(buildDate)}</lastBuildDate>
    <atom:link href="${origin}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Force revalidation so scheduled posts surface promptly. Caches still
      // benefit downstream because Next will hash the response.
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function itemXml(origin: string, p: BlogPost): string {
  const url = `${origin}/blog/${p.slug}`;
  const pubMs = p.publishedAt ?? p.scheduledFor ?? p.updatedAt;
  const description = (p.seo?.description ?? p.excerpt ?? "").trim();
  const categories = (p.tags ?? []).map(t => `<category>${escapeXml(t)}</category>`).join("");
  const contentBlock = p.bodyHtml
    ? `<content:encoded><![CDATA[${p.bodyHtml}]]></content:encoded>`
    : "";
  return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(pubMs)}</pubDate>
      <dc:creator>${escapeXml(p.author || "Luv & Ker")}</dc:creator>
      <description>${escapeXml(description)}</description>
      ${contentBlock}
      ${categories}
    </item>`;
}

function rfc822(ms: number): string {
  // Date#toUTCString is RFC 1123 / RFC 822-compatible — exactly what RSS wants.
  return new Date(ms).toUTCString();
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
