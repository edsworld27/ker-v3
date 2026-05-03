"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listPages, createPage, deletePage, togglePageHidden, onPagesChange, type CustomPage } from "@/lib/admin/customPages";
import PluginRequired from "@/components/admin/PluginRequired";
import { prompt } from "@/components/admin/PromptHost";
import AdminTabs from "@/components/admin/AdminTabs";
import { CONTENT_TABS } from "@/lib/admin/tabSets";

export default function AdminPagesIndex() {
  return <PluginRequired plugin="website"><AdminPagesIndexInner /></PluginRequired>;
}

function AdminPagesIndexInner() {
  const router = useRouter();
  const [pages, setPages] = useState<CustomPage[]>([]);
  useEffect(() => {
    const refresh = () => setPages(listPages());
    refresh();
    return onPagesChange(refresh);
  }, []);

  async function newPage() {
    const title = (await prompt({ title: "Page title", defaultValue: "New page", placeholder: "About us" })) ?? "New page";
    const p = createPage(title);
    router.push(`/admin/pages/${p.id}`);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-5xl">
      <AdminTabs tabs={CONTENT_TABS} ariaLabel="Content" />
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Custom pages</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Build new pages</h1>
          <p className="text-brand-cream/45 text-sm mt-1">Stack hero, text, image, gallery, quote, embed and CTA blocks. Each page lives at <code className="text-brand-cream/65">/p/&lt;slug&gt;</code>.</p>
        </div>
        <button onClick={newPage} className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold">+ New page</button>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card px-6 py-10 text-center">
          <p className="text-brand-cream/45 text-sm">No custom pages yet.</p>
          <button onClick={newPage} className="mt-4 text-xs px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold">Create one</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
          {pages.map(p => (
            <div key={p.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] ${p.hidden ? "opacity-50" : ""}`}>
              <Link href={`/admin/pages/${p.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-brand-cream truncate">{p.title}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.status === "published" ? "bg-green-400/20 text-green-300" : "bg-white/10 text-brand-cream/55"}`}>{p.status}</span>
                  {p.hidden && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-brand-cream/40">hidden</span>}
                  {p.showInNav && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple-light">in nav</span>}
                </div>
                <p className="text-xs text-brand-cream/40">/p/{p.slug} · {p.blocks.length} block{p.blocks.length === 1 ? "" : "s"}</p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePageHidden(p.id)}
                  title={p.hidden ? "Show page" : "Hide page"}
                  className="text-[11px] text-brand-cream/40 hover:text-brand-cream"
                >
                  {p.hidden ? "👁" : "🫥"}
                </button>
                <Link href={`/p/${p.slug}`} target="_blank" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">View</Link>
                <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) deletePage(p.id); }} className="text-[11px] text-brand-cream/40 hover:text-brand-orange">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
