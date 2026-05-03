// Reservations runtime — backs the Reservations plugin.
//
// Resources (tables / rooms / services) with availability windows
// and capacity. Bookings are time-slotted; the system rejects
// double-bookings and respects min lead time + max future-days
// from the plugin's config.
//
// Service-business additions:
//   • Service     — a priced offering (Haircut 60min £45). Maps onto
//                   a Resource for slot-resolution.
//   • Staff       — the human performing a Service. Bookings can be
//                   constrained to a specific staff member.
//   • Buffer time — gap before / after each booking, e.g. clean-up.
//   • External    — bookings imported from Google / Apple iCal feeds
//                   (read-only; see calendar.ts for the importer).

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";
import { emit } from "./eventBus";

export interface Resource {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  capacity: number;            // how many concurrent bookings per slot
  durationMinutes: number;     // default slot length
  bufferBeforeMinutes?: number;// gap inserted before each booking
  bufferAfterMinutes?: number; // gap inserted after each booking
  availability: AvailabilityWindow[];
  active: boolean;
  createdAt: number;
}

export interface AvailabilityWindow {
  // 0 = Sunday … 6 = Saturday
  dayOfWeek: number;
  // 24h "HH:MM"
  startTime: string;
  endTime: string;
}

// ─── Services + Staff (service-business model) ─────────────────────────────

export interface Service {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;              // pence/cents; undefined = free / quote
  currency?: string;
  // Resource(s) the service uses (room / chair / Zoom link). Empty
  // means "no resource constraint" — common for online consultations.
  resourceIds: string[];
  // Staff who can perform this service. Empty = anyone available.
  staffIds: string[];
  // Buffer override; falls back to resource defaults if undefined.
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  active: boolean;
  createdAt: number;
}

export interface Staff {
  id: string;
  orgId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  // Per-staff weekly availability. Falls back to resource availability
  // if empty (i.e. "this person is available whenever the resource is").
  availability: AvailabilityWindow[];
  active: boolean;
  createdAt: number;
}

export interface Booking {
  id: string;
  orgId: string;
  resourceId: string;
  serviceId?: string;          // optional — null for raw resource booking
  staffId?: string;            // optional — null = any
  startMs: number;
  endMs: number;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: "confirmed" | "cancelled" | "no-show" | "completed";
  source?: "storefront" | "admin" | "external-ical";
  externalUid?: string;        // for ical-imported events; dedupe key
  remindersSent?: { reminder24h?: boolean; reminder1h?: boolean };
  createdAt: number;
}

interface ReservationsState {
  reservations_resources?: Resource[];
  reservations_bookings?: Booking[];
  reservations_services?: Service[];
  reservations_staff?: Staff[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function getPluginConfig(orgId: string): { leadTimeMinutes: number; maxFutureDays: number } {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "reservations");
  const c = (install?.config as Record<string, unknown> | undefined) ?? {};
  return {
    leadTimeMinutes: typeof c.leadTimeMinutes === "number" ? c.leadTimeMinutes : 60,
    maxFutureDays:   typeof c.maxFutureDays === "number" ? c.maxFutureDays : 90,
  };
}

// ─── Resources ─────────────────────────────────────────────────────────────

export function listResources(orgId: string): Resource[] {
  const s = getState() as unknown as ReservationsState;
  return (s.reservations_resources ?? []).filter(r => r.orgId === orgId);
}

export function getResource(orgId: string, id: string): Resource | undefined {
  return listResources(orgId).find(r => r.id === id);
}

export interface CreateResourceInput {
  orgId: string;
  name: string;
  description?: string;
  capacity?: number;
  durationMinutes?: number;
  availability?: AvailabilityWindow[];
}

export function createResource(input: CreateResourceInput): Resource {
  const r: Resource = {
    id: makeId("res"),
    orgId: input.orgId,
    name: input.name,
    description: input.description,
    capacity: input.capacity ?? 1,
    durationMinutes: input.durationMinutes ?? 30,
    availability: input.availability ?? defaultAvailability(),
    active: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_resources) s.reservations_resources = [];
    s.reservations_resources.push(r);
  });
  return r;
}

function defaultAvailability(): AvailabilityWindow[] {
  // Mon–Fri, 9:00 → 17:00.
  return [1, 2, 3, 4, 5].map(d => ({ dayOfWeek: d, startTime: "09:00", endTime: "17:00" }));
}

