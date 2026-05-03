"use client";

// /admin/crm — overview: contact count, deal pipeline summary,
// upcoming tasks, recent activity.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Contact { id: string; email: string; name?: string; tags: string[]; createdAt: number }
interface Deal    { id: string; title: string; value: number; currency: string; stage: string; updatedAt: number }
interface Task    { id: string; title: string; dueAt?: number; done: boolean }

export default function CrmPage() {
  return <PluginRequired plugin="crm"><CrmPageInner /></PluginRequired>;
}

function CrmPageInner() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const [c, d, t] = await Promise.all([
        fetch(`/api/portal/crm/contacts?orgId=${orgId}`).then(r => r.json()),
        fetch(`/api/portal/crm/deals?orgId=${orgId}`).then(r => r.json()),
        fetch(`/api/portal/crm/tasks?orgId=${orgId}`).then(r => r.json()),
      ]);
      if (cancelled) return;
      setContacts(c.contacts ?? []);
      setDeals(d.deals ?? []);
      setTasks(t.tasks ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageSpinner />;

  const openDeals = deals.filter(d => !["Won", "Lost"].includes(d.stage));
  const openValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const openTasks = tasks.filter(t => !t.done);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">CRM</p>
          <h1 className="font-display text-3xl text-brand-cream">Pipeline</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/crm/contacts" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Contacts →</Link>
          <Link href="/admin/crm/deals"    className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Deals →</Link>
          <Link href="/admin/crm/tasks"    className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Tasks →</Link>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Contacts"     value={contacts.length.toLocaleString()} />
        <Stat label="Open deals"   value={openDeals.length.toLocaleString()} />
        <Stat label="Pipeline £"   value={`£${(openValue / 100).toLocaleString()}`} />
      </section>

      <section>
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Upcoming tasks</h2>
        {openTasks.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No open tasks. </p>
        ) : (
          <ul className="space-y-1">
            {openTasks.slice(0, 10).map(t => (
              <li key={t.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 flex items-center justify-between text-[12px]">
                <span className="text-brand-cream truncate">{t.title}</span>
                <span className="text-[10px] text-brand-cream/45 tabular-nums shrink-0">
                  {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "no due date"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Recent contacts</h2>
        {contacts.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No contacts — they auto-import from forms + e-commerce + newsletter.</p>
        ) : (
          <ul className="space-y-1">
            {contacts.slice(0, 10).map(c => (
              <li key={c.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-[12px]">
                <span className="text-brand-cream">{c.name ?? c.email}</span>
                {c.name && <span className="text-brand-cream/45 ml-2">{c.email}</span>}
                {c.tags.length > 0 && (
                  <span className="ml-3 text-[10px] text-brand-cream/40">
                    {c.tags.map(t => `#${t}`).join("  ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1">{value}</p>
    </div>
  );
}
