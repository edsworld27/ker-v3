"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
  listMedia, addMedia, deleteMedia, fileToDataUrl, formatBytes,
  onMediaChange, type MediaItem,
} from "@/lib/admin/media";

const MAX_BYTES = 1.5 * 1024 * 1024; // 1.5 MB per image — keeps localStorage sane

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setItems(listMedia());
    refresh();
    return onMediaChange(refresh);
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" is not an image — skipped.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`"${file.name}" is too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_BYTES)}.`);
          continue;
        }
        const dataUrl = await fileToDataUrl(file);
        addMedia(file.name, dataUrl, file.size, file.type);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.name}"? Anywhere this image is used will fall back to the default.`)) return;
    deleteMedia(item.id);
  }

  function copyRef(item: MediaItem) {
    const ref = `media:${item.id}`;
    navigator.clipboard.writeText(ref).then(() => {
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1400);
    }).catch(() => {});
  }

  const filtered = items.filter(i =>
    !query.trim() || i.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalBytes = items.reduce((s, i) => s + i.size, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      {/* Breadcrumb */}
      <Link href="/admin/website" className="text-[11px] text-brand-cream/40 hover:text-brand-cream transition-colors">
        ← Website
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Media library</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Images</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            {items.length} file{items.length === 1 ? "" : "s"} · {formatBytes(totalBytes)} stored
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-64"
          />
          <input
            ref={inputRef}
            id="media-upload"
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="media-upload"
            className={`shrink-0 cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              busy
                ? "bg-brand-orange/30 text-white/60"
                : "bg-brand-orange text-white hover:bg-brand-orange-light"
            }`}
          >
            {busy ? "Uploading…" : "+ Upload"}
          </label>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-brand-amber/20 bg-brand-amber/5 px-4 py-3 text-xs text-brand-cream/65 leading-relaxed">
        <span className="text-brand-amber font-semibold">Tip · </span>
        Use the &quot;Use this&quot; button next to any image to copy its reference (e.g. <code className="text-brand-amber">media:m_xxx</code>),
        then paste it into any image field on a page editor. Max {formatBytes(MAX_BYTES)} per file.
      </div>

      {error && (
        <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-xs text-brand-orange">
          {error}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-brand-black-card/50 px-8 py-16 text-center">
          <p className="text-brand-cream/40 text-sm">
            {items.length === 0
              ? "No images yet. Click Upload to add your first image."
              : "No images match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden group">
              <div className="relative aspect-square bg-brand-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-brand-cream truncate" title={item.name}>{item.name}</p>
                <p className="text-[10px] text-brand-cream/40 mt-0.5">{formatBytes(item.size)}</p>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => copyRef(item)}
                    className="flex-1 px-2 py-1.5 rounded-md text-[10px] font-medium border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10 transition-colors"
                  >
                    {copied === item.id ? "Copied!" : "Use this"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-2 py-1.5 rounded-md text-[10px] font-medium border border-white/10 text-brand-cream/55 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
