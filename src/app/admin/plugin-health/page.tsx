"use client";

// /admin/plugin-health — at-a-glance dashboard of every installed
// plugin's healthcheck result for the active org. Refresh button
// re-runs all checks; per-plugin row shows status with details.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrgId } from "@/lib/admin/orgs";
import PageSpinner from "@/components/admin/Spinner";
import AdminTabs from "@/components/admin/AdminTabs";
import { MARKETPLACE_TABS } from "@/lib/admin/tabSets";

interface HealthRow {
  pluginId: string;
  enabled: boolean;
  health: { ok: boolean; message?: string; components?: Record<string, { ok: boolean; message?: string }> } | null;
  healthCheckedAt: number | null;
}

export default function PluginHealthPage() {
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(refresh: boolean) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const orgId = getActiveOrgId();
      const url = `/api/portal/health/${orgId}${refresh ? "?refresh=1" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(data.plugins ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(false); }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <AdminTabs tabs={MARKETPLACE_TABS} ariaLabel="Plugins" />
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Plugin health</p>
          <h1 className="font-display text-3xl text-brand-cream">Installed plugins</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Last-known healthcheck result per plugin. Refresh to re-run.</p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium disabled:opacity-40"
        >
          {refreshing ? "Refreshing…" : "Refresh all"}
        </button>
      </header>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : rows.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No plugins installed.</p>
      ) : (
        <section className="space-y-2">
          {rows.map(row => {
            const ok = row.health?.ok === true;
            const unknown = !row.health;
            return (
              <article
                key={row.pluginId}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  unknown ? "border-white/5 bg-white/[0.02]" :
                  ok ? "border-emerald-400/15 bg-emerald-500/5" :
                  "border-red-400/20 bg-red-500/5"
                }`}
              >
                <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                  unknown ? "bg-white/15" : ok ? "bg-emerald-400" : "bg-red-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-brand-cream font-medium">{row.pluginId}</p>
                    {!row.enabled && <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/5 text-brand-cream/45">disabled</span>}
                  </div>
                  {row.health?.message && (
                    <p className="text-[12px] text-brand-cream/65 mt-1">{row.health.message}</p>
                  )}
                  {row.health?.components && (
                    <ul className="text-[11px] text-brand-cream/55 mt-2 space-y-0.5">
                      {Object.entries(row.health.components).map(([k, v]) => (
                        <li key={k} className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${v.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span className="font-mono">{k}</span>
                          {v.message && <span className="opacity-65"> — {v.message}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {row.healthCheckedAt && (
                    <p className="text-[10px] text-brand-cream/40 mt-2">
                      Checked {new Date(row.healthCheckedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <Link
                  href={`/aqua/${getActiveOrgId()}/plugins/${row.pluginId}`}
                  className="text-[11px] text-cyan-300/80 hover:text-cyan-200 shrink-0"
                >
                  Configure →
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
