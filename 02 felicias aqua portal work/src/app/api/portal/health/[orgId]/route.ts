// GET /api/portal/health/[orgId] — read all installed plugins'
// last-known health, optionally re-running each one.
//
// Query params:
//   ?refresh=1   Run each plugin's healthcheck before returning.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getOrg } from "@/portal/server/orgs";
import { runAllHealthchecks } from "@/portal/server/healthchecks";
import { listPlugins } from "@/plugins/_registry";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";

  const org = getOrg(orgId);
  if (!org) return NextResponse.json({ ok: false, error: "org-not-found" }, { status: 404 });

  if (refresh) {
    const installedIds = new Set((org.plugins ?? []).map(p => p.pluginId));
    const installedPlugins = listPlugins().filter(p => installedIds.has(p.id));
    await runAllHealthchecks(orgId, installedPlugins);
  }

  // Re-fetch after possible refresh so the response reflects the latest.
  const fresh = getOrg(orgId);
  return NextResponse.json({
    ok: true,
    plugins: (fresh?.plugins ?? []).map(p => ({
      pluginId: p.pluginId,
      enabled: p.enabled,
      health: p.health ?? null,
      healthCheckedAt: p.healthCheckedAt ?? null,
    })),
  });
}
