import { NextRequest, NextResponse } from "next/server";
import {
  getPublicOverrides, getContentState, setOverrides,
  type SetOverrideInput,
} from "@/portal/server/content";
import type { OverrideType } from "@/portal/server/types";

// GET  /api/portal/content/[siteId]            — public, CORS-open
//                                                 returns key → { value, type }
// GET  /api/portal/content/[siteId]?admin=1    — full admin shape (overrides
//                                                 + discovered keys)
// POST /api/portal/content/[siteId]            — same-origin, replaces the
//                                                 override map atomically

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=15, s-maxage=15",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const wantsAdmin = new URL(req.url).searchParams.get("admin") === "1";
  const body = wantsAdmin ? getContentState(siteId) : getPublicOverrides(siteId);
  return NextResponse.json(body, { headers: corsHeaders });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const input = body as Partial<{
    overrides: Array<{ key: string; value: string; type?: OverrideType }>;
  }>;
  if (!Array.isArray(input.overrides)) {
    return NextResponse.json({ ok: false, error: "missing-overrides" }, { status: 400 });
  }
  const inputs: SetOverrideInput[] = input.overrides
    .filter(o => o && typeof o.key === "string" && typeof o.value === "string")
    .map(o => ({
      key: o.key,
      value: o.value,
      type: typeof o.type === "string" ? o.type : undefined,
    }));
  const saved = setOverrides(siteId, inputs);
  return NextResponse.json({ ok: true, content: saved });
}
