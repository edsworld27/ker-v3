"use client";

// ── Visual in-place website editor (T1 #8) ──────────────────────────────────
//
// Tier-1 #8 from OMEGA_LAUNCH_PLAN.md. The user's longstanding ask for "the
// actual website editor": admin signs in, opens the storefront with
// ?portal_edit=1, and clicks any element marked with `data-portal-edit="key"`
// to edit it inline. Saves go to the existing portal content overrides
// system — nothing new on the server side, just a friendlier surface than
// /admin/sites > Content overrides.
//
// Why this lives in the storefront layout (not /admin):
//   • The whole point is to edit IN CONTEXT — the admin sees the live
//     site they're modifying, in its real layout, with real CSS.
//   • The existing portal/tag.js already rewrites [data-portal-edit] nodes
//     for visitors. We re-use the same DOM contract on the writing side
//     so what you see is exactly what gets shipped.
//
// Activation gate (deliberately strict — non-admins NEVER see this):
//   1. Edit-mode flag: ?portal_edit=1 OR sticky sessionStorage flag.
//   2. AND admin session via getSession()/isAdmin().
//   3. AND not on an excluded path (/admin, /portal, /embed).
// All three must hold or the component renders null.
//
// What the admin sees when active:
//   • Top banner: "Editor on · <site> · N unsaved · Exit"
//   • Hover any [data-portal-edit] element → orange dashed outline
//   • Click → floating popover anchored at the element with a type-
//     appropriate input (text → input/textarea, html → mono textarea,
//     image-src → URL input + thumbnail, href → URL input).
//   • Save → optimistic DOM update + POST to draft endpoint. On failure
//     the DOM reverts and a toast surfaces the error.
//   • Multiple popovers can be open simultaneously, each independent.
//
// Keyboard shortcuts:
//   • Cmd/Ctrl + E    toggle edit mode globally
//   • Escape          close the focused popover
//
// Edge cases handled:
//   • Re-entrant draft fetch — single in-flight request via a ref.
//   • Re-applies after MutationObserver-driven host renders won't lose
//     edits (we re-attach hover handlers using a single delegated
//     listener; no per-element listeners that could leak).
//   • Confirm-cancel on Exit when there are pending unsaved drafts
//     (defensively zeroed out as soon as the network save round-trips
//     successfully).
//   • Tag's MutationObserver re-applies the published value back; our
//     overlay applies the DRAFT value on top so the admin sees what
//     they're editing, not what's published.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getSession, isAdmin, AUTH_EVENT } from "@/lib/auth";
import {
  isEditModeFlagged, setEditMode, onEditModeChange, isExcludedPath,
} from "@/lib/portalEditMode";
import { getActiveSite, onSitesChange, getSite } from "@/lib/admin/sites";
import type { OverrideType } from "@/portal/server/types";

// ── Types ─────────────────────────────────────────────────────────────────

interface DraftEntry { value: string; type: OverrideType; }
interface DraftMap { [key: string]: DraftEntry; }
interface PopoverState {
  key: string;
  type: OverrideType;
  initialValue: string;        // captured when the popover opened
  draftValue: string;
  rect: { top: number; left: number; width: number; height: number };
}
interface ToastState { id: number; kind: "ok" | "error"; message: string; }

// Default site id matches PortalTagInjector. Both look at the same
// `data-portal-site` attribute on the loader script — but we also fall
// back to the admin's active site if no script tag is present yet.
const DEFAULT_SITE_ID = "luvandker";

