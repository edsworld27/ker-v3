// POST /api/portal/help/ask  { question, currentRoute }
//
// "Ask Aqua" — non-technical operators type a question, get a markdown
// answer back from Claude grounded in the in-tree help docs + a hint
// about which admin page they're currently on.
//
// Anthropic key lives in portal settings (set under
// /admin/portal-settings → Integrations → Anthropic key). Without a key
// the route returns 503 with a typed error so the UI can show "Connect
// Anthropic to enable AI assistant" instead of a generic failure.
//
// Prompt-caching: the help-docs system prompt is stable across every
// request, so we attach `cache_control: ephemeral` to the system block
// — first request mints the cache (~1.25× cost), subsequent reads are
// ~0.1× of input price. The varying user message stays after the
// breakpoint so cache hits are reliable. Verify with
// usage.cache_read_input_tokens.

import { NextRequest, NextResponse } from "next/server";
import { ensureHydrated } from "@/portal/server/storage";
import { getSettings } from "@/portal/server/settings";
import { requireAdmin } from "@/lib/server/auth";
import { rateLimit, clientIpFromHeaders } from "@/lib/server/rateLimit";
import { HELP_DOCS } from "@/lib/admin/helpDocs";

export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-7";

// Stable system prompt — keep static so the prefix hashes the same
// every request and the prompt-cache breakpoint pays off.
const SYSTEM_PREAMBLE = `You are Aqua — the in-product assistant for an admin panel that runs e-commerce, content, and SaaS portals. You help non-technical operators (think: a small-business owner running their first storefront) understand and operate the admin.

Tone: warm, direct, concrete. Speak as a knowledgeable colleague, not a manual.

Rules:
1. Answer in GitHub-flavoured markdown.
2. Ground every answer in the help docs below. If a question isn't covered, say so plainly and suggest the closest documented page.
3. Prefer step-by-step instructions when the question is "how do I X". Use numbered lists.
4. Reference admin routes as code spans (e.g. \`/admin/sites\`) so the operator can copy-paste them.
5. Never invent admin routes, settings, or commands that aren't in the docs. If a path isn't documented, omit it — don't guess.
6. Keep answers short. 3-6 sentences for simple questions; bullet list for procedures. Operators are mid-task — they want the answer, not a treatise.
7. End with a single "Next:" line pointing at the most useful related page when relevant. Skip when not.

The help docs are below. Each entry's key is the admin route it documents.`;

function serializeDocs(): string {
  const lines: string[] = [];
  for (const [route, doc] of Object.entries(HELP_DOCS)) {
    lines.push(`## \`${route}\` — ${doc.title}`);
    if (doc.intro) lines.push(doc.intro);
    for (const s of doc.sections) {
      lines.push(`### ${s.heading}`);
      lines.push(s.body);
      if (s.bullets) for (const b of s.bullets) lines.push(`- ${b}`);
      if (s.link) lines.push(`Link: ${s.link.label} → ${s.link.href}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

const SYSTEM_TEXT = `${SYSTEM_PREAMBLE}\n\n${serializeDocs()}`;

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  error?: { type?: string; message?: string };
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); }
  catch (r) { return r as Response; }
  await ensureHydrated();

  const ip = clientIpFromHeaders(req.headers);
  const ipCheck = rateLimit({ key: `ask:ip:${ip}`, max: 30, windowMs: 60_000 });
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSec) } },
    );
  }

  const settings = getSettings();
  const apiKey = settings.integrations?.anthropicKey?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "anthropic-key-missing",
        message: "Anthropic API key not configured. Set it under Portal settings → Integrations.",
      },
      { status: 503 },
    );
  }

  let body: { question?: string; currentRoute?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 }); }

  const question = (body.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { ok: false, error: "question-too-long", message: "Keep questions under 1000 characters." },
      { status: 400 },
    );
  }

  const currentRoute = (body.currentRoute ?? "").trim().slice(0, 200);
  // Per-request user content stays small + varies — keep it after the
  // cache breakpoint so cache hits are reliable.
  const userText = currentRoute
    ? `Currently viewing: \`${currentRoute}\`\n\nQuestion: ${question}`
    : `Question: ${question}`;

  const requestBody = {
    model: MODEL,
    max_tokens: 1024,
    // Adaptive thinking — Claude decides when/how much to think for each
    // question. Effort medium balances cost against quality for help Q&A.
    thinking: { type: "adaptive" as const },
    output_config: { effort: "medium" as const },
    system: [
      {
        type: "text",
        text: SYSTEM_TEXT,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [
      { role: "user", content: [{ type: "text", text: userText }] },
    ],
  };

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: "network-error", message: e instanceof Error ? e.message : "Couldn't reach Anthropic." },
      { status: 502 },
    );
  }

  const data = await res.json().catch(() => ({})) as AnthropicResponse;
  if (!res.ok || !data.content) {
    const message = data.error?.message ?? `Anthropic ${res.status}`;
    return NextResponse.json({ ok: false, error: "anthropic-failed", message }, { status: 502 });
  }

  const answer = (data.content ?? [])
    .filter(b => b.type === "text")
    .map(b => b.text ?? "")
    .join("\n")
    .trim();

  return NextResponse.json({
    ok: true,
    answer,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      cacheReadInputTokens: data.usage?.cache_read_input_tokens,
      cacheCreationInputTokens: data.usage?.cache_creation_input_tokens,
    },
  });
}
