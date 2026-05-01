// PATCH  /api/portal/orgs/[orgId]/plugins/[pluginId]   — configure
// DELETE /api/portal/orgs/[orgId]/plugins/[pluginId]   — uninstall
//
// Body for PATCH:
//   { config?: object, features?: object, enabled?: boolean }

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { configurePlugin, setPluginEnabled, uninstallPlugin } from "@/plugins/_runtime";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ orgId: string; pluginId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId, pluginId } = await ctx.params;

  let body: {
    config?: Record<string, unknown>;
    features?: Record<string, boolean>;
    enabled?: boolean;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (typeof body.enabled === "boolean") {
    const r = await setPluginEnabled(orgId, pluginId, body.enabled);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  }

  if (body.config || body.features) {
    const r = await configurePlugin(orgId, pluginId, { config: body.config, features: body.features });
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, install: r.install });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ orgId: string; pluginId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId, pluginId } = await ctx.params;

  const r = await uninstallPlugin(orgId, pluginId);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
