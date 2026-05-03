import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Aqua, the embedded assistant for the Aqua Portal — a multi-tenant SaaS for digital agencies.

The portal has these suites:
- CRM (Pipeline, Deals, Contacts, Activities, Reports, Leads)
- Finance Hub (transactions, partners, payouts, dashboards)
- People Hub (employees, jobs, audits)
- Operations Hub (cross-suite overview)
- Revenue Hub
  - Sales suite: Hub Overview, Pipeline, Calendar, Proposals, Lead Timeline, CRM Inbox
  - Marketing suite: Campaigns, Overview, Lead Funnel, Social Engagement, Channel Performance, Email Metrics, Content Calendar
- Client Portal (Portal, Dashboard, Resources, Agency Clients, Phases Hub, Web Studio, Management, Fulfillment)
- Plugin Marketplace for installing/configuring suites

Help the user navigate the portal, draft content, summarize data, plan work, and write code snippets when asked. Keep replies concise and practical. Use the user's domain context — when they say "the deal" they mean the CRM deal currently in view, when they say "this campaign" they mean the active marketing campaign, etc. If you genuinely need a clarification to give a useful answer, ask one focused question; otherwise make a reasonable assumption and answer.

Format your replies with short paragraphs and Markdown when helpful (lists, code blocks). Avoid unnecessary preamble — answer directly.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemContext?: string;
}

const encoder = new TextEncoder();

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
      { status: 500 },
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages array required.' }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = body.messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  const system: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ];
  if (body.systemContext && body.systemContext.trim().length > 0) {
    system.push({ type: 'text', text: `Live UI context:\n${body.systemContext}` });
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const response = client.messages.stream({
          model: 'claude-opus-4-7',
          max_tokens: 16_000,
          system,
          messages,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'high' },
        });

        response.on('text', delta => {
          send({ type: 'text', delta });
        });

        const finalMessage = await response.finalMessage();
        send({
          type: 'done',
          stopReason: finalMessage.stop_reason,
          usage: {
            input_tokens: finalMessage.usage.input_tokens,
            output_tokens: finalMessage.usage.output_tokens,
            cache_creation_input_tokens: finalMessage.usage.cache_creation_input_tokens ?? 0,
            cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens ?? 0,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const status =
          err instanceof Anthropic.APIError ? err.status : undefined;
        console.error('[api/ai/chat] streaming failed:', err);
        send({ type: 'error', message, status });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