export function deleteResource(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_resources) return;
    const before = s.reservations_resources.length;
    s.reservations_resources = s.reservations_resources.filter(r => !(r.id === id && r.orgId === orgId));
    removed = s.reservations_resources.length < before;
  });
  return removed;
}

// ─── Bookings ──────────────────────────────────────────────────────────────

export function listBookings(orgId: string, resourceId?: string): Booking[] {
  const s = getState() as unknown as ReservationsState;
  return (s.reservations_bookings ?? [])
    .filter(b => b.orgId === orgId && (!resourceId || b.resourceId === resourceId))
    .sort((a, b) => a.startMs - b.startMs);
}

export interface CreateBookingInput {
  orgId: string;
  resourceId: string;
  serviceId?: string;
  staffId?: string;
  startMs: number;
  partySize?: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  source?: Booking["source"];
  externalUid?: string;
}

export function createBooking(input: CreateBookingInput): { ok: true; booking: Booking } | { ok: false; error: string } {
  const cfg = getPluginConfig(input.orgId);
  const resource = getResource(input.orgId, input.resourceId);
  if (!resource) return { ok: false, error: "resource-not-found" };
  const service = input.serviceId ? getService(input.orgId, input.serviceId) : undefined;
  if (input.serviceId && !service) return { ok: false, error: "service-not-found" };

  // Lead time + max-future-days enforcement (skipped for external imports).
  if (input.source !== "external-ical") {
    const minStart = Date.now() + cfg.leadTimeMinutes * 60_000;
    const maxStart = Date.now() + cfg.maxFutureDays * 24 * 60 * 60_000;
    if (input.startMs < minStart) return { ok: false, error: "too-soon" };
    if (input.startMs > maxStart) return { ok: false, error: "too-far-out" };
  }

  const duration = service?.durationMinutes ?? resource.durationMinutes;
  const endMs = input.startMs + duration * 60_000;
  const partySize = input.partySize ?? 1;

  // Effective buffer = max of resource defaults + service overrides.
  const bufferBefore = (service?.bufferBeforeMinutes ?? resource.bufferBeforeMinutes ?? 0) * 60_000;
  const bufferAfter  = (service?.bufferAfterMinutes  ?? resource.bufferAfterMinutes  ?? 0) * 60_000;
  const occupiedStart = input.startMs - bufferBefore;
  const occupiedEnd   = endMs + bufferAfter;

  // Capacity check — sum partySize of overlapping confirmed bookings,
  // including buffer windows.
  const overlaps = listBookings(input.orgId, input.resourceId)
    .filter(b => b.status === "confirmed")
    .filter(b => {
      const bRes = getResource(input.orgId, b.resourceId);
      const bSrv = b.serviceId ? getService(input.orgId, b.serviceId) : undefined;
      const bBefore = (bSrv?.bufferBeforeMinutes ?? bRes?.bufferBeforeMinutes ?? 0) * 60_000;
      const bAfter  = (bSrv?.bufferAfterMinutes  ?? bRes?.bufferAfterMinutes  ?? 0) * 60_000;
      const bStart = b.startMs - bBefore;
      const bEnd   = b.endMs + bAfter;
      return !(bEnd <= occupiedStart || bStart >= occupiedEnd);
    });
  const used = overlaps.reduce((sum, b) => sum + b.partySize, 0);
  if (used + partySize > resource.capacity) {
    return { ok: false, error: "no-availability" };
  }

  // Staff check — if a specific staff member is requested, they must
  // not already have an overlapping booking.
  if (input.staffId) {
    const staff = getStaff(input.orgId, input.staffId);
    if (!staff) return { ok: false, error: "staff-not-found" };
    const staffOverlap = listBookings(input.orgId)
      .filter(b => b.staffId === input.staffId && b.status === "confirmed")
      .find(b => !(b.endMs <= input.startMs || b.startMs >= endMs));
    if (staffOverlap) return { ok: false, error: "staff-busy" };
  }

  const booking: Booking = {
    id: makeId("bk"),
    orgId: input.orgId,
    resourceId: input.resourceId,
    serviceId: input.serviceId,
    staffId: input.staffId,
    startMs: input.startMs,
    endMs,
    partySize,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    notes: input.notes,
    status: "confirmed",
    source: input.source ?? "admin",
    externalUid: input.externalUid,
    remindersSent: {},
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_bookings) s.reservations_bookings = [];
    s.reservations_bookings.push(booking);
  });

  // Emit so notifications + automation + webhooks can react.
  emit(input.orgId, "form.submitted", {
    formName: "booking",
    fields: {
      bookingId: booking.id,
      resourceId: booking.resourceId,
      serviceId: booking.serviceId ?? "",
      staffId: booking.staffId ?? "",
      startMs: String(booking.startMs),
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
    },
  });

  return { ok: true, booking };
}

