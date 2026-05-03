// POST /api/portal/domains/verify   { domain }  re-check verification
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { verifyDomain } from "@/lib/vercel/server";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { domain?: string };
  try { body = await req.json(); }
  catch { body = {}; }

  if (!body.domain) {
    return NextResponse.json({ ok: false, error: "missing-domain" }, { status: 400 });
  }

  try {
    const result = await verifyDomain(body.domain);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "vercel-verify-failed" },
      { status: 502 },
    );
  }
}
