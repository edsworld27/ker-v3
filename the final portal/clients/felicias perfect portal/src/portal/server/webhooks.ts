// Webhooks runtime — backs the Webhooks plugin.
//
// Operators configure outbound URLs via /admin/webhooks; this module
// listens to the internal event bus and POSTs HMAC-signed JSON to
// each matching URL. Failures retry with exponential backoff up to
// the plugin's `maxRetries` setting.

import "server-only";
import crypto from "crypto";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { on, type AquaEvent, type AquaEventName } from "./eventBus";

export interface WebhookConfig {
  id: string;
  orgId: string;
  url: string;
  secret: string;                 // HMAC secret
  events: Array<AquaEventName | "*">;
  enabled: boolean;
  description?: string;
  createdAt: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  orgId: string;
  event: string;
  url: string;
  status: "delivered" | "failed" | "retrying";
  attempt: number;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  payload: unknown;
  createdAt: number;
  deliveredAt?: number;
}

interface WebhookState {
  webhooks?: WebhookConfig[];
  webhookDeliveries?: WebhookDelivery[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export interface CreateWebhookInput {
  orgId: string;
  url: string;
  secret?: string;
  events?: Array<AquaEventName | "*">;
  description?: string;
}

export function createWebhook(input: CreateWebhookInput): WebhookConfig {
  const wh: WebhookConfig = {
    id: makeId("wh"),
    orgId: input.orgId,
    url: input.url,
    secret: input.secret ?? crypto.randomBytes(24).toString("hex"),
    events: (input.events && input.events.length > 0) ? input.events : ["*"],
    enabled: true,
    description: input.description,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as WebhookState;
    if (!s.webhooks) s.webhooks = [];
    s.webhooks.push(wh);
  });
  return wh;
}

export function listWebhooks(orgId: string): WebhookConfig[] {
  const s = getState() as unknown as WebhookState;
  return (s.webhooks ?? []).filter(w => w.orgId === orgId);
}

export function deleteWebhook(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as WebhookState;
    if (!s.webhooks) return;
    const before = s.webhooks.length;
    s.webhooks = s.webhooks.filter(w => !(w.id === id && w.orgId === orgId));
    removed = s.webhooks.length < before;
  });
  return removed;
}

export function setWebhookEnabled(orgId: string, id: string, enabled: boolean): void {
  mutate(state => {
    const s = state as unknown as WebhookState;
    const w = (s.webhooks ?? []).find(x => x.id === id && x.orgId === orgId);
    if (w) w.enabled = enabled;
  });
}

export function listDeliveries(orgId: string, webhookId?: string, limit = 100): WebhookDelivery[] {
  const s = getState() as unknown as WebhookState;
  return (s.webhookDeliveries ?? [])
    .filter(d => d.orgId === orgId && (!webhookId || d.webhookId === webhookId))
    .slice(-limit)
    .reverse();
}

// ─── Plugin config + dispatch ──────────────────────────────────────────────

interface RuntimeConfig { maxRetries: number; timeoutMs: number; userAgent: string }

function getPluginConfig(orgId: string): RuntimeConfig {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "webhooks");
  const c = (install?.config as Record<string, unknown> | undefined) ?? {};
  return {
    maxRetries: typeof c.maxRetries === "number" ? c.maxRetries : 3,
    timeoutMs:  typeof c.timeoutMs === "number" ? c.timeoutMs : 5000,
    userAgent:  typeof c.userAgent === "string" ? c.userAgent : "Aqua-Webhooks/0.1",
  };
}

function sign(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function dispatch(webhook: WebhookConfig, event: AquaEvent, attempt: number): Promise<void> {
  const cfg = getPluginConfig(webhook.orgId);
  const body = JSON.stringify(event);
  const signature = sign(webhook.secret, body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);

  let status: WebhookDelivery["status"] = "retrying";
  let responseCode: number | undefined;
  let responseBody: string | undefined;
  let error: string | undefined;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": cfg.userAgent,
        "X-Aqua-Event": event.name,
        "X-Aqua-Org": event.orgId,
        "X-Aqua-Signature": signature,
        "X-Aqua-Timestamp": String(event.emittedAt),
      },
      body,
      signal: controller.signal,
    });
    responseCode = res.status;
    responseBody = (await res.text().catch(() => "")).slice(0, 500);
    status = res.ok ? "delivered" : (attempt >= cfg.maxRetries ? "failed" : "retrying");
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    status = attempt >= cfg.maxRetries ? "failed" : "retrying";
  } finally {
    clearTimeout(timeout);
  }

  // Persist the attempt.
  const delivery: WebhookDelivery = {
    id: makeId("whd"),
    webhookId: webhook.id,
    orgId: webhook.orgId,
    event: event.name,
    url: webhook.url,
    status,
    attempt,
    responseCode,
    responseBody,
    error,
    payload: event.payload,
    createdAt: Date.now(),
    deliveredAt: status === "delivered" ? Date.now() : undefined,
  };
  mutate(state => {
    const s = state as unknown as WebhookState;
    if (!s.webhookDeliveries) s.webhookDeliveries = [];
    s.webhookDeliveries.push(delivery);
    s.webhookDeliveries = s.webhookDeliveries.slice(-5000);
  });

  // Retry on failure with exponential backoff (1s, 2s, 4s, …).
  if (status === "retrying" && attempt < cfg.maxRetries) {
    const delay = Math.min(60_000, 1000 * Math.pow(2, attempt - 1));
    setTimeout(() => { void dispatch(webhook, event, attempt + 1); }, delay);
  }
}

// ─── Bus subscription ──────────────────────────────────────────────────────

let bound = false;

export function bindEventBus(): void {
  if (bound) return;
  bound = true;
  on("*", async event => {
    const subs = listWebhooks(event.orgId).filter(w =>
      w.enabled && (w.events.includes("*") || w.events.includes(event.name)),
    );
    for (const wh of subs) {
      void dispatch(wh, event, 1);
    }
  });
}

// Eagerly bind so anything that imports this module activates it.
bindEventBus();
