// Portal variant management for one site.
//
// GET  /api/portal/pages/[siteId]/portal-variants?role=login        — list variants for a role
// POST /api/portal/pages/[siteId]/portal-variants                    — set active variant
//      body: { role: PortalRole, pageId: string | null }
//        pageId set    → mark that page active for the role
//        pageId null   → clear (no active variant; route falls back to default)

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listVariantsForPortal, setActivePortalVariant } from "@/portal/server/pages";
import type { PortalRole } from "@/portal/server/types";

export const dynamic = "force-dynamic";

const ROLES: PortalRole[] = ["login", "affiliates", "orders", "account"];

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  const roleParam = req.nextUrl.searchParams.get("role");
  if (!roleParam || !ROLES.includes(roleParam as PortalRole)) {
    return NextResponse.json({ ok: false, error: "bad-role" }, { status: 400 });
  }
  const variants = listVariantsForPortal(siteId, roleParam as PortalRole);
  return NextResponse.json({ ok: true, role: roleParam, variants });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: { role?: PortalRole; pageId?: string | null };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.role || !ROLES.includes(body.role)) {
    return NextResponse.json({ ok: false, error: "bad-role" }, { status: 400 });
  }
  const pageId = body.pageId === null ? null : (body.pageId ?? null);
  const ok = setActivePortalVariant(siteId, body.role, pageId);
  if (!ok && pageId !== null) {
    return NextResponse.json({ ok: false, error: "page-not-found-or-wrong-role" }, { status: 404 });
  }
  const variants = listVariantsForPortal(siteId, body.role);
  return NextResponse.json({ ok: true, role: body.role, variants });
}
