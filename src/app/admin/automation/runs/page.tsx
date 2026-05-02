"use client";

// /admin/automation/runs — execution history of automation rules.
// Backend persistence isn't wired yet (the automation runtime fires
// rules but doesn't keep a structured run log). Until that lands, surface
// what we have: the activity-log entries tagged "automation" so the
// operator at least sees that something fired.

import { useEffect, useState } from "react";
import Link from "next/link";
import PageSpinner from "@/components/admin/Spinner";
import PluginRequired from "@/components/admin/PluginRequired";

interface ActivityEntry {
  id: string;
  ts: number;
  category: string;
  action: string;
  actorEmail?: string;
  resourceLink?: string;
  resourceId?: string;
}

export default function AutomationRunsPage() {
  return <PluginRequired plugin="automation"><Inner /></PluginRequired>;
}

function Inner() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/portal/activity?category=settings&limit=200", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { entries?: ActivityEntry[] };
      // Filter client-side to anything that mentions "automation".
      setEntries((data.entries ?? []).filter(e => /automat|rule/i.test(e.action)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <header>
        <Link href="/admin/automation" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← Automation rules</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-2 mb-1">Automation</p>
        <h1 className="font-display text-3xl text-brand-cream">Run history</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Recent rule activity recorded in the audit log.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          {error} <button onClick={() => void load()} className="underline ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <PageSpinner wrap={false} />
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
          <p className="text-[13px] text-brand-cream/85">No automation runs yet.</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">
            Activate a rule from <Link href="/admin/automation" className="text-cyan-300 hover:text-cyan-200">/admin/automation</Link>{" "}
            and trigger its event (form submit, order paid, etc.). Runs appear here as they fire.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {entries.map(e => (
            <li key={e.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{e.action}</p>
                {e.actorEmail && <p className="text-[10px] text-brand-cream/45 truncate">{e.actorEmail}</p>}
              </div>
              <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">{new Date(e.ts).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
