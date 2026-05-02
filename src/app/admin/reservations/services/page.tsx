"use client";

// /admin/reservations/services — define services (Haircut £45 60min,
// Consultation £100 90min, etc). Each service maps to one or more
// resources + optionally specific staff.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { confirm } from "@/components/admin/ConfirmHost";

interface Service {
  id: string; name: string; description?: string;
  durationMinutes: number; price?: number; currency?: string;
  resourceIds: string[]; staffIds: string[];
  bufferBeforeMinutes?: number; bufferAfterMinutes?: number;
  active: boolean;
}
interface Resource { id: string; name: string }
interface Staff { id: string; name: string }

export default function ServicesPage() {
  return <PluginRequired plugin="reservations"><ServicesPageInner /></PluginRequired>;
}

function ServicesPageInner() {
  const [services, setServices] = useState<Service[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: 60,
    price: "",
    currency: "GBP",
    resourceIds: [] as string[],
    staffIds: [] as string[],
    bufferBeforeMinutes: "",
    bufferAfterMinutes: "",
  });
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const [s, r, st] = await Promise.all([
      fetch(`/api/portal/reservations/services?orgId=${orgId}`).then(x => x.json()),
      fetch(`/api/portal/reservations/resources?orgId=${orgId}`).then(x => x.json()),
      fetch(`/api/portal/reservations/staff?orgId=${orgId}`).then(x => x.json()),
    ]);
    setServices(s.services ?? []);
    setResources(r.resources ?? []);
    setStaff(st.staff ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!form.name.trim()) return;
    const orgId = getActiveOrgId();
    await fetch("/api/portal/reservations/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        name: form.name,
        description: form.description || undefined,
        durationMinutes: Number(form.durationMinutes),
        price: form.price ? Math.round(Number(form.price) * 100) : undefined,
        currency: form.currency,
        resourceIds: form.resourceIds,
        staffIds: form.staffIds,
        bufferBeforeMinutes: form.bufferBeforeMinutes ? Number(form.bufferBeforeMinutes) : undefined,
        bufferAfterMinutes:  form.bufferAfterMinutes  ? Number(form.bufferAfterMinutes)  : undefined,
      }),
    });
    setForm({ name: "", description: "", durationMinutes: 60, price: "", currency: "GBP",
      resourceIds: [], staffIds: [], bufferBeforeMinutes: "", bufferAfterMinutes: "" });
    setCreating(false);
    await load();
  }

  async function remove(id: string) {
    if (!(await confirm({ title: "Delete this service?", message: "Existing bookings keep their reference.", danger: true, confirmLabel: "Delete" }))) return;
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/reservations/services/${id}?orgId=${orgId}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <main className="p-6 text-[12px] text-brand-cream/45">Loading…</main>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/reservations" className="text-[11px] text-cyan-400/70 hover:text-cyan-300">← Reservations</Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Services</p>
          <h1 className="font-display text-3xl text-brand-cream">Bookable services</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{services.length} services defined</p>
        </div>
        <button
          onClick={() => setCreating(c => !c)}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px]"
        >
          {creating ? "Cancel" : "+ New service"}
        </button>
      </header>

      {creating && (
        <section className="rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-3">
          <Field label="Name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Haircut" className={INPUT} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} className={INPUT} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Duration (min)">
              <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} className={INPUT} />
            </Field>
            <Field label="Price">
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45.00" className={INPUT} />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={INPUT}>
                <option value="GBP">GBP</option><option value="USD">USD</option><option value="EUR">EUR</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Buffer before (min)">
              <input type="number" value={form.bufferBeforeMinutes} onChange={e => setForm({ ...form, bufferBeforeMinutes: e.target.value })} placeholder="0" className={INPUT} />
            </Field>
            <Field label="Buffer after (min)">
              <input type="number" value={form.bufferAfterMinutes} onChange={e => setForm({ ...form, bufferAfterMinutes: e.target.value })} placeholder="0" className={INPUT} />
            </Field>
          </div>
          <Field label="Resources">
            <MultiSelect
              options={resources.map(r => ({ value: r.id, label: r.name }))}
              selected={form.resourceIds}
              onChange={v => setForm({ ...form, resourceIds: v })}
              empty="No resources yet — create them first."
            />
          </Field>
          <Field label="Staff (optional)">
            <MultiSelect
              options={staff.map(s => ({ value: s.id, label: s.name }))}
              selected={form.staffIds}
              onChange={v => setForm({ ...form, staffIds: v })}
              empty="No staff yet — assign anyone available."
            />
          </Field>
          <div className="flex justify-end">
            <button onClick={create} className="px-3 py-1.5 rounded-md text-[12px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20">
              Create service
            </button>
          </div>
        </section>
      )}

      {services.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No services defined yet.</p>
      ) : (
        <ul className="space-y-1">
          {services.map(s => (
            <li key={s.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] text-brand-cream font-medium">{s.name}</p>
                {s.description && <p className="text-[12px] text-brand-cream/65 mt-0.5">{s.description}</p>}
                <p className="text-[11px] text-brand-cream/45 mt-1">
                  {s.durationMinutes}min
                  {typeof s.price === "number" && <span> · {fmt(s.price, s.currency ?? "GBP")}</span>}
                  {(s.bufferBeforeMinutes ?? 0) > 0 && <span> · +{s.bufferBeforeMinutes}m before</span>}
                  {(s.bufferAfterMinutes ?? 0) > 0 && <span> · +{s.bufferAfterMinutes}m after</span>}
                  {s.staffIds.length > 0 && <span> · {s.staffIds.length} staff</span>}
                </p>
              </div>
              <button onClick={() => remove(s.id)} className="text-[11px] text-red-300/70 hover:text-red-300 shrink-0">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-brand-cream/65 mb-1">{label}</span>
      {children}
    </label>
  );
}

function MultiSelect({ options, selected, onChange, empty }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  empty?: string;
}) {
  if (options.length === 0) {
    return <p className="text-[11px] text-brand-cream/40">{empty ?? "None available."}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(active ? selected.filter(v => v !== o.value) : [...selected, o.value])}
            className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
              active ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20" : "bg-white/5 text-brand-cream/65 hover:text-brand-cream"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function fmt(amount: number, currency: string): string {
  const sym = currency.toUpperCase() === "GBP" ? "£" : currency.toUpperCase() === "USD" ? "$" : currency.toUpperCase() === "EUR" ? "€" : "";
  return `${sym}${(amount / 100).toFixed(2)}`;
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40";
