"use client";

// /admin/reservations/calendar — week-view of bookings.
// Click a booking to see details. Switch resource / staff filters.
// Subscribe link copies the iCal feed URL for Google / Apple / Notion.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { notify } from "@/components/admin/Toaster";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Booking {
  id: string; resourceId: string; serviceId?: string; staffId?: string;
  startMs: number; endMs: number; partySize: number;
  customerName: string; customerEmail: string;
  status: "confirmed" | "cancelled" | "no-show" | "completed";
  source?: string;
}
interface Resource { id: string; name: string }
interface Service  { id: string; name: string; durationMinutes: number }
interface Staff    { id: string; name: string }

const HOURS = Array.from({ length: 14 }, (_, i) => 7 + i);   // 07:00 → 20:00
const DAYS_VISIBLE = 7;

export default function CalendarPage() {
  return <PluginRequired plugin="reservations"><CalendarPageInner /></PluginRequired>;
}

function CalendarPageInner() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [resourceFilter, setResourceFilter] = useState<string>("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const [b, r, s, st, t] = await Promise.all([
        fetch(`/api/portal/reservations?orgId=${orgId}`).then(x => x.json()),
        fetch(`/api/portal/reservations/resources?orgId=${orgId}`).then(x => x.json()),
        fetch(`/api/portal/reservations/services?orgId=${orgId}`).then(x => x.json()),
        fetch(`/api/portal/reservations/staff?orgId=${orgId}`).then(x => x.json()),
        fetch(`/api/portal/reservations/feed-url?orgId=${orgId}`).then(x => x.json()),
      ]);
      if (cancelled) return;
      setBookings(b.bookings ?? []);
      setResources(r.resources ?? []);
      setServices(s.services ?? []);
      setStaff(st.staff ?? []);
      setFeedUrl(t.url ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const visibleBookings = useMemo(() => {
    const weekEnd = weekStart.getTime() + 7 * 24 * 3600_000;
    return bookings.filter(b =>
      b.status === "confirmed" &&
      b.startMs >= weekStart.getTime() &&
      b.startMs < weekEnd &&
      (!resourceFilter || b.resourceId === resourceFilter) &&
      (!staffFilter || b.staffId === staffFilter),
    );
  }, [bookings, weekStart, resourceFilter, staffFilter]);

  function shiftWeek(days: number) {
    setWeekStart(d => new Date(d.getTime() + days * 24 * 3600_000));
  }

  function copyFeedUrl() {
    if (!feedUrl) return;
    void navigator.clipboard.writeText(feedUrl);
    notify({ tone: "ok", title: "Feed URL copied", message: "Paste into Google / Apple / Notion / Outlook to subscribe." });
  }

  function fmtDay(date: Date): string {
    return `${date.toLocaleDateString(undefined, { weekday: "short" })} ${date.getDate()}`;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-4">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Reservations</p>
          <h1 className="font-display text-3xl text-brand-cream">Calendar</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Week of {weekStart.toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => shiftWeek(-7)} className="px-3 py-1.5 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream">← Prev</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-3 py-1.5 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream">Today</button>
          <button onClick={() => shiftWeek(7)} className="px-3 py-1.5 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream">Next →</button>
          <span className="w-px h-5 bg-white/10" />
          <button onClick={copyFeedUrl} disabled={!feedUrl} className="px-3 py-1.5 rounded-md text-[11px] bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 disabled:opacity-40">
            Copy iCal feed URL
          </button>
          <Link href="/admin/reservations/services" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Services →</Link>
          <Link href="/admin/reservations/staff"    className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Staff →</Link>
          <Link href="/admin/reservations/external" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">External feeds →</Link>
        </div>
      </header>

      <div className="flex items-center gap-2 text-[11px] text-brand-cream/65">
        <span>Resource:</span>
        <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px]">
          <option value="">All</option>
          {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <span>Staff:</span>
        <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px]">
          <option value="">All</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="ml-auto">{visibleBookings.length} bookings</span>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${DAYS_VISIBLE}, minmax(120px, 1fr))`, minWidth: 900 }}>
          {/* Header row */}
          <div className="border-b border-white/5 p-2 text-[10px] text-brand-cream/45"></div>
          {Array.from({ length: DAYS_VISIBLE }).map((_, i) => {
            const d = new Date(weekStart.getTime() + i * 24 * 3600_000);
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`border-b border-white/5 p-2 text-[11px] tabular-nums ${isToday ? "text-cyan-300 font-semibold" : "text-brand-cream/55"}`}>
                {fmtDay(d)}
              </div>
            );
          })}

          {/* Hour rows */}
          {HOURS.map(hour => (
            <ColumnsForHour
              key={hour}
              hour={hour}
              weekStart={weekStart}
              bookings={visibleBookings}
              services={services}
              resources={resources}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      {selected && (
        <BookingDetailPanel
          booking={selected}
          service={services.find(s => s.id === selected.serviceId)}
          resource={resources.find(r => r.id === selected.resourceId)}
          staff={staff.find(s => s.id === selected.staffId)}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}

function ColumnsForHour({
  hour, weekStart, bookings, services, resources, onSelect,
}: {
  hour: number; weekStart: Date;
  bookings: Booking[];
  services: Service[];
  resources: Resource[];
  onSelect: (b: Booking) => void;
}) {
  return (
    <>
      <div className="border-r border-b border-white/5 px-2 py-1 text-[10px] text-brand-cream/45 tabular-nums">
        {hour}:00
      </div>
      {Array.from({ length: DAYS_VISIBLE }).map((_, day) => {
        const dayStart = new Date(weekStart.getTime() + day * 24 * 3600_000);
        const cellStart = new Date(dayStart);
        cellStart.setHours(hour, 0, 0, 0);
        const cellEnd = new Date(cellStart.getTime() + 3600_000);
        const inCell = bookings.filter(b =>
          b.startMs >= cellStart.getTime() &&
          b.startMs < cellEnd.getTime(),
        );
        return (
          <div key={day} className="relative border-r border-b border-white/5 min-h-[40px] p-0.5">
            {inCell.map(b => {
              const svc = services.find(s => s.id === b.serviceId);
              const res = resources.find(r => r.id === b.resourceId);
              const offsetMinutes = (b.startMs - cellStart.getTime()) / 60_000;
              const durationMinutes = (b.endMs - b.startMs) / 60_000;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className={`absolute left-0.5 right-0.5 text-left rounded px-1.5 py-0.5 text-[10px] truncate transition-colors ${
                    b.source === "external-ical"
                      ? "bg-amber-500/15 border border-amber-400/25 text-amber-200 hover:bg-amber-500/25"
                      : "bg-cyan-500/15 border border-cyan-400/25 text-cyan-200 hover:bg-cyan-500/25"
                  }`}
                  style={{
                    top: `${(offsetMinutes / 60) * 100}%`,
                    height: `${Math.max(20, (durationMinutes / 60) * 100)}%`,
                  }}
                  title={`${b.customerName} · ${new Date(b.startMs).toLocaleTimeString()}`}
                >
                  <span className="truncate block">{svc?.name ?? res?.name ?? "Booking"}</span>
                  <span className="truncate block opacity-70">{b.customerName}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function BookingDetailPanel({
  booking, service, resource, staff, onClose,
}: {
  booking: Booking;
  service?: Service;
  resource?: Resource;
  staff?: Staff;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#0a0e1a] p-5 space-y-3">
        <header className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Booking</p>
          <button onClick={onClose} className="text-brand-cream/55 hover:text-brand-cream text-lg leading-none">×</button>
        </header>
        <h2 className="font-display text-xl text-brand-cream">{booking.customerName}</h2>
        <ul className="text-[12px] text-brand-cream/85 space-y-1">
          <li><strong className="text-brand-cream/55">When:</strong> {new Date(booking.startMs).toLocaleString()} – {new Date(booking.endMs).toLocaleTimeString()}</li>
          {service  && <li><strong className="text-brand-cream/55">Service:</strong> {service.name}</li>}
          {resource && <li><strong className="text-brand-cream/55">Resource:</strong> {resource.name}</li>}
          {staff    && <li><strong className="text-brand-cream/55">With:</strong> {staff.name}</li>}
          <li><strong className="text-brand-cream/55">Email:</strong> {booking.customerEmail}</li>
          <li><strong className="text-brand-cream/55">Party:</strong> {booking.partySize}</li>
          {booking.source === "external-ical" && <li className="text-amber-300/80">From an external calendar feed (read-only).</li>}
        </ul>
      </div>
    </div>
  );
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  // Monday start (UK convention; Sunday-start markets can change here).
  const day = out.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + offset);
  return out;
}
