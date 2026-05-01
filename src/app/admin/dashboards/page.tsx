"use client";

import { useEffect, useState } from "react";
import { loadDashboard, saveDashboard, resetDashboard } from "@/lib/admin/dashboards";
import { getActiveOrg, getActiveOrgId, onOrgsChange } from "@/lib/admin/orgs";
import type { DashboardWidget, WidgetType } from "@/portal/server/types";

const WIDGET_LIBRARY: Array<{ type: WidgetType; label: string; defaultSpan: 1 | 2 | 3 }> = [
  { type: "stat-orders",          label: "Orders stat",         defaultSpan: 1 },
  { type: "stat-revenue",         label: "Revenue stat",        defaultSpan: 1 },
  { type: "stat-sites",           label: "Sites stat",          defaultSpan: 1 },
  { type: "stat-customers",       label: "Customers stat",      defaultSpan: 1 },
  { type: "list-recent-orders",   label: "Recent orders list",  defaultSpan: 2 },
  { type: "list-recent-activity", label: "Recent activity",     defaultSpan: 1 },
  { type: "list-low-stock",       label: "Low stock list",      defaultSpan: 1 },
  { type: "chart-revenue-trend",  label: "Revenue trend chart", defaultSpan: 3 },
  { type: "callout-onboarding",   label: "Onboarding callout",  defaultSpan: 3 },
];

// /admin/dashboards — reorder, hide, resize widgets for the active org.
//
// Drag-and-drop is intentionally simple ↑↓ buttons rather than HTML5
// drag-drop because mobile DnD is fiddly and this is admin tooling.

export default function DashboardsPage() {
  const [orgId, setOrgId] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function refresh(id: string) {
    if (!id) return;
    const layout = await loadDashboard(id, true);
    setWidgets(layout.widgets);
  }

  useEffect(() => {
    const id = getActiveOrgId();
    setOrgId(id);
    setOrgName(getActiveOrg()?.name ?? id);
    if (id) void refresh(id);
    return onOrgsChange(() => {
      const next = getActiveOrgId();
      setOrgId(next);
      setOrgName(getActiveOrg()?.name ?? next);
      if (next) void refresh(next);
    });
  }, []);

  async function persist(next: DashboardWidget[]) {
    setBusy(true); setError(null);
    try {
      await saveDashboard(orgId, next);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  function move(id: string, direction: -1 | 1) {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= widgets.length) return;
    const next = [...widgets];
    [next[idx], next[target]] = [next[target], next[idx]];
    setWidgets(next);
    void persist(next);
  }

  function toggleVisible(id: string) {
    const next = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(next);
    void persist(next);
  }

  function setSpan(id: string, span: 1 | 2 | 3) {
    const next = widgets.map(w => w.id === id ? { ...w, span } : w);
    setWidgets(next);
    void persist(next);
  }

  function removeWidget(id: string) {
    const next = widgets.filter(w => w.id !== id);
    setWidgets(next);
    void persist(next);
  }

  function addWidget(type: WidgetType, defaultSpan: 1 | 2 | 3) {
    const id = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    const next = [...widgets, { id, type, span: defaultSpan, visible: true }];
    setWidgets(next);
    void persist(next);
  }

  async function handleReset() {
    if (!confirm("Reset this org's dashboard to the default layout?")) return;
    setBusy(true); setError(null);
    try {
      const layout = await resetDashboard(orgId);
      setWidgets(layout.widgets);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Dashboard layout</p>
          <h1 className="font-display text-3xl text-brand-cream">Customise widgets</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Org: <span className="text-brand-cream/85 font-medium">{orgName || "—"}</span></p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-brand-cream/55">
          {busy && <span>Saving…</span>}
          {savedAt && !busy && <span className="text-brand-cream/70">Saved</span>}
          <button onClick={handleReset} disabled={busy} className="hover:text-brand-orange disabled:opacity-40">Reset to default</button>
        </div>
      </header>

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45">Active widgets</p>
        {widgets.length === 0 && (
          <p className="text-[12px] text-brand-cream/45">No widgets — add one below.</p>
        )}
        {widgets.map((w, i) => (
          <div key={w.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => move(w.id, -1)} disabled={i === 0} className="text-[10px] text-brand-cream/55 hover:text-brand-orange disabled:opacity-20">▲</button>
              <button onClick={() => move(w.id, 1)} disabled={i === widgets.length - 1} className="text-[10px] text-brand-cream/55 hover:text-brand-orange disabled:opacity-20">▼</button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-cream font-medium truncate">{w.title || w.type}</p>
              <p className="text-[10px] text-brand-cream/45 font-mono">{w.type}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setSpan(w.id, n as 1 | 2 | 3)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-mono ${w.span === n ? "bg-brand-orange text-white" : "bg-white/5 text-brand-cream/55 hover:text-brand-cream"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => toggleVisible(w.id)}
              className={`px-2 py-1 rounded-lg text-[11px] ${w.visible ? "bg-white/10 text-brand-cream/70" : "bg-white/5 text-brand-cream/30 line-through"}`}
            >
              {w.visible ? "Visible" : "Hidden"}
            </button>
            <button onClick={() => removeWidget(w.id)} className="text-[11px] text-brand-cream/45 hover:text-red-400">Remove</button>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/45">Add widget</p>
        <div className="grid sm:grid-cols-3 gap-2">
          {WIDGET_LIBRARY.map(w => (
            <button
              key={w.type}
              onClick={() => addWidget(w.type, w.defaultSpan)}
              className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-3 text-left"
            >
              <p className="text-sm text-brand-cream">{w.label}</p>
              <p className="text-[10px] text-brand-cream/45 font-mono">{w.type} · span {w.defaultSpan}</p>
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>
      )}
    </div>
  );
}
