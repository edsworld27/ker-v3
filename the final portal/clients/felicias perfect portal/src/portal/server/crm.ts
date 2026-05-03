// CRM runtime — backs the CRM plugin.
//
// Contacts (auto-imported from forms + e-commerce + newsletter),
// deals with stage pipeline, tasks with due dates, notes per
// contact. Slim by design — operators outgrow it onto something
// dedicated, but it's plenty for sub-100-contact lists.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { on } from "./eventBus";

export interface Contact {
  id: string;
  orgId: string;
  email: string;
  name?: string;
  phone?: string;
  tags: string[];
  source: "form" | "ecommerce" | "newsletter" | "manual" | "import";
  createdAt: number;
  lastContactedAt?: number;
}

export interface Deal {
  id: string;
  orgId: string;
  contactId: string;
  title: string;
  value: number;        // pence/cents
  currency: string;
  stage: string;
  probability: number;  // 0..100
  expectedCloseAt?: number;
  closedAt?: number;
  closedWon?: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CrmTask {
  id: string;
  orgId: string;
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueAt?: number;
  done: boolean;
  doneAt?: number;
  createdAt: number;
}

export interface ContactNote {
  id: string;
  orgId: string;
  contactId: string;
  body: string;
  authorEmail?: string;
  createdAt: number;
}

interface CrmState {
  contacts?: Contact[];
  deals?: Deal[];
  crmTasks?: CrmTask[];
  contactNotes?: ContactNote[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Stage configuration from plugin settings ─────────────────────────────

export function listStages(orgId: string): string[] {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "crm");
  const c = install?.config as Record<string, unknown> | undefined;
  const raw = typeof c?.stages === "string" ? c.stages : "Lead,Qualified,Proposal,Negotiation,Won,Lost";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export function listContacts(orgId: string, query?: string): Contact[] {
  const s = getState() as unknown as CrmState;
  const all = (s.contacts ?? []).filter(c => c.orgId === orgId);
  if (!query) return all.sort((a, b) => b.createdAt - a.createdAt);
  const q = query.toLowerCase();
  return all
    .filter(c => c.email.includes(q) || (c.name?.toLowerCase().includes(q)) || c.tags.some(t => t.toLowerCase().includes(q)))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getContact(orgId: string, id: string): Contact | undefined {
  return listContacts(orgId).find(c => c.id === id);
}

export interface UpsertContactInput {
  orgId: string;
  email: string;
  name?: string;
  phone?: string;
  tags?: string[];
  source?: Contact["source"];
}

export function upsertContact(input: UpsertContactInput): Contact {
  const cleaned = input.email.trim().toLowerCase();
  let result!: Contact;
  mutate(state => {
    const s = state as unknown as CrmState;
    if (!s.contacts) s.contacts = [];
    const existing = s.contacts.find(c => c.orgId === input.orgId && c.email === cleaned);
    if (existing) {
      Object.assign(existing, {
        name:  input.name ?? existing.name,
        phone: input.phone ?? existing.phone,
        tags:  input.tags ?? existing.tags,
      });
      result = existing;
      return;
    }
    result = {
      id: makeId("ct"),
      orgId: input.orgId,
      email: cleaned,
      name: input.name,
      phone: input.phone,
      tags: input.tags ?? [],
      source: input.source ?? "manual",
      createdAt: Date.now(),
    };
    s.contacts.push(result);
  });
  return result;
}

export function tagContact(orgId: string, id: string, tag: string): void {
  mutate(state => {
    const s = state as unknown as CrmState;
    const c = s.contacts?.find(x => x.orgId === orgId && x.id === id);
    if (c && !c.tags.includes(tag)) c.tags.push(tag);
  });
}

// ─── Deals ─────────────────────────────────────────────────────────────────

export function listDeals(orgId: string, contactId?: string): Deal[] {
  const s = getState() as unknown as CrmState;
  return (s.deals ?? [])
    .filter(d => d.orgId === orgId && (!contactId || d.contactId === contactId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export interface CreateDealInput {
  orgId: string;
  contactId: string;
  title: string;
  value?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseAt?: number;
  notes?: string;
}

export function createDeal(input: CreateDealInput): Deal {
  const stages = listStages(input.orgId);
  const d: Deal = {
    id: makeId("deal"),
    orgId: input.orgId,
    contactId: input.contactId,
    title: input.title,
    value: input.value ?? 0,
    currency: input.currency ?? "GBP",
    stage: input.stage ?? stages[0] ?? "Lead",
    probability: input.probability ?? 10,
    expectedCloseAt: input.expectedCloseAt,
    notes: input.notes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as CrmState;
    if (!s.deals) s.deals = [];
    s.deals.push(d);
  });
  return d;
}

export function moveDealStage(orgId: string, id: string, stage: string): void {
  mutate(state => {
    const s = state as unknown as CrmState;
    const d = s.deals?.find(x => x.orgId === orgId && x.id === id);
    if (!d) return;
    d.stage = stage;
    d.updatedAt = Date.now();
    if (stage.toLowerCase() === "won")  { d.closedAt = Date.now(); d.closedWon = true; }
    if (stage.toLowerCase() === "lost") { d.closedAt = Date.now(); d.closedWon = false; }
  });
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export function listTasks(orgId: string): CrmTask[] {
  const s = getState() as unknown as CrmState;
  return (s.crmTasks ?? [])
    .filter(t => t.orgId === orgId)
    .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
}

export interface CreateTaskInput {
  orgId: string;
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueAt?: number;
}

export function createTask(input: CreateTaskInput): CrmTask {
  const t: CrmTask = {
    id: makeId("task"),
    orgId: input.orgId,
    contactId: input.contactId,
    dealId: input.dealId,
    title: input.title,
    description: input.description,
    dueAt: input.dueAt,
    done: false,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as CrmState;
    if (!s.crmTasks) s.crmTasks = [];
    s.crmTasks.push(t);
  });
  return t;
}

export function setTaskDone(orgId: string, id: string, done: boolean): void {
  mutate(state => {
    const s = state as unknown as CrmState;
    const t = s.crmTasks?.find(x => x.orgId === orgId && x.id === id);
    if (t) {
      t.done = done;
      t.doneAt = done ? Date.now() : undefined;
    }
  });
}

// ─── Auto-import via event bus ────────────────────────────────────────────

let bound = false;
export function bindCrm(): void {
  if (bound) return;
  bound = true;
  on("form.submitted", event => {
    const p = event.payload as { fields?: Record<string, string> } | undefined;
    if (!p?.fields?.email) return;
    upsertContact({
      orgId: event.orgId,
      email: p.fields.email,
      name: p.fields.name,
      phone: p.fields.phone,
      source: "form",
      tags: ["form-submission"],
    });
  });
  on("order.paid", event => {
    const p = event.payload as { customerEmail?: string; customerName?: string } | undefined;
    if (!p?.customerEmail) return;
    upsertContact({
      orgId: event.orgId,
      email: p.customerEmail,
      name: p.customerName,
      source: "ecommerce",
      tags: ["customer"],
    });
  });
  on("newsletter.subscribed", event => {
    const p = event.payload as { email?: string } | undefined;
    if (!p?.email) return;
    upsertContact({
      orgId: event.orgId,
      email: p.email,
      source: "newsletter",
      tags: ["newsletter"],
    });
  });
}

bindCrm();
