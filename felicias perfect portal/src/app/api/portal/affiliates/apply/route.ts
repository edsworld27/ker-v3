// POST /api/portal/affiliates/apply — public affiliate signup form.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { createAffiliate } from "@/portal/server/affiliates";

export const dynamic = "force-dynamic";

interface Body { orgId?: string; email?: string; name?: string }

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.email || !body.name) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  await ensureHydrated();
  const aff = createAffiliate({
    orgId: body.orgId ?? "agency",
    email: body.email,
    name: body.name,
  });
  return NextResponse.json({ ok: true, code: aff.code, status: aff.status });
}
