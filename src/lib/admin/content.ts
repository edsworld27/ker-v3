"use client";

// Site-wide content overrides with draft / published separation.
//
// `published` is what the public site renders. `draft` is the in-progress
// edit buffer the admin sees. Saving a field writes to `draft`; "Publish"
// promotes drafts → published; "Discard" wipes the draft buffer.
//
// Preview mode (a per-tab flag) lets the admin browse the live site rendering
// drafts instead of published — flip via setPreviewMode(true).
//
// TODO Database (Supabase):
//   table content_overrides (
//     key text primary key,
//     draft_value text,
//     published_value text,
//     updated_at timestamptz default now()
//   );

const STORAGE_KEY = "lk_admin_content_v2";
const LEGACY_KEY  = "lk_admin_content_v1";
const PREVIEW_KEY = "lk_admin_preview_mode";
const CHANGE_EVENT = "lk-admin-content-change";

export interface ContentEntry {
  draft?: string;
  published?: string;
  updatedAt: number;
}

export type ContentStore = Record<string, ContentEntry>;

function read(): ContentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ContentStore;
    // Migrate legacy v1 (flat { key: { value, updatedAt } }) → v2.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy) as Record<string, { value: string; updatedAt: number }>;
      const migrated: ContentStore = {};
      for (const [k, v] of Object.entries(old)) {
        migrated[k] = { published: v.value, draft: v.value, updatedAt: v.updatedAt };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return {};
  } catch { return {}; }
}

function write(store: ContentStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PREVIEW_KEY) === "1";
}

export function setPreviewMode(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) sessionStorage.setItem(PREVIEW_KEY, "1");
  else sessionStorage.removeItem(PREVIEW_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Public read — what the storefront sees (drafts only when preview is on).
export function getValue(key: string): string | undefined {
  const e = read()[key];
  if (!e) return undefined;
  if (isPreviewMode()) return e.draft ?? e.published;
  return e.published;
}

// Admin read — always returns the latest draft (falling back to published).
export function getDraftValue(key: string): string | undefined {
  const e = read()[key];
  if (!e) return undefined;
  return e.draft ?? e.published;
}

export function getPublishedValue(key: string): string | undefined {
  return read()[key]?.published;
}

export function hasDraft(key: string): boolean {
  const e = read()[key];
  if (!e) return false;
  return e.draft !== undefined && e.draft !== e.published;
}

export function setValue(key: string, value: string) {
  const store = read();
  const existing = store[key];
  store[key] = {
    draft: value,
    published: existing?.published,
    updatedAt: Date.now(),
  };
  write(store);
}

// Save & publish in one step (used when the admin doesn't want a draft buffer).
export function setAndPublish(key: string, value: string) {
  const store = read();
  store[key] = { draft: value, published: value, updatedAt: Date.now() };
  write(store);
}

export function clearValue(key: string) {
  const store = read();
  delete store[key];
  write(store);
}

export function discardDraft(key: string) {
  const store = read();
  const e = store[key];
  if (!e) return;
  if (e.published === undefined) delete store[key];
  else store[key] = { ...e, draft: e.published };
  write(store);
}

export function publishKey(key: string) {
  const store = read();
  const e = store[key];
  if (!e || e.draft === undefined) return;
  store[key] = { ...e, published: e.draft, updatedAt: Date.now() };
  write(store);
}

export function publishAll(): number {
  const store = read();
  let n = 0;
  for (const [k, e] of Object.entries(store)) {
    if (e.draft !== undefined && e.draft !== e.published) {
      store[k] = { ...e, published: e.draft, updatedAt: Date.now() };
      n++;
    }
  }
  if (n > 0) write(store);
  return n;
}

export function discardAllDrafts(): number {
  const store = read();
  let n = 0;
  for (const k of Object.keys(store)) {
    const e = store[k];
    if (e.draft !== undefined && e.draft !== e.published) {
      if (e.published === undefined) delete store[k];
      else store[k] = { ...e, draft: e.published };
      n++;
    }
  }
  if (n > 0) write(store);
  return n;
}

export function pendingDraftCount(): number {
  const store = read();
  let n = 0;
  for (const e of Object.values(store)) {
    if (e.draft !== undefined && e.draft !== e.published) n++;
  }
  return n;
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
