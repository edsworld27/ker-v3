"use client";

// /admin/kb/categories — list and create knowledge-base categories.
// Articles attach to a category id; without categories the storefront
// /help index has nothing to group.

import { useEffect, useState } from "react";
import Link from "next/link";
import PageSpinner from "@/components/admin/Spinner";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { notify } from "@/components/admin/Toaster";

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export default function KbCategoriesPage() {
  return <PluginRequired plugin="knowledgebase"><Inner /></PluginRequired>;
}

function Inner() {
  const [cats, setCats]     = useState<Category[]>([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setError(null);
    const orgId = getActiveOrgId();
    try {
      const res = await fetch(`/api/portal/kb/categories?orgId=${encodeURIComponent(orgId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { categories?: Category[] };
      setCats(data.categories ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoad(false); }
  }
  useEffect(() => { void load(); }, []);

  async function addCategory() {
    if (!draftName.trim()) { notify({ tone: "warn", message: "Name required." }); return; }
    setAdding(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/kb/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, name: draftName.trim(), description: draftDesc.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { notify({ tone: "error", message: data.error ?? "Add failed" }); return; }
      notify({ tone: "ok", message: "Category added." });
      setDraftName(""); setDraftDesc("");
      await load();
    } finally { setAdding(false); }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header>
        <Link href="/admin/kb" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← Knowledge base</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-2 mb-1">Knowledge base</p>
        <h1 className="font-display text-3xl text-brand-cream">Categories</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">{cats.length} categor{cats.length === 1 ? "y" : "ies"} — group articles for the storefront <code className="font-mono text-brand-cream/65">/help</code> index.</p>
      </header>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <p className="text-[11px] tracking-wider uppercase text-brand-cream/55">Add a category</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            placeholder="Getting started"
            className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <input
            value={draftDesc}
            onChange={e => setDraftDesc(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <button
            onClick={() => void addCategory()}
            disabled={adding || !draftName.trim()}
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
      ) : cats.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No categories yet. Add one above to start organising articles.</p>
      ) : (
        <ul className="space-y-1">
          {cats.map(c => (
            <li key={c.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{c.name}</p>
                {c.description && <p className="text-[10px] text-brand-cream/55 truncate">{c.description}</p>}
                <p className="text-[10px] text-brand-cream/35 font-mono mt-0.5 truncate">{c.id}</p>
              </div>
              <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
