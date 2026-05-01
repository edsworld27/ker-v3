// GET /api/portal/forum/topics?orgId=...&categoryId=...
// POST /api/portal/forum/topics — create topic (public)
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listTopics, createTopic } from "@/portal/server/forum";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const categoryId = req.nextUrl.searchParams.get("categoryId") ?? undefined;
  return NextResponse.json({ ok: true, topics: listTopics(orgId, categoryId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();

  let body: {
    orgId?: string; categoryId?: string; title?: string; body?: string;
    authorEmail?: string; authorName?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.categoryId || !body.title || !body.body || !body.authorEmail) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const t = createTopic({
    orgId: body.orgId, categoryId: body.categoryId,
    title: body.title, body: body.body,
    authorEmail: body.authorEmail, authorName: body.authorName,
  });
  return NextResponse.json({ ok: true, topic: t });
}
