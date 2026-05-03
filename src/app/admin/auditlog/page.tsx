"use client";

// /admin/auditlog — compliance-grade view of admin mutations.
//
// Reads from the same /api/portal/activity feed that powers
// /admin/activity, but presents it through an audit lens: actor /
// timestamp / action / resource / diff per row, retention banner,
// filterable by category + actor + free-text search, CSV export.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";
import { friendlyFromResponse } from "@/lib/admin/friendlyError";

interface Entry {
  id: string;
  ts: number;
  actorEmail: string;
  actorName: string;
  category: string;
  action: string;
  resourceId?: string;
  resourceLink?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

interface Stats {
  total: number;
  oldestTs: number | null;
  retentionDays: number;
  byCategory: Record<string, number>;
}

const CATEGORY_COLOURS: Record<string, string> = {
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

export default function AdminAuditLogPage() {
  return (
    <PluginRequired plugin="auditlog">
      <AuditLogInner />
    </PluginRequired>
  );
}

function AuditLogInner() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [actor, setActor] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/activity?limit=2000`, { cache: "no-store" });
      const data = await res.json() as { entries?: Entry[]; stats?: Stats };
      setEntries(data.entries ?? []);
      setStats(data.stats ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const actors = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) set.add(e.actorEmail);
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(e => {
      if (category !== "all" && e.category !== category) return false;
      if (actor !== "all" && e.actorEmail !== actor) return false;
      if (!q) return true;
      return e.action.toLowerCase().includes(q)
        || e.actorName.toLowerCase().includes(q)
        || e.actorEmail.toLowerCase().includes(q)
        || (e.resourceId ?? "").toLowerCase().includes(q);
    });
  }, [entries, query, category, actor]);

  function exportCsv() {
    if (filtered.length === 0) {
      notify("Nothing to export with these filters.");
      return;
    }
    const header = ["timestamp", "actor_email", "actor_name", "category", "action", "resource_id"].join(",");
    const rows = filtered.map(e => [
      new Date(e.ts).toISOString(),
      e.actorEmail,
      e.actorName,
      e.category,
      e.action,
      e.resourceId ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditlog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearLog() {
    const ok = await confirm({
      title: "Clear the entire audit log?",
      message: "This wipes every entry. Useful for dev environments only — production should never need this.",
      danger: true,
      confirmLabel: "Clear log",
    });
    if (!ok) return;
    const res = await fetch("/api/portal/activity", { method: "DELETE" });
    if (res.ok) {
      notify({ tone: "ok", message: "Audit log cleared" });
      await load();
    } else {
      const f = friendlyFromResponse(res, null, "Couldn't clear");
      notify({ tone: "error", title: f.title, message: f.message });
    }
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Compliance</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Audit log</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Every admin-side mutation: tier changes, payouts, status flips, plugin installs, content publishes.
            Each entry has actor, timestamp, target resource, and a before/after diff when one was supplied.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 disabled:opacity-40 transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={clearLog}
            className="text-[11px] uppercase tracking-[0.2em] text-red-300/80 hover:text-red-300 rounded-lg border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 transition-colors"
          >
            Clear log
          </button>
        </div>
      </header>

      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Entries" value={stats.total.toLocaleString()} />
          <Stat label="Retention" value={`${stats.retentionDays}d`} hint="Configurable per compliance mode." />
          <Stat
            label="Oldest entry"
            value={stats.oldestTs ? new Date(stats.oldestTs).toLocaleDateString() : "—"}
          />
          <Stat label="Categories" value={Object.keys(stats.byCategory).length.toLocaleString()} />
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search action, actor, resource…"
          className="flex-1 min-w-[12rem] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        >
          <option value="all">All categories</option>
          {Object.keys(stats?.byCategory ?? {}).sort().map(c => (
            <option key={c} value={c}>{c} ({stats!.byCategory[c]})</option>
          ))}
        </select>
        <select
          value={actor}
          onChange={e => setActor(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        >
          <option value="all">All actors</option>
          {actors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : entries.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No audit entries yet</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-md mx-auto leading-relaxed">
            As operators perform admin actions (membership tier changes, affiliate payouts, plugin installs, content publishes) entries will land here.
            SOC 2 + HIPAA compliance modes auto-extend retention.
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No matches</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">Try clearing the filters above.</p>
        </section>
      ) : (
        <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
          {filtered.map(e => {
            const isExpanded = expandedId === e.id;
            const hasDiff = !!e.diff && Object.keys(e.diff).length > 0;
            return (
              <li key={e.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start gap-3">
                  <span className={`text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                    CATEGORY_COLOURS[e.category] ?? "bg-white/10 text-brand-cream/70"
                  }`}>
                    {e.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-brand-cream">{e.action}</p>
                    <p className="text-[11px] text-brand-cream/55 mt-0.5">
                      <span className="text-brand-cream/70">{e.actorName}</span>
                      <span className="text-brand-cream/40"> · {e.actorEmail}</span>
                      {e.resourceLink && (
                        <>
                          <span className="text-brand-cream/40"> · </span>
                          <Link href={e.resourceLink} className="text-cyan-300/80 hover:text-cyan-200">
                            View →
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasDiff && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : e.id)}
                        className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/55 hover:text-brand-cream"
                      >
                        {isExpanded ? "Hide diff" : "Show diff"}
                      </button>
                    )}
                    <span className="text-[10px] text-brand-cream/40 tabular-nums">
                      {new Date(e.ts).toLocaleString()}
                    </span>
                  </div>
                </div>
                {isExpanded && hasDiff && (
                  <div className="mt-2 ml-2 rounded-lg border border-white/8 bg-black/30 p-3 space-y-1">
                    {Object.entries(e.diff!).map(([key, val]) => {
                      const v = val as { from: unknown; to: unknown };
                      return (
                        <div key={key} className="text-[11px] font-mono">
                          <span className="text-brand-cream/55">{key}:</span>{" "}
                          <span className="text-red-300/70 line-through">{stringify(v.from)}</span>
                          {" → "}
                          <span className="text-emerald-300">{stringify(v.to)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function stringify(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "—";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
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
