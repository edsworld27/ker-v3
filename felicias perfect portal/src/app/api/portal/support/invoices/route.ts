import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createInvoice, listInvoices } from "@/portal/server/support";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
  return NextResponse.json({ ok: true, items: listInvoices(orgId) });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { orgId?: string; amountTotal?: number; description?: string; currency?: string; dueDate?: number; lines?: Array<{ description: string; quantity: number; unitAmount: number }> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.orgId || typeof body.amountTotal !== "number") return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  const item = createInvoice({
    orgId: body.orgId,
    amountTotal: body.amountTotal,
    description: body.description,
    currency: body.currency,
    dueDate: body.dueDate,
    lines: body.lines,
  });
  return NextResponse.json({ ok: true, item });
}
