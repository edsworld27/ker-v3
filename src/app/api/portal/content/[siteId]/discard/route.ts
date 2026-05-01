import { NextRequest, NextResponse } from "next/server";
import { discardDraft } from "@/portal/server/content";

// POST /api/portal/content/[siteId]/discard
// Throws away the current draft, resetting it to the published state.

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const saved = discardDraft(siteId);
  return NextResponse.json({ ok: true, content: saved });
}
