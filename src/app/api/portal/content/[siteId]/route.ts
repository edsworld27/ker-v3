import { NextRequest, NextResponse } from "next/server";
import {
  getPublicOverrides, getPreviewOverrides, getContentState, setDraftOverrides,
  type SetOverrideInput,
} from "@/portal/server/content";
import { verifyPreviewToken } from "@/portal/server/preview";
import type { OverrideType } from "@/portal/server/types";

// GET /api/portal/content/[siteId]
//   - default                                    → published overrides projection
//   - ?preview=draft&pt=<token>                  → draft projection (signed)
//   - ?admin=1                                   → full admin state shape
// POST /api/portal/content/[siteId]
//   - same-origin only, replaces the DRAFT map atomically. Publishing is a
//     separate endpoint so the workflow split is explicit at the HTTP layer.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=15, s-maxage=15",
};

// Preview responses must NOT be cached — the same URL serves different
// content for different tokens, and we want admins to see edits immediately.
const previewCorsHeaders = {
  ...corsHeaders,
  "Cache-Control": "private, no-store",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const url = new URL(req.url);
  const wantsAdmin = url.searchParams.get("admin") === "1";
  const previewMode = url.searchParams.get("preview");

  if (wantsAdmin) {
    return NextResponse.json(getContentState(siteId), { headers: corsHeaders });
  }

  // Preview path — token-gated, returns the draft projection.
  if (previewMode === "draft") {
    const token = url.searchParams.get("pt") ?? "";
    const result = verifyPreviewToken(token, siteId);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "invalid-preview-token", reason: result.reason },
        { status: 401, headers: previewCorsHeaders },
      );
    }
    return NextResponse.json(getPreviewOverrides(siteId), { headers: previewCorsHeaders });
  }

  return NextResponse.json(getPublicOverrides(siteId), { headers: corsHeaders });
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
  const saved = setDraftOverrides(siteId, inputs);
  return NextResponse.json({ ok: true, content: saved });
}
