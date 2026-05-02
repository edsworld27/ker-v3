import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPages } from "@/portal/server/pages";
import { requireAdmin } from "@/lib/server/auth";
import type { Block } from "@/portal/server/types";

// GET /api/portal/links/[siteId]?check=1
//
// Walks every visual editor page for the site and collects every URL
// referenced by a block (button.href, image.href, navbar links, footer
// links, hero.ctaHref, …). With ?check=1 it also pings each external
// URL to flag 404s + bad statuses. Internal URLs (starting with `/` or
// the configured site domain) are listed but not pinged.
//
// SSRF mitigations on the ?check=1 path:
//   1. requireAdmin() — only signed-in admins can trigger outbound fetches.
//   2. https?:// scheme gate — already enforced by the `external` regex.
//   3. Block obvious internal-network targets (localhost, RFC1918 IPv4,
//      link-local incl. cloud-metadata 169.254.169.254, IPv6 loopback +
//      ULA). Hostname-pattern only — doesn't defeat DNS rebinding, but
//      stops naive "https://169.254.169.254/latest/meta-data/" attacks
//      and the gated audience makes the residual risk acceptable.
//   4. 5s timeout + HEAD (already in place) so the response body never
//      reaches us — no data exfil.

export const dynamic = "force-dynamic";

// Reject hosts that point at the local machine, RFC1918, link-local
// (incl. cloud-metadata), or IPv6 loopback / ULA. Returns true if safe.
function isPublicHost(host: string): boolean {
  const h = host.toLowerCase().trim();
  if (!h) return false;
  if (h === "localhost" || h.endsWith(".localhost")) return false;
  if (h === "0.0.0.0" || h === "[::]" || h === "::") return false;
  // IPv4 literal — check for loopback / RFC1918 / link-local.
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [, a, b] = v4.map(n => parseInt(n, 10));
    if (a === 127) return false;                      // 127.0.0.0/8 loopback
    if (a === 10) return false;                       // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12
    if (a === 192 && b === 168) return false;         // 192.168.0.0/16
    if (a === 169 && b === 254) return false;         // 169.254.0.0/16 link-local (AWS/GCP metadata!)
    if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
    if (a === 0) return false;                        // 0.0.0.0/8
  }
  // IPv6 — strip brackets if present.
  const v6 = h.replace(/^\[|\]$/g, "");
  if (v6 === "::1") return false;
  if (/^fc[0-9a-f]{2}:/i.test(v6) || /^fd[0-9a-f]{2}:/i.test(v6)) return false; // ULA fc00::/7
  if (/^fe80:/i.test(v6)) return false;               // link-local
  return true;
}

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
  // Refuse to ping anything that resolves at a glance to a private /
  // metadata IP. Defangs trivial SSRF; doesn't block DNS rebinding but
  // the route is admin-only.
  let parsed: URL;
  try { parsed = new URL(link.url); }
  catch { return { ...link, ok: false, error: "invalid-url" }; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ...link, ok: false, error: "blocked-scheme" };
  }
  if (!isPublicHost(parsed.hostname)) {
    return { ...link, ok: false, error: "blocked-private-host" };
  }
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

  // ?check=1 makes outbound fetches — gate it behind admin auth so a
  // random visitor can't drive the server's egress. Plain listing is
  // harmless (read-only, same-origin data) and stays open.
  if (check) {
    try { await requireAdmin(); }
    catch (e) { if (e instanceof Response) return e; throw e; }
  }

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
