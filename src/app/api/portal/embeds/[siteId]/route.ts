import { NextRequest, NextResponse } from "next/server";
import { getEmbeds, setEmbeds, getPublicEmbeds } from "@/portal/server/embeds";
import { ensureHydrated } from "@/portal/server/storage";
import { isEmbedProviderAllowed, getComplianceMode } from "@/portal/server/compliance";
import type { Embed, EmbedProvider, EmbedPosition, ConsentCategory } from "@/portal/server/types";

// GET  /api/portal/embeds/[siteId]   — public, CORS-open. Returns the
//                                       narrow projection the <PortalEmbed>
//                                       renderer needs.
// POST /api/portal/embeds/[siteId]   — same-origin only. Admin replaces
//                                       the full embeds list atomically.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=30, s-maxage=30",
};

const KNOWN_PROVIDERS: ReadonlySet<EmbedProvider> = new Set<EmbedProvider>([
  "crisp", "intercom", "tidio", "calendly", "cal-com",
  "youtube", "vimeo", "custom-html",
]);

const KNOWN_POSITIONS: ReadonlySet<EmbedPosition> = new Set<EmbedPosition>([
  "popup-bottom-right", "popup-bottom-left", "inline", "bottom-bar",
]);

const KNOWN_CONSENT: ReadonlySet<ConsentCategory> = new Set<ConsentCategory>([
  "analytics", "marketing", "functional",
]);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  // ?admin=1 returns the full Embed[] (used by the admin UI). The default
  // is the narrow projection consumed by <PortalEmbed/>.
  const wantsAdmin = new URL(req.url).searchParams.get("admin") === "1";
  const body = wantsAdmin ? getEmbeds(siteId) : getPublicEmbeds(siteId);
  return NextResponse.json(body, { headers: corsHeaders });
}

// Admin save. Accepts the full embeds array so the admin can replace the
// list atomically. No CORS — same-origin only.
export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const input = body as { embeds?: unknown };
  if (!Array.isArray(input.embeds)) {
    return NextResponse.json({ ok: false, error: "embeds-must-be-array" }, { status: 400 });
  }
  const errors: string[] = [];
  const valid: Embed[] = [];
  for (let i = 0; i < input.embeds.length; i++) {
    const raw = input.embeds[i];
    const err = validateEmbed(raw, i);
    if (err) errors.push(err);
    else valid.push(raw as Embed);
  }
  if (errors.length) {
    return NextResponse.json({ ok: false, error: "validation", details: errors }, { status: 400 });
  }

  // Compliance gate (E-3): HIPAA mode forbids enabling embeds whose
  // provider doesn't offer a BAA pathway. Disabled embeds can still
  // be persisted as historical config.
  const blocked = valid.filter(e => e.enabled && !isEmbedProviderAllowed(e.provider));
  if (blocked.length > 0) {
    return NextResponse.json({
      ok: false,
      error: `Compliance mode "${getComplianceMode()}" forbids enabling these embed providers: ${blocked.map(b => b.provider).join(", ")}.`,
      blockedProviders: blocked.map(b => b.provider),
    }, { status: 412 });
  }

  const saved = setEmbeds(siteId, valid);
  return NextResponse.json({ ok: true, embeds: saved });
}

function validateEmbed(t: unknown, index: number): string | null {
  if (!t || typeof t !== "object") return `embeds[${index}]: not an object`;
  const o = t as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) return `embeds[${index}]: id must be a non-empty string`;
  if (typeof o.provider !== "string" || !KNOWN_PROVIDERS.has(o.provider as EmbedProvider))
    return `embeds[${index}]: unknown provider "${String(o.provider)}"`;
  if (typeof o.enabled !== "boolean") return `embeds[${index}]: enabled must be boolean`;
  if (typeof o.value !== "string") return `embeds[${index}]: value must be a string`;
  // Empty value is OK for disabled embeds (lets the admin save in-progress
  // edits) but enabled embeds must have something to render.
  if (o.enabled && !o.value.trim()) return `embeds[${index}]: enabled embeds need a value`;
  if (o.position !== undefined && !KNOWN_POSITIONS.has(o.position as EmbedPosition))
    return `embeds[${index}]: invalid position "${String(o.position)}"`;
  if (o.consentCategory !== undefined && !KNOWN_CONSENT.has(o.consentCategory as ConsentCategory))
    return `embeds[${index}]: invalid consentCategory "${String(o.consentCategory)}"`;
  if (o.settings !== undefined && (o.settings === null || typeof o.settings !== "object"))
    return `embeds[${index}]: settings must be an object`;
  if (o.label !== undefined && typeof o.label !== "string")
    return `embeds[${index}]: label must be a string`;
  return null;
}
