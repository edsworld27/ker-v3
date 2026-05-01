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
import { promoteSiteToGitHub } from "@/lib/admin/promote";
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
  const [view, setView] = useState<"text" | "visual" | "code">("visual");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo/redo history. We snapshot the blocks tree on every mutation
  // (capped at 50 entries). Pasting historical state via setBlocks +
  // immediate save is fine because the save endpoint is idempotent.
  const undoStack = useRef<Block[][]>([]);
  const redoStack = useRef<Block[][]>([]);
  const HISTORY_CAP = 50;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  // Load
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await getPage(siteId, pageId);
      if (cancelled) return;
      if (!p) { setError("Page not found"); return; }
      setPage(p);
      setBlocks(p.blocks);
      undoStack.current = [];
      redoStack.current = [];
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

  // Centralised tree mutation: applies a function, pushes to undo,
  // clears redo (a fresh edit invalidates the redo branch), and triggers
  // save. Skip is used when applying an undo/redo so we don't push the
  // history snapshot back onto its own stack.
  const mutate = useCallback((next: Block[], opts?: { skipHistory?: boolean }) => {
    if (!opts?.skipHistory) {
      undoStack.current.push(blocks);
      if (undoStack.current.length > HISTORY_CAP) undoStack.current.shift();
      redoStack.current = [];
    }
    setBlocks(next);
    scheduleSave(next);
  }, [blocks, scheduleSave]);

  function handleUndo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(blocks);
    setBlocks(prev);
    scheduleSave(prev);
    showToast("Undone");
  }

  function handleRedo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(blocks);
    setBlocks(next);
    scheduleSave(next);
    showToast("Redone");
  }

  // Inline rich-text edits dispatched by Heading/Text blocks. Patches
  // the matching block's prop without re-rendering the contentEditable
  // (the block already shows the user's typed value).
  useEffect(() => {
    function onCommit(e: Event) {
      const detail = (e as CustomEvent).detail as { id: string; key: string; value: unknown } | undefined;
      if (!detail) return;
      const target = findBlock(blocks, detail.id);
      if (!target) return;
      mutate(updateBlock(blocks, detail.id, {
        props: { ...target.block.props, [detail.key]: detail.value },
      }));
    }
    window.addEventListener("lk-block-text-commit", onCommit);
    return () => window.removeEventListener("lk-block-text-commit", onCommit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Keyboard shortcuts: ⌘Z / ⌘⇧Z (undo/redo), Backspace+Delete (remove
  // selected), ⌘D (duplicate). All scoped to the editor — bail out when
  // an input/textarea is focused so typing isn't hijacked.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isEditing) return;
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (cmd && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        mutate(duplicateBlock(blocks, selectedId));
        showToast("Duplicated");
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        mutate(removeBlock(blocks, selectedId));
        setSelectedId(null);
        showToast("Deleted");
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, selectedId]);

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
      if (next) {
        setPage(next);
        showToast("Published");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  async function handlePromoteToGitHub() {
    setBusy("promote"); setError(null);
    try {
      const result = await promoteSiteToGitHub(siteId, { message: `Visual editor publish: ${page?.title ?? pageId}` });
      if (result.ok && result.prUrl) {
        showToast("Pushed to GitHub");
        window.open(result.prUrl, "_blank", "noopener");
      } else {
        setError(result.error ?? "Promote failed — check /admin/portal-settings (GitHub repo + PAT)");
      }
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
        undoStack.current = [];
        redoStack.current = [];
        showToast("Reverted");
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
        {/* View toggle: simple text mode ↔ visual canvas ↔ raw JSON code */}
        <div className="flex items-center gap-0.5 border border-white/10 rounded-lg p-0.5 mr-2">
          <button
            onClick={() => setView("text")}
            title="Simplest mode — edit only text + colours"
            className={`px-2.5 py-1 text-[11px] rounded ${view === "text" ? "bg-white/10 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >Text</button>
          <button
            onClick={() => setView("visual")}
            title="Drag-drop blocks, layout, styles"
            className={`px-2.5 py-1 text-[11px] rounded ${view === "visual" ? "bg-white/10 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >Visual</button>
          <button
            onClick={() => setView("code")}
            title="Raw JSON + custom code"
            className={`px-2.5 py-1 text-[11px] rounded ${view === "code" ? "bg-white/10 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >Code</button>
        </div>
        <button
          onClick={handleUndo}
          disabled={undoStack.current.length === 0}
          title="Undo (⌘Z)"
          className="text-[16px] w-7 h-7 rounded text-brand-cream/55 hover:text-brand-cream hover:bg-white/5 disabled:opacity-25"
        >↶</button>
        <button
          onClick={handleRedo}
          disabled={redoStack.current.length === 0}
          title="Redo (⌘⇧Z)"
          className="text-[16px] w-7 h-7 rounded text-brand-cream/55 hover:text-brand-cream hover:bg-white/5 disabled:opacity-25 mr-2"
        >↷</button>
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
        <button
          onClick={handlePromoteToGitHub}
          disabled={!!busy}
          title="Open a PR with portal.pages.json + portal.overrides.json + portal.site.json"
          className="text-[12px] px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-semibold hover:bg-cyan-500/20 disabled:opacity-30"
        >
          {busy === "promote" ? "Pushing…" : "Push to GitHub →"}
        </button>
      </header>

      {/* Workspace — text/visual/code */}
      {view === "visual" && (
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
      )}
      {view === "code" && (
        <CodeView
          page={page}
          blocks={blocks}
          onPageMutate={(patch) => {
            if (!page) return;
            setPage({ ...page, ...patch });
            void updatePage(siteId, pageId, patch);
          }}
          onTreeMutate={(next) => mutate(next)}
        />
      )}
      {view === "text" && (
        <TextView
          blocks={blocks}
          onPatch={(id, props) => {
            const target = findBlock(blocks, id);
            if (!target) return;
            mutate(updateBlock(blocks, id, { props: { ...target.block.props, ...props } }));
          }}
          onPatchStyles={(id, stylesPatch) => {
            const target = findBlock(blocks, id);
            if (!target) return;
            mutate(updateBlock(blocks, id, { styles: { ...(target.block.styles ?? {}), ...stylesPatch } }));
          }}
        />
      )}

      {error && (
        <div className="absolute bottom-4 right-4 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">{error}</div>
      )}
      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-brand-cream text-brand-black text-[12px] font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

// Simplest mode — list every text-bearing block as a labelled input.
// Designed for elderly clients / non-technical owners who want to edit
// the words on the page without thinking about layout, blocks, or
// breakpoints. Click → type → save. Colour wheels for the obvious
// settings only.
function TextView({
  blocks, onPatch, onPatchStyles,
}: {
  blocks: Block[];
  onPatch: (id: string, props: Record<string, unknown>) => void;
  onPatchStyles: (id: string, styles: Partial<NonNullable<Block["styles"]>>) => void;
}) {
  const flat: Block[] = [];
  walk(blocks, b => flat.push(b));
  const editableTypes = new Set(["heading", "text", "button", "hero", "cta", "testimonials", "navbar", "footer", "image"]);
  const editable = flat.filter(b => editableTypes.has(b.type));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto py-8 px-6 space-y-4">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-[12px] text-cyan-400/85 leading-relaxed">
          Simple mode — edit the words on every block + the brand colour. Need more? Switch to <strong className="text-brand-cream">Visual</strong> in the top bar.
        </div>
        {editable.length === 0 && (
          <p className="text-[12px] text-brand-cream/45 text-center py-12">
            No editable text yet — switch to Visual mode and drag in a Heading or Text block.
          </p>
        )}
        {editable.map(block => <TextRow key={block.id} block={block} onPatch={onPatch} onPatchStyles={onPatchStyles} />)}
      </div>
    </div>
  );
}

function TextRow({ block, onPatch, onPatchStyles }: { block: Block; onPatch: (id: string, props: Record<string, unknown>) => void; onPatchStyles: (id: string, styles: Partial<NonNullable<Block["styles"]>>) => void }) {
  const meta = textMetaFor(block);
  if (!meta) return null;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45">{meta.label}</p>
        <p className="text-[10px] text-brand-cream/30 font-mono">{block.type}</p>
      </div>
      {meta.fields.map(field => (
        <div key={field.key} className="mb-2 last:mb-0">
          {field.kind === "input" ? (
            <input
              defaultValue={String(block.props[field.key] ?? "")}
              onBlur={e => onPatch(block.id, { [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
            />
          ) : (
            <textarea
              defaultValue={String(block.props[field.key] ?? "")}
              onBlur={e => onPatch(block.id, { [field.key]: e.target.value })}
              placeholder={field.placeholder}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
            />
          )}
          {field.label && <p className="text-[10px] text-brand-cream/35 mt-1">{field.label}</p>}
        </div>
      ))}
      {/* Always offer a text-colour picker on text-bearing blocks. */}
      <label className="flex items-center gap-2 mt-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 w-24">Text colour</span>
        <input
          type="color"
          defaultValue={(block.styles?.textColor as string | undefined) ?? "#ffffff"}
          onChange={e => onPatchStyles(block.id, { textColor: e.target.value })}
          className="w-8 h-7 rounded cursor-pointer bg-transparent border border-white/10"
        />
        <button
          onClick={() => onPatchStyles(block.id, { textColor: undefined })}
          className="text-[10px] text-brand-cream/55 hover:text-brand-orange ml-auto"
        >
          Reset
        </button>
      </label>
    </div>
  );
}

function walk(blocks: Block[] | undefined, visit: (b: Block) => void) {
  if (!blocks) return;
  for (const b of blocks) {
    visit(b);
    if (b.children) walk(b.children, visit);
  }
}

interface TextMeta {
  label: string;
  fields: Array<{ key: string; kind: "input" | "textarea"; label?: string; placeholder?: string }>;
}

function textMetaFor(block: Block): TextMeta | null {
  switch (block.type) {
    case "heading":
      return { label: "Heading", fields: [{ key: "text", kind: "input", placeholder: "Headline text" }] };
    case "text":
      return { label: "Paragraph", fields: [{ key: "text", kind: "textarea", placeholder: "Body copy" }] };
    case "button":
      return { label: "Button", fields: [
        { key: "label", kind: "input", placeholder: "Label" },
        { key: "href", kind: "input", label: "Where it links to", placeholder: "/, /shop, https://…" },
      ] };
    case "hero":
      return { label: "Hero", fields: [
        { key: "eyebrow",  kind: "input",    placeholder: "Eyebrow" },
        { key: "headline", kind: "input",    placeholder: "Big headline" },
        { key: "subhead",  kind: "textarea", placeholder: "Sub-headline" },
        { key: "ctaLabel", kind: "input",    label: "CTA label", placeholder: "Get started" },
        { key: "ctaHref",  kind: "input",    label: "CTA URL", placeholder: "/" },
      ] };
    case "cta":
      return { label: "Call to action", fields: [
        { key: "headline", kind: "input",    placeholder: "Headline" },
        { key: "subhead",  kind: "textarea", placeholder: "Sub-headline" },
        { key: "ctaLabel", kind: "input",    label: "Button label" },
        { key: "ctaHref",  kind: "input",    label: "Button URL" },
      ] };
    case "navbar":
      return { label: "Navbar", fields: [
        { key: "brand",    kind: "input", placeholder: "Brand name" },
        { key: "ctaLabel", kind: "input", label: "CTA label" },
        { key: "ctaHref",  kind: "input", label: "CTA URL" },
      ] };
    case "footer":
      return { label: "Footer", fields: [
        { key: "brand",   kind: "input",    placeholder: "Brand" },
        { key: "tagline", kind: "textarea", placeholder: "Footer tagline" },
      ] };
    case "image":
      return { label: "Image", fields: [
        { key: "src",  kind: "input", label: "URL", placeholder: "https://…" },
        { key: "alt",  kind: "input", label: "Alt text (helps SEO + screen readers)" },
        { key: "href", kind: "input", label: "Click link (optional)" },
      ] };
    case "testimonials":
      return { label: "Testimonials", fields: [{ key: "title", kind: "input", placeholder: "Section title" }] };
    default:
      return null;
  }
}

function SeoPanel({ page, onPageMutate }: { page: EditorPage; onPageMutate: (patch: Partial<EditorPage>) => void }) {
  const seo = page.seo ?? {};
  function patch(p: Partial<NonNullable<EditorPage["seo"]>>) {
    onPageMutate({ seo: { ...seo, ...p } });
  }
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";
  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-soft p-3 space-y-3">
      <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/55">SEO + meta</p>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">Title (overrides page title)</span>
        <input value={seo.title ?? ""} onChange={e => patch({ title: e.target.value || undefined })} className={inputClass} />
      </label>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">Meta description</span>
        <textarea value={seo.metaDescription ?? page.description ?? ""} onChange={e => patch({ metaDescription: e.target.value || undefined })} rows={3} className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">Canonical</span>
          <input value={seo.canonical ?? ""} onChange={e => patch({ canonical: e.target.value || undefined })} placeholder="https://…" className={inputClass + " font-mono"} />
        </label>
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">og:image</span>
          <input value={seo.ogImage ?? ""} onChange={e => patch({ ogImage: e.target.value || undefined })} placeholder="https://…" className={inputClass + " font-mono"} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">og:type</span>
          <select value={seo.ogType ?? ""} onChange={e => patch({ ogType: (e.target.value || undefined) as "website" | "article" | "product" | undefined })} className={inputClass}>
            <option value="">(default) website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="website">website</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">twitter:card</span>
          <select value={seo.twitterCard ?? ""} onChange={e => patch({ twitterCard: (e.target.value || undefined) as "summary" | "summary_large_image" | undefined })} className={inputClass}>
            <option value="">(default)</option>
            <option value="summary">summary</option>
            <option value="summary_large_image">summary_large_image</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="flex items-center gap-2 text-[11px] text-brand-cream/65">
          <input type="checkbox" checked={seo.noindex === true} onChange={e => patch({ noindex: e.target.checked || undefined })} />
          noindex
        </label>
        <label className="flex items-center gap-2 text-[11px] text-brand-cream/65">
          <input type="checkbox" checked={seo.nofollow === true} onChange={e => patch({ nofollow: e.target.checked || undefined })} />
          nofollow
        </label>
        <label className="flex items-center gap-2 text-[11px] text-brand-cream/65">
          <input type="checkbox" checked={seo.excludeFromSitemap === true} onChange={e => patch({ excludeFromSitemap: e.target.checked || undefined })} />
          skip sitemap
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">priority</span>
          <input type="number" min="0" max="1" step="0.1" value={seo.priority ?? ""} onChange={e => patch({ priority: e.target.value === "" ? undefined : Number(e.target.value) })} className={inputClass} placeholder="0.7" />
        </label>
        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">changefreq</span>
          <select value={seo.changefreq ?? ""} onChange={e => patch({ changefreq: (e.target.value || undefined) as "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" | undefined })} className={inputClass}>
            <option value="">(weekly)</option>
            <option value="always">always</option>
            <option value="hourly">hourly</option>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
            <option value="never">never</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 mb-1">Custom JSON-LD (advanced)</span>
        <textarea value={seo.jsonLd ?? ""} onChange={e => patch({ jsonLd: e.target.value || undefined })} rows={5} spellCheck={false} placeholder='{"@context":"https://schema.org","@type":"Product"…}' className={inputClass + " font-mono"} />
      </label>
    </div>
  );
}

// Raw JSON editor for the entire page — block tree + custom head + foot.
// Edit + blur to commit; parse failures keep the prior value. Lets the
// admin hand-wire what the visual UI can't express (custom CSS,
// awkward flex/grid layouts, third-party scripts) and round-trip back
// to the visual canvas without losing data.
function CodeView({
  page, blocks, onPageMutate, onTreeMutate,
}: {
  page: EditorPage | null;
  blocks: Block[];
  onPageMutate: (patch: Partial<EditorPage>) => void;
  onTreeMutate: (next: Block[]) => void;
}) {
  const initial = JSON.stringify(blocks, null, 2);
  const [tree, setTree] = useState(initial);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Sync if blocks changed externally (undo/redo, autosave revert).
  useEffect(() => { setTree(JSON.stringify(blocks, null, 2)); }, [blocks]);

  function commitTree() {
    try {
      const parsed = JSON.parse(tree);
      if (!Array.isArray(parsed)) throw new Error("expected an array of blocks");
      onTreeMutate(parsed as Block[]);
      setTreeError(null);
    } catch (e) {
      setTreeError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 overflow-y-auto bg-[#0a0a0a]">
      {/* Block tree */}
      <div className="lg:col-span-2 flex flex-col rounded-2xl border border-white/8 bg-brand-black-soft overflow-hidden">
        <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
          <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/55">Page block tree (JSON)</p>
          {treeError && <span className="text-[10px] text-red-400">{treeError}</span>}
        </div>
        <textarea
          value={tree}
          onChange={e => setTree(e.target.value)}
          onBlur={commitTree}
          spellCheck={false}
          className="flex-1 bg-transparent p-3 text-[11px] font-mono leading-relaxed text-brand-cream resize-none focus:outline-none"
        />
        <div className="px-3 py-2 border-t border-white/8 flex items-center justify-between text-[10px] text-brand-cream/45">
          <span>Saves on blur. Use this to hand-wire what the visual editor can&apos;t express.</span>
          <button onClick={commitTree} className="px-2 py-1 rounded bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30">Apply</button>
        </div>
      </div>

      {/* SEO + custom head + foot */}
      <div className="flex flex-col gap-3">
        {page && <SeoPanel page={page} onPageMutate={onPageMutate} />}
        <CodePane
          label="Page <head> code"
          help="Injected at the top of this page only. Use for one-off scripts/styles, schema, page-specific tracking."
          value={page?.customHead ?? ""}
          onChange={v => onPageMutate({ customHead: v })}
          height="h-48"
        />
        <CodePane
          label="Page footer code"
          help="Injected at the bottom of this page (after all blocks). Useful for late scripts."
          value={page?.customFoot ?? ""}
          onChange={v => onPageMutate({ customFoot: v })}
          height="h-48"
        />
        <div className="rounded-2xl border border-white/8 bg-brand-black-soft p-3 text-[11px] text-brand-cream/55 leading-relaxed">
          <p className="font-semibold text-brand-cream/85 mb-1">Tip — clean output</p>
          <p>The host site renders only the resting block tree via <code className="font-mono text-brand-cream/85">&lt;PortalPageRenderer /&gt;</code>. None of the editor chrome (selection rings, drag handles, properties panel) ships to visitors — just the blocks plus this code.</p>
        </div>
      </div>
    </div>
  );
}

function CodePane({ label, help, value, onChange, height }: { label: string; help: string; value: string; onChange: (v: string) => void; height: string }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);
  return (
    <div className="rounded-2xl border border-white/8 bg-brand-black-soft overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-white/8">
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/55">{label}</p>
        <p className="text-[10px] text-brand-cream/40 mt-0.5">{help}</p>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => text !== value && onChange(text)}
        spellCheck={false}
        className={`${height} bg-transparent p-3 text-[11px] font-mono leading-relaxed text-brand-cream resize-none focus:outline-none`}
        placeholder='<script>...</script>'
      />
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