// ─── Service CRUD ──────────────────────────────────────────────────────────

export function listServices(orgId: string): Service[] {
  const s = getState() as unknown as ReservationsState;
  return (s.reservations_services ?? []).filter(x => x.orgId === orgId);
}

export function getService(orgId: string, id: string): Service | undefined {
  return listServices(orgId).find(x => x.id === id);
}

export interface CreateServiceInput {
  orgId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  currency?: string;
  resourceIds?: string[];
  staffIds?: string[];
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
}

export function createService(input: CreateServiceInput): Service {
  const svc: Service = {
    id: makeId("svc"),
    orgId: input.orgId,
    name: input.name,
    description: input.description,
    durationMinutes: input.durationMinutes,
    price: input.price,
    currency: input.currency ?? "GBP",
    resourceIds: input.resourceIds ?? [],
    staffIds: input.staffIds ?? [],
    bufferBeforeMinutes: input.bufferBeforeMinutes,
    bufferAfterMinutes: input.bufferAfterMinutes,
    active: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_services) s.reservations_services = [];
    s.reservations_services.push(svc);
  });
  return svc;
}

export function updateService(orgId: string, id: string, patch: Partial<Service>): Service | null {
  let result: Service | null = null;
  mutate(state => {
    const s = state as unknown as ReservationsState;
    const svc = s.reservations_services?.find(x => x.orgId === orgId && x.id === id);
    if (!svc) return;
    Object.assign(svc, patch);
    result = svc;
  });
  return result;
}

export function deleteService(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_services) return;
    const before = s.reservations_services.length;
    s.reservations_services = s.reservations_services.filter(x => !(x.orgId === orgId && x.id === id));
    removed = s.reservations_services.length < before;
  });
  return removed;
}

// ─── Staff CRUD ────────────────────────────────────────────────────────────

export function listStaff(orgId: string): Staff[] {
  const s = getState() as unknown as ReservationsState;
  return (s.reservations_staff ?? []).filter(x => x.orgId === orgId);
}

export function getStaff(orgId: string, id: string): Staff | undefined {
  return listStaff(orgId).find(x => x.id === id);
}

export interface CreateStaffInput {
  orgId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  availability?: AvailabilityWindow[];
}

export function createStaff(input: CreateStaffInput): Staff {
  const st: Staff = {
    id: makeId("staff"),
    orgId: input.orgId,
    name: input.name,
    email: input.email,
    avatarUrl: input.avatarUrl,
    bio: input.bio,
    availability: input.availability ?? [],
    active: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_staff) s.reservations_staff = [];
    s.reservations_staff.push(st);
  });
  return st;
}

export function deleteStaff(orgId: string, id: string): boolean {
  let removed = false;
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_staff) return;
    const before = s.reservations_staff.length;
    s.reservations_staff = s.reservations_staff.filter(x => !(x.orgId === orgId && x.id === id));
    removed = s.reservations_staff.length < before;
  });
  return removed;
}

// ─── Reminder bookkeeping ──────────────────────────────────────────────────
//
// Called by the reminder cron / scheduler in src/portal/server/calendar.ts.
// Marks a reminder as "already sent" so the same booking doesn't get
// hammered if the cron fires twice.

export function markReminderSent(orgId: string, bookingId: string, kind: "reminder24h" | "reminder1h"): void {
  mutate(state => {
    const s = state as unknown as ReservationsState;
    const b = s.reservations_bookings?.find(x => x.orgId === orgId && x.id === bookingId);
    if (!b) return;
    if (!b.remindersSent) b.remindersSent = {};
    b.remindersSent[kind] = true;
  });
}

export function cancelBooking(orgId: string, id: string): boolean {
  let ok = false;
  mutate(state => {
    const s = state as unknown as ReservationsState;
    const b = (s.reservations_bookings ?? []).find(x => x.orgId === orgId && x.id === id);
    if (b && b.status === "confirmed") {
      b.status = "cancelled";
      ok = true;
    }
  });
  return ok;
}
