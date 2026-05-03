// Aqua Support hub server module (S-1).
//
// Three feature surfaces share the same store:
//   • Feature requests — clients raise asks; agency triages, adds
//     comments, marks status.
//   • Meeting bookings — clients propose dates; agency confirms with
//     a meeting URL.
//   • Invoices — mock for now (until the Stripe webhook lands real
//     billing); agency can add manual entries to mirror what's billed.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import type {
  FeatureRequest, SupportRequestStatus, SupportRequestPriority,
  MeetingBooking, SupportInvoice,
} from "./types";

function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

// ── Feature requests ────────────────────────────────────────────────────
export interface CreateFeatureRequestInput {
  orgId: string;
  title: string;
  body: string;
  priority?: SupportRequestPriority;
  submittedBy?: string;
}

export function listFeatureRequests(orgId?: string): FeatureRequest[] {
  const all = Object.values(getState().featureRequests);
  return all
    .filter(r => !orgId || r.orgId === orgId)
    .sort((a, b) => b.votes - a.votes || b.createdAt - a.createdAt);
}

export function getFeatureRequest(id: string): FeatureRequest | undefined {
  return getState().featureRequests[id];
}

export function createFeatureRequest(input: CreateFeatureRequestInput): FeatureRequest {
  const fr: FeatureRequest = {
    id: makeId("fr"),
    orgId: input.orgId,
    title: input.title,
    body: input.body,
    status: "open",
    priority: input.priority ?? "medium",
    votes: 1,
    submittedBy: input.submittedBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    comments: [],
  };
  mutate(state => { state.featureRequests[fr.id] = fr; });
  return fr;
}

export function updateFeatureRequest(id: string, patch: Partial<Pick<FeatureRequest, "title" | "body" | "status" | "priority">>): FeatureRequest | null {
  let result: FeatureRequest | null = null;
  mutate(state => {
    const existing = state.featureRequests[id];
    if (!existing) return;
    state.featureRequests[id] = { ...existing, ...patch, updatedAt: Date.now() };
    result = state.featureRequests[id];
  });
  return result;
}

export function voteFeatureRequest(id: string, delta: 1 | -1): FeatureRequest | null {
  let result: FeatureRequest | null = null;
  mutate(state => {
    const existing = state.featureRequests[id];
    if (!existing) return;
    state.featureRequests[id] = { ...existing, votes: Math.max(0, existing.votes + delta), updatedAt: Date.now() };
    result = state.featureRequests[id];
  });
  return result;
}

export function commentOnFeatureRequest(id: string, comment: { author: string; body: string; isAgency?: boolean }): FeatureRequest | null {
  let result: FeatureRequest | null = null;
  mutate(state => {
    const existing = state.featureRequests[id];
    if (!existing) return;
    const comments = [...(existing.comments ?? []), { id: makeId("c"), author: comment.author, body: comment.body, isAgency: comment.isAgency, createdAt: Date.now() }];
    state.featureRequests[id] = { ...existing, comments, updatedAt: Date.now() };
    result = state.featureRequests[id];
  });
  return result;
}

export function deleteFeatureRequest(id: string): boolean {
  let removed = false;
  mutate(state => { if (state.featureRequests[id]) { delete state.featureRequests[id]; removed = true; } });
  return removed;
}

// ── Meeting bookings ────────────────────────────────────────────────────
export interface CreateMeetingInput {
  orgId: string;
  topic: string;
  preferredDates: string[];
  notes?: string;
  contactEmail?: string;
}

export function listMeetings(orgId?: string): MeetingBooking[] {
  const all = Object.values(getState().meetings);
  return all.filter(m => !orgId || m.orgId === orgId).sort((a, b) => b.createdAt - a.createdAt);
}

export function createMeeting(input: CreateMeetingInput): MeetingBooking {
  const m: MeetingBooking = {
    id: makeId("mtg"),
    orgId: input.orgId,
    topic: input.topic,
    preferredDates: input.preferredDates,
    notes: input.notes,
    contactEmail: input.contactEmail,
    status: "requested",
    createdAt: Date.now(),
  };
  mutate(state => { state.meetings[m.id] = m; });
  return m;
}

export function updateMeeting(id: string, patch: Partial<Pick<MeetingBooking, "status" | "meetingUrl" | "notes">>): MeetingBooking | null {
  let result: MeetingBooking | null = null;
  mutate(state => {
    const existing = state.meetings[id];
    if (!existing) return;
    state.meetings[id] = { ...existing, ...patch, confirmedAt: patch.status === "confirmed" ? Date.now() : existing.confirmedAt };
    result = state.meetings[id];
  });
  return result;
}

// ── Invoices (mock) ─────────────────────────────────────────────────────
export interface CreateInvoiceInput {
  orgId: string;
  number?: string;
  amountTotal: number;
  currency?: string;
  description?: string;
  dueDate?: number;
  lines?: SupportInvoice["lines"];
}

export function listInvoices(orgId?: string): SupportInvoice[] {
  const all = Object.values(getState().invoices);
  return all.filter(i => !orgId || i.orgId === orgId).sort((a, b) => b.date - a.date);
}

export function createInvoice(input: CreateInvoiceInput): SupportInvoice {
  const id = makeId("in");
  const inv: SupportInvoice = {
    id,
    orgId: input.orgId,
    number: input.number ?? id.toUpperCase().replace(/^IN_/, "INV-"),
    date: Date.now(),
    dueDate: input.dueDate,
    status: "open",
    amountTotal: input.amountTotal,
    currency: input.currency ?? "GBP",
    description: input.description,
    lines: input.lines ?? [{ description: input.description ?? "Service", quantity: 1, unitAmount: input.amountTotal }],
  };
  mutate(state => { state.invoices[id] = inv; });
  return inv;
}

export function updateInvoice(id: string, patch: Partial<Pick<SupportInvoice, "status" | "hostedUrl" | "pdfUrl">>): SupportInvoice | null {
  let result: SupportInvoice | null = null;
  mutate(state => {
    const existing = state.invoices[id];
    if (!existing) return;
    state.invoices[id] = { ...existing, ...patch };
    result = state.invoices[id];
  });
  return result;
}

// ── Helpful aggregates ──────────────────────────────────────────────────
export function supportStats(orgId?: string) {
  const requests = listFeatureRequests(orgId);
  const meetings = listMeetings(orgId);
  const invoices = listInvoices(orgId);
  const openRequests = requests.filter(r => r.status === "open" || r.status === "planned" || r.status === "in-progress").length;
  const pendingMeetings = meetings.filter(m => m.status === "requested").length;
  const unpaid = invoices.filter(i => i.status === "open").reduce((acc, i) => acc + i.amountTotal, 0);
  return { openRequests, pendingMeetings, unpaidPence: unpaid, totalRequests: requests.length, totalMeetings: meetings.length, totalInvoices: invoices.length };
}
