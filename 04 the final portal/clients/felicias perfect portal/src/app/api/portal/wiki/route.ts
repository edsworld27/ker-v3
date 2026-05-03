// GET  /api/portal/wiki?orgId=...
// POST /api/portal/wiki  — upsert a page
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listWikiPages, upsertWikiPage } from "@/portal/server/wiki";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, pages: listWikiPages(orgId) });
}

export async function POST(req: NextRequest) {
  let session;
  try { session = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; title?: string; body?: string; slug?: string; parentSlug?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.title) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const page = upsertWikiPage({
    orgId: body.orgId,
    title: body.title,
    body: body.body ?? "",
    slug: body.slug,
    parentSlug: body.parentSlug,
    authorEmail: session?.email,
  });
  return NextResponse.json({ ok: true, page });
}
