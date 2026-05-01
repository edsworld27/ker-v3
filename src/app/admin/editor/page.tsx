"use client";

// /admin/editor — Wix / GoHighLevel-style live editor (the "super editor").
//
// Hosts the actual storefront in an iframe (with ?portal_edit=1 so the
// existing PortalEditOverlay activates inside) and wraps it in:
//   • Icon top bar          — site / page picker, mode switcher, edit/view, save, publish
//   • Right properties side — opens when an element is clicked in the iframe
//   • Mode switch           — Live (iframe + click-to-edit), Block (drag/drop builder),
//                             Code (raw JSON of the page's block tree)
//
// Live mode message contract with the embedded PortalEditOverlay:
//   iframe → host:  { source: "portal-edit-overlay", type: "ready" | "select" | "unsaved" | "saved", … }
//   host → iframe:  { source: "editor-host", type: "set-mode" | "patch" | "save" | "revert", … }

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import DevicePreview from "@/components/admin/DevicePreview";
import EditorTopBar, { type EditorMode } from "./EditorTopBar";
import EditorPropertiesSidebar, { type SelectedElement } from "./EditorPropertiesSidebar";
import {
  loadDeviceState, saveDeviceState, getDevicePreset, effectiveViewport,
  type DeviceState,
} from "@/lib/admin/devicePresets";
import { listPages as listEditorPages, getPage as getEditorPage, updatePage as updateEditorPage, publishPage as publishEditorPage } from "@/lib/admin/editorPages";
import { listSites, getActiveSite, type Site } from "@/lib/admin/sites";
import { promoteSiteToGitHub, type PromoteResult } from "@/lib/admin/promote";
import type { EditorPage } from "@/portal/server/types";

interface PageEntry {
  id: string;
  slug: string;
  title: string;
  source: "editor" | "site";
}

export default function VisualEditorPage() {
  return <PluginRequired plugin="website"><VisualEditorPageInner /></PluginRequired>;
}

