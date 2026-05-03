import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getTheme, updateTheme, deleteTheme, setDefaultTheme } from "@/portal/server/themes";
import type { ThemeTokens } from "@/portal/server/types";

// GET    /api/portal/themes/[siteId]/[themeId]  — load
// PATCH  /api/portal/themes/[siteId]/[themeId]  — partial update (name, tokens, appearance)
//        body: { ..., setAsDefault?: boolean }
// DELETE /api/portal/themes/[siteId]/[themeId]  — remove (default cannot be deleted)

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string; themeId: string }> }) {
  await ensureHydrated();
  const { siteId, themeId } = await ctx.params;
  const theme = getTheme(siteId, themeId);
  if (!theme) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, theme });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ siteId: string; themeId: string }> }) {
  await ensureHydrated();
  const { siteId, themeId } = await ctx.params;
  let body: { name?: string; appearance?: "light" | "dark" | "auto"; tokens?: ThemeTokens; setAsDefault?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (body.setAsDefault === true) {
    setDefaultTheme(siteId, themeId);
  }
  const theme = updateTheme(siteId, themeId, {
    name: body.name,
    appearance: body.appearance,
    tokens: body.tokens,
  });
  if (!theme) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, theme });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ siteId: string; themeId: string }> }) {
  await ensureHydrated();
  const { siteId, themeId } = await ctx.params;
  const removed = deleteTheme(siteId, themeId);
  if (!removed) return NextResponse.json({ ok: false, error: "cannot-delete" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
