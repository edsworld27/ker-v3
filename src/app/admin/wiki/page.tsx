"use client";

// /admin/wiki — wiki page list. Click any to edit.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Page {
  id: string; slug: string; title: string;
  parentSlug?: string; authorEmail?: string;
  updatedAt: number; revisionCount: number;
}

export default function WikiPage() {
  return <PluginRequired plugin="wiki"><WikiPageInner /></PluginRequired>;
}

function WikiPageInner() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<{ slug?: string; title: string; body: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/wiki?orgId=${orgId}`);
    const data = await res.json();
    setPages(data.pages ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!editor) return;
    setSaving(true);
    try {
      const orgId = getActiveOrgId();
      await fetch("/api/portal/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, slug: editor.slug, title: editor.title, body: editor.body }),
      });
      setEditor(null);
      await load();
    } finally { setSaving(false); }
  }

  if (loading) return <PageSpinner />;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Wiki</p>
          <h1 className="font-display text-3xl text-brand-cream">Documentation pages</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{pages.length} pages</p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ title: "New page", body: "" })}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px]"
        >
          + New page
        </button>
      </header>

      {editor && (
        <section className="rounded-xl border border-cyan-400/20 bg-white/[0.02] p-4 space-y-3">
          <input
            type="text"
            value={editor.title}
            onChange={e => setEditor({ ...editor, title: e.target.value })}
            placeholder="Page title"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[14px] text-brand-cream"
          />
          <textarea
            value={editor.body}
            onChange={e => setEditor({ ...editor, body: e.target.value })}
            placeholder="Markdown body…"
            rows={12}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] font-mono text-brand-cream"
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditor(null)} className="text-[11px] text-brand-cream/55 hover:text-brand-cream">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !editor.title}
              className="px-3 py-1.5 rounded-md text-[11px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save page"}
            </button>
          </div>
        </section>
      )}

      {pages.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-[13px] text-brand-cream/85">No wiki pages yet.</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto">
            The wiki is your team&apos;s shared knowledge base. Use it for runbooks, processes, anything that&apos;s easier to author together than in code.
          </p>
          <button
            type="button"
            onClick={() => setEditor({ title: "New page", body: "" })}
            className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px]"
          >
            + Create your first page
          </button>
        </div>
      ) : (
        <ul className="space-y-1">
          {pages.map(p => (
            <li key={p.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 flex items-center justify-between text-[12px]">
              <button
                onClick={() => setEditor({ slug: p.slug, title: p.title, body: "" })}
                className="text-left text-brand-cream hover:text-cyan-200"
              >
                <span className="font-medium">{p.title}</span>
                <span className="text-brand-cream/45 ml-2 font-mono text-[10px]">/{p.slug}</span>
              </button>
              <span className="text-[10px] text-brand-cream/40 tabular-nums">
                {p.revisionCount} revisions · {new Date(p.updatedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
