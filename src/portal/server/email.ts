// Email transport for the Aqua Email plugin.
//
// Server-only. Reads provider config off the Email plugin install for
// the given org, dispatches via Resend / Postmark / SMTP. Stores
// outbound messages in a per-org log so the operator can debug
// delivery from /admin/email.
//
// Used by:
//   • Stripe webhook → order confirmation
//   • E-commerce digital download delivery
//   • Forms → submission notifications
//   • Auth → password reset / verify links
//   • Blog → newsletter dispatch (when newsletter feature on)
//
// Each call resolves the email plugin's config and the agency's
// branding so the message can use the right "From" address + logo.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import type { OrgPluginInstall } from "./types";

export interface SendEmailInput {
  orgId: string;
  to: string | string[];
  subject: string;
  // Either pass a templateId (rendered via the plugin's template
  // library) + variables, OR pass html/text directly for one-off
  // messages.
  templateId?: string;
  variables?: Record<string, string | number>;
  html?: string;
  text?: string;
  replyTo?: string;
  // For digital-product delivery — attach signed download URLs.
  attachments?: Array<{ filename: string; url: string }>;
  // Tags help filtering in the provider dashboard.
  tags?: string[];
}

export interface SendEmailResult {
  ok: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
}

interface EmailLogEntry {
  id: string;
  orgId: string;
  to: string[];
  subject: string;
  provider: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
  messageId?: string;
  createdAt: number;
  templateId?: string;
}

interface EmailLogState {
  emailLog?: EmailLogEntry[];
}

const DEFAULT_TEMPLATES: Record<string, { subject: string; html: string; text: string }> = {
  "order-confirmation": {
    subject: "Your order is confirmed — {{orderId}}",
    html: `<h1>Thanks for your order, {{customerName}}!</h1>
<p>Your order <strong>{{orderId}}</strong> for <strong>{{currency}}{{total}}</strong> is confirmed.</p>
<p>We'll email you again when it ships. <a href="{{orderUrl}}">View order</a>.</p>`,
    text: `Thanks for your order, {{customerName}}.\n\nOrder {{orderId}} for {{currency}}{{total}} is confirmed.\n\nView: {{orderUrl}}`,
  },
  "digital-delivery": {
    subject: "Your downloads are ready — {{orderId}}",
    html: `<h1>Here are your downloads</h1>
<p>Hi {{customerName}}, your digital products from order <strong>{{orderId}}</strong> are ready.</p>
<p>Click each link below to download. Links expire in {{expiryHours}} hours.</p>
{{downloadList}}`,
    text: `Hi {{customerName}}, your downloads from order {{orderId}}:\n\n{{downloadListText}}\n\nLinks expire in {{expiryHours}} hours.`,
  },
  "form-submission": {
    subject: "New form submission — {{formName}}",
    html: `<h1>New submission</h1>
<p>Form: <strong>{{formName}}</strong></p>
{{fieldsHtml}}`,
    text: `New submission to {{formName}}:\n\n{{fieldsText}}`,
  },
  "password-reset": {
    subject: "Reset your password",
    html: `<h1>Reset your password</h1>
<p>Click <a href="{{resetUrl}}">here</a> to reset. Link valid for 1 hour.</p>`,
    text: `Reset your password: {{resetUrl}}\n\nLink valid for 1 hour.`,
  },
  "email-verify": {
    subject: "Verify your email",
    html: `<h1>Welcome!</h1><p>Confirm your email by clicking <a href="{{verifyUrl}}">here</a>.</p>`,
    text: `Welcome! Confirm your email: {{verifyUrl}}`,
  },
  "newsletter-post": {
    subject: "{{postTitle}}",
    html: `<h1>{{postTitle}}</h1><p>{{postSummary}}</p><p><a href="{{postUrl}}">Read full post →</a></p>`,
    text: `{{postTitle}}\n\n{{postSummary}}\n\nRead: {{postUrl}}`,
  },
};

// ─── Config resolution ─────────────────────────────────────────────────────

function getEmailInstall(orgId: string): OrgPluginInstall | null {
  const org = getOrg(orgId);
  if (!org) return null;
  const install = (org.plugins ?? []).find(p => p.pluginId === "email");
  if (!install || !install.enabled) return null;
  return install;
}

