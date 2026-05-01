import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getPage, updatePage, deletePage } from "@/portal/server/pages";
import type { Block } from "@/portal/server/types";

// GET    /api/portal/pages/[siteId]/[pageId]  — load a single page
// PATCH  /api/portal/pages/[siteId]/[pageId]  — partial update (title/slug/description/blocks)
// DELETE /api/portal/pages/[siteId]/[pageId]  — remove

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string; pageId: string }> }) {
  await ensureHydrated();
  const { siteId, pageId } = await ctx.params;
  const page = getPage(siteId, pageId);
  if (!page) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, page });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ siteId: string; pageId: string }> }) {
  await ensureHydrated();
  const { siteId, pageId } = await ctx.params;
  let body: { title?: string; slug?: string; description?: string; blocks?: Block[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  const page = updatePage(siteId, pageId, body);
  if (!page) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, page });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ siteId: string; pageId: string }> }) {
  await ensureHydrated();
  const { siteId, pageId } = await ctx.params;
  const removed = deletePage(siteId, pageId);
  if (!removed) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
