import { NextRequest, NextResponse } from "next/server";
import {
  getSchema, setSchema,
} from "@/portal/server/schema";
import { ensureHydrated } from "@/portal/server/storage";
import type {
  ManifestField, ManifestSchema, OverrideType,
} from "@/portal/server/types";

// GET  /api/portal/schema/[siteId]            — public, CORS-open
//                                               returns the inner ManifestSchema
//                                               (small payload for the loader)
// GET  /api/portal/schema/[siteId]?admin=1    — full SiteManifestSchema
//                                               (includes uploadedAt/uploadedFrom)
// POST /api/portal/schema/[siteId]            — same-origin, accepts
//                                               { schema, uploadedFrom? }
//
// Schemas change rarely (only on CLI uploads) so the GET cache is
// longer than the override one in /api/portal/content.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=60, s-maxage=60",
};

const VALID_TYPES: OverrideType[] = ["text", "html", "image-src", "href"];

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  const wantsAdmin = new URL(req.url).searchParams.get("admin") === "1";
  const stored = getSchema(siteId);
  if (wantsAdmin) {
    return NextResponse.json(stored, { headers: corsHeaders });
  }
  // Public projection — just the inner ManifestSchema (or empty object
  // when nothing's been uploaded). Keeps the loader payload tiny.
  return NextResponse.json(stored?.schema ?? {}, { headers: corsHeaders });
}

interface PostBody {
  schema?: unknown;
  uploadedFrom?: unknown;
}

// Validates an arbitrary JSON blob against the ManifestSchema shape.
// Returns either the cleaned schema or a human-readable error.
function validateSchema(input: unknown): { ok: true; schema: ManifestSchema } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "schema must be an object" };
  }
  const cleaned: ManifestSchema = {};
  for (const [section, fields] of Object.entries(input as Record<string, unknown>)) {
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      return { ok: false, error: `section "${section}" must be an object` };
    }
    const cleanedSection: Record<string, ManifestField> = {};
    for (const [key, raw] of Object.entries(fields as Record<string, unknown>)) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return { ok: false, error: `field "${section}.${key}" must be an object` };
      }
      const f = raw as Record<string, unknown>;
      const type = f.type;
      if (typeof type !== "string" || !VALID_TYPES.includes(type as OverrideType)) {
        return { ok: false, error: `field "${section}.${key}" has invalid type` };
      }
      if (typeof f.default !== "string") {
        return { ok: false, error: `field "${section}.${key}" must have a string default` };
      }
      const field: ManifestField = {
        type: type as OverrideType,
        default: f.default,
      };
      if (typeof f.description === "string") field.description = f.description;
      if (typeof f.multiline === "boolean") field.multiline = f.multiline;
      cleanedSection[key] = field;
    }
    cleaned[section] = cleanedSection;
  }
  return { ok: true, schema: cleaned };
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: PostBody;
  try { body = await req.json() as PostBody; }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const result = validateSchema(body.schema);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const uploadedFrom = typeof body.uploadedFrom === "string" ? body.uploadedFrom : undefined;
  const saved = setSchema(siteId, result.schema, uploadedFrom);
  return NextResponse.json({ ok: true, schema: saved });
}
