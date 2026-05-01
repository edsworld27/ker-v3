// POST /api/portal/email/test — send a quick verification email to
// confirm the operator's Email plugin config is valid.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { sendEmail } from "@/portal/server/email";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; to?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.to) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const result = await sendEmail({
    orgId: body.orgId,
    to: body.to,
    subject: "Test from Aqua Email",
    html: "<h1>Email plugin works.</h1><p>This is a test message confirming your provider keys are correct.</p>",
    text: "Email plugin works.\n\nThis is a test message confirming your provider keys are correct.",
    tags: ["test"],
  });

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    messageId: result.messageId,
  });
}
