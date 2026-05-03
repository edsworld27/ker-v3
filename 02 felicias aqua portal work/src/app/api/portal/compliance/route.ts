import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { requireAdmin } from "@/lib/server/auth";
import { getCompliance, getComplianceReport } from "@/portal/server/compliance";
import { saveSettings } from "@/portal/server/settings";
import type { ComplianceMode } from "@/portal/server/types";

// GET    /api/portal/compliance         — current settings + report
// POST   /api/portal/compliance         — update mode / overrides
//
// Same-origin only. The report is a computed view (no settings to leak)
// so even unauth'd in dev it's safe to surface.

export const dynamic = "force-dynamic";

const VALID_MODES: ReadonlyArray<ComplianceMode> = ["none", "gdpr", "hipaa", "soc2"];

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({
    ok: true,
    settings: getCompliance(),
    report: getComplianceReport(),
  });
}

export async function POST(req: NextRequest) {
  // Mutates legal/compliance posture for the org — admin only.
  try { await requireAdmin(); } catch (e) { if (e instanceof Response) return e; throw e; }
  await ensureHydrated();
  let body: {
    mode?: string;
    auditRetentionDaysOverride?: number;
    acknowledgeWarning?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const current = getCompliance();
  const next = { ...current };

  if (typeof body.mode === "string") {
    if (!VALID_MODES.includes(body.mode as ComplianceMode)) {
      return NextResponse.json({ ok: false, error: `Invalid mode "${body.mode}"` }, { status: 400 });
    }
    next.mode = body.mode as ComplianceMode;
  }
  if (typeof body.auditRetentionDaysOverride === "number") {
    next.auditRetentionDaysOverride = Math.max(0, Math.floor(body.auditRetentionDaysOverride));
  }
  if (typeof body.acknowledgeWarning === "string" && body.acknowledgeWarning) {
    const acks = new Set(next.acknowledgedWarnings ?? []);
    acks.add(body.acknowledgeWarning);
    next.acknowledgedWarnings = Array.from(acks);
  }

  saveSettings({ compliance: next });
  return NextResponse.json({
    ok: true,
    settings: getCompliance(),
    report: getComplianceReport(),
  });
}
