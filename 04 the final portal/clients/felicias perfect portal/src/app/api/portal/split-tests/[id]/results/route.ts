import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getGroup, getGroupResults } from "@/portal/server/splitTests";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const group = getGroup(id);
  if (!group) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, group, results: getGroupResults(id) });
}
