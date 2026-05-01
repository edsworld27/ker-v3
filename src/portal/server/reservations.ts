// Reservations runtime — backs the Reservations plugin.
//
// Resources (tables / rooms / services) with availability windows
// and capacity. Bookings are time-slotted; the system rejects
// double-bookings and respects min lead time + max future-days
// from the plugin's config.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";

export interface Resource {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  capacity: number;            // how many concurrent bookings per slot
  durationMinutes: number;     // default slot length
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

export interface Booking {
  id: string;
  orgId: string;
  resourceId: string;
  startMs: number;
  endMs: number;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: "confirmed" | "cancelled" | "no-show" | "completed";
  createdAt: number;
}

interface ReservationsState {
  reservations_resources?: Resource[];
  reservations_bookings?: Booking[];
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
  startMs: number;
  partySize?: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export function createBooking(input: CreateBookingInput): { ok: true; booking: Booking } | { ok: false; error: string } {
  const cfg = getPluginConfig(input.orgId);
  const resource = getResource(input.orgId, input.resourceId);
  if (!resource) return { ok: false, error: "resource-not-found" };

  // Lead time + max-future-days enforcement.
  const minStart = Date.now() + cfg.leadTimeMinutes * 60_000;
  const maxStart = Date.now() + cfg.maxFutureDays * 24 * 60 * 60_000;
  if (input.startMs < minStart) return { ok: false, error: "too-soon" };
  if (input.startMs > maxStart) return { ok: false, error: "too-far-out" };

  const endMs = input.startMs + resource.durationMinutes * 60_000;
  const partySize = input.partySize ?? 1;

  // Capacity check — sum partySize of overlapping confirmed bookings.
  const overlaps = listBookings(input.orgId, input.resourceId)
    .filter(b => b.status === "confirmed")
    .filter(b => !(b.endMs <= input.startMs || b.startMs >= endMs));
  const used = overlaps.reduce((sum, b) => sum + b.partySize, 0);
  if (used + partySize > resource.capacity) {
    return { ok: false, error: "no-availability" };
  }

  const booking: Booking = {
    id: makeId("bk"),
    orgId: input.orgId,
    resourceId: input.resourceId,
    startMs: input.startMs,
    endMs,
    partySize,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    notes: input.notes,
    status: "confirmed",
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as ReservationsState;
    if (!s.reservations_bookings) s.reservations_bookings = [];
    s.reservations_bookings.push(booking);
  });
  return { ok: true, booking };
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
