import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getChatbotConfig, setChatbotConfig } from "@/portal/server/chatbot";
import type { ChatbotConfig, ChatbotProvider } from "@/portal/server/types";

// GET  /api/portal/chatbot/[siteId]   — public, CORS-open. Used by the
//                                       ChatBot component on the storefront
//                                       to pick the right provider/copy.
// POST /api/portal/chatbot/[siteId]   — same-origin only. Admin saves the
//                                       full config atomically.
//
// The chatbot config is intentionally public — accent colour, position,
// welcome message, system prompt. None of it is sensitive; any visitor
// loading the host page sees all of it visually. We mirror the embed-theme
// route's CORS + cache headers for consistency.

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "public, max-age=30, s-maxage=30",
};

const KNOWN_PROVIDERS: ReadonlySet<ChatbotProvider> = new Set<ChatbotProvider>([
  "portal-builtin", "crisp", "intercom", "tidio", "custom-gpt",
]);

const KNOWN_POSITIONS: ReadonlySet<NonNullable<ChatbotConfig["position"]>> = new Set([
  "bottom-right", "bottom-left",
]);

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  return NextResponse.json(getChatbotConfig(siteId), { headers: corsHeaders });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  await ensureHydrated();
  const { siteId } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const err = validate(body);
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

  const saved = setChatbotConfig(siteId, body as ChatbotConfig);
  return NextResponse.json({ ok: true, config: saved });
}

function validate(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return "config must be an object";
  const o = raw as Record<string, unknown>;
  if (typeof o.provider !== "string" || !KNOWN_PROVIDERS.has(o.provider as ChatbotProvider))
    return `unknown provider "${String(o.provider)}"`;
  if (typeof o.enabled !== "boolean") return "enabled must be boolean";
  if (o.value !== undefined && typeof o.value !== "string") return "value must be a string";
  if (o.welcomeMessage !== undefined && typeof o.welcomeMessage !== "string")
    return "welcomeMessage must be a string";
  if (o.systemPrompt !== undefined && typeof o.systemPrompt !== "string")
    return "systemPrompt must be a string";
  if (o.position !== undefined && !KNOWN_POSITIONS.has(o.position as NonNullable<ChatbotConfig["position"]>))
    return `invalid position "${String(o.position)}"`;
  if (o.accentColor !== undefined && typeof o.accentColor !== "string")
    return "accentColor must be a string";
  return null;
}
