import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listThemes, createTheme } from "@/portal/server/themes";

// GET  /api/portal/themes/[siteId]   — list all themes (auto-seeds Default + Light + Dark)
// POST /api/portal/themes/[siteId]   — create a new theme

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  return NextResponse.json({ ok: true, themes: listThemes(siteId) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: { name?: string; appearance?: "light" | "dark" | "auto"; tokens?: Record<string, string> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.name) return NextResponse.json({ ok: false, error: "missing name" }, { status: 400 });
  const theme = createTheme(siteId, { name: body.name, appearance: body.appearance, tokens: body.tokens });
  return NextResponse.json({ ok: true, theme });
}
