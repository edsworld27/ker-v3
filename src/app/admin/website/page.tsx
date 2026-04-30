"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PAGE_SCHEMAS, GLOBAL_SETTINGS_SCHEMA, getSchema } from "@/lib/admin/contentSchema";
import {
  listAll, onContentChange, hasDraft, pendingDraftCount,
  publishAll, discardAllDrafts, isPreviewMode, setPreviewMode,
  type ContentStore,
} from "@/lib/admin/content";
import { listMedia, onMediaChange, type MediaItem } from "@/lib/admin/media";
import { listPages, onPagesChange, type CustomPage } from "@/lib/admin/customPages";

export default function AdminWebsitePage() {
  const [store, setStore] = useState<ContentStore>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [previewOn, setPreviewOn] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStore(listAll());
      setMedia(listMedia());
      setPages(listPages());
      setPreviewOn(isPreviewMode());
    };
    refresh();
    const off1 = onContentChange(refresh);
    const off2 = onMediaChange(refresh);
    const off3 = onPagesChange(refresh);
    return () => { off1(); off2(); off3(); };
  }, []);

  function statsForPage(schemaId: string): { edits: number; drafts: number } {
    const schema = schemaId === "global" ? GLOBAL_SETTINGS_SCHEMA : getSchema(schemaId);
    if (!schema) return { edits: 0, drafts: 0 };
    let edits = 0, drafts = 0;
    for (const sec of schema.sections) {
      for (const f of sec.fields) {
        if (store[f.key]) edits++;
        if (hasDraft(f.key)) drafts++;
      }
    }
    return { edits, drafts };
  }

  const totalDrafts = pendingDraftCount();
  const totalEdits = Object.keys(store).length;
  const mediaCount = media.length;

  function publishEverything() {
    if (totalDrafts === 0) return;
    if (!confirm(`Publish all ${totalDrafts} draft change${totalDrafts === 1 ? "" : "s"} across the site?`)) return;
    publishAll();
  }
  function discardEverything() {
    if (totalDrafts === 0) return;
    if (!confirm(`Discard all ${totalDrafts} unpublished draft change${totalDrafts === 1 ? "" : "s"}?`)) return;
    discardAllDrafts();
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Website</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Sitemap &amp; content</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            Edit any text, image or piece of head/SEO code on the site. Drafts are private — publish when ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreviewMode(!previewOn)}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
              previewOn
                ? "border-brand-amber/40 bg-brand-amber/15 text-brand-amber"
                : "border-white/10 text-brand-cream/55 hover:text-brand-cream hover:border-white/30"
            }`}
          >
            {previewOn ? "Preview ON" : "Preview drafts"}
          </button>
          {totalDrafts > 0 && (
            <>
              <button
                onClick={discardEverything}
                className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
              >
                Discard all drafts
              </button>
              <button
                onClick={publishEverything}
                className="text-xs px-3 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold transition-colors"
              >
                Publish {totalDrafts}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Pages" value={(PAGE_SCHEMAS.length + pages.length).toString()} />
        <Stat label="Drafts pending" value={totalDrafts.toString()} accent={totalDrafts > 0} />
        <Stat label="Active edits" value={totalEdits.toString()} />
        <Stat label="Media files" value={mediaCount.toString()} />
      </div>

      {/* Tile shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/website/global"
          className="rounded-2xl border border-brand-purple/30 bg-brand-purple/10 px-5 py-4 hover:bg-brand-purple/15 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-brand-purple-light/80 mb-1">Site-wide</p>
            <p className="text-sm font-medium text-brand-cream">Global SEO, analytics & cookies →</p>
          </div>
        </Link>
        <Link
          href="/admin/website/media"
          className="rounded-2xl border border-brand-amber/30 bg-brand-amber/10 px-5 py-4 hover:bg-brand-amber/15 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-brand-amber/80 mb-1">Open</p>
            <p className="text-sm font-medium text-brand-cream">Media library →</p>
          </div>
        </Link>
        <Link
          href="/admin/pages"
          className="rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-5 py-4 hover:bg-brand-orange/15 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-brand-orange/80 mb-1">Builder</p>
            <p className="text-sm font-medium text-brand-cream">Custom pages →</p>
          </div>
        </Link>
      </div>

      {/* Pages list */}
      <div>
        <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/50 mb-3">Editable pages</h2>
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
          {PAGE_SCHEMAS.map(schema => {
            const { edits, drafts } = statsForPage(schema.id);
            const fullSchema = getSchema(schema.id)!;
            const totalFields = fullSchema.sections.reduce((s, sec) => s + sec.fields.length, 0);
            return (
              <Link
                key={schema.id}
                href={`/admin/website/${schema.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-brand-cream truncate">{schema.label}</span>
                    {drafts > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-amber/25 text-brand-amber">
                        {drafts} draft{drafts === 1 ? "" : "s"}
                      </span>
                    )}
                    {edits > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange">
                        {edits} edit{edits === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-cream/40">
                    {schema.description ?? "—"}
                    <span className="text-brand-cream/25"> · {fullSchema.sections.length} section{fullSchema.sections.length === 1 ? "" : "s"} · {totalFields} fields</span>
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

      {/* Custom pages */}
      {pages.length > 0 && (
        <div>
          <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/50 mb-3">Custom pages</h2>
          <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
            {pages.map(p => (
              <Link
                key={p.id}
                href={`/admin/pages/${p.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-brand-cream truncate">{p.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.status === "published" ? "bg-green-400/20 text-green-300" : "bg-white/10 text-brand-cream/55"}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-cream/40">/p/{p.slug} · {p.blocks.length} block{p.blocks.length === 1 ? "" : "s"}</p>
                </div>
                <span className="text-brand-cream/30">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${accent ? "border-brand-amber/30 bg-brand-amber/10" : "border-white/8 bg-brand-black-card"}`}>
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${accent ? "text-brand-amber" : "text-brand-cream"}`}>{value}</p>
    </div>
  );
}
