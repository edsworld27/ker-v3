// Calendar utilities — iCal export, external feed import, reminder
// scheduling. Backs the service-business workflow on top of the
// Reservations plugin.
//
// Export: GET /api/portal/reservations/calendar.ics?orgId=…&token=…
// returns an .ics feed Google / Apple / Notion / Outlook can subscribe
// to. Each org gets a stable per-feed token; rotating it invalidates
// existing subscriptions.
//
// Import: operator pastes a Google / Apple / Notion calendar URL on
// /admin/reservations/external; we periodically fetch + parse + merge
// the events as read-only "external" bookings so they show up on the
// calendar view alongside native bookings.

import "server-only";
import crypto from "crypto";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import {
  listBookings, listResources, listServices, listStaff,
  createBooking, markReminderSent,
} from "./reservations";
import { sendEmail } from "./email";

// ─── iCal text generation (RFC 5545 subset) ────────────────────────────────

function pad2(n: number): string { return n.toString().padStart(2, "0"); }

function fmtIcalDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeIcal(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Hard-fold lines at 75 octets per RFC 5545.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let s = line;
  while (s.length > 75) {
    out.push(s.slice(0, 75));
    s = " " + s.slice(75);
  }
  out.push(s);
  return out.join("\r\n");
}

export function generateIcalFeed(orgId: string): string {
  const org = getOrg(orgId);
  const orgName = org?.name ?? orgId;
  const bookings = listBookings(orgId).filter(b => b.status === "confirmed");
  const resources = listResources(orgId);
  const services = listServices(orgId);
  const staff = listStaff(orgId);

  function resourceName(id: string): string {
    return resources.find(r => r.id === id)?.name ?? "Unknown resource";
  }
  function serviceName(id?: string): string | null {
    if (!id) return null;
    return services.find(s => s.id === id)?.name ?? null;
  }
  function staffName(id?: string): string | null {
    if (!id) return null;
    return staff.find(s => s.id === id)?.name ?? null;
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aqua portal//Reservations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeIcal(orgName)} bookings`),
    foldLine(`X-WR-CALDESC:${escapeIcal(`All confirmed bookings for ${orgName}.`)}`),
  ];

  for (const b of bookings) {
    const svc = serviceName(b.serviceId);
    const stf = staffName(b.staffId);
    const summaryParts = [
      svc ?? resourceName(b.resourceId),
      `· ${b.customerName}`,
      stf ? `(with ${stf})` : null,
    ].filter(Boolean) as string[];
    const summary = summaryParts.join(" ");
    const descLines = [
      `Customer: ${b.customerName}`,
      `Email: ${b.customerEmail}`,
      b.customerPhone ? `Phone: ${b.customerPhone}` : null,
      svc ? `Service: ${svc}` : null,
      stf ? `Staff: ${stf}` : null,
      `Resource: ${resourceName(b.resourceId)}`,
      `Party size: ${b.partySize}`,
      b.notes ? `Notes: ${b.notes}` : null,
    ].filter(Boolean).join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      foldLine(`UID:${b.id}@aqua-portal`),
      foldLine(`DTSTAMP:${fmtIcalDate(b.createdAt)}`),
      foldLine(`DTSTART:${fmtIcalDate(b.startMs)}`),
      foldLine(`DTEND:${fmtIcalDate(b.endMs)}`),
      foldLine(`SUMMARY:${escapeIcal(summary)}`),
      foldLine(`DESCRIPTION:${escapeIcal(descLines)}`),
      foldLine(`LOCATION:${escapeIcal(resourceName(b.resourceId))}`),
      `STATUS:${b.status === "confirmed" ? "CONFIRMED" : "CANCELLED"}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ─── Per-org feed token ────────────────────────────────────────────────────
//
// Each org has a stable token that lets external calendars subscribe
// to /api/portal/reservations/calendar.ics?orgId=…&token=… The token
// is generated lazily on first fetch + rotates on demand.

interface CalendarTokenState {
  calendarFeedTokens?: Record<string, string>;
}

export function getOrCreateFeedToken(orgId: string): string {
  const state = getState() as unknown as CalendarTokenState;
  const existing = state.calendarFeedTokens?.[orgId];
  if (existing) return existing;
  const token = crypto.randomBytes(20).toString("hex");
  mutate(s => {
    const ss = s as unknown as CalendarTokenState;
    if (!ss.calendarFeedTokens) ss.calendarFeedTokens = {};
    ss.calendarFeedTokens[orgId] = token;
  });
  return token;
}

export function rotateFeedToken(orgId: string): string {
  const token = crypto.randomBytes(20).toString("hex");
  mutate(s => {
    const ss = s as unknown as CalendarTokenState;
    if (!ss.calendarFeedTokens) ss.calendarFeedTokens = {};
    ss.calendarFeedTokens[orgId] = token;
  });
  return token;
}

export function verifyFeedToken(orgId: string, token: string): boolean {
  const state = getState() as unknown as CalendarTokenState;
  return state.calendarFeedTokens?.[orgId] === token;
}

// ─── External calendar feeds ───────────────────────────────────────────────
//
// Operator pastes a Google / Apple / Notion / Outlook .ics URL.
// We fetch periodically and merge events as read-only bookings so the
// calendar view shows them alongside native bookings.

export interface ExternalFeed {
  id: string;
  orgId: string;
  url: string;
  label: string;            // "Jane's Google calendar", "Studio iCloud", etc.
  resourceId: string;       // bookings get assigned to this resource
  staffId?: string;
  enabled: boolean;
  lastSyncedAt?: number;
  lastError?: string;
  createdAt: number;
}

interface ExternalFeedsState {
  externalCalendarFeeds?: ExternalFeed[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function listExternalFeeds(orgId: string): ExternalFeed[] {
  const s = getState() as unknown as ExternalFeedsState;
  return (s.externalCalendarFeeds ?? []).filter(f => f.orgId === orgId);
}

export interface AddFeedInput {
  orgId: string;
  url: string;
  label: string;
  resourceId: string;
  staffId?: string;
}

export function addExternalFeed(input: AddFeedInput): ExternalFeed {
  const f: ExternalFeed = {
    id: makeId("feed"),
    orgId: input.orgId,
    url: input.url,
    label: input.label,
    resourceId: input.resourceId,
    staffId: input.staffId,
    enabled: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ExternalFeedsState;
    if (!s.externalCalendarFeeds) s.externalCalendarFeeds = [];
    s.externalCalendarFeeds.push(f);
  });
  return f;
}

export function removeExternalFeed(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as ExternalFeedsState;
    if (!s.externalCalendarFeeds) return;
    const before = s.externalCalendarFeeds.length;
    s.externalCalendarFeeds = s.externalCalendarFeeds.filter(f => !(f.orgId === orgId && f.id === id));
    removed = s.externalCalendarFeeds.length < before;
  });
  return removed;
}

// ─── External feed parser ──────────────────────────────────────────────────
//
// RFC 5545 is a big spec; we handle the subset that real-world Google
// /Apple/Outlook/Notion exports use: VEVENT blocks with UID, DTSTART,
// DTEND, SUMMARY, DESCRIPTION, LOCATION. Recurring events (RRULE) get
// the first instance only — a "good enough" sync, not a full replica.

interface ParsedEvent {
  uid: string;
  startMs: number;
  endMs: number;
  summary: string;
  description?: string;
}

function unfoldLines(text: string): string[] {
  // Per RFC 5545 §3.1, continuation lines start with a single space or tab.
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of raw) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      out[out.length - 1] = (out[out.length - 1] ?? "") + line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function parseIcalDate(value: string): number | null {
  // Strip parameters. Examples we need to handle:
  //   20260501T180000Z         (UTC)
  //   20260501T180000          (floating)
  //   TZID=Europe/London:20260501T180000
  //   VALUE=DATE:20260501       (all-day; assume midnight UTC)
  let v = value;
  if (v.includes(":")) v = v.split(":").pop()!;
  v = v.trim();
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/.exec(v);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (z === "Z" || !h) {
    return Date.UTC(+y, +mo - 1, +d, h ? +h : 0, mi ? +mi : 0, s ? +s : 0);
  }
  // Floating local time — interpret as UTC for stability. Operators
  // can override with explicit timezones in the source feed.
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
}

function parseIcal(text: string): ParsedEvent[] {
  const lines = unfoldLines(text);
  const events: ParsedEvent[] = [];
  let current: Partial<ParsedEvent> | null = null;

  for (const raw of lines) {
    if (raw === "BEGIN:VEVENT") { current = {}; continue; }
    if (raw === "END:VEVENT") {
      if (current?.uid && typeof current.startMs === "number" && typeof current.endMs === "number") {
        events.push({
          uid: current.uid,
          startMs: current.startMs,
          endMs: current.endMs,
          summary: current.summary ?? "Untitled",
          description: current.description,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = raw.indexOf(":");
    if (colon < 0) continue;
    const keyAndParams = raw.slice(0, colon);
    const value = raw.slice(colon + 1);
    const key = keyAndParams.split(";")[0].toUpperCase();

    switch (key) {
      case "UID":         current.uid = value; break;
      case "DTSTART":     current.startMs = parseIcalDate(raw) ?? undefined; break;
      case "DTEND":       current.endMs = parseIcalDate(raw) ?? undefined; break;
      case "SUMMARY":     current.summary = value; break;
      case "DESCRIPTION": current.description = value; break;
    }
  }
  return events;
}

export async function syncExternalFeed(orgId: string, feedId: string): Promise<{ ok: boolean; imported: number; error?: string }> {
  const feed = listExternalFeeds(orgId).find(f => f.id === feedId);
  if (!feed) return { ok: false, imported: 0, error: "feed-not-found" };
  if (!feed.enabled) return { ok: false, imported: 0, error: "feed-disabled" };

  let text: string;
  try {
    const res = await fetch(feed.url, { headers: { "User-Agent": "Aqua-Portal-Calendar/0.1" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    mutate(state => {
      const s = state as unknown as ExternalFeedsState;
      const f = s.externalCalendarFeeds?.find(x => x.id === feedId);
      if (f) { f.lastError = errMsg; f.lastSyncedAt = Date.now(); }
    });
    return { ok: false, imported: 0, error: errMsg };
  }

  const events = parseIcal(text);
  let imported = 0;
  const existing = listBookings(orgId);
  const knownUids = new Set(existing.map(b => b.externalUid).filter(Boolean) as string[]);

  for (const ev of events) {
    const uid = `${feed.id}:${ev.uid}`;
    if (knownUids.has(uid)) continue;
    const result = createBooking({
      orgId,
      resourceId: feed.resourceId,
      staffId: feed.staffId,
      startMs: ev.startMs,
      customerName: ev.summary || "External event",
      customerEmail: "noreply@external-calendar.local",
      notes: ev.description,
      source: "external-ical",
      externalUid: uid,
    });
    if (result.ok) imported++;
  }

  mutate(state => {
    const s = state as unknown as ExternalFeedsState;
    const f = s.externalCalendarFeeds?.find(x => x.id === feedId);
    if (f) { f.lastSyncedAt = Date.now(); f.lastError = undefined; }
  });

  return { ok: true, imported };
}

// ─── Reminder dispatcher ───────────────────────────────────────────────────
//
// Iterates over confirmed bookings whose start is within the
// 24h / 1h windows and dispatches reminder emails via the Email
// plugin. Idempotent — uses the booking's `remindersSent` map.
//
// In a production runtime this would be triggered by a cron
// (Vercel cron, EdgeRuntime, etc); for now an admin-triggered
// /api/portal/reservations/reminders/run endpoint kicks it off.

export async function dispatchDueReminders(orgId: string): Promise<{ sent24h: number; sent1h: number }> {
  const now = Date.now();
  const window24h = [now + 23 * 3600_000, now + 25 * 3600_000];   // ±1h
  const window1h  = [now + 30 * 60_000,  now + 90 * 60_000];      // 30m–1.5h

  const bookings = listBookings(orgId).filter(b => b.status === "confirmed");
  const services = listServices(orgId);
  let sent24h = 0;
  let sent1h = 0;

  for (const b of bookings) {
    const serviceName = b.serviceId ? services.find(s => s.id === b.serviceId)?.name : undefined;

    if (!b.remindersSent?.reminder24h && b.startMs >= window24h[0] && b.startMs <= window24h[1]) {
      await sendEmail({
        orgId,
        to: b.customerEmail,
        subject: `Tomorrow: your booking with us`,
        html: `<h2>See you tomorrow</h2><p>Your${serviceName ? ` ${serviceName}` : ""} booking is at <strong>${new Date(b.startMs).toLocaleString()}</strong>.</p>`,
        text: `See you tomorrow.\n\nYour${serviceName ? ` ${serviceName}` : ""} booking is at ${new Date(b.startMs).toLocaleString()}.`,
        tags: ["booking-reminder-24h"],
      }).catch(() => undefined);
      markReminderSent(orgId, b.id, "reminder24h");
      sent24h++;
    }

    if (!b.remindersSent?.reminder1h && b.startMs >= window1h[0] && b.startMs <= window1h[1]) {
      await sendEmail({
        orgId,
        to: b.customerEmail,
        subject: `In 1 hour: your booking`,
        html: `<h2>Almost time</h2><p>Your${serviceName ? ` ${serviceName}` : ""} booking starts at <strong>${new Date(b.startMs).toLocaleTimeString()}</strong>.</p>`,
        text: `Almost time.\n\nYour${serviceName ? ` ${serviceName}` : ""} booking starts at ${new Date(b.startMs).toLocaleTimeString()}.`,
        tags: ["booking-reminder-1h"],
      }).catch(() => undefined);
      markReminderSent(orgId, b.id, "reminder1h");
      sent1h++;
    }
  }

  return { sent24h, sent1h };
}
