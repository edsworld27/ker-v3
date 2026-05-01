"use client";

// /admin/repo — full GitHub file browser + editor. Lists every file in
// the connected repo, opens any of them, lets the admin edit + commit
// directly via the GitHub contents API.
//
// The PAT lives in /admin/portal-settings — we never echo it to the
// client. All reads/writes go through /api/portal/repo/* which signs
// requests server-side.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";

interface TreeItem { type: "file" | "dir"; name: string; path: string; sha?: string; size?: number }
interface TreeResponse { ok: boolean; ref?: string; path?: string; items?: TreeItem[]; error?: string }
interface FileResponse { ok: boolean; path?: string; ref?: string; sha?: string; size?: number; content?: string; error?: string }

export default function RepoBrowser() {
  return <PluginRequired plugin="repo"><RepoBrowserInner /></PluginRequired>;
}

function RepoBrowserInner() {
  const [path, setPath] = useState("");
  const [items, setItems] = useState<TreeItem[]>([]);
  const [openFile, setOpenFile] = useState<{ path: string; sha?: string; content: string } | null>(null);
  const [edited, setEdited] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showToast(s: string) { setToast(s); setTimeout(() => setToast(null), 1800); }

  async function loadTree(p: string) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/portal/repo/tree?path=${encodeURIComponent(p)}`, { cache: "no-store" });
      const data = await res.json() as TreeResponse;
      if (!data.ok) { setError(data.error ?? "failed"); return; }
      setItems(data.items ?? []);
      setPath(data.path ?? p);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  async function openFileFromPath(p: string) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/portal/repo/file?path=${encodeURIComponent(p)}`, { cache: "no-store" });
      const data = await res.json() as FileResponse;
      if (!data.ok) { setError(data.error ?? "failed"); return; }
      setOpenFile({ path: data.path ?? p, sha: data.sha, content: data.content ?? "" });
      setEdited(data.content ?? "");
      setMessage(`chore(portal): edit ${p}`);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!openFile) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/portal/repo/file", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: openFile.path, content: edited, message, sha: openFile.sha }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data?.error ?? "save failed"); return; }
      showToast("Committed");
      setOpenFile({ ...openFile, sha: data.sha, content: edited });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }

  useEffect(() => { void loadTree(""); }, []);

  const breadcrumb = path.split("/").filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Source</p>
          <h1 className="font-display text-3xl text-brand-cream">Repository</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Browse + edit any file in the connected GitHub repo. Each save is a real commit.</p>
        </div>
        <Link href="/admin/portal-settings" className="text-[11px] text-brand-cream/55 hover:text-brand-cream">
          Settings →
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* Tree */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden h-[70vh] flex flex-col">
          <div className="px-3 py-2 border-b border-white/8 text-[11px] font-mono flex items-center gap-1 flex-wrap">
            <button onClick={() => loadTree("")} className={`hover:text-brand-orange ${path ? "text-brand-cream/55" : "text-brand-cream"}`}>
              /
            </button>
            {breadcrumb.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-brand-cream/30">/</span>
                <button
                  onClick={() => loadTree(breadcrumb.slice(0, i + 1).join("/"))}
                  className={`hover:text-brand-orange ${i === breadcrumb.length - 1 ? "text-brand-cream" : "text-brand-cream/55"}`}
                >
                  {seg}
                </button>
              </span>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-[12px]">
            {loading && <p className="text-brand-cream/45 px-2 py-1">Loading…</p>}
            {!loading && items.length === 0 && <p className="text-brand-cream/45 px-2 py-1">Empty.</p>}
            {items.map(it => (
              <button
                key={it.path}
                onClick={() => it.type === "dir" ? loadTree(it.path) : openFileFromPath(it.path)}
                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded text-brand-cream/85 hover:bg-white/5"
              >
                <span className="text-base leading-none">{it.type === "dir" ? "📁" : "📄"}</span>
                <span className="truncate">{it.name}</span>
                {it.size !== undefined && <span className="ml-auto text-[10px] text-brand-cream/40">{formatSize(it.size)}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* File editor */}
        <main className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden h-[70vh] flex flex-col">
          {openFile ? (
            <>
              <div className="px-3 py-2 border-b border-white/8 flex items-center gap-2">
                <p className="text-[11px] font-mono text-brand-cream/85 truncate flex-1">{openFile.path}</p>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Commit message"
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-brand-cream w-72 placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1 rounded-lg bg-brand-orange text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Committing…" : "Commit"}
                </button>
              </div>
              <textarea
                value={edited}
                onChange={e => setEdited(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-black/40 p-3 text-[12px] font-mono leading-relaxed text-brand-cream resize-none focus:outline-none"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[12px] text-brand-cream/45 p-6 text-center">
              Pick a file from the tree to open it.<br />Edits commit straight back to the configured branch.
            </div>
          )}
        </main>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-brand-cream text-brand-black text-[12px] font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function formatSize(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}
