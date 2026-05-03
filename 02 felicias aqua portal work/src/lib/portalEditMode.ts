"use client";

// Tiny helper for the visual in-place editor's activation logic.
//
// The overlay is OFF by default for everyone — including admins — so a
// random sign-in doesn't drape orange outlines over the storefront. It
// turns ON via either:
//
//   • URL flag `?portal_edit=1` (sticks in sessionStorage so subsequent
//     same-tab navigations keep it on without rewriting the address bar)
//   • OR a programmatic call to setEditMode(true) from inside the overlay
//
// Activation requires an admin session. Non-admin visitors who land on
// a URL with ?portal_edit=1 (e.g. shared by mistake) silently get
// nothing — the overlay short-circuits to render-null on mount.
//
// The helper deliberately does no admin-detection itself — it just
// answers "does this tab WANT the editor on?" The caller (the overlay)
// gates that against getSession()/isAdmin() before mounting.

const STORAGE_KEY = "lk_portal_edit_v1";
const EVENT       = "lk-portal-edit-mode-change";

// Paths on which the editor must NEVER show, even if the flag is set.
// /admin runs the actual admin chrome — we don't want a second editor
// stacked on top of it.
const EXCLUDED_PATH_PREFIXES = ["/admin", "/embed", "/portal"];

export function isExcludedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  for (const prefix of EXCLUDED_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return true;
  }
  return false;
}

// Synchronous read. Returns true if the current tab has been flagged
// for edit mode either via the URL or via a previous sticky toggle.
export function isEditModeFlagged(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // URL wins — query param is the source of truth on first paint.
    const params = new URLSearchParams(window.location.search);
    if (params.get("portal_edit") === "1") return true;
    if (params.get("portal_edit") === "0") return false;
  } catch { /* malformed URL — fall through */ }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch { return false; }
}

// Persist edit-mode across same-tab navigations. We use sessionStorage
// (not localStorage) so opening the storefront in a fresh tab doesn't
// inherit the editor — every editor session is explicit.
export function setEditMode(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.sessionStorage.setItem(STORAGE_KEY, "1");
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* storage blocked — UI just won't be sticky */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch {}
}

export function onEditModeChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

// Build a storefront URL that will boot directly into edit mode. Used by
// the "Open editor" button in /admin/sites — we want to drop the admin
// onto the live site with the overlay armed.
export function buildEditorUrl(host: string | undefined, path: string = "/"): string {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  if (!host) return `${safePath}${safePath.includes("?") ? "&" : "?"}portal_edit=1`;
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}${safePath}${safePath.includes("?") ? "&" : "?"}portal_edit=1`;
}