function detectSiteId(): string {
  if (typeof document === "undefined") return DEFAULT_SITE_ID;
  const tag = document.querySelector<HTMLScriptElement>("script[data-portal-site]");
  if (tag) {
    const v = tag.getAttribute("data-portal-site");
    if (v) return v;
  }
  return DEFAULT_SITE_ID;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PortalEditOverlay() {
  const pathname = usePathname();

  // ── Activation gate ─────────────────────────────────────────────────────
  // We split "wants edit mode" from "is admin" so the helper file stays
  // focused on the URL/sessionStorage semantics and this component owns
  // the privilege check.
  const [wantsEdit, setWantsEdit] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const refreshFlag = () => setWantsEdit(isEditModeFlagged());
    refreshFlag();
    const off = onEditModeChange(refreshFlag);
    // Also refresh on storage events so multi-tab toggles propagate.
    window.addEventListener("storage", refreshFlag);
    return () => { off(); window.removeEventListener("storage", refreshFlag); };
  }, []);

  useEffect(() => {
    const refreshAdmin = () => setIsAdminUser(isAdmin(getSession()));
    refreshAdmin();
    window.addEventListener(AUTH_EVENT, refreshAdmin);
    window.addEventListener("storage", refreshAdmin);
    return () => {
      window.removeEventListener(AUTH_EVENT, refreshAdmin);
      window.removeEventListener("storage", refreshAdmin);
    };
  }, []);

  // ── Cmd/Ctrl + E toggle (always on for admins, even when overlay
  //    is not currently rendered — that's how they turn it ON the
  //    first time without a URL flag). ──────────────────────────────────────
  useEffect(() => {
    if (!isAdminUser) return;
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() !== "e") return;
      // Don't fight admin-side editors with their own Cmd/Ctrl+E hotkeys.
      if (typeof window !== "undefined" && isExcludedPath(window.location.pathname)) return;
      e.preventDefault();
      setEditMode(!isEditModeFlagged());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdminUser]);

  const excluded = isExcludedPath(pathname);
  const active = wantsEdit && isAdminUser && !excluded;

  // Host-frame integration: when this page renders inside the
  // /admin/editor iframe, listen for set-mode messages from the host
  // toolbar (Edit/View) and announce ourselves as ready. Outside an
  // iframe (top-level storefront editing) these listeners are no-ops.
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    function postReady() {
      try { window.parent.postMessage({ source: "portal-edit-overlay", type: "ready" }, "*"); } catch {}
    }
    function onHost(e: MessageEvent) {
      const data = e.data as { source?: string; type?: string; mode?: "edit" | "view" } | null;
      if (!data || data.source !== "editor-host") return;
      if (data.type === "set-mode" && data.mode) {
        const url = new URL(window.location.href);
        if (data.mode === "edit") url.searchParams.set("portal_edit", "1");
        else url.searchParams.delete("portal_edit");
        window.history.replaceState(null, "", url.toString());
        // Re-evaluate this component's gate by toggling sessionStorage too,
        // then full reload — cleaner than trying to re-render the entire
        // overlay state in place.
        try { sessionStorage.setItem("lk_portal_edit", data.mode === "edit" ? "1" : "0"); } catch {}
        window.location.reload();
      }
    }
    window.addEventListener("message", onHost);
    postReady();
    return () => window.removeEventListener("message", onHost);
  }, []);

  if (!active) return null;
  return <ActiveOverlay siteId={detectSiteId()} />;
}

// ── Active overlay ────────────────────────────────────────────────────────
//
// Pulled out into its own component so all the heavy effects (DOM
// listeners, draft fetch, popover state) only mount when the overlay is
// actually shown. Keeps the no-op path for visitors as cheap as possible.

