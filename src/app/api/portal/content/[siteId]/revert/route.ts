import { NextRequest, NextResponse } from "next/server";
import { revertToSnapshot } from "@/portal/server/content";

// POST /api/portal/content/[siteId]/revert
// Body: { snapshotId: string, message?: string, publishedBy?: string }
// Restores the published overrides to the named history snapshot. The
// previous published state is itself snapshotted before the swap so the
// revert can be undone.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  let body: { snapshotId?: string; message?: string; publishedBy?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.snapshotId || typeof body.snapshotId !== "string") {
    return NextResponse.json({ ok: false, error: "missing-snapshotId" }, { status: 400 });
  }

  const saved = revertToSnapshot(siteId, body.snapshotId, {
    message: body.message,
    publishedBy: body.publishedBy,
  });
  if (!saved) {
    return NextResponse.json({ ok: false, error: "snapshot-not-found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, content: saved });
}
