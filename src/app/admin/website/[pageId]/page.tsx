"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSchema, GLOBAL_SETTINGS_SCHEMA, type ContentField, type PageSchema } from "@/lib/admin/contentSchema";
import {
  getDraftValue, getPublishedValue, hasDraft, setValue, clearValue,
  publishKey, discardDraft, onContentChange, isPreviewMode, setPreviewMode,
} from "@/lib/admin/content";
import {
  listMedia, addMedia, fileToDataUrl, formatBytes, resolveMediaRef,
  onMediaChange, type MediaItem,
} from "@/lib/admin/media";

const MAX_BYTES = 1.5 * 1024 * 1024;

export default function PageEditor() {
  const params = useParams();
  const pageId = (params?.pageId as string) ?? "";
  const schema = pageId === "global" ? GLOBAL_SETTINGS_SCHEMA : getSchema(pageId);

  const [, setTick] = useState(0);
  const [previewOn, setPreviewOn] = useState(false);
  useEffect(() => {
    setPreviewOn(isPreviewMode());
    const refresh = () => { setTick(t => t + 1); setPreviewOn(isPreviewMode()); };
    const off1 = onContentChange(refresh);
    const off2 = onMediaChange(refresh);
    return () => { off1(); off2(); };
  }, []);

  if (!schema) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
        <Link href="/admin/website" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Website</Link>
        <p className="mt-6 text-brand-cream/60">No page schema found for &quot;{pageId}&quot;.</p>
      </div>
    );
  }

  const allKeys = schema.sections.flatMap(s => s.fields.map(f => f.key));
  const draftCount = allKeys.filter(k => hasDraft(k)).length;
  const editsCount = allKeys.filter(k => getDraftValue(k) !== undefined || getPublishedValue(k) !== undefined).length;

  function resetAll() {
    if (!confirm(`Reset all ${editsCount} edit${editsCount === 1 ? "" : "s"} on this page back to defaults?`)) return;
    for (const k of allKeys) clearValue(k);
  }

  function publishAll() {
    if (!confirm(`Publish ${draftCount} draft change${draftCount === 1 ? "" : "s"} on this page? Visitors will see them immediately.`)) return;
    for (const k of allKeys) if (hasDraft(k)) publishKey(k);
  }

  function discardAll() {
    if (!confirm(`Discard ${draftCount} unpublished draft change${draftCount === 1 ? "" : "s"}?`)) return;
    for (const k of allKeys) if (hasDraft(k)) discardDraft(k);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-4xl">
      <Link href="/admin/website" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Website</Link>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Editing</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">{schema.label}</h1>
          {schema.description && (
            <p className="text-brand-cream/45 text-sm mt-1">{schema.description}</p>
          )}
          <p className="text-brand-cream/35 text-xs mt-2">
            {draftCount > 0 && <span className="text-brand-amber font-semibold">{draftCount} unpublished draft{draftCount === 1 ? "" : "s"}</span>}
            {draftCount > 0 && " · "}
            <a href={schema.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-brand-cream">
              View live →
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPreviewMode(!previewOn); }}
            className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
              previewOn
                ? "border-brand-amber/40 bg-brand-amber/15 text-brand-amber"
                : "border-white/10 text-brand-cream/55 hover:text-brand-cream hover:border-white/30"
            }`}
          >
            {previewOn ? "Preview ON" : "Preview drafts"}
          </button>
          {draftCount > 0 && (
            <>
              <button
                onClick={discardAll}
                className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
              >
                Discard drafts
              </button>
              <button
                onClick={publishAll}
                className="text-xs px-3 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold transition-colors"
              >
                Publish {draftCount}
              </button>
            </>
          )}
          {editsCount > 0 && (
            <button
              onClick={resetAll}
              className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/40 hover:text-brand-cream/80 transition-colors"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {schema.sections.map(section => (
        <SectionEditor key={section.id} section={section} pageSchema={schema} />
      ))}
    </div>
  );
}

function SectionEditor({ section }: { section: PageSchema["sections"][number]; pageSchema: PageSchema }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-brand-black-soft/40">
        <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/60">{section.label}</h2>
      </div>
      <div className="p-5 space-y-5">
        {section.fields.map(field => (
          <FieldEditor key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}

function FieldEditor({ field }: { field: ContentField }) {
  const stored = getDraftValue(field.key);
  const isOverride = stored !== undefined;
  const draftPending = hasDraft(field.key);
  const current = stored ?? field.default;
  const [draft, setDraft] = useState(current);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => { setDraft(current); }, [current]);

  function save(next: string) {
    if (next === field.default && getPublishedValue(field.key) === undefined) {
      clearValue(field.key);
    } else {
      setValue(field.key, next);
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 800);
  }

  function reset() {
    clearValue(field.key);
    setDraft(field.default);
  }

  function publish() {
    publishKey(field.key);
  }

  function discard() {
    discardDraft(field.key);
    setDraft(getPublishedValue(field.key) ?? field.default);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium text-brand-cream/80">
          {field.label}
          {isOverride && !draftPending && <span className="ml-2 text-[10px] text-brand-orange">edited</span>}
          {draftPending && <span className="ml-2 text-[10px] text-brand-amber font-semibold">DRAFT</span>}
          {savedFlash && <span className="ml-2 text-[10px] text-brand-cream/50">saved</span>}
        </label>
        <div className="flex items-center gap-2">
          {draftPending && (
            <>
              <button onClick={publish} className="text-[10px] text-brand-orange hover:underline">publish</button>
              <button onClick={discard} className="text-[10px] text-brand-cream/40 hover:text-brand-cream">discard</button>
            </>
          )}
          {isOverride && !draftPending && (
            <button onClick={reset} className="text-[10px] text-brand-cream/40 hover:text-brand-cream underline underline-offset-2">reset</button>
          )}
        </div>
      </div>
      {field.hint && <p className="text-[11px] text-brand-cream/35">{field.hint}</p>}

      {(field.type === "text" || field.type === "url") && (
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          placeholder={field.type === "url" ? "https://…" : ""}
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40"
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          rows={4}
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40 resize-y leading-relaxed"
        />
      )}

      {field.type === "code" && (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          rows={6}
          spellCheck={false}
          placeholder={field.hint?.includes("JSON-LD") ? '{ "@context": "https://schema.org", "@type": "WebPage", "name": "…" }' : ""}
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-xs text-brand-cream font-mono focus:outline-none focus:border-brand-orange/40 resize-y leading-relaxed"
        />
      )}

      {field.type === "boolean" && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => save(draft === "true" ? "false" : "true")}
            className={`relative w-11 h-6 rounded-full transition-colors ${draft === "true" ? "bg-brand-orange" : "bg-white/15"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${draft === "true" ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-xs text-brand-cream/60">{draft === "true" ? "On" : "Off"}</span>
        </div>
      )}

      {field.type === "image" && (
        <ImageFieldEditor field={field} draft={draft} setDraft={setDraft} save={save} />
      )}
    </div>
  );
}

