// GET /api/portal/kb/categories?orgId=...
// POST /api/portal/kb/categories
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listCategories, createCategory } from "@/portal/server/knowledgebase";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, categories: listCategories(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; name?: string; description?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, category: createCategory(body.orgId, body.name, body.description) });
}
