"use client";

// /admin/backups — Backups plugin landing.
//
// Lists existing snapshots from the runtime, lets the operator take
// one on demand, download as JSON, delete, or jump to the restore
// flow. The runtime's file adapter writes to .data/backups/ on the
// server; S3 is plugin-config-driven (typed error today, easy hook
// for future implementations).

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";
import { friendlyError } from "@/lib/admin/friendlyError";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Backup {
  id: string;
  orgId: string;
  kind: "manual" | "scheduled";
  adapter: "file" | "s3";
  location: string;
  sizeBytes: number;
  createdAt: number;
  notes?: string;
}

interface BackupsConfig {
  adapter?: "file" | "s3";
  retention?: number;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminBackupsPage() {
  return (
    <PluginRequired plugin="backups">
      <BackupsPageInner />
    </PluginRequired>
  );
}

function BackupsPageInner() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupsConfig>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/backups?orgId=${orgId}`, { cache: "no-store" });
      const data = await res.json() as { backups?: Backup[]; config?: BackupsConfig };
      setBackups(data.backups ?? []);
      setConfig(data.config ?? {});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function backupNow() {
    setBusy(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/backups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, kind: "manual" }),
      });
      const data = await res.json() as { ok: boolean; backup?: Backup; error?: string };
      if (!data.ok) {
        const f = friendlyError(data.error, "Backup failed");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      notify({ tone: "ok", message: `Backup created (${fmtSize(data.backup?.sizeBytes ?? 0)})` });
      await load();
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function deleteBackup(b: Backup) {
    const ok = await confirm({
      title: "Delete this backup?",
      message: `Snapshot from ${new Date(b.createdAt).toLocaleString()} will be removed permanently.`,
      danger: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    const res = await fetch(`/api/portal/backups/${encodeURIComponent(b.id)}`, { method: "DELETE" });
    const data = await res.json() as { ok: boolean };
    if (data.ok) {
      notify({ tone: "ok", message: "Backup deleted" });
      await load();
    } else {
      notify({ tone: "error", message: "Delete failed" });
    }
  }

  function downloadBackup(b: Backup) {
    window.open(`/api/portal/backups/${encodeURIComponent(b.id)}`, "_blank", "noopener");
  }

  const adapter = config.adapter ?? "file";
  const retention = config.retention ?? 14;

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Disaster recovery</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Backups</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Snapshots of your full portal state — orgs, users, pages, content, plugin configs.
            Each backup is restorable from <Link href="/admin/backups/restore" className="text-cyan-300/80 hover:text-cyan-200 underline">/admin/backups/restore</Link>.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/backups/restore"
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 transition-colors"
          >
            Restore
          </Link>
          <button
            type="button"
            onClick={backupNow}
            disabled={busy}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {busy ? "Working…" : "Backup now"}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Snapshots" value={backups.length.toLocaleString()} />
        <Stat label="Adapter" value={adapter} hint={adapter === "s3" ? "S3 not in-tree — see runtime." : "Writes to .data/backups/"} />
        <Stat label="Retention" value={`${retention} most recent`} hint="Older snapshots auto-evicted on new write." />
      </section>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : backups.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No backups yet</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-md mx-auto leading-relaxed">
            Click <strong>Backup now</strong> to take a snapshot. Wire your platform&rsquo;s cron at{" "}
            <code className="font-mono text-brand-cream/65">POST /api/portal/backups</code> for scheduled snapshots.
          </p>
        </section>
      ) : (
        <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
          {backups.map(b => (
            <li key={b.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[12rem]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] text-brand-cream font-mono">{b.id}</span>
                  <span className={`text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full ${
                    b.kind === "scheduled"
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}>
                    {b.kind}
                  </span>
                  <span className="text-[10px] text-brand-cream/45">{b.adapter}</span>
                </div>
                <p className="text-[11px] text-brand-cream/55 mt-0.5">
                  {new Date(b.createdAt).toLocaleString()} · {fmtSize(b.sizeBytes)}
                  {b.notes && <> · {b.notes}</>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadBackup(b)}
                className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 transition-colors"
              >
                Download
              </button>
              <Link
                href={`/admin/backups/restore?id=${encodeURIComponent(b.id)}`}
                className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 transition-colors"
              >
                Restore
              </Link>
              <button
                type="button"
                onClick={() => deleteBackup(b)}
                className="text-[11px] uppercase tracking-[0.2em] text-red-300/80 hover:text-red-300 rounded-lg border border-red-400/20 hover:border-red-400/40 px-3 py-1.5"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-brand-black-card p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[10px] text-brand-cream/40 mt-1">{hint}</p>}
    </div>
  );
}
