"use client";

// /admin/sites/[siteId]/pages — list + create pages for the visual editor.
// Supports starter templates (homepage / about / contact / shop / cart /
// checkout) so a fresh site is one click away from a working layout.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { EditorPage } from "@/portal/server/types";
import { listPages, createPage, deletePage } from "@/lib/admin/editorPages";
import { PAGE_TEMPLATES, type PageTemplate } from "@/components/editor/pageTemplates";
import { confirm } from "@/components/admin/ConfirmHost";

export default function SitePagesIndex() {
  const params = useParams<{ siteId: string }>();
  const siteId = params?.siteId ?? "";
  const router = useRouter();

  const [pages, setPages] = useState<EditorPage[]>([]);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [template, setTemplate] = useState<PageTemplate>(PAGE_TEMPLATES[0]);
  const [slug, setSlug] = useState(PAGE_TEMPLATES[0].defaultSlug);
  const [title, setTitle] = useState(PAGE_TEMPLATES[0].defaultTitle);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!siteId) return;
    setPages(await listPages(siteId, true));
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [siteId]);

  function pickTemplate(t: PageTemplate) {
    setTemplate(t);
    setSlug(t.defaultSlug);
    setTitle(t.defaultTitle);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const page = await createPage(siteId, {
        slug: slug.trim(),
        title: title.trim(),
        blocks: template.build(),
      });
      if (!page) { setError("Could not create page"); return; }
      router.push(`/admin/sites/${siteId}/editor/${page.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  async function handleDelete(pageId: string) {
    if (!(await confirm({ title: "Delete this page?", message: "Page + its blocks are removed. This cannot be undone.", danger: true, confirmLabel: "Delete page" }))) return;
    await deletePage(siteId, pageId);
    void refresh();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Visual editor</p>
          <h1 className="font-display text-3xl text-brand-cream">Pages</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Site: <span className="text-brand-cream/85 font-medium">{siteId}</span></p>
        </div>
        <button onClick={() => setCreating(c => !c)} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90">
          {creating ? "Cancel" : "+ New page"}
        </button>
      </header>

      {creating && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-2">Template</p>
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PAGE_TEMPLATES.map(t => {
                const active = t.id === template.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => pickTemplate(t)}
                    className={`text-left rounded-xl border p-3 transition-colors ${active ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
                  >
                    <p className="text-base mb-1">{t.icon}</p>
                    <p className="text-[12px] font-semibold text-brand-cream">{t.label}</p>
                    <p className="text-[10px] text-brand-cream/55 leading-relaxed mt-0.5">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Title</span>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50" />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">URL path</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-brand-cream font-mono focus:outline-none focus:border-brand-orange/50" />
            </label>
          </div>
          <button type="submit" disabled={busy || !title || !slug} className="w-full px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold disabled:opacity-50">
            {busy ? "Creating…" : `Create ${template.label.toLowerCase()} + open editor`}
          </button>
        </form>
      )}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {pages.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[14px] text-brand-cream/65 mb-2">No pages yet</p>
            <p className="text-[11px] text-brand-cream/45 max-w-sm mx-auto leading-relaxed">Create your first page from a template above. Default starts include a homepage, about, contact, full e-commerce shop + cart + checkout flow.</p>
          </div>
        ) : pages.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.02]">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-cream font-medium truncate">{p.title}</p>
              <p className="text-[11px] text-brand-cream/55 font-mono">{p.slug}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${p.status === "published" ? "bg-green-500/15 text-green-400" : "bg-brand-amber/15 text-brand-amber"}`}>
              {p.status}
            </span>
            <Link href={`/admin/sites/${siteId}/editor/${p.id}`} className="text-[11px] text-brand-orange hover:underline">Edit</Link>
            <button onClick={() => handleDelete(p.id)} className="text-[11px] text-brand-cream/45 hover:text-red-400">Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}
