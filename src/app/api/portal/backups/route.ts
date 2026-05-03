// GET  /api/portal/backups?orgId=...        list backups
// POST /api/portal/backups                  { orgId, kind?, notes? } — create
//
// Both admin-gated. POST is also the cron-trigger endpoint — operators
// who want scheduled backups point Vercel cron / system crontab /
// GitHub Action at this route. The kind defaults to "scheduled" when
// the request looks automated (User-Agent includes "cron"); admin UI
// requests stay "manual".
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createBackup, listBackups, getBackupsConfig } from "@/portal/server/backups";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const records = await listBackups();
  return NextResponse.json({
    ok: true,
    backups: records,
    config: getBackupsConfig(orgId),
  });
}

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; kind?: "manual" | "scheduled"; notes?: string };
  try { body = await req.json(); }
  catch { body = {}; }

  const orgId = body.orgId ?? "agency";
  const ua = req.headers.get("user-agent") ?? "";
  const looksLikeCron = /cron|scheduler|github-actions/i.test(ua);
  const kind = body.kind ?? (looksLikeCron ? "scheduled" : "manual");

  try {
    const record = await createBackup({
      orgId,
      kind,
      notes: body.notes,
      config: getBackupsConfig(orgId),
    });
    recordAdminAction(actor, {
      category: "settings",
      action: `Created ${kind} backup (${(record.sizeBytes / 1024).toFixed(1)} KB)`,
      resourceId: record.id,
      resourceLink: "/admin/backups",
    });
    return NextResponse.json({ ok: true, backup: record });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "backup-failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
