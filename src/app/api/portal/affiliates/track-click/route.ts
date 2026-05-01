// POST /api/portal/affiliates/track-click — record a referral click.
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { recordClick } from "@/portal/server/affiliates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function hashIp(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  let body: { orgId?: string; code?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.code) return NextResponse.json({ ok: false, error: "missing-code" }, { status: 400 });

  await ensureHydrated();
  recordClick(body.orgId ?? "agency", body.code, hashIp(req));
  return NextResponse.json({ ok: true });
}
