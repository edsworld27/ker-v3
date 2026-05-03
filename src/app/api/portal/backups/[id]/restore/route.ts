// POST /api/portal/backups/[id]/restore
//
// Replaces current PortalState with the contents of a previously saved
// backup. This is destructive — it overwrites every slice (orgs, users,
// pages, content, …) with what's in the snapshot. The admin UI prompts
// for explicit confirmation; this route is a thin wrapper.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { restoreBackup } from "@/portal/server/backups";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;

  const result = await restoreBackup(id);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  recordAdminAction(actor, {
    category: "settings",
    action: `Restored backup ${id}`,
    resourceId: id,
    resourceLink: "/admin/backups",
  });
  return NextResponse.json(result);
}
