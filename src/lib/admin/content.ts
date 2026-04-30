"use client";

// Site-wide content overrides. Every editable text/image on the site
// reads through useContent(key, fallback) — if there's an override stored
// for that key, the override wins; otherwise the hardcoded fallback is used.
// That means the site renders identically until admin edits something.
//
// TODO Database (Supabase):
//   table content_overrides (
//     key text primary key,
//     value text,
//     updated_at timestamptz default now()
//   );

const STORAGE_KEY = "lk_admin_content_v1";
const CHANGE_EVENT = "lk-admin-content-change";

export interface ContentEntry {
  value: string;
  updatedAt: number;
}

export type ContentStore = Record<string, ContentEntry>;

function read(): ContentStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as ContentStore; }
  catch { return {}; }
}

function write(store: ContentStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getValue(key: string): string | undefined {
  return read()[key]?.value;
}

export function setValue(key: string, value: string) {
  const store = read();
  store[key] = { value, updatedAt: Date.now() };
  write(store);
}

export function clearValue(key: string) {
  const store = read();
  delete store[key];
  write(store);
}

export function listAll(): ContentStore {
  return read();
}

export function onContentChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
