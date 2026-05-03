// GET /api/portal/forum/categories?orgId=...
// POST /api/portal/forum/categories
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listForumCategories, createForumCategory } from "@/portal/server/forum";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, categories: listForumCategories(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; name?: string; description?: string; membersOnly?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    category: createForumCategory(body.orgId, body.name, {
      description: body.description, membersOnly: body.membersOnly,
    }),
  });
}
