import { NextRequest, NextResponse } from "next/server";
import { mintPreviewToken } from "@/portal/server/preview";
import { ensureHydrated } from "@/portal/server/storage";

// POST /api/portal/content/[siteId]/preview-token
// Mints a short-lived signed token the host site can use to fetch the
// draft instead of the published overrides. Same-origin only — no CORS.
//
// Optional body: { ttlMs?: number } — caps to 1 hour.

export const dynamic = "force-dynamic";

const MAX_TTL_MS = 60 * 60 * 1000;          // 1 hour ceiling

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: { ttlMs?: number } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  const requested = typeof body.ttlMs === "number" && body.ttlMs > 0 ? body.ttlMs : undefined;
  const ttlMs = requested ? Math.min(requested, MAX_TTL_MS) : undefined;

  const token = mintPreviewToken(siteId, ttlMs);
  return NextResponse.json({ ok: true, token, expiresAt: Date.now() + (ttlMs ?? 30 * 60 * 1000) });
}
