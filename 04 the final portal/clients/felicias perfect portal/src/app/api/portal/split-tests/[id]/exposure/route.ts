import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { recordExposure } from "@/portal/server/splitTests";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await ensureHydrated();
  const { id } = await ctx.params;
  let body: { variantId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.variantId) return NextResponse.json({ ok: false, error: "missing-variantId" }, { status: 400 });
  recordExposure(id, body.variantId);
  return NextResponse.json({ ok: true });
}
