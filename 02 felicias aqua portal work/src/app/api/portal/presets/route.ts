// GET /api/portal/presets — bundle definitions for one-click org setup.
import { NextResponse } from "next/server";
import { listPresets } from "@/plugins/_presets";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, presets: listPresets() });
}
