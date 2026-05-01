import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSubscription, setSubscription, cancelSubscription, listFeatures, listPlans } from "@/portal/server/billing";
import type { PlanId } from "@/portal/server/types";

// GET    /api/portal/billing/[orgId]    — current subscription + plan list + active flags
// POST   /api/portal/billing/[orgId]    — { planId } → set/swap subscription
// DELETE /api/portal/billing/[orgId]    — cancel current subscription

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  return NextResponse.json({
    ok: true,
    subscription: getSubscription(orgId),
    features: listFeatures(orgId),
    plans: listPlans(),
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  let body: { planId?: PlanId };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }
  if (!body.planId) return NextResponse.json({ ok: false, error: "missing-plan" }, { status: 400 });
  const sub = setSubscription(orgId, body.planId, "active");
  if (!sub) return NextResponse.json({ ok: false, error: "org-not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, subscription: sub });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  await ensureHydrated();
  const { orgId } = await ctx.params;
  const sub = cancelSubscription(orgId);
  if (!sub) return NextResponse.json({ ok: false, error: "no-subscription" }, { status: 404 });
  return NextResponse.json({ ok: true, subscription: sub });
}
