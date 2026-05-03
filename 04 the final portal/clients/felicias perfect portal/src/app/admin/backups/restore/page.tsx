"use client";

// /admin/backups/restore — restore a snapshot.
//
// Picks a backup, prompts for explicit "I understand" confirmation,
// then POSTs to the restore endpoint. Restoring overwrites every
// state slice, so the confirmation flow demands a typed match against
// the backup id (operator can't rubber-stamp through with one click).

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { notify } from "@/components/admin/Toaster";
import { friendlyError } from "@/lib/admin/friendlyError";

interface Backup {
  id: string;
  kind: "manual" | "scheduled";
  adapter: "file" | "s3";
  sizeBytes: number;
  createdAt: number;
  notes?: string;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BackupRestorePage() {
  return (
    <Suspense>
      <PluginRequired plugin="backups">
        <RestoreInner />
      </PluginRequired>
    </Suspense>
  );
}

function RestoreInner() {
  const params = useSearchParams();
  const presetId = params.get("id") ?? "";

  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(presetId);
  const [confirmInput, setConfirmInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/portal/backups", { cache: "no-store" });
        const data = await res.json() as { backups?: Backup[] };
        if (!cancelled) setBackups(data.backups ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const target = backups.find(b => b.id === selected) ?? null;
  const canConfirm = target != null && confirmInput.trim() === target.id && !busy;

  async function restore() {
    if (!target || !canConfirm) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/portal/backups/${encodeURIComponent(target.id)}/restore`, {
        method: "POST",
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        const f = friendlyError(data.error, "Restore failed");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      notify({ tone: "ok", title: "Restored", message: `Portal state replaced from ${target.id}` });
      setConfirmInput("");
      // Force a full reload so admin chrome picks up potentially-different
      // org records, plugin installs, branding, etc.
      setTimeout(() => { window.location.href = "/admin"; }, 800);
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl space-y-6">
      <Link href="/admin/backups" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Backups
      </Link>

      <header>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Backups</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Restore</h1>
        <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
          Roll the entire portal state back to a previous snapshot. Destructive — every slice (orgs, users, pages, content, plugin configs) is replaced.
        </p>
      </header>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-[12px] text-amber-200/90 leading-relaxed">
        <strong className="text-amber-200">Heads up.</strong> The restore is not undoable from the UI. If you might need a path back, take a fresh backup of the current state first via <Link href="/admin/backups" className="underline">Backups → Backup now</Link>.
      </div>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : backups.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No snapshots available</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">
            Take one first from <Link href="/admin/backups" className="text-cyan-300/80 hover:text-cyan-200 underline">/admin/backups</Link>.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/55">Snapshot</span>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream font-mono focus:outline-none focus:border-brand-orange/50"
            >
              <option value="">— pick a snapshot —</option>
              {backups.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} · {new Date(b.createdAt).toLocaleString()} · {fmtSize(b.sizeBytes)}
                </option>
              ))}
            </select>
          </label>

          {target && (
            <>
              <div className="rounded-lg border border-white/8 bg-black/30 p-3 text-[12px] text-brand-cream/75 space-y-1">
                <div><span className="text-brand-cream/45">Created:</span> {new Date(target.createdAt).toLocaleString()}</div>
                <div><span className="text-brand-cream/45">Size:</span> {fmtSize(target.sizeBytes)}</div>
                <div><span className="text-brand-cream/45">Kind:</span> {target.kind}</div>
                <div><span className="text-brand-cream/45">Adapter:</span> {target.adapter}</div>
                {target.notes && <div><span className="text-brand-cream/45">Notes:</span> {target.notes}</div>}
              </div>

              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/55">
                  Type the snapshot id to confirm
                </span>
                <input
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  placeholder={target.id}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-brand-cream focus:outline-none focus:border-brand-orange/50"
                />
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={restore}
                  disabled={!canConfirm}
                  className="text-[11px] uppercase tracking-[0.2em] text-white bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {busy ? "Restoring…" : "Restore from this snapshot"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
