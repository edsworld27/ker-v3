"use client";

// /admin/analytics — Analytics plugin dashboard. Pageviews, unique
// visitors, top pages / referrers, day-by-day chart, conversion rate.
//
// Uses /api/portal/analytics/[orgId]?days=N. Falls back to a friendly
// empty state when the plugin isn't installed (via PluginRequired).

import { useEffect, useState } from "react";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Summary {
  pageviews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  byDevice: Record<"desktop" | "tablet" | "mobile" | "other", number>;
  byDay: Array<{ day: string; views: number }>;
  conversionRate: number;
  totalEvents: number;
}

export default function AnalyticsPage() {
  return <PluginRequired plugin="analytics"><AnalyticsPageInner /></PluginRequired>;
}

function AnalyticsPageInner() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const orgId = getActiveOrgId();
      try {
        const res = await fetch(`/api/portal/analytics/${orgId}?days=${days}`);
        const data = await res.json();
        if (!cancelled && data.ok) setSummary(data.summary);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [days]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Analytics</p>
          <h1 className="font-display text-3xl text-brand-cream">Site activity</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            Self-hosted, privacy-friendly. Last {days} days.
          </p>
        </div>
        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-white/[0.02]">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${days === d ? "bg-white/10 text-brand-cream" : "text-brand-cream/55 hover:text-brand-cream"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </header>

      {loading && !summary && (
        <p className="text-[12px] text-brand-cream/45">Loading…</p>
      )}

      {summary && (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Pageviews"          value={summary.pageviews.toLocaleString()} />
            <Stat label="Unique visitors"    value={summary.uniqueVisitors.toLocaleString()} />
            <Stat label="Sessions"           value={summary.uniqueSessions.toLocaleString()} />
            <Stat label="Conversion"         value={`${summary.conversionRate.toFixed(2)}%`} />
          </section>

          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Pageviews by day</h2>
            <DayChart days={summary.byDay} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block title="Top pages">
              {summary.topPages.length === 0 ? (
                <p className="text-[11px] text-brand-cream/40">No data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.topPages.map(p => (
                    <li key={p.path} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="font-mono text-brand-cream/80 truncate">{p.path}</span>
                      <span className="text-brand-cream/55 tabular-nums">{p.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Block>
            <Block title="Top referrers">
              {summary.topReferrers.length === 0 ? (
                <p className="text-[11px] text-brand-cream/40">No referrers tracked yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.topReferrers.map(r => (
                    <li key={r.referrer} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-brand-cream/80 truncate">{r.referrer}</span>
                      <span className="text-brand-cream/55 tabular-nums">{r.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Block>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Block title="Desktop">
              <p className="text-2xl font-display text-brand-cream">{summary.byDevice.desktop.toLocaleString()}</p>
            </Block>
            <Block title="Tablet">
              <p className="text-2xl font-display text-brand-cream">{summary.byDevice.tablet.toLocaleString()}</p>
            </Block>
            <Block title="Mobile">
              <p className="text-2xl font-display text-brand-cream">{summary.byDevice.mobile.toLocaleString()}</p>
            </Block>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{label}</p>
      <p className="font-display text-2xl text-brand-cream mt-1">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <h3 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function DayChart({ days }: { days: Array<{ day: string; views: number }> }) {
  if (days.length === 0) {
    return <p className="text-[11px] text-brand-cream/40">No pageviews yet.</p>;
  }
  const max = Math.max(...days.map(d => d.views), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {days.map(d => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.day}: ${d.views}`}>
          <div
            className="w-full bg-cyan-400/30 group-hover:bg-cyan-400/60 transition-colors rounded-t"
            style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }}
          />
          <span className="text-[9px] text-brand-cream/35 font-mono">{d.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
