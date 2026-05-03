// GET    /api/portal/backups/[id]          download a backup as JSON
// DELETE /api/portal/backups/[id]          remove a backup
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getBackup, deleteBackup } from "@/portal/server/backups";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const found = await getBackup(id);
  if (!found) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return new NextResponse(found.json, {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${id}.json"`,
    },
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const { id } = await ctx.params;
  const ok = await deleteBackup(id);
  if (ok) {
    recordAdminAction(actor, {
      category: "settings",
      action: `Deleted backup ${id}`,
      resourceId: id,
      resourceLink: "/admin/backups",
    });
  }
  return NextResponse.json({ ok });
}
