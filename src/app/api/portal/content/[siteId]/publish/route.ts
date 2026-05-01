import { NextRequest, NextResponse } from "next/server";
import { publishDraft, hasUnpublishedChanges } from "@/portal/server/content";

// POST /api/portal/content/[siteId]/publish
// Promotes draft → published, snapshots the previous published state
// into history. Same-origin only. Optional body: { message?, publishedBy? }.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  let body: { message?: string; publishedBy?: string } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  if (!hasUnpublishedChanges(siteId)) {
    return NextResponse.json({ ok: false, error: "no-changes" }, { status: 409 });
  }

  const saved = publishDraft(siteId, {
    message: typeof body.message === "string" ? body.message : undefined,
    publishedBy: typeof body.publishedBy === "string" ? body.publishedBy : undefined,
  });
  return NextResponse.json({ ok: true, content: saved });
}
