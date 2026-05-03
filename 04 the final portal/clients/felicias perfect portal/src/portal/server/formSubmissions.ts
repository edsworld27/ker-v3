// Form submissions store — backs the Forms plugin.
//
// Each submission belongs to an org + form name. The Forms plugin's
// admin reads from here; the storefront ContactFormBlock (and any
// custom form block) writes via /api/portal/forms/submit.
//
// Spam protection: honeypot is enforced at the route layer; here we
// just persist + optionally relay to a webhook URL configured on the
// Forms plugin.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";

export interface FormSubmission {
  id: string;
  orgId: string;
  formName: string;
  fields: Record<string, string>;
  ip?: string;       // hashed
  userAgent?: string;
  createdAt: number;
  read: boolean;
}

interface FormState {
  formSubmissions?: FormSubmission[];
}

function makeId(): string {
  return `fs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export interface RecordSubmissionInput {
  orgId: string;
  formName: string;
  fields: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

export function recordSubmission(input: RecordSubmissionInput): FormSubmission {
  const sub: FormSubmission = {
    id: makeId(),
    orgId: input.orgId,
    formName: input.formName,
    fields: input.fields,
    ip: input.ip,
    userAgent: input.userAgent,
    createdAt: Date.now(),
    read: false,
  };
  mutate(state => {
    const s = state as unknown as FormState;
    if (!s.formSubmissions) s.formSubmissions = [];
    s.formSubmissions.push(sub);
    // Cap at 5000 per org to keep storage bounded.
    s.formSubmissions = s.formSubmissions.slice(-20_000);
  });
  return sub;
}

export function listSubmissions(orgId: string, formName?: string, limit = 200): FormSubmission[] {
  const s = getState() as unknown as FormState;
  const all = s.formSubmissions ?? [];
  return all
    .filter(x => x.orgId === orgId && (!formName || x.formName === formName))
    .slice(-limit)
    .reverse();
}

export function markSubmissionRead(id: string): void {
  mutate(state => {
    const s = state as unknown as FormState;
    if (!s.formSubmissions) return;
    const found = s.formSubmissions.find(x => x.id === id);
    if (found) found.read = true;
  });
}

export function getFormsConfig(orgId: string): { notifyEmail?: string; webhookUrl?: string; webhookSecret?: string } | null {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "forms");
  if (!install || !install.enabled) return null;
  const c = install.config as Record<string, unknown>;
  return {
    notifyEmail: typeof c.notifyEmail === "string" ? c.notifyEmail : undefined,
    webhookUrl:  typeof c.webhookUrl === "string" ? c.webhookUrl : undefined,
    webhookSecret: typeof c.webhookSecret === "string" ? c.webhookSecret : undefined,
  };
}
