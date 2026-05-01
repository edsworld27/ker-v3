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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import DevicePreview from "@/components/admin/DevicePreview";
import EditorTopBar, { type EditorMode } from "./EditorTopBar";
import EditorPropertiesSidebar, { type SelectedElement } from "./EditorPropertiesSidebar";
import EditorOutliner, { type EditorTarget } from "./EditorOutliner";
import EditorFunnelStage from "./EditorFunnelStage";
import {
  loadDeviceState, saveDeviceState, getDevicePreset, effectiveViewport,
  type DeviceState,
} from "@/lib/admin/devicePresets";
import {
  listPages as listEditorPages, getPage as getEditorPage,
  updatePage as updateEditorPage, publishPage as publishEditorPage,
  createPage as createEditorPage, deletePage as deleteEditorPage,
} from "@/lib/admin/editorPages";
import { listSites, getActiveSite, getSite, updateSite, type Site } from "@/lib/admin/sites";
import { promoteSiteToGitHub, type PromoteResult } from "@/lib/admin/promote";
import {
  type Funnel, listFunnels, refreshFunnels, createFunnel, onFunnelsChange,
} from "@/lib/admin/funnels";
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
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [target, setTarget] = useState<EditorTarget>({ kind: "page", id: "_home" });
  const [mode, setMode] = useState<EditorMode>("live");
  const [edit, setEdit] = useState<"edit" | "view">("edit");
  const [deviceState, setDeviceState] = useState<DeviceState>(() => loadDeviceState());
  const [unsaved, setUnsaved] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newFunnelOpen, setNewFunnelOpen] = useState(false);
  const [pageSettingsId, setPageSettingsId] = useState<string | null>(null);
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadPages = useCallback(async (siteId: string): Promise<PageEntry[]> => {
    const editorPages = await listEditorPages(siteId, true);
    const pageEntries: PageEntry[] = editorPages.map(p => ({
      id: p.id, slug: p.slug, title: p.title || p.slug, source: "editor",
    }));
    if (!pageEntries.some(p => p.slug === "/")) {
      pageEntries.unshift({ id: "_home", slug: "/", title: "Home", source: "site" });
    }
    return pageEntries;
  }, []);

  // Load sites + pages + funnels on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const allSites = listSites();
      const active = getActiveSite() ?? allSites[0] ?? null;
      if (cancelled) return;
      setSites(allSites);
      setSite(active);
      if (!active) return;

      const [pageEntries, _funnels] = await Promise.all([
        loadPages(active.id),
        refreshFunnels(),
      ]);
      if (cancelled) return;

      setPages(pageEntries);
      setFunnels(_funnels);
      setTarget({ kind: "page", id: pageEntries[0]?.id ?? "_home" });
    }
    void load();
    return () => { cancelled = true; };
  }, [loadPages]);

  // Re-load pages when the active site changes.
  useEffect(() => {
    if (!site) return;
    let cancelled = false;
    void loadPages(site.id).then(pageEntries => {
      if (cancelled) return;
      setPages(pageEntries);
      setTarget({ kind: "page", id: pageEntries[0]?.id ?? "_home" });
    });
    return () => { cancelled = true; };
  }, [site?.id, loadPages]);

  // Subscribe to funnel mutations so the outliner stays in sync.
  useEffect(() => onFunnelsChange(() => setFunnels(listFunnels())), []);

  const currentPage   = target.kind === "page" ? pages.find(p => p.id === target.id) ?? null : null;
  const currentFunnel = target.kind === "funnel" ? funnels.find(f => f.id === target.id) ?? null : null;
  const pageSettingsPage = pageSettingsId ? pages.find(p => p.id === pageSettingsId) ?? null : null;

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

  // Reset selected when the target / mode changes — its keys won't be in the new doc.
  // (Use scalar deps so a fresh `target` object reference doesn't refire each render.)
  useEffect(() => { setSelected(null); }, [target.kind, target.id, mode]);

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

  // Outliner callbacks — page CRUD + funnel CRUD wired to the libs.
  async function handleDeletePage(id: string) {
    if (!site) return;
    const pg = pages.find(p => p.id === id);
    if (!pg || pg.source !== "editor") return;
    const ok = window.confirm(`Delete "${pg.title}"? This cannot be undone.`);
    if (!ok) return;
    await deleteEditorPage(site.id, id);
    const next = await loadPages(site.id);
    setPages(next);
    if (target.kind === "page" && target.id === id) {
      setTarget({ kind: "page", id: next[0]?.id ?? "_home" });
    }
  }
  function handleSelectPage(id: string)   { setTarget({ kind: "page", id }); }
  function handleSelectFunnel(id: string) { setTarget({ kind: "funnel", id }); }

  async function handleDeleteFunnel(id: string) {
    const f = funnels.find(x => x.id === id);
    if (!f) return;
    const ok = window.confirm(`Delete "${f.name}"? This cannot be undone.`);
    if (!ok) return;
    const { deleteFunnel } = await import("@/lib/admin/funnels");
    await deleteFunnel(id);
    setFunnels(listFunnels());
    if (target.kind === "funnel" && target.id === id) {
      setTarget({ kind: "page", id: pages[0]?.id ?? "_home" });
    }
  }

  // Resolve viewport for iframe scaling. Same maths the canvas uses.
  const spec = getDevicePreset(deviceState.deviceId) ?? null;
  const viewport = spec ? effectiveViewport(spec, deviceState) : { width: 1280, height: 800 };
  const isResponsive = deviceState.deviceId === "responsive";

  // Topbar widgets only make sense for page editing.
  const isPageTarget = target.kind === "page";

  return (
    <main className="h-[calc(100vh-0px)] flex flex-col bg-[#0a0a0a]">
      <EditorTopBar
        sites={sites.map(s => ({ id: s.id, name: s.name }))}
        siteId={site?.id ?? ""}
        onSiteChange={id => setSite(sites.find(s => s.id === id) ?? null)}
        pages={pages.map(p => ({ id: p.id, slug: p.slug, title: p.title }))}
        pageId={isPageTarget ? target.id : null}
        onPageChange={id => setTarget({ kind: "page", id })}
        mode={mode}
        onModeChange={setMode}
        edit={edit}
        onEditChange={setEditorMode}
        onReload={reloadIframe}
        iframeReady={iframeReady}
        unsaved={unsaved}
        onPublish={() => setPublishOpen(true)}
        targetKind={target.kind}
        funnelLabel={currentFunnel?.name}
      />

      {isPageTarget && mode === "live" && (
        <DevicePreview state={deviceState} onChange={s => { setDeviceState(s); saveDeviceState(s); }} />
      )}

      <div className="flex-1 min-h-0 flex">
        <EditorOutliner
          siteName={site?.name ?? "Site"}
          pages={pages}
          funnels={funnels}
          target={target}
          onSelectPage={handleSelectPage}
          onSelectFunnel={handleSelectFunnel}
          onCreatePage={() => setNewPageOpen(true)}
          onCreateFunnel={() => setNewFunnelOpen(true)}
          onDeletePage={id => void handleDeletePage(id)}
          onDeleteFunnel={id => void handleDeleteFunnel(id)}
          onPageSettings={id => setPageSettingsId(id)}
          onSiteSettings={() => setSiteSettingsOpen(true)}
        />

        {/* Stage */}
        <div className="flex-1 min-w-0 overflow-auto bg-[#050505] flex items-start justify-center p-6">
          {target.kind === "funnel" ? (
            currentFunnel ? (
              <EditorFunnelStage
                funnel={currentFunnel}
                onChange={next => setFunnels(fs => fs.map(f => f.id === next.id ? next : f))}
                onDeleted={() => {
                  setFunnels(listFunnels());
                  setTarget({ kind: "page", id: pages[0]?.id ?? "_home" });
                }}
              />
            ) : (
              <div className="text-center text-[12px] text-brand-cream/45 mt-12">Funnel not found.</div>
            )
          ) : mode === "code" ? (
            <CodeStage
              site={site}
              page={currentPage}
              onSavedChange={n => setUnsaved(n)}
            />
          ) : !currentPage ? (
            <div className="text-center text-[12px] text-brand-cream/45 mt-12 max-w-md">
              <p>No pages on this site yet.</p>
              <p className="mt-2">
                Click <strong>+</strong> in the left rail to create one, or open{" "}
                <Link href="/admin/sites" className="text-cyan-300 hover:text-cyan-200">/admin/sites</Link>.
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
        {isPageTarget && mode === "live" && (
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
        {target.kind === "funnel" ? (
          <span>Funnel editor — auto-saves changes. Step paths support globs (e.g. <code className="font-mono text-brand-cream/65">/products/*</code>).</span>
        ) : mode === "live" ? (
          <>
            <span>Cmd/Ctrl+E to toggle edit mode inside the iframe</span>
            <span className="opacity-50">·</span>
            <span>Click any element marked <code className="font-mono text-brand-cream/65">data-portal-edit</code> to edit</span>
          </>
        ) : mode === "block" ? (
          <span>Block editor — drag, drop, duplicate, delete blocks. Saves are instant.</span>
        ) : (
          <span>Raw JSON view of the page's block tree. Edit carefully — invalid JSON won't save.</span>
        )}
        <div className="flex-1" />
        <span>{target.kind === "page" ? currentPage?.slug : currentFunnel?.steps.length + " steps"}</span>
      </footer>

      {publishOpen && site && (
        <PublishModal
          site={site}
          activePageId={currentPage?.source === "editor" ? currentPage.id : null}
          onClose={() => setPublishOpen(false)}
        />
      )}

      {newPageOpen && site && (
        <NewPageModal
          onClose={() => setNewPageOpen(false)}
          onCreate={async input => {
            const created = await createEditorPage(site.id, input);
            if (!created) return false;
            const next = await loadPages(site.id);
            setPages(next);
            setTarget({ kind: "page", id: created.id });
            return true;
          }}
        />
      )}

      {newFunnelOpen && (
        <NewFunnelModal
          onClose={() => setNewFunnelOpen(false)}
          onCreate={async input => {
            const created = await createFunnel(input);
            if (!created) return false;
            setFunnels(listFunnels());
            setTarget({ kind: "funnel", id: created.id });
            return true;
          }}
        />
      )}

      {pageSettingsId && pageSettingsPage && site && (
        <PageSettingsModal
          siteId={site.id}
          page={pageSettingsPage}
          onClose={() => setPageSettingsId(null)}
          onSaved={async () => {
            const next = await loadPages(site.id);
            setPages(next);
          }}
        />
      )}

      {siteSettingsOpen && site && (
        <SiteSettingsModal
          site={site}
          onClose={() => setSiteSettingsOpen(false)}
          onSaved={updated => {
            setSite(updated);
            setSites(ss => ss.map(s => s.id === updated.id ? updated : s));
          }}
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

// ── New page modal ─────────────────────────────────────────────────────────

function NewPageModal({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (input: { slug: string; title: string }) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive slug from title until the operator edits it directly.
  const slugTouched = useRef(false);
  function handleTitle(v: string) {
    setTitle(v);
    if (!slugTouched.current) {
      const auto = "/" + v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setSlug(auto === "/" ? "" : auto);
    }
  }

  async function submit() {
    setError(null);
    const t = title.trim();
    let s = slug.trim();
    if (!t) { setError("Title is required."); return; }
    if (!s) { setError("Slug is required."); return; }
    if (!s.startsWith("/")) s = "/" + s;
    setBusy(true);
    const ok = await onCreate({ slug: s, title: t });
    setBusy(false);
    if (!ok) { setError("Failed to create page. Slug may already exist."); return; }
    onClose();
  }

  return (
    <ModalShell title="New page" onClose={busy ? () => {} : onClose}>
      <label className="block">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Title</span>
        <input
          value={title}
          onChange={e => handleTitle(e.target.value)}
          placeholder="About us"
          autoFocus
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>
      <label className="block">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Slug</span>
        <input
          value={slug}
          onChange={e => { slugTouched.current = true; setSlug(e.target.value); }}
          placeholder="/about"
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
      <ModalActions
        onCancel={onClose}
        onSubmit={() => void submit()}
        submitLabel={busy ? "Creating…" : "Create"}
        disabled={busy}
      />
    </ModalShell>
  );
}

// ── New funnel modal ───────────────────────────────────────────────────────

function NewFunnelModal({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (input: { name: string }) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const n = name.trim();
    if (!n) { setError("Name is required."); return; }
    setBusy(true);
    const ok = await onCreate({ name: n });
    setBusy(false);
    if (!ok) { setError("Failed to create funnel."); return; }
    onClose();
  }

  return (
    <ModalShell title="New funnel" onClose={busy ? () => {} : onClose}>
      <p className="text-[12px] text-brand-cream/65">
        Funnels track how visitors walk a sequence of pages — landing → product → checkout.
        Add steps after creating.
      </p>
      <label className="block">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Name</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Spring sale funnel"
          autoFocus
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
      <ModalActions
        onCancel={onClose}
        onSubmit={() => void submit()}
        submitLabel={busy ? "Creating…" : "Create"}
        disabled={busy}
      />
    </ModalShell>
  );
}

// ── Page settings modal ────────────────────────────────────────────────────

function PageSettingsModal({
  siteId, page, onClose, onSaved,
}: {
  siteId: string;
  page: PageEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug]   = useState(page.slug);
  const [description, setDescription] = useState("");
  const [customHead, setCustomHead] = useState("");
  const [customFoot, setCustomFoot] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getEditorPage(siteId, page.id).then(doc => {
      if (cancelled || !doc) return;
      setDescription(doc.description ?? "");
      setCustomHead(doc.customHead ?? "");
      setCustomFoot(doc.customFoot ?? "");
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [siteId, page.id]);

  async function submit() {
    setError(null);
    const t = title.trim();
    let s = slug.trim();
    if (!t || !s) { setError("Title and slug are required."); return; }
    if (!s.startsWith("/")) s = "/" + s;
    setBusy(true);
    const out = await updateEditorPage(siteId, page.id, {
      title: t,
      slug: s,
      description: description.trim() || undefined,
      customHead: customHead || undefined,
      customFoot: customFoot || undefined,
    });
    setBusy(false);
    if (!out) { setError("Save failed."); return; }
    onSaved();
    onClose();
  }

  return (
    <ModalShell title="Page settings" onClose={busy ? () => {} : onClose} wide>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Title</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream focus:outline-none focus:border-cyan-400/40"
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Slug</span>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] font-mono text-brand-cream focus:outline-none focus:border-cyan-400/40"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">SEO description</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="Short summary for search engines."
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>
      <details>
        <summary className="text-[11px] text-brand-cream/55 cursor-pointer hover:text-brand-cream">Custom head / foot scripts</summary>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Custom head</span>
            <textarea
              value={customHead}
              onChange={e => setCustomHead(e.target.value)}
              rows={3}
              placeholder="<script>…</script> or <link …>"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[11px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Custom foot</span>
            <textarea
              value={customFoot}
              onChange={e => setCustomFoot(e.target.value)}
              rows={3}
              placeholder="<script>…</script>"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[11px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
            />
          </label>
        </div>
      </details>
      {!loaded && <p className="text-[11px] text-brand-cream/45">Loading…</p>}
      {error && <p className="text-[11px] text-red-300">{error}</p>}
      <ModalActions
        onCancel={onClose}
        onSubmit={() => void submit()}
        submitLabel={busy ? "Saving…" : "Save"}
        disabled={busy || !loaded}
      />
    </ModalShell>
  );
}

// ── Modal shell + actions ──────────────────────────────────────────────────

function ModalShell({
  title, onClose, children, wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-2xl border border-cyan-400/20 bg-[#0a0e1a] p-5 space-y-4`}
      >
        <header className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">{title}</p>
          <button onClick={onClose} className="text-brand-cream/55 hover:text-brand-cream text-lg leading-none">×</button>
        </header>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel, onSubmit, submitLabel, disabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-1">
      <button onClick={onCancel} className="text-[11px] text-brand-cream/55 hover:text-brand-cream px-3 py-1.5">
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  );
}

// ── Site settings modal ────────────────────────────────────────────────────

function SiteSettingsModal({
  site, onClose, onSaved,
}: {
  site: Site;
  onClose: () => void;
  onSaved: (next: Site) => void;
}) {
  const [name, setName]               = useState(site.name);
  const [tagline, setTagline]         = useState(site.tagline ?? "");
  const [description, setDescription] = useState(site.description ?? "");
  const [primaryDomain, setPrimaryDomain] = useState(site.primaryDomain ?? "");
  const [domainsText, setDomainsText] = useState((site.domains ?? []).join("\n"));
  const [customHead, setCustomHead]   = useState(site.customHead ?? "");
  const [customBody, setCustomBody]   = useState(site.customBody ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const n = name.trim();
    if (!n) { setError("Site name is required."); return; }
    const domains = domainsText
      .split(/\n|,/)
      .map(d => d.trim())
      .filter(Boolean);
    updateSite(site.id, {
      name: n,
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      primaryDomain: primaryDomain.trim() || undefined,
      domains,
      customHead: customHead || undefined,
      customBody: customBody || undefined,
    });
    const updated = getSite(site.id);
    if (!updated) { setError("Save failed."); return; }
    onSaved(updated);
    onClose();
  }

  return (
    <ModalShell title="Site settings" onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Name</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream focus:outline-none focus:border-cyan-400/40"
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Tagline</span>
          <input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="Natural soap from Ghana"
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Description</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="Default meta description for SEO."
          className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>
      <div className="grid grid-cols-1 gap-3">
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Primary domain</span>
          <input
            value={primaryDomain}
            onChange={e => setPrimaryDomain(e.target.value)}
            placeholder="luvandker.com"
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        </label>
        <label className="block">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">All domains (one per line)</span>
          <textarea
            value={domainsText}
            onChange={e => setDomainsText(e.target.value)}
            rows={3}
            placeholder={"luvandker.com\nwww.luvandker.com"}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[11px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        </label>
      </div>
      <details>
        <summary className="text-[11px] text-brand-cream/55 cursor-pointer hover:text-brand-cream">Site-wide custom head / body scripts</summary>
        <p className="mt-2 text-[10px] text-brand-cream/45 leading-relaxed">
          Injected into every page on this site — useful for analytics, hotjar, custom CSS,
          Meta Pixel, etc.
        </p>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Custom head</span>
            <textarea
              value={customHead}
              onChange={e => setCustomHead(e.target.value)}
              rows={3}
              placeholder="<script>…</script> or <link rel=…>"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[11px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Custom body</span>
            <textarea
              value={customBody}
              onChange={e => setCustomBody(e.target.value)}
              rows={3}
              placeholder="<script>…</script>"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[11px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
            />
          </label>
        </div>
      </details>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
      <ModalActions onCancel={onClose} onSubmit={submit} submitLabel="Save" />
    </ModalShell>
  );
}
