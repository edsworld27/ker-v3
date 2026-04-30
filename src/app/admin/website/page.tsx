"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PAGE_SCHEMAS } from "@/lib/admin/contentSchema";
import { listAll, onContentChange, type ContentStore } from "@/lib/admin/content";
import { listMedia, onMediaChange, type MediaItem } from "@/lib/admin/media";

export default function AdminWebsitePage() {
  const [store, setStore] = useState<ContentStore>({});
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const refresh = () => { setStore(listAll()); setMedia(listMedia()); };
    refresh();
    const off1 = onContentChange(refresh);
    const off2 = onMediaChange(refresh);
    return () => { off1(); off2(); };
  }, []);

  function editsForPage(schemaId: string): number {
    const schema = PAGE_SCHEMAS.find(p => p.id === schemaId);
    if (!schema) return 0;
    let n = 0;
    for (const sec of schema.sections) {
      for (const f of sec.fields) {
        if (store[f.key]) n++;
      }
    }
    return n;
  }

  const totalEdits = Object.keys(store).length;
  const mediaCount = media.length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Website</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Sitemap &amp; content</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          Edit any text or image on the site. Changes appear instantly — no rebuild needed.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Pages" value={PAGE_SCHEMAS.length.toString()} />
        <Stat label="Active edits" value={totalEdits.toString()} accent />
        <Stat label="Media files" value={mediaCount.toString()} />
        <Link
          href="/admin/website/media"
          className="rounded-2xl border border-brand-amber/30 bg-brand-amber/10 px-5 py-4 hover:bg-brand-amber/15 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-brand-amber/80 mb-1">Open</p>
            <p className="text-sm font-medium text-brand-cream">Media library →</p>
          </div>
        </Link>
      </div>

      {/* Pages list */}
      <div>
        <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/50 mb-3">Editable pages</h2>
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
          {PAGE_SCHEMAS.map(schema => {
            const edits = editsForPage(schema.id);
            const totalFields = schema.sections.reduce((s, sec) => s + sec.fields.length, 0);
            return (
              <Link
                key={schema.id}
                href={`/admin/website/${schema.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-brand-cream truncate">{schema.label}</span>
                    {edits > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange">
                        {edits} edit{edits === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-cream/40">
                    {schema.description ?? "—"}
                    <span className="text-brand-cream/25"> · {schema.sections.length} section{schema.sections.length === 1 ? "" : "s"} · {totalFields} fields</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={schema.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-brand-cream/40 hover:text-brand-cream underline underline-offset-4"
                  >
                    View
                  </a>
                  <span className="text-brand-cream/30">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Note about future custom pages */}
      <div className="rounded-xl border border-white/5 bg-brand-black-card/60 px-4 py-3 text-xs text-brand-cream/55 leading-relaxed">
        <span className="text-brand-amber font-semibold">Coming next · </span>
        Add new custom pages with section blocks (hero, text, gallery) directly from this panel.
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${accent ? "border-brand-orange/25 bg-brand-orange/5" : "border-white/8 bg-brand-black-card"}`}>
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${accent ? "text-brand-orange" : "text-brand-cream"}`}>{value}</p>
    </div>
  );
}
