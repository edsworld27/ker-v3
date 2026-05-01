import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listPages, createPage } from "@/portal/server/pages";
import type { Block } from "@/portal/server/types";

// GET  /api/portal/pages/[siteId]   — list all pages for the site
// POST /api/portal/pages/[siteId]   — { slug, title, description?, blocks? } → new page

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  return NextResponse.json({ ok: true, pages: listPages(siteId) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: { slug?: string; title?: string; description?: string; blocks?: Block[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.slug || !body.title) return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  const page = createPage({
    siteId,
    slug: body.slug,
    title: body.title,
    description: body.description,
    blocks: body.blocks,
  });
  return NextResponse.json({ ok: true, page });
}
