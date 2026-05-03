// GET /api/portal/crm/contacts?orgId=...&q=...
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listContacts, upsertContact } from "@/portal/server/crm";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json({ ok: true, contacts: listContacts(orgId, q) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; email?: string; name?: string; phone?: string; tags?: string[] };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.email) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const c = upsertContact({
    orgId: body.orgId, email: body.email,
    name: body.name, phone: body.phone, tags: body.tags,
    source: "manual",
  });
  return NextResponse.json({ ok: true, contact: c });
}
