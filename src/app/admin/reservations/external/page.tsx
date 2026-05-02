"use client";

// /admin/reservations/external — manage external iCal feeds.
// Operator pastes a Google / Apple / Notion / Outlook calendar URL;
// we periodically fetch + parse + import events as read-only bookings
// so they show up on the calendar view alongside native bookings.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";

interface Feed {
  id: string; url: string; label: string;
  resourceId: string; staffId?: string;
  enabled: boolean;
  lastSyncedAt?: number;
  lastError?: string;
}
interface Resource { id: string; name: string }
interface Staff { id: string; name: string }

export default function ExternalFeedsPage() {
  return <PluginRequired plugin="reservations"><ExternalFeedsPageInner /></PluginRequired>;
}

function ExternalFeedsPageInner() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: "", label: "", resourceId: "", staffId: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const [f, r, st] = await Promise.all([
      fetch(`/api/portal/reservations/external?orgId=${orgId}`).then(x => x.json()),
      fetch(`/api/portal/reservations/resources?orgId=${orgId}`).then(x => x.json()),
      fetch(`/api/portal/reservations/staff?orgId=${orgId}`).then(x => x.json()),
    ]);
    setFeeds(f.feeds ?? []);
    setResources(r.resources ?? []);
    setStaff(st.staff ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function add() {
    if (!form.url || !form.label || !form.resourceId) return;
    const orgId = getActiveOrgId();
    await fetch("/api/portal/reservations/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...form, staffId: form.staffId || undefined }),
    });
    setForm({ url: "", label: "", resourceId: "", staffId: "" });
    setCreating(false);
    await load();
  }

  async function remove(id: string) {
    if (!(await confirm({ title: "Remove this feed?", message: "Bookings imported from it stay in the system.", danger: true, confirmLabel: "Remove" }))) return;
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/reservations/external/${id}?orgId=${orgId}`, { method: "DELETE" });
    await load();
  }

  async function sync(id: string) {
    setBusyId(id);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/reservations/external/${id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (data.ok) notify({ tone: "ok", message: `Imported ${data.imported} event${data.imported === 1 ? "" : "s"}.` });
      else notify({ tone: "error", title: "Sync failed", message: data.error ?? "Unknown error" });
      await load();
    } finally { setBusyId(null); }
  }

  if (loading) return <PageSpinner />;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/reservations" className="text-[11px] text-cyan-400/70 hover:text-cyan-300">← Reservations</Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">External feeds</p>
          <h1 className="font-display text-3xl text-brand-cream">Subscribed calendars</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            Sync from Google / Apple / Notion / Outlook. Paste any public iCal URL.
          </p>
        </div>
        <button onClick={() => setCreating(c => !c)} className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px]">
          {creating ? "Cancel" : "+ Add feed"}
        </button>
      </header>

      {creating && (
        <section className="rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-3">
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Label (e.g. Jane's Google)" className={INPUT} />
          <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://calendar.google.com/calendar/ical/.../basic.ics" className={INPUT} />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.resourceId} onChange={e => setForm({ ...form, resourceId: e.target.value })} className={INPUT}>
              <option value="">Pick resource…</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} className={INPUT}>
              <option value="">No staff (any)</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <p className="text-[10px] text-brand-cream/40">
            Tip — Google: Settings → Integrate calendar → Secret iCal URL. Apple: iCloud.com → Calendar → Share → Public.
            Notion: any database with date column → Share → Copy iCal URL.
          </p>
          <div className="flex justify-end">
            <button onClick={add} disabled={!form.url || !form.label || !form.resourceId} className="px-3 py-1.5 rounded-md text-[12px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40">
              Add feed
            </button>
          </div>
        </section>
      )}

      {feeds.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No external feeds yet.</p>
      ) : (
        <ul className="space-y-1">
          {feeds.map(f => (
            <li key={f.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-brand-cream truncate">{f.label}</p>
                <p className="text-[11px] text-brand-cream/55 truncate">{f.url}</p>
                {f.lastSyncedAt && (
                  <p className="text-[10px] text-brand-cream/40 mt-1">
                    Last synced {new Date(f.lastSyncedAt).toLocaleString()}
                  </p>
                )}
                {f.lastError && (
                  <p className="text-[10px] text-red-300/80 mt-1">Error: {f.lastError}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => sync(f.id)} disabled={busyId === f.id} className="text-[11px] text-cyan-300/80 hover:text-cyan-200 disabled:opacity-40">
                  {busyId === f.id ? "Syncing…" : "Sync now"}
                </button>
                <button onClick={() => remove(f.id)} className="text-[11px] text-red-300/70 hover:text-red-300">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40";
