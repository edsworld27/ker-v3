"use client";

// /admin/sites/[siteId]/editor/[pageId] — visual page builder. Three-pane
// layout: left = block library + layers tree, centre = drag-drop canvas,
// right = properties + styles panel. Edits are debounced-saved to the
// pages API.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Block, BlockType, EditorPage } from "@/portal/server/types";
import { getPage, updatePage, publishPage, revertPage } from "@/lib/admin/editorPages";
import {
  appendChild, createBlock, duplicateBlock, findBlock, insertSibling,
  moveBlock, removeBlock, updateBlock,
} from "@/components/editor/canvas/blockTreeOps";
import Canvas from "@/components/editor/canvas/Canvas";
import Sidebar from "@/components/editor/canvas/Sidebar";
import PropertiesPanel from "@/components/editor/canvas/PropertiesPanel";

const SAVE_DEBOUNCE_MS = 500;

export default function EditorPage() {
  const params = useParams<{ siteId: string; pageId: string }>();
  const router = useRouter();
  const siteId = params?.siteId ?? "";
  const pageId = params?.pageId ?? "";

  const [page, setPage] = useState<EditorPage | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await getPage(siteId, pageId);
      if (cancelled) return;
      if (!p) { setError("Page not found"); return; }
      setPage(p);
      setBlocks(p.blocks);
    })();
    return () => { cancelled = true; };
  }, [siteId, pageId]);

  // Debounced autosave
  const scheduleSave = useCallback((nextBlocks: Block[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await updatePage(siteId, pageId, { blocks: nextBlocks });
        if (updated) setPage(updated);
        setSavedAt(Date.now());
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally { setSaving(false); }
    }, SAVE_DEBOUNCE_MS);
  }, [siteId, pageId]);

  // Centralised tree mutation: applies a function and triggers save.
  const mutate = useCallback((next: Block[]) => {
    setBlocks(next);
    scheduleSave(next);
  }, [scheduleSave]);

  function handleDropOnCanvas(type: BlockType) {
    mutate([...blocks, createBlock(type)]);
  }

  function handleDropBeside(targetId: string, type: BlockType, position: "before" | "after" | "inside") {
    const newBlock = createBlock(type);
    if (position === "inside") {
      mutate(appendChild(blocks, targetId, newBlock));
    } else {
      mutate(insertSibling(blocks, targetId, newBlock, position));
    }
    setSelectedId(newBlock.id);
  }

  function handleMoveBeside(sourceId: string, targetId: string, position: "before" | "after" | "inside") {
    mutate(moveBlock(blocks, sourceId, targetId, position));
  }

  function handlePatchSelected(patch: Partial<Block>) {
    if (!selectedId) return;
    mutate(updateBlock(blocks, selectedId, patch));
  }

  function handleDuplicateSelected() {
    if (!selectedId) return;
    mutate(duplicateBlock(blocks, selectedId));
  }

  function handleRemoveSelected() {
    if (!selectedId) return;
    mutate(removeBlock(blocks, selectedId));
    setSelectedId(null);
  }

  async function handlePublish() {
    setBusy("publish"); setError(null);
    try {
      const next = await publishPage(siteId, pageId);
      if (next) setPage(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  async function handleRevert() {
    if (!confirm("Revert to last published version? Unsaved draft changes will be lost.")) return;
    setBusy("revert"); setError(null);
    try {
      const next = await revertPage(siteId, pageId);
      if (next) {
        setPage(next);
        setBlocks(next.blocks);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  const selectedBlock = useMemo(() => {
    if (!selectedId) return null;
    return findBlock(blocks, selectedId)?.block ?? null;
  }, [blocks, selectedId]);

  if (error && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-brand-cream font-display text-2xl mb-2">{error}</p>
          <Link href={`/admin/sites/${siteId}/pages`} className="text-brand-orange hover:underline text-[12px]">← Back to pages</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-black">
      {/* Top bar */}
      <header className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-white/8 bg-brand-black-soft">
        <button onClick={() => router.push(`/admin/sites/${siteId}/pages`)} className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Pages</button>
        <span className="mx-1 text-brand-cream/15">/</span>
        <input
          value={page?.title ?? ""}
          onChange={e => {
            if (!page) return;
            setPage({ ...page, title: e.target.value });
            void updatePage(siteId, pageId, { title: e.target.value });
          }}
          className="bg-transparent text-brand-cream text-sm font-medium focus:outline-none px-2 py-1 rounded hover:bg-white/5 focus:bg-white/5"
        />
        <span className="text-[11px] text-brand-cream/45 font-mono">{page?.slug}</span>
        <span className="ml-auto" />
        <DeviceSwitcher device={device} setDevice={setDevice} />
        <span className="text-[11px] text-brand-cream/45 mx-3">
          {saving ? "Saving…" : savedAt ? "Saved" : page?.status === "published" ? "Published" : "Draft"}
        </span>
        <button
          onClick={handleRevert}
          disabled={!!busy || !page?.publishedBlocks}
          className="text-[12px] px-2.5 py-1.5 rounded-lg border border-white/10 text-brand-cream/65 hover:text-brand-cream hover:bg-white/5 disabled:opacity-30"
        >
          Revert
        </button>
        <button
          onClick={handlePublish}
          disabled={!!busy}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-brand-orange text-white font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {busy === "publish" ? "Publishing…" : "Publish"}
        </button>
      </header>

      {/* 3-pane workspace */}
      <div className="flex-1 min-h-0 flex">
        <Sidebar blocks={blocks} selectedId={selectedId} onSelect={setSelectedId} onAddTopLevel={handleDropOnCanvas} />
        <Canvas
          blocks={blocks}
          selectedId={selectedId}
          device={device}
          onSelect={setSelectedId}
          onDropOnCanvas={handleDropOnCanvas}
          onDropBeside={handleDropBeside}
          onMoveBeside={handleMoveBeside}
        />
        <PropertiesPanel
          block={selectedBlock}
          onPatch={handlePatchSelected}
          onDuplicate={handleDuplicateSelected}
          onRemove={handleRemoveSelected}
        />
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">{error}</div>
      )}
    </div>
  );
}

function DeviceSwitcher({ device, setDevice }: { device: "desktop" | "tablet" | "mobile"; setDevice: (d: "desktop" | "tablet" | "mobile") => void }) {
  const items: Array<{ id: typeof device; icon: string; label: string }> = [
    { id: "desktop", icon: "🖥", label: "Desktop" },
    { id: "tablet",  icon: "📱", label: "Tablet" },
    { id: "mobile",  icon: "📞", label: "Mobile" },
  ];
  return (
    <div className="flex items-center gap-0.5 border border-white/10 rounded-lg p-0.5">
      {items.map(i => (
        <button
          key={i.id}
          onClick={() => setDevice(i.id)}
          title={i.label}
          className={`w-8 h-7 text-[14px] rounded ${device === i.id ? "bg-white/10 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"}`}
        >
          {i.icon}
        </button>
      ))}
    </div>
  );
}
