// GET /api/portal/crm/deals?orgId=...
// POST /api/portal/crm/deals
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listDeals, createDeal } from "@/portal/server/crm";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const contactId = req.nextUrl.searchParams.get("contactId") ?? undefined;
  return NextResponse.json({ ok: true, deals: listDeals(orgId, contactId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; contactId?: string; title?: string; value?: number; currency?: string; stage?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.contactId || !body.title) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const d = createDeal({
    orgId: body.orgId, contactId: body.contactId,
    title: body.title, value: body.value, currency: body.currency, stage: body.stage,
  });
  return NextResponse.json({ ok: true, deal: d });
}
