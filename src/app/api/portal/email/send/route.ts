// POST /api/portal/email/send — operator-composed one-off email.
// Different from /api/portal/email/test in that the operator picks
// the subject + body. Sends via the configured provider, log entry
// is recorded against the org so it shows up in the Log tab.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { sendEmail } from "@/portal/server/email";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: {
    orgId?: string;
    to?: string | string[];
    subject?: string;
    html?: string;
    text?: string;
    replyTo?: string;
    templateId?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.to || !body.subject) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  if (!body.html && !body.text && !body.templateId) {
    return NextResponse.json({ ok: false, error: "empty-body" }, { status: 400 });
  }

  const result = await sendEmail({
    orgId: body.orgId,
    to: body.to,
    subject: body.subject,
    html: body.html,
    text: body.text,
    replyTo: body.replyTo,
    templateId: body.templateId,
    tags: ["compose"],
  });

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    messageId: result.messageId,
    provider: result.provider,
  });
}
