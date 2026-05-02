// GET  /api/portal/email/templates?orgId=... — list bundled templates with
//   any org-saved overrides applied. Each entry has subject / html / text
//   plus an isOverridden flag so the UI can show a "modified" badge.
// PUT  /api/portal/email/templates                — save an override.
//   body: { orgId, templateId, subject?, html?, text? }
// DELETE /api/portal/email/templates              — clear an override
//   (revert to bundled default). body: { orgId, templateId }
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import {
  listResolvedTemplates, getResolvedTemplate,
  setTemplateOverride, clearTemplateOverride,
} from "@/portal/server/email";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ ok: false, error: "missing-orgId" }, { status: 400 });
  const templateId = req.nextUrl.searchParams.get("id");
  if (templateId) {
    const t = getResolvedTemplate(orgId, templateId);
    if (!t) return NextResponse.json({ ok: false, error: "unknown-template" }, { status: 404 });
    return NextResponse.json({ ok: true, template: t });
  }
  return NextResponse.json({ ok: true, templates: listResolvedTemplates(orgId) });
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; templateId?: string; subject?: string; html?: string; text?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.templateId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  const ok = setTemplateOverride(body.orgId, body.templateId, {
    subject: body.subject,
    html: body.html,
    text: body.text,
  });
  if (!ok) return NextResponse.json({ ok: false, error: "unknown-template" }, { status: 404 });
  const t = getResolvedTemplate(body.orgId, body.templateId);
  return NextResponse.json({ ok: true, template: t });
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { orgId?: string; templateId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.orgId || !body.templateId) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  clearTemplateOverride(body.orgId, body.templateId);
  const t = getResolvedTemplate(body.orgId, body.templateId);
  return NextResponse.json({ ok: true, template: t });
}
