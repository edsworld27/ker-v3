"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  loadActivity, clearActivity, onActivityChange, relativeTime,
  type ActivityEntry, type ActivityCategory,
} from "@/lib/admin/activity";
import Tip from "@/components/admin/Tip";

const CATEGORY_COLOURS: Record<ActivityCategory, string> = {
  orders:    "bg-brand-orange/15 text-brand-orange",
  products:  "bg-brand-amber/15 text-brand-amber",
  customers: "bg-brand-purple/20 text-brand-purple-light",
  marketing: "bg-pink-500/15 text-pink-300",
  content:   "bg-blue-500/15 text-blue-300",
  theme:     "bg-fuchsia-500/15 text-fuchsia-300",
  settings:  "bg-white/10 text-brand-cream/70",
  features:  "bg-green-500/15 text-green-400",
  shipping:  "bg-cyan-500/15 text-cyan-300",
  support:   "bg-yellow-500/15 text-yellow-300",
  auth:      "bg-red-500/15 text-red-400",
};

interface ActivityStats {
  total: number;
  oldestTs: number | null;
  retentionDays: number;
  byCategory: Record<string, number>;
}

export default function AdminActivityPage() {
  const [entries,  setEntries]  = useState<ActivityEntry[]>([]);
  const [stats,    setStats]    = useState<ActivityStats | null>(null);
  const [source,   setSource]   = useState<"cloud" | "local">("local");
  const [filter,   setFilter]   = useState<ActivityCategory | "all">("all");
  const [actor,    setActor]    = useState<string>("all");
  const [query,    setQuery]    = useState("");

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const result = await loadActivity({ limit: 1000 });
      if (cancelled) return;
      setEntries(result.entries);
      setStats(result.stats);
      setSource(result.source);
    }
    void refresh();
    // Refresh on local-cache change AND every 30s so other admins'
    // entries land in the timeline within a minute.
    const off = onActivityChange(() => void refresh());
    const id = setInterval(() => void refresh(), 30_000);
    return () => { cancelled = true; off(); clearInterval(id); };
  }, []);

  const actors = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => set.add(e.actorEmail));
    return [...set].sort();
  }, [entries]);

  const visible = entries.filter(e => {
    if (filter !== "all" && e.category !== filter) return false;
    if (actor  !== "all" && e.actorEmail !== actor) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (
        !e.action.toLowerCase().includes(q)
        && !e.actorName.toLowerCase().includes(q)
        && !e.actorEmail.toLowerCase().includes(q)
        && !(e.resourceId ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // Group entries by day
  const grouped = useMemo(() => {
    const out: { date: string; items: ActivityEntry[] }[] = [];
    let last = "";
    for (const e of visible) {
      const d = new Date(e.ts);
      const key = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
      const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
      const label = key === today ? "Today" : key;
      if (label !== last) {
        out.push({ date: label, items: [e] });
        last = label;
      } else {
        out[out.length - 1].items.push(e);
      }
    }
    return out;
  }, [visible]);

  const categories: (ActivityCategory | "all")[] = [
    "all", "orders", "products", "customers", "marketing", "content",
    "theme", "settings", "features", "shipping", "support", "auth",
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Operations</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Activity log</h1>
            <Tip
              id="activity.header"
              text="Audit trail of every admin mutation. Cloud-first: stored in the portal backend with retention driven by the active compliance mode (HIPAA → 6 years, SOC 2 → 1 year). LocalStorage is a fast-read cache + offline fallback."
              align="bottom"
            />
            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
              source === "cloud"
                ? "bg-green-500/15 text-green-400 border-green-500/25"
                : "bg-brand-amber/15 text-brand-amber border-brand-amber/30"
            }`} title={source === "cloud"
              ? "Reading from the cloud-side activity store"
              : "Cloud store unreachable — showing localStorage fallback (this device only)"}>
              {source === "cloud" ? "Cloud" : "Local fallback"}
            </span>
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} loaded
            {visible.length !== entries.length && ` · ${visible.length} matching`}
            {stats && stats.retentionDays > 0 && (
              <> · retained {stats.retentionDays}d · {stats.total} total</>
            )}
          </p>
        </div>
        <button
          onClick={() => { if (confirm("Clear all activity history? This cannot be undone.")) clearActivity(); }}
          disabled={entries.length === 0}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear log
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search action, actor, resource…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
        {actors.length > 1 && (
          <select
            value={actor}
            onChange={e => setActor(e.target.value)}
            className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream focus:outline-none"
          >
            <option value="all">All actors</option>
            {actors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] capitalize transition-colors ${
                filter === cat
                  ? "bg-brand-orange text-white font-semibold"
                  : "bg-white/5 text-brand-cream/55 hover:text-brand-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <p className="text-brand-cream/50 text-sm">No activity yet.</p>
          <p className="text-brand-cream/30 text-xs mt-1">
            Anything you change in the admin panel will appear here — order updates, theme tweaks, flag toggles…
          </p>
        </div>
      )}

      {/* Filtered to nothing */}
      {entries.length > 0 && visible.length === 0 && (
        <div className="text-center py-10 text-brand-cream/40 text-sm">
          No entries match these filters.
        </div>
      )}

      {/* Timeline */}
      {grouped.map(group => (
        <div key={group.date} className="space-y-2">
          <p className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/35 px-1">{group.date}</p>
          <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
            {group.items.map(e => (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 mt-0.5 ${CATEGORY_COLOURS[e.category]}`}>
                  {e.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-cream leading-snug">
                    {e.resourceLink ? (
                      <Link href={e.resourceLink} className="hover:underline">{e.action}</Link>
                    ) : e.action}
                  </p>
                  <p className="text-[11px] text-brand-cream/40 mt-0.5">
                    {e.actorName} <span className="text-brand-cream/25">· {e.actorEmail}</span>
                  </p>
                </div>
                <span className="text-[11px] text-brand-cream/35 shrink-0 mt-1" title={new Date(e.ts).toLocaleString()}>
                  {relativeTime(e.ts)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
