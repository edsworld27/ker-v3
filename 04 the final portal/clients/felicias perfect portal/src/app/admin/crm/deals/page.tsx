"use client";

// /admin/crm/deals — pipeline of sales opportunities. Each deal is
// pinned to a contact and has a stage + value. List view with stage
// filtering; new deals attach to an existing contact id.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageSpinner from "@/components/admin/Spinner";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";
import { notify } from "@/components/admin/Toaster";

interface Deal {
  id: string;
  contactId: string;
  title: string;
  value?: number;
  currency?: string;
  stage: "lead" | "qualified" | "proposal" | "won" | "lost";
  createdAt: number;
}

const STAGE_TONE: Record<Deal["stage"], string> = {
  lead:      "bg-white/5 text-brand-cream/65",
  qualified: "bg-cyan-500/10 text-cyan-300",
  proposal:  "bg-amber-500/10 text-amber-300",
  won:       "bg-emerald-500/10 text-emerald-300",
  lost:      "bg-red-500/10 text-red-300",
};

export default function DealsPage() {
  return <PluginRequired plugin="crm"><Inner /></PluginRequired>;
}

function Inner() {
  const [deals, setDeals]     = useState<Deal[]>([]);
  const [filter, setFilter]   = useState<"all" | Deal["stage"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function load() {
    setError(null);
    const orgId = getActiveOrgId();
    try {
      const res = await fetch(`/api/portal/crm/deals?orgId=${encodeURIComponent(orgId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { deals?: Deal[] };
      setDeals(data.deals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => filter === "all" ? deals : deals.filter(d => d.stage === filter), [deals, filter]);
  const totals = useMemo(() => {
    const map: Record<Deal["stage"], { count: number; value: number }> = {
      lead: { count: 0, value: 0 }, qualified: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 }, won: { count: 0, value: 0 }, lost: { count: 0, value: 0 },
    };
    for (const d of deals) { map[d.stage].count++; map[d.stage].value += d.value ?? 0; }
    return map;
  }, [deals]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header>
        <Link href="/admin/crm" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← CRM overview</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-2 mb-1">CRM</p>
        <h1 className="font-display text-3xl text-brand-cream">Deals</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">{deals.length} deal{deals.length === 1 ? "" : "s"} · pipeline value £{deals.reduce((a, d) => a + (d.value ?? 0), 0).toFixed(2)}</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(["lead", "qualified", "proposal", "won", "lost"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`rounded-xl border p-3 text-left transition-colors ${filter === s ? "border-cyan-400/40 bg-cyan-500/10" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"}`}
          >
            <p className="text-[10px] tracking-wider uppercase text-brand-cream/55 mb-1">{s}</p>
            <p className="font-display text-xl tabular-nums text-brand-cream">{totals[s].count}</p>
            {totals[s].value > 0 && <p className="text-[10px] text-brand-cream/45 mt-0.5">£{totals[s].value.toFixed(0)}</p>}
          </button>
        ))}
      </section>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          {error} <button onClick={() => void load()} className="underline ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <PageSpinner wrap={false} />
      ) : visible.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">{filter === "all" ? "No deals yet. Create one from a contact's profile or via the API." : `No deals in "${filter}".`}</p>
      ) : (
        <ul className="space-y-1">
          {visible.map(d => (
            <li key={d.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{d.title}</p>
                <p className="text-[10px] text-brand-cream/45 font-mono truncate">{d.contactId}</p>
              </div>
              {d.value !== undefined && (
                <span className="text-[12px] tabular-nums text-brand-cream/85 shrink-0">£{d.value.toFixed(2)}</span>
              )}
              <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded ${STAGE_TONE[d.stage]} shrink-0`}>{d.stage}</span>
              <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">{new Date(d.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && deals.length > 0 && (
        <p className="text-[10px] text-brand-cream/40">Tip: tap a stage card above to filter the list.</p>
      )}
    </main>
  );
}