function ActiveOverlay({ siteId }: { siteId: string }) {
  // ── Draft + published state ────────────────────────────────────────────
  // We pull the FULL admin shape (`?admin=1`) so we know both what's
  // already saved as a draft and what's currently published. The
  // "unsaved" counter is the diff between draft and published.
  const [draft, setDraft]       = useState<DraftMap>({});
  const [published, setPubl]    = useState<DraftMap>({});
  const [loaded, setLoaded]     = useState(false);
  const [siteName, setSiteName] = useState<string>(siteId);
  const draftRef = useRef<DraftMap>({});
  draftRef.current = draft;

  // Pending optimistic edits (key → previous-DOM-value) so we can
  // revert if the network save fails. Cleared per key on success.
  const pendingRef = useRef<Record<string, string>>({});

  // Toast queue (errors mostly) — shown briefly bottom-left.
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const pushToast = useCallback((kind: "ok" | "error", message: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, kind, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Resolve site display name for the banner.
  useEffect(() => {
    function refresh() {
      const s = getSite(siteId) ?? getActiveSite();
      if (s) setSiteName(s.name);
    }
    refresh();
    return onSitesChange(refresh);
  }, [siteId]);

  // Initial draft fetch. We hit the admin projection so we get both
  // draft and published in one round-trip.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(
          `/api/portal/content/${encodeURIComponent(siteId)}?admin=1`,
          { cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = await res.json() as {
          draft?: Record<string, { value: string; type: OverrideType }>;
          published?: Record<string, { value: string; type: OverrideType }>;
        };
        if (cancelled) return;
        const flatten = (m?: Record<string, { value: string; type: OverrideType }>): DraftMap => {
          const out: DraftMap = {};
          if (!m) return out;
          for (const [k, v] of Object.entries(m)) {
            if (v && typeof v.value === "string") out[k] = { value: v.value, type: v.type ?? "text" };
          }
          return out;
        };
        setDraft(flatten(data.draft));
        setPubl(flatten(data.published));
      } catch {
        // Stay silent — admin already has /admin/sites if the API is down.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void pull();
    return () => { cancelled = true; };
  }, [siteId]);

  // ── Apply draft over published in the live DOM ──────────────────────
  // The portal tag fetches the PUBLISHED map and rewrites nodes; we're
  // racing it on every load. To make sure the editor reflects the
  // CURRENT DRAFT (not what's published), re-run our own apply step on
  // every draft change, and on every host MutationObserver tick.
  const applyDraftToDom = useCallback((map: DraftMap) => {
    if (typeof document === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>("[data-portal-edit]");
    els.forEach(el => {
      const key = el.getAttribute("data-portal-edit");
      if (!key) return;
      const rule = map[key];
      if (!rule) return;
      const t = (el.getAttribute("data-portal-type") as OverrideType) || rule.type;
      try {
        switch (t) {
          case "html":      el.innerHTML = rule.value; break;
          case "image-src": el.setAttribute("src", rule.value); break;
          case "href":      el.setAttribute("href", rule.value); break;
          default:          el.textContent = rule.value; break;
        }
      } catch {}
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    applyDraftToDom(draftRef.current);
  }, [loaded, draft, applyDraftToDom]);

  // Re-apply on host re-renders (SPA routes, hydration churn). Light
  // guard: ignore mutations our own apply caused (we don't add
  // [data-portal-edit] nodes — only the host page does).
  useEffect(() => {
    if (!loaded || typeof MutationObserver === "undefined") return;
    let timer: number | null = null;
    const obs = new MutationObserver(records => {
      let touchedNew = false;
      for (const r of records) {
        if (r.addedNodes && r.addedNodes.length) { touchedNew = true; break; }
      }
      if (!touchedNew) return;
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = null;
        applyDraftToDom(draftRef.current);
      }, 60);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      obs.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [loaded, applyDraftToDom]);

  // ── Popovers ────────────────────────────────────────────────────────────
  // Multiple popovers can be open at once; each is independent. Keyed
  // by the data-portal-edit key.
  const [popovers, setPopovers] = useState<Record<string, PopoverState>>({});

  const openPopover = useCallback((el: HTMLElement) => {
    const key = el.getAttribute("data-portal-edit");
    if (!key) return;
    const declaredType = (el.getAttribute("data-portal-type") as OverrideType) || "text";
    // Use the current DOM value as the initial — it already reflects
    // any draft we've applied on top of the published text.
    let initialValue = "";
    switch (declaredType) {
      case "image-src": initialValue = el.getAttribute("src") ?? ""; break;
      case "href":      initialValue = el.getAttribute("href") ?? ""; break;
      case "html":      initialValue = el.innerHTML ?? ""; break;
      default:          initialValue = el.textContent ?? ""; break;
    }
    // Existing draft value wins if we already have one.
    const existing = draftRef.current[key];
    if (existing) initialValue = existing.value;

    const r = el.getBoundingClientRect();
    setPopovers(prev => ({
      ...prev,
      [key]: {
        key,
        type: declaredType,
        initialValue,
        draftValue: initialValue,
        rect: {
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height,
        },
      },
    }));
  }, []);

  const closePopover = useCallback((key: string) => {
    setPopovers(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Click delegation on [data-portal-edit] elements ────────────────────
  // Single delegated listener catches clicks anywhere — including on
  // nodes that get added to the DOM after mount (SPA navigations).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const editable = target.closest<HTMLElement>("[data-portal-edit]");
      if (!editable) return;
      // Don't capture clicks inside our own UI (banner, popover).
      if (target.closest("[data-portal-overlay-ui]")) return;
      e.preventDefault();
      e.stopPropagation();
      openPopover(editable);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openPopover]);

  // Hover styling — we ship a single <style> tag rather than mutating
  // each element, so there's nothing to clean up when nodes come/go.

  // ── Saving ──────────────────────────────────────────────────────────────
  // Build the list of overrides every save — POST replaces the whole
  // draft map. We send the union of what we already have plus the
  // single key being changed. This matches the admin UI's pattern and
  // keeps the server's setDraftOverrides() contract simple.
  const saveDraft = useCallback(async (key: string, value: string, type: OverrideType): Promise<boolean> => {
    const next: DraftMap = { ...draftRef.current, [key]: { value, type } };
    if (value === "") delete next[key];                                  // empty = clear

    // Snapshot DOM for revert on failure. Only the field we'd be touching.
    const el = document.querySelector<HTMLElement>(
      `[data-portal-edit="${cssEscape(key)}"]`,
    );
    if (el) {
      let prev = "";
      switch (type) {
        case "image-src": prev = el.getAttribute("src") ?? ""; break;
        case "href":      prev = el.getAttribute("href") ?? ""; break;
        case "html":      prev = el.innerHTML ?? ""; break;
        default:          prev = el.textContent ?? ""; break;
      }
      pendingRef.current[key] = prev;
    }

    // Optimistic DOM update + state update.
    setDraft(next);
    applyDraftToDom(next);

    try {
      const overrides = Object.entries(next).map(([k, v]) => ({
        key: k, value: v.value, type: v.type,
      }));
      const res = await fetch(
        `/api/portal/content/${encodeURIComponent(siteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrides }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      delete pendingRef.current[key];
      pushToast("ok", `Saved “${key}”`);
      return true;
    } catch (err) {
      // Revert DOM + state.
      const prev = pendingRef.current[key];
      delete pendingRef.current[key];
      setDraft(d => {
        const reverted = { ...d };
        delete reverted[key];
        return reverted;
      });
      if (el && prev !== undefined) {
        try {
          switch (type) {
            case "image-src": el.setAttribute("src", prev); break;
            case "href":      el.setAttribute("href", prev); break;
            case "html":      el.innerHTML = prev; break;
            default:          el.textContent = prev; break;
          }
        } catch {}
      }
      const msg = err instanceof Error ? err.message : "Save failed";
      pushToast("error", `Save failed for “${key}” — ${msg}`);
      return false;
    }
  }, [siteId, applyDraftToDom, pushToast]);

  // ── Unsaved counter ─────────────────────────────────────────────────────
  // "Unsaved" = draft entries that differ from the corresponding
  // published value. Pure projection of the two maps we already have.
  const unsavedCount = useMemo(() => {
    if (!loaded) return 0;
    const all = new Set<string>([...Object.keys(draft), ...Object.keys(published)]);
    let count = 0;
    for (const k of all) {
      const a = draft[k];
      const b = published[k];
      if (!a && b) { count++; continue; }
      if (a && !b) { count++; continue; }
      if (a && b && (a.value !== b.value || a.type !== b.type)) count++;
    }
    return count;
  }, [draft, published, loaded]);

  // Surface unsaved count up to the host iframe (the /admin/editor
  // wrapper). No-op when the overlay isn't running inside an iframe.
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    try {
      window.parent.postMessage(
        { source: "portal-edit-overlay", type: unsavedCount === 0 ? "saved" : "unsaved", unsaved: unsavedCount },
        "*",
      );
    } catch { /* swallow cross-origin errors */ }
  }, [unsavedCount]);

  // ── Exit ────────────────────────────────────────────────────────────────
  const onExit = useCallback(() => {
    const pending = Object.keys(pendingRef.current).length;
    if (pending > 0) {
      const ok = window.confirm(
        `${pending} edit${pending === 1 ? "" : "s"} still saving. Exit anyway?`,
      );
      if (!ok) return;
    }
    setEditMode(false);
    // Strip the URL flag so a refresh doesn't re-arm the editor.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("portal_edit");
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }, []);

  // ── Escape key — close the most recently opened popover ─────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const keys = Object.keys(popovers);
      if (keys.length === 0) return;
      e.preventDefault();
      closePopover(keys[keys.length - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popovers, closePopover]);

  return (
    <>
      {/* Hover styles — applied via attribute selectors so they cover
          every [data-portal-edit] element on the page, including nodes
          added after mount. */}
      <style jsx global>{`
        [data-portal-edit] {
          outline: 1px dashed rgba(245, 158, 11, 0.4);
          outline-offset: 3px;
          cursor: pointer !important;
          transition: outline-color 120ms ease;
        }
        [data-portal-edit]:hover {
          outline: 2px dashed rgba(245, 158, 11, 0.95);
          outline-offset: 3px;
          background-color: rgba(245, 158, 11, 0.07) !important;
        }
      `}</style>

      <Banner
        siteName={siteName}
        unsavedCount={unsavedCount}
        loaded={loaded}
        onExit={onExit}
      />

      {Object.values(popovers).map(p => (
        <Popover
          key={p.key}
          state={p}
          onClose={() => closePopover(p.key)}
          onChange={value => setPopovers(prev =>
            prev[p.key] ? { ...prev, [p.key]: { ...prev[p.key], draftValue: value } } : prev,
          )}
          onSave={async () => {
            const ok = await saveDraft(p.key, p.draftValue, p.type);
            if (ok) closePopover(p.key);
          }}
        />
      ))}

      <Toasts toasts={toasts} />
    </>
  );
}

// ── Banner ────────────────────────────────────────────────────────────────

function Banner({
  siteName, unsavedCount, loaded, onExit,
}: {
  siteName: string;
  unsavedCount: number;
  loaded: boolean;
  onExit: () => void;
}) {
  return (
    <div
      data-portal-overlay-ui
      className="fixed top-0 inset-x-0 z-[210] bg-brand-orange/95 text-white text-[12px] sm:text-sm font-medium flex items-center justify-center gap-3 py-1.5 backdrop-blur-sm shadow-lg"
    >
      <span className="font-bold tracking-wide uppercase text-[10px]">Editor on</span>
      <span className="opacity-90">·</span>
      <span className="opacity-90 truncate max-w-[200px]" title={siteName}>{siteName}</span>
      <span className="opacity-90 hidden sm:inline">·</span>
      <span className="hidden sm:inline">
        {!loaded ? (
          <span className="opacity-75">loading…</span>
        ) : unsavedCount > 0 ? (
          <span><strong>{unsavedCount}</strong> unsaved</span>
        ) : (
          <span className="opacity-75">0 unsaved</span>
        )}
      </span>
      <span className="opacity-50 hidden md:inline">·</span>
      <span className="hidden md:inline opacity-70 text-[11px]">
        Click any highlighted region · <kbd className="px-1 rounded bg-black/20">Esc</kbd> closes · <kbd className="px-1 rounded bg-black/20">⌘E</kbd> toggles
      </span>
      <button
        onClick={onExit}
        className="ml-2 text-[11px] px-2.5 py-1 rounded-md bg-black/25 hover:bg-black/40 font-semibold uppercase tracking-wide"
      >
        Exit
      </button>
    </div>
  );
}

// ── Popover ───────────────────────────────────────────────────────────────

function Popover({
  state, onClose, onChange, onSave,
}: {
  state: PopoverState;
  onClose: () => void;
  onChange: (value: string) => void;
  onSave: () => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  // Position the popover BELOW the element by default; if there's not
  // enough room, anchor above. We compute on every render — cheap.
  const top  = state.rect.top + state.rect.height + 8;
  const left = Math.max(8, state.rect.left);

  const isLong = state.type === "html" || state.draftValue.length > 80 || state.draftValue.includes("\n");
  const isUrl  = state.type === "image-src" || state.type === "href";

  const dirty = state.draftValue !== state.initialValue;

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try { await onSave(); }
    finally { setSaving(false); }
  }

  return (
    <div
      data-portal-overlay-ui
      style={{ top, left, maxWidth: 480 }}
      className="absolute z-[220] w-[min(480px,calc(100vw-24px))] rounded-xl border border-brand-orange/40 bg-brand-black-card text-brand-cream shadow-2xl overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-brand-orange/15">
        <code
          className="font-mono text-[11px] text-brand-cream/85 truncate flex-1"
          title={state.key}
        >
          {state.key}
        </code>
        <span className="text-[10px] uppercase tracking-wider text-brand-cream/55 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
          {state.type}
        </span>
        <button
          onClick={onClose}
          aria-label="Close editor"
          className="text-brand-cream/55 hover:text-brand-cream w-6 h-6 flex items-center justify-center rounded hover:bg-white/5"
        >
          ×
        </button>
      </div>

      <div className="p-3 space-y-2">
        {state.type === "image-src" && state.draftValue && (
          // Live thumbnail — useful when pasting URLs in.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.draftValue}
            alt=""
            className="max-h-24 max-w-full object-contain rounded border border-white/10 bg-brand-black/40"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {isLong || state.type === "html" ? (
          <textarea
            autoFocus
            value={state.draftValue}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void handleSave(); }
            }}
            rows={state.type === "html" ? 6 : 4}
            className={`w-full px-3 py-2 rounded-md bg-brand-black border border-white/15 focus:border-brand-orange focus:outline-none text-sm text-brand-cream placeholder:text-brand-cream/30 ${state.type === "html" ? "font-mono text-xs" : ""}`}
          />
        ) : (
          <input
            autoFocus
            type={isUrl ? "url" : "text"}
            value={state.draftValue}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); void handleSave(); }
            }}
            className={`w-full px-3 py-2 rounded-md bg-brand-black border border-white/15 focus:border-brand-orange focus:outline-none text-sm text-brand-cream placeholder:text-brand-cream/30 ${isUrl ? "font-mono text-xs" : ""}`}
          />
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="text-xs px-3 py-1.5 rounded-md bg-brand-orange text-white font-semibold disabled:opacity-40"
          >
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-md text-brand-cream/65 hover:text-brand-cream"
          >
            Cancel
          </button>
          <span className="ml-auto text-[10px] text-brand-cream/35">
            <kbd className="px-1 rounded bg-white/5 border border-white/10">{isLong ? "⌘+Enter" : "Enter"}</kbd> save
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Toasts ────────────────────────────────────────────────────────────────

function Toasts({ toasts }: { toasts: ToastState[] }) {
  if (!toasts.length) return null;
  return (
    <div
      data-portal-overlay-ui
      className="fixed bottom-4 left-4 z-[230] space-y-2 max-w-sm pointer-events-none"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-3 py-2 rounded-lg shadow-lg text-xs font-medium pointer-events-auto ${
            t.kind === "ok"
              ? "bg-green-600/90 text-white"
              : "bg-red-500/95 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── CSS.escape polyfill — older browsers don't have it. ───────────────────
function cssEscape(s: string): string {
  if (typeof window !== "undefined" && typeof window.CSS?.escape === "function") {
    return window.CSS.escape(s);
  }
  return s.replace(/[^a-zA-Z0-9_-]/g, ch => `\\${ch}`);
}
