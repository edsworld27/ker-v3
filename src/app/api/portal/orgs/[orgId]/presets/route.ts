// POST /api/portal/orgs/[orgId]/presets  — apply a preset to an org
//
// Body: { presetId: string }

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { applyPreset } from "@/plugins/_runtime";
import { getPreset } from "@/plugins/_presets";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  let session: { email?: string } | null = null;
  try { session = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;

  let body: { presetId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.presetId) return NextResponse.json({ ok: false, error: "missing-presetId" }, { status: 400 });

  const preset = getPreset(body.presetId);
  if (!preset) return NextResponse.json({ ok: false, error: "preset-not-found" }, { status: 404 });

  const result = await applyPreset(orgId, preset, session?.email);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error, installed: result.installed }, { status: 400 });

  return NextResponse.json({ ok: true, installed: result.installed });
}
