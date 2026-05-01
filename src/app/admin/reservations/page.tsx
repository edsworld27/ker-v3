"use client";

// /admin/reservations — list bookings + resources for the active org.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Booking {
  id: string; resourceId: string; startMs: number; endMs: number;
  partySize: number; customerName: string; customerEmail: string;
  status: "confirmed" | "cancelled" | "no-show" | "completed";
}
interface Resource {
  id: string; name: string; capacity: number; durationMinutes: number;
}

export default function ReservationsPage() {
  return <PluginRequired plugin="reservations"><ReservationsPageInner /></PluginRequired>;
}

function ReservationsPageInner() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const [b, r] = await Promise.all([
        fetch(`/api/portal/reservations?orgId=${orgId}`).then(x => x.json()),
        fetch(`/api/portal/reservations/resources?orgId=${orgId}`).then(x => x.json()),
      ]);
      if (cancelled) return;
      setBookings(b.bookings ?? []);
      setResources(r.resources ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <main className="p-6 text-[12px] text-brand-cream/45">Loading…</main>;

  const upcoming = bookings.filter(b => b.status === "confirmed" && b.startMs > Date.now());
  const past = bookings.filter(b => b.status !== "cancelled" && b.endMs <= Date.now());

  function resourceName(id: string): string {
    return resources.find(r => r.id === id)?.name ?? id;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Reservations</p>
          <h1 className="font-display text-3xl text-brand-cream">Bookings</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <Link href="/admin/reservations/resources" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
          Manage resources →
        </Link>
      </header>

      <Section title="Upcoming">
        {upcoming.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No upcoming bookings.</p>
        ) : upcoming.map(b => (
          <BookingRow key={b.id} booking={b} resourceName={resourceName(b.resourceId)} />
        ))}
      </Section>

      <Section title="Past">
        {past.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No past bookings yet.</p>
        ) : past.slice(0, 30).map(b => (
          <BookingRow key={b.id} booking={b} resourceName={resourceName(b.resourceId)} />
        ))}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function BookingRow({ booking, resourceName }: { booking: Booking; resourceName: string }) {
  return (
    <article className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
      <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded-md ${
        booking.status === "confirmed" ? "bg-cyan-500/10 text-cyan-300" :
        booking.status === "completed" ? "bg-emerald-500/10 text-emerald-300" :
        booking.status === "no-show"   ? "bg-amber-500/10 text-amber-300" :
        "bg-red-500/10 text-red-300"
      }`}>
        {booking.status}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-brand-cream truncate">
          {booking.customerName} · {resourceName} · party {booking.partySize}
        </p>
        <p className="text-[10px] text-brand-cream/55">
          {new Date(booking.startMs).toLocaleString()} — {new Date(booking.endMs).toLocaleTimeString()}
        </p>
      </div>
      <span className="text-[10px] text-brand-cream/45 truncate hidden sm:inline">{booking.customerEmail}</span>
    </article>
  );
}
