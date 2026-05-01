import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listOrgs, createOrg } from "@/portal/server/orgs";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({ ok: true, orgs: listOrgs() });
}

export async function POST(req: NextRequest) {
  await ensureHydrated();
  let body: { name?: string; slug?: string; ownerEmail?: string; brandColor?: string; logoUrl?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ ok: false, error: "missing-name" }, { status: 400 });
  }
  const org = createOrg({
    name: body.name.trim(),
    slug: typeof body.slug === "string" ? body.slug : undefined,
    ownerEmail: typeof body.ownerEmail === "string" ? body.ownerEmail : undefined,
    brandColor: typeof body.brandColor === "string" ? body.brandColor : undefined,
    logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : undefined,
  });
  return NextResponse.json({ ok: true, org });
}