function VisualEditorPageInner() {
  const [sites, setSites] = useState<Site[]>([]);
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [pageId, setPageId] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>("live");
  const [edit, setEdit] = useState<"edit" | "view">("edit");
  const [deviceState, setDeviceState] = useState<DeviceState>(() => loadDeviceState());
  const [unsaved, setUnsaved] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load sites + pages on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const allSites = listSites();
      const active = getActiveSite() ?? allSites[0] ?? null;
      if (cancelled) return;
      setSites(allSites);
      setSite(active);
      if (!active) return;

      const editorPages = await listEditorPages(active.id);
      if (cancelled) return;

      const pageEntries: PageEntry[] = editorPages.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title || p.slug,
        source: "editor",
      }));
      // Always include the storefront home so operators can edit it
      // even if no editor-managed page covers "/".
      if (!pageEntries.some(p => p.slug === "/")) {
        pageEntries.unshift({ id: "_home", slug: "/", title: "Home", source: "site" });
      }
      setPages(pageEntries);
      setPageId(pageEntries[0]?.id ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const currentPage = pageId ? pages.find(p => p.id === pageId) : null;

  // The URL we render inside the iframe in Live mode. ?portal_edit=1
  // activates PortalEditOverlay; mode=view turns it off without reload.
  const iframeSrc = useMemo(() => {
    if (!currentPage) return "about:blank";
    if (mode === "block") {
      // Block builder lives at /admin/sites/<siteId>/editor/<pageId>.
      if (!site || currentPage.source !== "editor") return "about:blank";
      return `/admin/sites/${encodeURIComponent(site.id)}/editor/${encodeURIComponent(currentPage.id)}`;
    }
    const params = new URLSearchParams();
    if (edit === "edit") params.set("portal_edit", "1");
    params.set("editor_host", "1");
    const qs = params.toString();
    return `${currentPage.slug}${qs ? `?${qs}` : ""}`;
  }, [currentPage, edit, mode, site]);

  // Listen to messages from the embedded overlay.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as
        | { source?: string; type?: string; unsaved?: number; key?: string;
            elementType?: SelectedElement["type"]; value?: string;
            rect?: SelectedElement["rect"]; label?: string }
        | null;
      if (!data || data.source !== "portal-edit-overlay") return;
      if (data.type === "ready")   setIframeReady(true);
      if (data.type === "unsaved") setUnsaved(data.unsaved ?? 0);
      if (data.type === "saved")   setUnsaved(0);
      if (data.type === "select" && data.key && data.elementType) {
        setSelected({
          key: data.key,
          type: data.elementType,
          value: data.value ?? "",
          rect: data.rect,
          label: data.label,
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Reset selected when the page changes — its keys won't be in the new doc.
  useEffect(() => { setSelected(null); }, [pageId, mode]);

  function reloadIframe() {
    setIframeReady(false);
    setReloadKey(k => k + 1);
  }

  function postToIframe(message: unknown) {
    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }

  function setEditorMode(next: "edit" | "view") {
    setEdit(next);
    postToIframe({ source: "editor-host", type: "set-mode", mode: next });
  }

  function patchSelected(key: string, value: string) {
    postToIframe({ source: "editor-host", type: "patch", key, value });
  }
  function saveSelected(key: string) {
    postToIframe({ source: "editor-host", type: "save", key });
  }
  function revertSelected(key: string) {
    postToIframe({ source: "editor-host", type: "revert", key });
  }

  // Resolve viewport for iframe scaling. Same maths the canvas uses.
  const spec = getDevicePreset(deviceState.deviceId) ?? null;
  const viewport = spec ? effectiveViewport(spec, deviceState) : { width: 1280, height: 800 };
  const isResponsive = deviceState.deviceId === "responsive";

  return (
    <main className="h-[calc(100vh-0px)] flex flex-col bg-[#0a0a0a]">
      <EditorTopBar
        sites={sites.map(s => ({ id: s.id, name: s.name }))}
        siteId={site?.id ?? ""}
        onSiteChange={id => setSite(sites.find(s => s.id === id) ?? null)}
        pages={pages.map(p => ({ id: p.id, slug: p.slug, title: p.title }))}
        pageId={pageId}
        onPageChange={setPageId}
        mode={mode}
        onModeChange={setMode}
        edit={edit}
        onEditChange={setEditorMode}
        onReload={reloadIframe}
        iframeReady={iframeReady}
        unsaved={unsaved}
        onPublish={() => setPublishOpen(true)}
      />

      {mode === "live" && (
        <DevicePreview state={deviceState} onChange={s => { setDeviceState(s); saveDeviceState(s); }} />
      )}

      <div className="flex-1 min-h-0 flex">
        {/* Stage */}
        <div className="flex-1 min-w-0 overflow-auto bg-[#050505] flex items-start justify-center p-6">
          {mode === "code" ? (
            <CodeStage
              site={site}
              page={currentPage}
              onSavedChange={n => setUnsaved(n)}
            />
          ) : !currentPage ? (
            <div className="text-center text-[12px] text-brand-cream/45 mt-12 max-w-md">
              <p>No pages on this site yet.</p>
              <p className="mt-2">
                Create one from <Link href="/admin/pages" className="text-cyan-300 hover:text-cyan-200">/admin/pages</Link>{" "}
                or use the block-based editor at <Link href="/admin/sites" className="text-cyan-300 hover:text-cyan-200">/admin/sites</Link>.
              </p>
            </div>
          ) : mode === "block" && currentPage.source !== "editor" ? (
            <div className="text-center text-[12px] text-brand-cream/45 mt-12 max-w-md">
              <p>Block editing is only available for editor-managed pages.</p>
              <p className="mt-2 text-brand-cream/35">
                The storefront home is rendered from source. Switch to{" "}
                <button onClick={() => setMode("live")} className="text-cyan-300 hover:text-cyan-200 underline">Live</button>{" "}
                to edit it inline.
              </p>
            </div>
          ) : (
            <div
              style={{
                width: isResponsive ? "100%" : viewport.width,
                maxWidth: "100%",
                transform: mode === "live" ? `scale(${deviceState.zoom})` : undefined,
                transformOrigin: "top center",
              }}
            >
              <iframe
                key={`${mode}-${reloadKey}`}
                ref={iframeRef}
                src={iframeSrc}
                title={currentPage.title}
                sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-modals allow-clipboard-write"
                onLoad={() => setIframeReady(true)}
                style={{
                  width: "100%",
                  height: mode === "live"
                    ? (isResponsive ? "calc(100vh - 220px)" : viewport.height)
                    : "calc(100vh - 120px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  background: "#0a0a0a",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>

        {/* Right properties sidebar — only useful in Live mode where the
            overlay is sending select events back. */}
        {mode === "live" && (
          <EditorPropertiesSidebar
            selected={selected}
            onClose={() => setSelected(null)}
            onPatch={patchSelected}
            onSave={saveSelected}
            onRevert={revertSelected}
          />
        )}
      </div>

      <footer className="shrink-0 px-4 py-2 border-t border-white/5 bg-brand-black-soft text-[10px] text-brand-cream/45 flex items-center gap-4">
        {mode === "live" && (
          <>
            <span>Cmd/Ctrl+E to toggle edit mode inside the iframe</span>
            <span className="opacity-50">·</span>
            <span>Click any element marked <code className="font-mono text-brand-cream/65">data-portal-edit</code> to edit</span>
          </>
        )}
        {mode === "block" && (
          <span>Block editor — drag, drop, duplicate, delete blocks. Saves are instant.</span>
        )}
        {mode === "code" && (
          <span>Raw JSON view of the page's block tree. Edit carefully — invalid JSON won't save.</span>
        )}
        <div className="flex-1" />
        <span>{currentPage?.slug}</span>
      </footer>

      {publishOpen && site && (
        <PublishModal
          site={site}
          activePageId={currentPage?.source === "editor" ? currentPage.id : null}
          onClose={() => setPublishOpen(false)}
        />
      )}
    </main>
  );
}

// ── Code stage ─────────────────────────────────────────────────────────────
//
// Loads the EditorPage record for the active page and renders its
// `blocks` array as a raw JSON textarea. Save = parse + PATCH.

function CodeStage({
  site, page, onSavedChange,
}: {
  site: Site | null;
  page: PageEntry | null | undefined;
  onSavedChange: (n: number) => void;
}) {
  const [text, setText]       = useState("");
  const [original, setOrig]   = useState("");
  const [pageDoc, setPageDoc] = useState<EditorPage | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setError(null);
    async function pull() {
      if (!site || !page || page.source !== "editor") {
        setText("");
        setOrig("");
        setPageDoc(null);
        setLoaded(true);
        return;
      }
      const doc = await getEditorPage(site.id, page.id);
      if (cancelled) return;
      const formatted = JSON.stringify(doc?.blocks ?? [], null, 2);
      setPageDoc(doc);
      setText(formatted);
      setOrig(formatted);
      setLoaded(true);
    }
    void pull();
    return () => { cancelled = true; };
  }, [site, page]);

  const dirty = text !== original;
  useEffect(() => { onSavedChange(dirty ? 1 : 0); }, [dirty, onSavedChange]);

  async function commit() {
    if (!site || !pageDoc || !dirty) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }
    if (!Array.isArray(parsed)) {
      setError("Top-level value must be an array of blocks.");
      return;
    }
    setSaving(true);
    setError(null);
    const ok = await updateEditorPage(site.id, pageDoc.id, { blocks: parsed as EditorPage["blocks"] });
    setSaving(false);
    if (!ok) {
      setError("Save failed.");
      return;
    }
    setOrig(text);
  }

  if (!loaded) {
    return <div className="text-center text-[12px] text-brand-cream/45 mt-12">Loading…</div>;
  }
  if (!page || page.source !== "editor") {
    return (
      <div className="text-center text-[12px] text-brand-cream/45 mt-12 max-w-md">
        <p>Code view is only available for editor-managed pages.</p>
        <p className="mt-2 text-brand-cream/35">
          Storefront source pages are rendered from React components in <code className="font-mono">src/app/</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">blocks.json</span>
        <span className="text-[10px] text-brand-cream/35 font-mono truncate">{pageDoc?.slug}</span>
        <div className="flex-1" />
        {error && <span className="text-[11px] text-red-300">{error}</span>}
        <button
          onClick={commit}
          disabled={!dirty || saving}
          className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40"
        >
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full font-mono text-[12px] leading-relaxed bg-[#0a0e1a] border border-white/10 rounded-lg p-4 text-brand-cream focus:outline-none focus:border-cyan-400/40"
      />
    </div>
  );
}

// ── Publish modal ───────────────────────────────────────────────────────────
//
// One-click "ship to GitHub". Three steps run in sequence:
//   1. POST /api/portal/content/<siteId>/publish      — drafts → published
//   2. POST /api/portal/pages/<siteId>/<pageId>/publish — current editor page
//      (best-effort; ignored if no draft exists)
//   3. POST /api/portal/promote/<siteId>              — bundles published
//      overrides + pages + per-site config into a GitHub PR
// On success the operator sees the PR URL and can click through.

function PublishModal({
  site, activePageId, onClose,
}: {
  site: Site;
  activePageId: string | null;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">("idle");
  const [step, setStep] = useState<string>("");
  const [result, setResult] = useState<PromoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPhase("running");
    setError(null);

    // 1. Publish content drafts. 409 means no changes — that's fine.
    setStep("Publishing content drafts…");
    try {
      const res = await fetch(`/api/portal/content/${encodeURIComponent(site.id)}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok && res.status !== 409) {
        const body = await res.text();
        setError(`Content publish failed: ${body.slice(0, 200)}`);
        setPhase("error");
        return;
      }
    } catch (e) {
      setError(`Content publish failed: ${e instanceof Error ? e.message : String(e)}`);
      setPhase("error");
      return;
    }

    // 2. Publish active editor page if one is selected. Best effort.
    if (activePageId) {
      setStep("Publishing active page…");
      try {
        await publishEditorPage(site.id, activePageId);
      } catch { /* ignore — promote will still pick up published state */ }
    }

    // 3. Bundle into a GitHub PR.
    setStep("Opening GitHub pull request…");
    try {
      const out = await promoteSiteToGitHub(site.id, { message });
      setResult(out);
      setPhase(out.ok ? "done" : "error");
      if (!out.ok) setError(out.error ?? "Unknown promote error");
    } catch (e) {
      setError(`Promote failed: ${e instanceof Error ? e.message : String(e)}`);
      setPhase("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={phase === "running" ? undefined : onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#0a0e1a] p-5 space-y-4">
        <header className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Publish</p>
          <button onClick={onClose} disabled={phase === "running"} className="text-brand-cream/55 hover:text-brand-cream text-lg leading-none disabled:opacity-30">×</button>
        </header>

        {phase === "idle" && (
          <>
            <h2 className="font-display text-xl text-brand-cream">Ship {site.name} to GitHub</h2>
            <p className="text-[12px] text-brand-cream/65 leading-relaxed">
              Promotes any draft content edits + the active page to <strong>published</strong>,
              then opens a pull request against your configured repo with{" "}
              <code className="font-mono text-brand-cream/85">portal.overrides.json</code>,{" "}
              <code className="font-mono text-brand-cream/85">portal.pages.json</code>, and{" "}
              <code className="font-mono text-brand-cream/85">portal.site.json</code>.
            </p>
            <label className="block">
              <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Commit note (optional)</span>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="e.g. Updated hero copy + new product photo"
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
              />
            </label>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={onClose} className="text-[11px] text-brand-cream/55 hover:text-brand-cream px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => void run()}
                className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20"
              >
                Publish →
              </button>
            </div>
            <p className="text-[10px] text-brand-cream/35 leading-relaxed">
              GitHub credentials come from <Link href="/admin/portal-settings" className="text-cyan-300 hover:text-cyan-200">Portal settings</Link>.
              Need to set them? Open that page first.
            </p>
          </>
        )}

        {phase === "running" && (
          <div className="text-center py-6 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-[12px] text-brand-cream/85">{step}</p>
          </div>
        )}

        {phase === "done" && result?.ok && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-[12px]">✓</span>
              <h2 className="font-display text-lg text-brand-cream">Pull request opened</h2>
            </div>
            <p className="text-[12px] text-brand-cream/65">
              Review and merge to ship. Your host (Vercel et al.) will pick up the new content on the next build.
            </p>
            {result.prUrl && (
              <a
                href={result.prUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 rounded-md text-[12px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-center font-medium"
              >
                View PR #{result.prNumber} on GitHub →
              </a>
            )}
            {result.files && result.files.length > 0 && (
              <details className="text-[11px] text-brand-cream/55">
                <summary className="cursor-pointer hover:text-brand-cream/85">{result.files.length} file{result.files.length === 1 ? "" : "s"} included</summary>
                <ul className="mt-2 space-y-0.5 font-mono text-brand-cream/65">
                  {result.files.map(f => <li key={f.path}>{f.path}</li>)}
                </ul>
              </details>
            )}
            <div className="flex justify-end pt-1">
              <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[11px] text-brand-cream/65 hover:text-brand-cream">
                Close
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-500/15 border border-red-400/30 text-red-300 flex items-center justify-center text-[12px]">!</span>
              <h2 className="font-display text-lg text-brand-cream">Publish failed</h2>
            </div>
            <p className="text-[12px] text-red-300 break-words">{error}</p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={onClose} className="text-[11px] text-brand-cream/55 hover:text-brand-cream px-3 py-1.5">
                Close
              </button>
              <button
                onClick={() => { setPhase("idle"); setError(null); }}
                className="px-3 py-1.5 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
