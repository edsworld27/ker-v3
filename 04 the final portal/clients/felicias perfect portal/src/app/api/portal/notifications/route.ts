// GET   /api/portal/notifications?orgId=...&unread=1
// PATCH /api/portal/notifications  — mark all read for an org
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  listNotifications, markAllRead, unreadCount,
} from "@/portal/server/notifications";
import { requireAdmin } from "@/lib/server/auth";
import "@/portal/server/notifications"; // ensure bus binding

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";
  return NextResponse.json({
    ok: true,
    notifications: listNotifications(orgId, 100, unreadOnly),
    unread: unreadCount(orgId),
  });
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  let body: { orgId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const count = markAllRead(body.orgId);
  return NextResponse.json({ ok: true, marked: count });
}
