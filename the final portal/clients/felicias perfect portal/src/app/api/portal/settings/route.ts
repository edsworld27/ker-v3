import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  getAdminSettings, applyAdminPatch, resetSettings,
} from "@/portal/server/settings";
import type { PortalSettingsPatch } from "@/portal/server/types";

// GET    /api/portal/settings    — admin projection (secrets replaced
//                                   with the SECRET_PLACEHOLDER sentinel)
// POST   /api/portal/settings    — partial update; sentinel values are
//                                   ignored so existing secrets aren't
//                                   accidentally cleared
// DELETE /api/portal/settings    — reset to defaults
//
// Same-origin only — no CORS headers. Returns secrets-redacted shapes
// only; the actual PAT / KV URL / Postgres URL never leave the server.

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({ ok: true, settings: getAdminSettings() });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const patch = (body && typeof body === "object" ? body : {}) as PortalSettingsPatch;
  applyAdminPatch(patch);
  return NextResponse.json({ ok: true, settings: getAdminSettings() });
}

export async function DELETE() {
  await ensureHydrated();
  resetSettings();
  return NextResponse.json({ ok: true, settings: getAdminSettings() });
}
