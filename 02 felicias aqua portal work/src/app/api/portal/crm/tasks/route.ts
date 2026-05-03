// GET /api/portal/crm/tasks?orgId=...
// POST /api/portal/crm/tasks
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listTasks, createTask } from "@/portal/server/crm";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, tasks: listTasks(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; title?: string; contactId?: string; dealId?: string; dueAt?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.title) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const t = createTask({
    orgId: body.orgId, title: body.title,
    contactId: body.contactId, dealId: body.dealId, dueAt: body.dueAt,
  });
  return NextResponse.json({ ok: true, task: t });
}
