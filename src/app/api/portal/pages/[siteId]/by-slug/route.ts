import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getPageBySlug } from "@/portal/server/pages";
import { resolveTheme } from "@/portal/server/themes";

export const dynamic = "force-dynamic";

// GET /api/portal/pages/[siteId]/by-slug?slug=/about — resolve a slug to a
// page, returning the published snapshot when present (so live visitors
// don't see in-flight drafts) and the draft blocks otherwise. The host-
// side <PortalPageRenderer> hits this endpoint once per slug.

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  const slug = req.nextUrl.searchParams.get("slug") ?? "/";
  const page = getPageBySlug(siteId, slug);
  if (!page) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  // Return the published snapshot for live traffic, draft for `?preview=1`.
  const preview = req.nextUrl.searchParams.get("preview") === "1";
  const blocks = preview
    ? page.blocks
    : (page.publishedBlocks ?? page.blocks);
  const theme = resolveTheme(siteId, page.themeId);
  return NextResponse.json({
    ok: true,
    page: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description,
      blocks,
      status: page.status,
      updatedAt: page.updatedAt,
      customHead: page.customHead,
      customFoot: page.customFoot,
      seo: page.seo,
      themeId: page.themeId,
    },
    theme,
  });
}
