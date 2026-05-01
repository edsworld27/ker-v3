// GET /api/portal/webhooks/deliveries?orgId=...&webhookId=...
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listDeliveries } from "@/portal/server/webhooks";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const webhookId = req.nextUrl.searchParams.get("webhookId") ?? undefined;
  return NextResponse.json({ ok: true, deliveries: listDeliveries(orgId, webhookId) });
}
