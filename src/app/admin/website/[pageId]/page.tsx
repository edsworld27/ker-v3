"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSchema, type ContentField, type PageSchema } from "@/lib/admin/contentSchema";
import { getValue, setValue, clearValue, onContentChange } from "@/lib/admin/content";
import {
  listMedia, addMedia, fileToDataUrl, formatBytes, resolveMediaRef,
  onMediaChange, type MediaItem,
} from "@/lib/admin/media";

const MAX_BYTES = 1.5 * 1024 * 1024;

export default function PageEditor() {
  const params = useParams();
  const pageId = (params?.pageId as string) ?? "";
  const schema = getSchema(pageId);

  const [, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick(t => t + 1);
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
  const editsCount = allKeys.filter(k => getValue(k) !== undefined).length;

  function resetAll() {
    if (!confirm(`Reset all ${editsCount} edit${editsCount === 1 ? "" : "s"} on this page back to defaults?`)) return;
    for (const k of allKeys) clearValue(k);
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
            {editsCount > 0 && <span className="text-brand-orange">{editsCount} active edit{editsCount === 1 ? "" : "s"}</span>}
            {editsCount > 0 && " · "}
            <a href={schema.href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-brand-cream">
              View live →
            </a>
          </p>
        </div>
        {editsCount > 0 && (
          <button
            onClick={resetAll}
            className="text-xs px-3 py-2 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
          >
            Reset all edits
          </button>
        )}
      </div>

      {schema.sections.map(section => (
        <SectionEditor key={section.id} section={section} pageSchema={schema} />
      ))}
    </div>
  );
}

function SectionEditor({ section, pageSchema }: { section: PageSchema["sections"][number]; pageSchema: PageSchema }) {
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
  const stored = getValue(field.key);
  const isOverride = stored !== undefined;
  const current = stored ?? field.default;
  const [draft, setDraft] = useState(current);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => { setDraft(current); }, [current]);

  function save(next: string) {
    if (next === field.default) {
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

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium text-brand-cream/80">
          {field.label}
          {isOverride && <span className="ml-2 text-[10px] text-brand-orange">edited</span>}
          {savedFlash && <span className="ml-2 text-[10px] text-brand-amber">saved</span>}
        </label>
        {isOverride && (
          <button
            onClick={reset}
            className="text-[10px] text-brand-cream/40 hover:text-brand-cream underline underline-offset-2"
          >
            reset
          </button>
        )}
      </div>
      {field.hint && <p className="text-[11px] text-brand-cream/35">{field.hint}</p>}

      {field.type === "text" && (
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => save(draft)}
          onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
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
