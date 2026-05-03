// POST /api/portal/reservations/reminders — admin-triggered.
// Production deployments wire this to a Vercel cron / external
// scheduler (every 15 minutes is a reasonable cadence).

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { dispatchDueReminders } from "@/portal/server/calendar";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  let body: { orgId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const result = await dispatchDueReminders(body.orgId);
  return NextResponse.json({ ok: true, ...result });
}
