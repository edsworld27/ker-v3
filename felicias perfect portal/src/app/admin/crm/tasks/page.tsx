"use client";

// /admin/crm/tasks — to-do list of follow-ups attached to contacts /
// deals. Quick-add at the top, list below sorted by due date.

import { useEffect, useState } from "react";
import Link from "next/link";
import PageSpinner from "@/components/admin/Spinner";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { notify } from "@/components/admin/Toaster";
import { friendlyError } from "@/lib/admin/friendlyError";

interface Task {
  id: string;
  title: string;
  contactId?: string;
  dealId?: string;
  dueAt?: number;
  doneAt?: number;
  createdAt: number;
}

export default function TasksPage() {
  return <PluginRequired plugin="crm"><Inner /></PluginRequired>;
}

function Inner() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDue, setDraftDue]     = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setError(null);
    const orgId = getActiveOrgId();
    try {
      const res = await fetch(`/api/portal/crm/tasks?orgId=${encodeURIComponent(orgId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { tasks?: Task[] };
      setTasks(data.tasks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoad(false); }
  }
  useEffect(() => { void load(); }, []);

  async function addTask() {
    if (!draftTitle.trim()) { notify({ tone: "warn", message: "Title required." }); return; }
    setAdding(true);
    try {
      const orgId = getActiveOrgId();
      const dueAt = draftDue ? new Date(draftDue).getTime() : undefined;
      const res = await fetch("/api/portal/crm/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, title: draftTitle.trim(), dueAt }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const f = friendlyError(data.error, "Couldn't add task");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      notify({ tone: "ok", message: "Task added." });
      setDraftTitle(""); setDraftDue("");
      await load();
    } finally { setAdding(false); }
  }

  const open = tasks.filter(t => !t.doneAt).sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  const done = tasks.filter(t => t.doneAt).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0)).slice(0, 20);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header>
        <Link href="/admin/crm" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← CRM overview</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-2 mb-1">CRM</p>
        <h1 className="font-display text-3xl text-brand-cream">Tasks</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">{open.length} open · {done.length} recently done</p>
      </header>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <p className="text-[11px] tracking-wider uppercase text-brand-cream/55">Quick add</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") void addTask(); }}
            placeholder="Call Felicia about Q2 plan"
            className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <input
            type="datetime-local"
            value={draftDue}
            onChange={e => setDraftDue(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream focus:outline-none focus:border-cyan-400/40"
          />
          <button
            onClick={() => void addTask()}
            disabled={adding || !draftTitle.trim()}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          {error} <button onClick={() => void load()} className="underline ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <PageSpinner wrap={false} />
      ) : (
        <>
          <section className="space-y-1">
            <h2 className="text-[10px] tracking-wider uppercase text-brand-cream/55">Open</h2>
            {open.length === 0 ? (
              <p className="text-[12px] text-brand-cream/45">All caught up.</p>
            ) : (
              <ul className="space-y-1">
                {open.map(t => {
                  const overdue = t.dueAt && t.dueAt < Date.now();
                  return (
                    <li key={t.id} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${overdue ? "border-amber-400/30 bg-amber-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-brand-cream">{t.title}</p>
                        {(t.contactId || t.dealId) && (
                          <p className="text-[10px] text-brand-cream/45 font-mono">
                            {t.contactId ? `contact: ${t.contactId}` : ""}{t.contactId && t.dealId ? " · " : ""}{t.dealId ? `deal: ${t.dealId}` : ""}
                          </p>
                        )}
                      </div>
                      {t.dueAt && (
                        <span className={`text-[11px] tabular-nums shrink-0 ${overdue ? "text-amber-300" : "text-brand-cream/65"}`}>
                          {new Date(t.dueAt).toLocaleString()}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {done.length > 0 && (
            <section className="space-y-1 pt-2">
              <h2 className="text-[10px] tracking-wider uppercase text-brand-cream/55">Recently done</h2>
              <ul className="space-y-1">
                {done.map(t => (
                  <li key={t.id} className="rounded-lg border border-white/5 bg-white/[0.01] px-4 py-2 flex items-center gap-3 opacity-65">
                    <span className="text-emerald-300 shrink-0">✓</span>
                    <span className="text-[12px] text-brand-cream/85 line-through flex-1 truncate">{t.title}</span>
                    {t.doneAt && <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">{new Date(t.doneAt).toLocaleDateString()}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
