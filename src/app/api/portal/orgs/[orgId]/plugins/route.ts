// GET    /api/portal/orgs/[orgId]/plugins  — list plugins installed on this org
// POST   /api/portal/orgs/[orgId]/plugins  — install a plugin
//
// Body for POST:
//   { pluginId: string, setupAnswers?: object, featureOverrides?: object, configOverrides?: object }

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrg } from "@/portal/server/orgs";
import { installPlugin } from "@/plugins/_runtime";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const org = getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: "org-not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, installs: org.plugins ?? [] });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  let session: { email?: string } | null = null;
  try { session = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;

  let body: {
    pluginId?: string;
    setupAnswers?: Record<string, string>;
    featureOverrides?: Record<string, boolean>;
    configOverrides?: Record<string, unknown>;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.pluginId || typeof body.pluginId !== "string") {
    return NextResponse.json({ ok: false, error: "missing-pluginId" }, { status: 400 });
  }

  const result = await installPlugin(orgId, body.pluginId, {
    installedBy: session?.email,
    setupAnswers: body.setupAnswers,
    featureOverrides: body.featureOverrides,
    configOverrides: body.configOverrides,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, install: result.install });
}
