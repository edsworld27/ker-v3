import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPages } from "@/portal/server/pages";
import type { Block } from "@/portal/server/types";

// GET /api/portal/links/[siteId]?check=1
//
// Walks every visual editor page for the site and collects every URL
// referenced by a block (button.href, image.href, navbar links, footer
// links, hero.ctaHref, …). With ?check=1 it also pings each external
// URL to flag 404s + bad statuses. Internal URLs (starting with `/` or
// the configured site domain) are listed but not pinged.

export const dynamic = "force-dynamic";

interface LinkRef {
  url: string;
  source: { pageSlug: string; pageId: string; blockId: string; blockType: string; field: string };
  external: boolean;
  status?: number;
  ok?: boolean;
  error?: string;
}

const FIELDS_TO_SCAN: Array<{ type: string; keys: string[] }> = [
  { type: "button", keys: ["href"] },
  { type: "image", keys: ["href", "src"] },
  { type: "hero", keys: ["ctaHref", "backgroundImage"] },
  { type: "cta", keys: ["ctaHref"] },
  { type: "navbar", keys: ["ctaHref"] },
  { type: "form", keys: ["action"] },
  { type: "video", keys: ["src"] },
  { type: "payment-button", keys: [] },
  { type: "order-success", keys: ["ctaHref"] },
];

function collectLinks(block: Block, pageSlug: string, pageId: string, out: LinkRef[]) {
  const def = FIELDS_TO_SCAN.find(f => f.type === block.type);
  if (def) {
    for (const key of def.keys) {
      const v = block.props[key];
      if (typeof v === "string" && v.length > 0 && v !== "#") {
        out.push({
          url: v,
          source: { pageSlug, pageId, blockId: block.id, blockType: block.type, field: key },
          external: /^https?:\/\//i.test(v),
        });
      }
    }
  }
  // Walk array-shaped link collections (navbar.links, footer.columns[].links).
  if (block.type === "navbar" && Array.isArray(block.props.links)) {
    (block.props.links as Array<{ href?: string }>).forEach((l, i) => {
      if (l?.href) out.push({
        url: l.href,
        source: { pageSlug, pageId, blockId: block.id, blockType: block.type, field: `links[${i}]` },
        external: /^https?:\/\//i.test(l.href),
      });
    });
  }
  if (block.type === "footer" && Array.isArray(block.props.columns)) {
    (block.props.columns as Array<{ links?: Array<{ href?: string }> }>).forEach((col, ci) => {
      col.links?.forEach((l, li) => {
        if (l?.href) out.push({
          url: l.href,
          source: { pageSlug, pageId, blockId: block.id, blockType: block.type, field: `columns[${ci}].links[${li}]` },
          external: /^https?:\/\//i.test(l.href),
        });
      });
    });
  }
  if (block.children) for (const c of block.children) collectLinks(c, pageSlug, pageId, out);
}

async function checkOne(link: LinkRef): Promise<LinkRef> {
  if (!link.external) return link;
  try {
    const res = await fetch(link.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
    return { ...link, status: res.status, ok: res.ok };
  } catch (e) {
    return { ...link, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  const check = req.nextUrl.searchParams.get("check") === "1";
  const pages = listPages(siteId);
  const links: LinkRef[] = [];
  for (const p of pages) {
    for (const b of p.blocks) collectLinks(b, p.slug, p.id, links);
    if (p.publishedBlocks) for (const b of p.publishedBlocks) collectLinks(b, p.slug, p.id, links);
  }

  if (check) {
    const checked = await Promise.all(links.map(checkOne));
    return NextResponse.json({ ok: true, links: checked, total: checked.length, broken: checked.filter(l => l.external && l.ok === false).length });
  }

  return NextResponse.json({ ok: true, links, total: links.length });
}
