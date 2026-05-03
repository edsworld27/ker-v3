import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { deleteGroup, getGroup, setGroupStatus, updateGroup } from "@/portal/server/splitTests";
import type { SplitTestGroup, SplitTestStatus } from "@/portal/server/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const group = getGroup(id);
  if (!group) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, group });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  let body: Partial<Pick<SplitTestGroup, "name" | "description" | "status" | "trafficPercent" | "stickyBy" | "goalEvent" | "endsAt" | "blockRefs">> & { setStatus?: SplitTestStatus };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  let g = updateGroup(id, body);
  if (body.setStatus) g = setGroupStatus(id, body.setStatus);
  if (!g) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, group: g });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const removed = deleteGroup(id);
  if (!removed) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
