// POST /api/portal/domains             { domain }   attach via Vercel API
// DELETE /api/portal/domains?domain=…              remove
// POST /api/portal/domains/verify       { domain }  re-check verification
//
// All admin-gated. When VERCEL_TOKEN / VERCEL_PROJECT_ID aren't set the
// route returns ok:false with a descriptive error so the UI can fall
// back to the existing manual-DNS path. The Vercel API returns the
// verification records the operator must add at their registrar; we
// pass those through verbatim.
import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { attachDomain, removeDomain, isConfigured } from "@/lib/vercel/server";
import { requireAdmin } from "@/lib/server/auth";
import { recordAdminAction } from "@/portal/server/activity";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isConfigured(),
  });
}

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  let body: { domain?: string };
  try { body = await req.json(); }
  catch { body = {}; }

  if (!body.domain) {
    return NextResponse.json({ ok: false, error: "missing-domain" }, { status: 400 });
  }

  try {
    const result = await attachDomain(body.domain);
    if (result.ok) {
      recordAdminAction(actor, {
        category: "settings",
        action: `Attached domain ${result.domain} via Vercel${result.verified ? " (verified)" : " (DNS pending)"}`,
        resourceId: result.domain,
        resourceLink: "/admin/sites",
      });
    }
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "vercel-attach-failed" },
      { status: 502 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const domain = req.nextUrl.searchParams.get("domain") ?? "";
  if (!domain) {
    return NextResponse.json({ ok: false, error: "missing-domain" }, { status: 400 });
  }

  try {
    const result = await removeDomain(domain);
    if (result.ok) {
      recordAdminAction(actor, {
        category: "settings",
        action: `Removed domain ${domain} from Vercel`,
        resourceId: domain,
        resourceLink: "/admin/sites",
      });
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "vercel-remove-failed" },
      { status: 502 },
    );
  }
}
