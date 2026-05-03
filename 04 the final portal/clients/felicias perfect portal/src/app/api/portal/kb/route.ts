// GET  /api/portal/kb?orgId=...
// POST /api/portal/kb  — create article
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listArticles, createArticle } from "@/portal/server/knowledgebase";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const categoryId = req.nextUrl.searchParams.get("categoryId") ?? undefined;
  const publishedOnly = req.nextUrl.searchParams.get("published") === "1";
  return NextResponse.json({ ok: true, articles: listArticles(orgId, categoryId, publishedOnly) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; categoryId?: string; title?: string; body?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.categoryId || !body.title) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const a = createArticle({
    orgId: body.orgId,
    categoryId: body.categoryId,
    title: body.title,
    body: body.body ?? "",
  });
  return NextResponse.json({ ok: true, article: a });
}
