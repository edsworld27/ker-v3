"use client";

// /admin/backups — Backups plugin landing.
// Operator-visible list of snapshots, with the option to take one on
// demand. Real list comes from the plugin's runtime once cron + S3
// client land.

import Link from "next/link";
import PluginPageScaffold from "@/components/admin/PluginPageScaffold";
import { getActiveOrgId } from "@/lib/admin/orgs";

export default function AdminBackupsPage() {
  return (
    <PluginPageScaffold
      pluginId="backups"
      eyebrow="Disaster recovery"
      title="Backups"
      description="Scheduled snapshots of your org data + uploaded media. Daily / weekly / monthly cadence, restorable from this admin."
      actions={
        <>
          <Link href="/admin/backups/restore" className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30">Restore →</Link>
          <button
            type="button"
            disabled
            title="Manual backup will be enabled once the Backups plugin runtime lands."
            className="text-xs px-3 py-2 rounded-lg bg-brand-orange/40 text-white/70 disabled:cursor-not-allowed"
          >
            Backup now
          </button>
        </>
      }
    >
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-6 sm:p-8 space-y-3">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Snapshots</h2>
        <p className="text-[12px] text-brand-cream/55">No backups taken yet for this org.</p>
        <p className="text-[11px] text-brand-cream/40">
          Configure cadence + storage in the Backups plugin's <Link
            href={`/aqua/${getActiveOrgId()}/plugins/backups`}
            className="text-cyan-300/80 hover:text-cyan-200"
          >settings</Link>. Daily snapshots + S3-compatible storage are mandatory for SOC 2.
        </p>
      </section>
    </PluginPageScaffold>
  );
}
