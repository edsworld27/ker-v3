// POST /api/portal/forms/submit — receive a storefront form submission.
//
// Public endpoint — no auth, since real visitors fill these forms.
// Resolves the active org from a body field or from the Origin header
// (a future iteration will let SiteResolver inject orgId at SSR).
//
// Honeypot: if `website` field is non-empty, treat as bot and return
// 200 without persisting.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ensureHydrated } from "@/portal/server/storage";
import { recordSubmission, getFormsConfig } from "@/portal/server/formSubmissions";
import { sendEmail } from "@/portal/server/email";
import { emit } from "@/portal/server/eventBus";
import "@/portal/server/webhooks";       // event bus → outbound webhooks
import "@/portal/server/notifications";  // event bus → in-app + email digest

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Body {
  orgId?: string;
  formName?: string;
  fields?: Record<string, string>;
}

function hashIp(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
             req.headers.get("x-real-ip") ?? "anon";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const orgId = body.orgId ?? "agency";
  const formName = body.formName ?? "anonymous";
  const fields = body.fields ?? {};

  // Honeypot
  if (fields.website && String(fields.website).trim()) {
    return NextResponse.json({ ok: true, dropped: "honeypot" });
  }

  await ensureHydrated();

  const submission = recordSubmission({
    orgId, formName, fields,
    ip: hashIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Best-effort email + webhook notification.
  const cfg = getFormsConfig(orgId);
  if (cfg?.notifyEmail) {
    const fieldsHtml = Object.entries(fields)
      .filter(([k]) => k !== "website")
      .map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</p>`)
      .join("");
    const fieldsText = Object.entries(fields)
      .filter(([k]) => k !== "website")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    await sendEmail({
      orgId,
      to: cfg.notifyEmail,
      subject: `New ${formName} submission`,
      templateId: "form-submission",
      variables: {
        formName,
        fieldsHtml,
        fieldsText,
      },
      tags: ["form-submission", `form:${formName}`, `org:${orgId}`],
    }).catch(() => undefined);
  }

  if (cfg?.webhookUrl) {
    void fetch(cfg.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cfg.webhookSecret ? { "X-Aqua-Signature": signWebhook(cfg.webhookSecret, submission.id) } : {}),
      },
      body: JSON.stringify({
        id: submission.id,
        orgId, formName, fields,
        createdAt: submission.createdAt,
      }),
    }).catch(() => undefined);
  }

  // Emit event so Webhooks plugin (and future listeners) can react.
  emit(orgId, "form.submitted", {
    submissionId: submission.id,
    formName,
    fields,
  });

  return NextResponse.json({ ok: true, id: submission.id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function signWebhook(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
