// POST /api/portal/kb/[id]/publish
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { publishArticle } from "@/portal/server/knowledgebase";
import { requireAdmin } from "@/lib/server/auth";
import "@/portal/server/searchIndex";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  let body: { orgId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  publishArticle(body.orgId, id);
  return NextResponse.json({ ok: true });
}
