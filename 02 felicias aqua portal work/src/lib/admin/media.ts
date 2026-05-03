"use client";

// Media library. Images are stored as data-URLs in localStorage so the admin
// can upload, browse, and reuse them with no backend. Each item has an id —
// content-image fields can either reference a media id ("media:abc123") or
// a path/URL directly. The useMediaImage helper resolves both.
//
// TODO Storage (Supabase):
//   bucket "site-media" with public read; upload returns a public URL.
//   Replace addMedia() body with a fetch POST to /api/media/upload that
//   pipes through @supabase/supabase-js and returns { url, id }.

const STORAGE_KEY = "lk_admin_media_v1";
const CHANGE_EVENT = "lk-admin-media-change";

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  createdAt: number;
}

function read(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as MediaItem[]; }
  catch { return []; }
}

function write(items: MediaItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listMedia(): MediaItem[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getMedia(id: string): MediaItem | undefined {
  return read().find(m => m.id === id);
}

export function addMedia(name: string, dataUrl: string, size: number, type: string): MediaItem {
  const item: MediaItem = {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    dataUrl,
    size,
    type,
    createdAt: Date.now(),
  };
  write([item, ...read()]);
  return item;
}

export function deleteMedia(id: string) {
  write(read().filter(m => m.id !== id));
}

// A media reference can be either:
//   - "media:<id>"  → look up in the media library
//   - "/path.png" or "data:..." or "https://..."  → use as-is
export function resolveMediaRef(ref: string): string {
  if (!ref) return ref;
  if (ref.startsWith("media:")) {
    const id = ref.slice("media:".length);
    return getMedia(id)?.dataUrl ?? ref;
  }
  return ref;
}

export function onMediaChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
