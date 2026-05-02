"use client";

// /admin/reservations/staff — manage staff who can be assigned to bookings.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { confirm } from "@/components/admin/ConfirmHost";

interface Staff { id: string; name: string; email?: string; bio?: string; active: boolean }

export default function StaffPage() {
  return <PluginRequired plugin="reservations"><StaffPageInner /></PluginRequired>;
}

function StaffPageInner() {
  const [list, setList] = useState<Staff[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/reservations/staff?orgId=${orgId}`);
    const data = await res.json();
    setList(data.staff ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!form.name.trim()) return;
    const orgId = getActiveOrgId();
    await fetch("/api/portal/reservations/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, name: form.name, email: form.email || undefined, bio: form.bio || undefined }),
    });
    setForm({ name: "", email: "", bio: "" });
    setCreating(false);
    await load();
  }

  async function remove(id: string) {
    if (!(await confirm({ title: "Remove this staff member?", message: "Their existing bookings stay assigned and visible.", danger: true, confirmLabel: "Remove" }))) return;
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/reservations/staff/${id}?orgId=${orgId}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <PageSpinner />;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/reservations" className="text-[11px] text-cyan-400/70 hover:text-cyan-300">← Reservations</Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Staff</p>
          <h1 className="font-display text-3xl text-brand-cream">Team members</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{list.length} active</p>
        </div>
        <button onClick={() => setCreating(c => !c)} className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px]">
          {creating ? "Cancel" : "+ Add staff"}
        </button>
      </header>

      {creating && (
        <section className="rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className={INPUT} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" type="email" className={INPUT} />
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Bio (optional)" className={INPUT} />
          <div className="flex justify-end">
            <button onClick={create} className="px-3 py-1.5 rounded-md text-[12px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20">Add</button>
          </div>
        </section>
      )}

      {list.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No staff yet.</p>
      ) : (
        <ul className="space-y-1">
          {list.map(s => (
            <li key={s.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] text-brand-cream">{s.name}</p>
                {s.email && <p className="text-[11px] text-brand-cream/55">{s.email}</p>}
                {s.bio && <p className="text-[11px] text-brand-cream/45 mt-1">{s.bio}</p>}
              </div>
              <button onClick={() => remove(s.id)} className="text-[11px] text-red-300/70 hover:text-red-300 shrink-0">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40";
