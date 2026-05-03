import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { listOrgs, createOrg, getOrg } from "@/portal/server/orgs";
import { requireAdmin } from "@/lib/server/auth";
import { applyPreset, installCorePluginsForOrg } from "@/plugins/_runtime";
import { getPreset } from "@/plugins/_presets";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureHydrated();
  return NextResponse.json({ ok: true, orgs: listOrgs() });
}

export async function POST(req: NextRequest) {
  let session: { email?: string } | null = null;
  try { session = await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();
  let body: {
    name?: string; slug?: string; ownerEmail?: string;
    brandColor?: string; logoUrl?: string;
    // Optional preset to apply on creation. Core plugins (Brand Kit) install
    // unconditionally; the preset adds the rest.
    presetId?: string;
  };
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

  // Auto-install core plugins (Brand Kit) for every new org. Failure here
  // shouldn't fail the create — the operator can re-run from the marketplace.
  try { await installCorePluginsForOrg(org.id); } catch { /* swallowed by design */ }

  // If the operator picked a preset on the new-org form, apply it now.
  if (body.presetId) {
    const preset = getPreset(body.presetId);
    if (preset) {
      await applyPreset(org.id, preset, session?.email).catch(() => undefined);
    }
  }

  // Re-read so the response reflects the installed plugins.
  return NextResponse.json({ ok: true, org: getOrg(org.id) ?? org });
}
