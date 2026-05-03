import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getEmbedTheme, setEmbedTheme } from "@/portal/server/embedTheme";
import type { EmbedTheme } from "@/portal/server/types";

// GET  /api/portal/embed-theme/[siteId]   public, CORS-open
//                                         used by the embed iframe + loader
// POST /api/portal/embed-theme/[siteId]   same-origin, admin saves
//
// The theme is intentionally public — colours, logo, copy, an admin
// link toggle. None of it's sensitive; any visitor whose host page
// embeds this site's widget will already see all of it visually.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=30, s-maxage=30",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  return NextResponse.json(getEmbedTheme(siteId), { headers: corsHeaders });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  const saved = setEmbedTheme(siteId, (body ?? {}) as EmbedTheme);
  return NextResponse.json({ ok: true, theme: saved });
}