function ImageFieldEditor({
  field, draft, setDraft, save,
}: {
  field: ContentField;
  draft: string;
  setDraft: (s: string) => void;
  save: (s: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMedia(listMedia());
    return onMediaChange(() => setMedia(listMedia()));
  }, []);

  const preview = resolveMediaRef(draft || field.default);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_BYTES) {
      alert(`Image too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_BYTES)}.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const item = addMedia(file.name, dataUrl, file.size, file.type);
      const ref = `media:${item.id}`;
      setDraft(ref);
      save(ref);
    } finally {
      setUploading(false);
    }
  }

  function pick(item: MediaItem) {
    const ref = `media:${item.id}`;
    setDraft(ref);
    save(ref);
    setPicking(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-start">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-brand-black border border-white/10 shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-brand-cream/30">no image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => save(draft)}
            placeholder="/path/to/image.png  or  media:abc123  or  https://..."
            className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-xs text-brand-cream font-mono focus:outline-none focus:border-brand-orange/40"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPicking(p => !p)}
              className="text-[11px] px-3 py-1.5 rounded-md border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10"
            >
              {picking ? "Hide library" : "Pick from library"}
            </button>
            <label className={`text-[11px] px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
              uploading
                ? "border-white/10 text-brand-cream/40"
                : "border-brand-orange/30 text-brand-orange hover:bg-brand-orange/10"
            }`}>
              {uploading ? "Uploading…" : "Upload new"}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      {picking && (
        <div className="rounded-lg border border-white/8 bg-brand-black p-3 max-h-72 overflow-y-auto">
          {media.length === 0 ? (
            <p className="text-[11px] text-brand-cream/40 text-center py-4">
              Library is empty. <Link href="/admin/website/media" className="text-brand-orange underline">Open library →</Link>
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {media.map(item => (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  className="relative aspect-square rounded-md overflow-hidden border border-white/10 hover:border-brand-orange/50 transition-colors"
                  title={item.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.dataUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
