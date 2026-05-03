"use client";

// /admin/crm/contacts — list of contacts auto-imported by the CRM
// plugin from forms / orders / newsletter, plus manual upserts.
// Search box hits the /api/portal/crm/contacts endpoint with ?q=.

import { useEffect, useState } from "react";
import Link from "next/link";
import PageSpinner from "@/components/admin/Spinner";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { notify } from "@/components/admin/Toaster";
import { friendlyError } from "@/lib/admin/friendlyError";

interface Contact {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  createdAt: number;
  updatedAt: number;
}

export default function ContactsPage() {
  return <PluginRequired plugin="crm"><Inner /></PluginRequired>;
}

function Inner() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ]               = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [adding, setAdding]     = useState(false);
  const [draftEmail, setDraftEmail] = useState("");
  const [draftName, setDraftName]   = useState("");

  async function load() {
    setError(null);
    const orgId = getActiveOrgId();
    try {
      const url = `/api/portal/crm/contacts?orgId=${encodeURIComponent(orgId)}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { contacts?: Contact[] };
      setContacts(data.contacts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q]);

  async function addContact() {
    if (!draftEmail.trim()) { notify({ tone: "warn", message: "Email required." }); return; }
    setAdding(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/crm/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, email: draftEmail.trim(), name: draftName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const f = friendlyError(data.error, "Couldn't add contact");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      notify({ tone: "ok", message: "Contact added." });
      setDraftEmail(""); setDraftName("");
      await load();
    } finally { setAdding(false); }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link href="/admin/crm" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← CRM overview</Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-2 mb-1">CRM</p>
          <h1 className="font-display text-3xl text-brand-cream">Contacts</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{contacts.length} contact{contacts.length === 1 ? "" : "s"}</p>
        </div>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, email, tag…"
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40 min-w-[260px]"
        />
      </header>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <p className="text-[11px] tracking-wider uppercase text-brand-cream/55">Add a contact</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="email"
            value={draftEmail}
            onChange={e => setDraftEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <input
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            placeholder="Name (optional)"
            className="flex-1 min-w-[160px] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <button
            onClick={() => void addContact()}
            disabled={adding || !draftEmail.trim()}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40"
          >
            {adding ? "Adding…" : "Add contact"}
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
      ) : contacts.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No contacts yet. They&apos;ll appear here automatically as orders / form submissions / newsletter signups arrive.</p>
      ) : (
        <ul className="space-y-1">
          {contacts.map(c => (
            <li key={c.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{c.name || c.email}</p>
                <p className="text-[10px] text-brand-cream/45 truncate font-mono">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                {c.tags && c.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {c.tags.map(t => <span key={t} className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-brand-cream/65">{t}</span>)}
                  </div>
                )}
              </div>
              {c.source && <span className="text-[10px] tracking-wider uppercase text-brand-cream/45 px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0">{c.source}</span>}
              <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
