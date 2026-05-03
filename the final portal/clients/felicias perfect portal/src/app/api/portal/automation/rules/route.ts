// GET  /api/portal/automation/rules?orgId=...
// POST /api/portal/automation/rules
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listRules, createRule, type AutomationAction } from "@/portal/server/automation";
import type { AquaEventName } from "@/portal/server/eventBus";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId") ?? "agency";
  return NextResponse.json({ ok: true, rules: listRules(orgId) });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string; name?: string; trigger?: string;
    filter?: Array<{ path: string; equals: string | number | boolean }>;
    actions?: AutomationAction[];
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.name || !body.trigger || !body.actions) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const rule = createRule({
    orgId: body.orgId,
    name: body.name,
    trigger: body.trigger as AquaEventName,
    filter: body.filter,
    actions: body.actions,
  });
  return NextResponse.json({ ok: true, rule });
}
