import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { supportStats } from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
  return NextResponse.json({ ok: true, stats: supportStats(orgId) });
}
