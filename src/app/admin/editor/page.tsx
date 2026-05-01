"use client";

// /admin/editor — Wix / GoHighLevel-style live editor.
//
// Hosts the actual storefront in an iframe (with ?portal_edit=1 so
// the existing PortalEditOverlay activates inside) and wraps it in
// a top toolbar: page selector, Edit/View mode toggle, device
// emulator, and Publish.
//
// The "actual editing" — click element, change copy, change image —
// happens inside the iframe via PortalEditOverlay's existing
// machinery. The toolbar here is just chrome around it: pick which
// page to edit, preview at different device sizes, then ship.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import DevicePreview from "@/components/admin/DevicePreview";
import {
  loadDeviceState, saveDeviceState, getDevicePreset, effectiveViewport,
  type DeviceState,
} from "@/lib/admin/devicePresets";
import { listPages as listEditorPages } from "@/lib/admin/editorPages";
import { listSites, getActiveSite, type Site } from "@/lib/admin/sites";

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
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [deviceState, setDeviceState] = useState<DeviceState>(() => loadDeviceState());
  const [unsaved, setUnsaved] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
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
      // Always include the storefront home as the first option so
      // operators can edit it even if no editor-managed page covers "/".
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

  // The URL we render inside the iframe. ?portal_edit=1 activates
  // PortalEditOverlay; mode=view turns it off without reload.
  const iframeSrc = useMemo(() => {
    if (!currentPage) return "about:blank";
    const params = new URLSearchParams();
    if (mode === "edit") params.set("portal_edit", "1");
    params.set("editor_host", "1");           // signal to iframe: we're inside the editor
    const qs = params.toString();
    return `${currentPage.slug}${qs ? `?${qs}` : ""}`;
  }, [currentPage, mode]);

  // Listen to messages from the embedded overlay.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as { source?: string; type?: string; unsaved?: number } | null;
      if (!data || data.source !== "portal-edit-overlay") return;
      if (data.type === "ready")    setIframeReady(true);
      if (data.type === "unsaved")  setUnsaved(data.unsaved ?? 0);
      if (data.type === "saved")    setUnsaved(0);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function reloadIframe() {
    setIframeReady(false);
    setReloadKey(k => k + 1);
  }

  function postToIframe(message: unknown) {
    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }

  // Toggle edit / view inside the iframe without a full reload.
  function setEditorMode(next: "edit" | "view") {
    setMode(next);
    postToIframe({ source: "editor-host", type: "set-mode", mode: next });
  }

  // Resolve viewport for the iframe scaling. Same maths the canvas uses.
  const spec = getDevicePreset(deviceState.deviceId) ?? null;
  const viewport = spec ? effectiveViewport(spec, deviceState) : { width: 1280, height: 800 };
  const isResponsive = deviceState.deviceId === "responsive";

  return (
    <main className="h-[calc(100vh-0px)] flex flex-col bg-[#0a0a0a]">
      {/* Top toolbar */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-brand-black-soft">
        <Link href="/admin" className="text-[11px] text-cyan-400/70 hover:text-cyan-300">
          ← Admin
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Site</span>
          <select
            value={site?.id ?? ""}
            onChange={e => setSite(sites.find(s => s.id === e.target.value) ?? null)}
            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[12px] text-brand-cream"
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider uppercase text-brand-cream/45">Page</span>
          <select
            value={pageId ?? ""}
            onChange={e => setPageId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[12px] text-brand-cream min-w-[180px]"
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} {p.slug !== p.title && <>· {p.slug}</>}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-white/[0.02]">
          <button
            onClick={() => setEditorMode("edit")}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
              mode === "edit" ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20" : "text-brand-cream/55 hover:text-brand-cream"
            }`}
          >
            ✎ Edit
          </button>
          <button
            onClick={() => setEditorMode("view")}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
              mode === "view" ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20" : "text-brand-cream/55 hover:text-brand-cream"
            }`}
          >
            👁 View
          </button>
        </div>

        <button
          onClick={reloadIframe}
          className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85"
          title="Reload iframe"
        >
          ↻
        </button>

        <div className="flex-1" />

        {unsaved > 0 && (
          <span className="text-[11px] text-amber-300/85">{unsaved} unsaved</span>
        )}
        {iframeReady ? (
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Editor connected" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Connecting…" />
        )}

        <Link
          href="/admin/repo"
          className="px-3 py-1.5 rounded-md text-[11px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20"
          title="Open the GitHub repo browser to publish a PR"
        >
          Publish to GitHub
        </Link>
      </header>

      <DevicePreview state={deviceState} onChange={s => { setDeviceState(s); saveDeviceState(s); }} />

      {/* iframe stage */}
      <div className="flex-1 min-h-0 overflow-auto bg-[#050505] flex items-start justify-center p-6">
        {currentPage ? (
          <div
            style={{
              width: isResponsive ? "100%" : viewport.width,
              maxWidth: "100%",
              transform: `scale(${deviceState.zoom})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={iframeSrc}
              title={currentPage.title}
              sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-modals allow-clipboard-write"
              onLoad={() => setIframeReady(true)}
              style={{
                width: "100%",
                height: isResponsive ? "calc(100vh - 200px)" : viewport.height,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                background: "#0a0a0a",
                display: "block",
              }}
            />
          </div>
        ) : (
          <div className="text-center text-[12px] text-brand-cream/45 mt-12 max-w-md">
            <p>No pages on this site yet.</p>
            <p className="mt-2">
              Create one from <Link href="/admin/pages" className="text-cyan-300 hover:text-cyan-200">/admin/pages</Link>{" "}
              or use the block-based editor at <Link href="/admin/sites" className="text-cyan-300 hover:text-cyan-200">/admin/sites</Link>.
            </p>
          </div>
        )}
      </div>

      {/* Hint footer */}
      <footer className="shrink-0 px-4 py-2 border-t border-white/5 bg-brand-black-soft text-[10px] text-brand-cream/45 flex items-center gap-4">
        <span>Cmd/Ctrl+E to toggle edit mode inside the iframe</span>
        <span className="opacity-50">·</span>
        <span>Click any text marked with <code className="font-mono text-brand-cream/65">data-portal-edit</code> to edit</span>
        <div className="flex-1" />
        <span>{currentPage?.slug}</span>
      </footer>
    </main>
  );
}
