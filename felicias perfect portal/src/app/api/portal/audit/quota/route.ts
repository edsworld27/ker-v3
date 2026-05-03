import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getQuota } from "@/portal/server/audit";
import { getSettings } from "@/portal/server/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "";
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const settings = getSettings();
  return NextResponse.json({
    ok: true,
    quota: getQuota(orgId),
    pagespeedKeyConfigured: !!settings.integrations?.pagespeedKey,
    anthropicKeyConfigured: !!settings.integrations?.anthropicKey,
  });
}
