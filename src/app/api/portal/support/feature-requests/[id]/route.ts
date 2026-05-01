import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  commentOnFeatureRequest, deleteFeatureRequest, getFeatureRequest,
  updateFeatureRequest, voteFeatureRequest,
} from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const item = getFeatureRequest(id);
  if (!item) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  let body: {
    title?: string;
    body?: string;
    status?: "open" | "planned" | "in-progress" | "shipped" | "declined";
    priority?: "low" | "medium" | "high" | "urgent";
    voteDelta?: 1 | -1;
    addComment?: { author: string; body: string; isAgency?: boolean };
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  let item = updateFeatureRequest(id, { title: body.title, body: body.body, status: body.status, priority: body.priority });
  if (body.voteDelta) item = voteFeatureRequest(id, body.voteDelta);
  if (body.addComment) item = commentOnFeatureRequest(id, body.addComment);
  if (!item) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  const removed = deleteFeatureRequest(id);
  if (!removed) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
