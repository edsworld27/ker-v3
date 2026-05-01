import { NextResponse } from "next/server";
import { ensureHydrated, getBackendInfo } from "@/portal/server/storage";

// GET /api/portal/storage-info
// Returns metadata about the active storage backend so the admin
// portal-settings page can show what's actually running. The admin
// settings UI (localStorage) lets users *intend* a backend, but the
// real choice is server-side via PORTAL_BACKEND env var. This endpoint
// surfaces the real one so there's no surprise.

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({ ok: true, ...getBackendInfo() });
}