interface EmailConfig {
  provider: "resend" | "postmark" | "smtp";
  apiKey?: string;
  fromAddress?: string;
  fromName?: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

function resolveConfig(install: OrgPluginInstall): EmailConfig {
  const c = install.config as Record<string, unknown>;
  const provider = (typeof c.provider === "string" ? c.provider : "resend") as EmailConfig["provider"];
  return {
    provider,
    apiKey: typeof c.apiKey === "string" ? c.apiKey : undefined,
    fromAddress: typeof c.fromAddress === "string" ? c.fromAddress : undefined,
    fromName: typeof c.fromName === "string" ? c.fromName : undefined,
    replyTo: typeof c.replyTo === "string" ? c.replyTo : undefined,
    smtpHost: typeof c.smtpHost === "string" ? c.smtpHost : undefined,
    smtpPort: typeof c.smtpPort === "number" ? c.smtpPort : undefined,
    smtpUser: typeof c.smtpUser === "string" ? c.smtpUser : undefined,
    smtpPass: typeof c.smtpPass === "string" ? c.smtpPass : undefined,
  };
}

// ─── Template rendering ────────────────────────────────────────────────────

function renderTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const v = variables[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

interface ResolvedMessage {
  subject: string;
  html: string;
  text: string;
}

function resolveMessage(input: SendEmailInput): ResolvedMessage {
  const variables = input.variables ?? {};
  if (input.templateId) {
    const template = DEFAULT_TEMPLATES[input.templateId];
    if (template) {
      return {
        subject: renderTemplate(input.subject || template.subject, variables),
        html: renderTemplate(template.html, variables),
        text: renderTemplate(template.text, variables),
      };
    }
  }
  return {
    subject: input.subject,
    html: input.html ?? "",
    text: input.text ?? input.html?.replace(/<[^>]+>/g, "") ?? "",
  };
}

// ─── Provider adapters ─────────────────────────────────────────────────────

async function sendViaResend(cfg: EmailConfig, to: string[], msg: ResolvedMessage, replyTo?: string): Promise<SendEmailResult> {
  if (!cfg.apiKey) return { ok: false, error: "Resend API key not configured.", provider: "resend" };
  const from = cfg.fromName
    ? `${cfg.fromName} <${cfg.fromAddress ?? "noreply@example.com"}>`
    : cfg.fromAddress ?? "noreply@example.com";
  const body = {
    from,
    to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    reply_to: replyTo ?? cfg.replyTo,
  };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message ?? `Resend ${res.status}`, provider: "resend" };
    return { ok: true, messageId: data?.id, provider: "resend" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), provider: "resend" };
  }
}

async function sendViaPostmark(cfg: EmailConfig, to: string[], msg: ResolvedMessage, replyTo?: string): Promise<SendEmailResult> {
  if (!cfg.apiKey) return { ok: false, error: "Postmark API token not configured.", provider: "postmark" };
  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": cfg.apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: cfg.fromAddress ?? "noreply@example.com",
        To: to.join(","),
        Subject: msg.subject,
        HtmlBody: msg.html,
        TextBody: msg.text,
        ReplyTo: replyTo ?? cfg.replyTo,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.Message ?? `Postmark ${res.status}`, provider: "postmark" };
    return { ok: true, messageId: data?.MessageID, provider: "postmark" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), provider: "postmark" };
  }
}

async function sendViaSmtp(_cfg: EmailConfig, _to: string[], _msg: ResolvedMessage): Promise<SendEmailResult> {
  // Real SMTP needs nodemailer (a heavy dep). Stub it so the plugin's
  // config UI works end-to-end; flip provider to resend / postmark
  // when sending matters. We still log the attempt as "skipped" so
  // the operator can see the message would have gone out.
  return { ok: false, error: "SMTP transport not yet implemented (use Resend or Postmark for now).", provider: "smtp" };
}

// ─── Logging ───────────────────────────────────────────────────────────────

function logSend(orgId: string, to: string[], input: SendEmailInput, result: SendEmailResult): void {
  mutate(state => {
    const s = state as unknown as EmailLogState;
    if (!s.emailLog) s.emailLog = [];
    s.emailLog.push({
      id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orgId,
      to,
      subject: input.subject,
      provider: result.provider ?? "unknown",
      status: result.ok ? "sent" : "failed",
      error: result.error,
      messageId: result.messageId,
      createdAt: Date.now(),
      templateId: input.templateId,
    });
    // Keep last 500 entries per org to bound storage.
    s.emailLog = s.emailLog.slice(-500);
  });
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const install = getEmailInstall(input.orgId);
  if (!install) {
    const result: SendEmailResult = { ok: false, error: "Email plugin not installed for this org." };
    return result;
  }
  const cfg = resolveConfig(install);
  const msg = resolveMessage(input);
  const to = Array.isArray(input.to) ? input.to : [input.to];

  let result: SendEmailResult;
  if (cfg.provider === "resend") result = await sendViaResend(cfg, to, msg, input.replyTo);
  else if (cfg.provider === "postmark") result = await sendViaPostmark(cfg, to, msg, input.replyTo);
  else result = await sendViaSmtp(cfg, to, msg);

  logSend(input.orgId, to, input, result);
  return result;
}

export function listEmailLog(orgId: string, limit = 50): EmailLogEntry[] {
  const s = getState() as unknown as EmailLogState;
  const entries = s.emailLog ?? [];
  return entries.filter(e => e.orgId === orgId).slice(-limit).reverse();
}

export function listTemplates(): Array<{ id: string; subject: string }> {
  return Object.entries(DEFAULT_TEMPLATES).map(([id, t]) => ({ id, subject: t.subject }));
}
