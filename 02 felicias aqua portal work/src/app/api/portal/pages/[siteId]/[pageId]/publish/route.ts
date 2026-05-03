import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { publishPage } from "@/portal/server/pages";

export const dynamic = "force-dynamic";

// POST /api/portal/pages/[siteId]/[pageId]/publish — snapshot draft → published

export async function POST(_req: NextRequest, ctx: { params: Promise<{ siteId: string; pageId: string }> }) {
  await ensureHydrated();
  const { siteId, pageId } = await ctx.params;
  const page = publishPage(siteId, pageId);
  if (!page) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, page });
}
