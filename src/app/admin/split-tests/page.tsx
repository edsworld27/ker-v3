"use client";

// /admin/split-tests — manage groups, set timing/frequency/goal, view
// per-variant exposures + conversions. Each group is paired with the
// (page, block) refs that participate; clicking through to a block
// jumps into the visual editor with its Split tab open.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SplitTestGroup, SplitTestResult } from "@/portal/server/types";
import { getActiveSite, type Site } from "@/lib/admin/sites";
import {
  createGroup, deleteGroup, getGroupResults, listGroups, onSplitTestsChange,
  patchGroup, statusTone,
} from "@/lib/admin/splitTests";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

interface ResultRow { variantId: string; exposures: number; conversions: number }

export default function SplitTestsPage() {
  const [site, setSite] = useState<Site | null>(null);
  const [groups, setGroups] = useState<SplitTestGroup[]>([]);
  const [results, setResults] = useState<Record<string, ResultRow[]>>({});
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newTraffic, setNewTraffic] = useState(100);
  const [newSticky, setNewSticky] = useState<"visitor" | "session">("visitor");

  async function refresh() {
    const s = getActiveSite() ?? null;
    setSite(s);
    if (!s) return;
    const list = await listGroups(s.id);
    setGroups(list);
    const next: Record<string, ResultRow[]> = {};
    await Promise.all(list.map(async g => {
      const r = await getGroupResults(g.id);
      next[g.id] = r.results.map(x => ({ variantId: x.variantId, exposures: x.exposures, conversions: x.conversions }));
    }));
    setResults(next);
  }

  useEffect(() => {
    void refresh();
    return onSplitTestsChange(() => { void refresh(); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!site || !newName.trim()) return;
    await createGroup({ siteId: site.id, name: newName.trim(), goalEvent: newGoal.trim() || undefined, trafficPercent: newTraffic, stickyBy: newSticky });
    setNewName(""); setNewGoal(""); setNewTraffic(100); setNewSticky("visitor"); setCreating(false);
    void refresh();
  }

  if (!site) return <main className="p-6 text-[12px] text-brand-cream/45">No active site.</main>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Optimisation</p>
          <h1 className="font-display text-3xl text-brand-cream">Split tests</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Site: {site.name}</p>
        </div>
        <button onClick={() => setCreating(c => !c)} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90">
          {creating ? "Cancel" : "+ New group"}
        </button>
      </header>

      {creating && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Pricing-page CTA test" required className={INPUT} /></Field>
            <Field label="Goal event (optional)"><input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="purchase | signup | click:cta" className={INPUT + " font-mono"} /></Field>
            <Field label="Traffic %">
              <input type="number" min={1} max={100} value={newTraffic} onChange={e => setNewTraffic(Number(e.target.value) || 100)} className={INPUT} />
            </Field>
            <Field label="Sticky by">
              <select value={newSticky} onChange={e => setNewSticky(e.target.value as "visitor" | "session")} className={INPUT}>
                <option value="visitor">Visitor (cookie)</option>
                <option value="session">Session (re-rolls per visit)</option>
              </select>
            </Field>
          </div>
          <button type="submit" disabled={!newName.trim()} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold disabled:opacity-50">
            Create group
          </button>
        </form>
      )}

      <section className="space-y-3">
        {groups.length === 0 && <p className="text-[12px] text-brand-cream/45 text-center py-8">No split-test groups yet. Create one above, then assign blocks to it from the visual editor&apos;s Split tab.</p>}
        {groups.map(g => {
          const groupResults = results[g.id] ?? [];
          const totalExp = groupResults.reduce((acc, r) => acc + r.exposures, 0);
          const totalConv = groupResults.reduce((acc, r) => acc + r.conversions, 0);
          const overallRate = totalExp > 0 ? (totalConv / totalExp) * 100 : 0;
          return (
            <details key={g.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02]">
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${statusTone(g.status)}`}>{g.status}</span>
                <span className="font-semibold text-brand-cream truncate flex-1">{g.name}</span>
                <span className="text-[11px] text-brand-cream/55 font-mono">{totalExp.toLocaleString()} exposures · {(overallRate).toFixed(2)}%</span>
              </summary>
              <div className="p-4 border-t border-white/8 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Name"><input defaultValue={g.name} onBlur={e => e.target.value !== g.name && patchGroup(g.id, { name: e.target.value })} className={INPUT} /></Field>
                  <Field label="Goal event">
                    <input defaultValue={g.goalEvent ?? ""} onBlur={e => patchGroup(g.id, { goalEvent: e.target.value || undefined })} placeholder="purchase | click:cta" className={INPUT + " font-mono"} />
                  </Field>
                  <Field label="Traffic %">
                    <input type="number" min={1} max={100} defaultValue={g.trafficPercent ?? 100} onBlur={e => patchGroup(g.id, { trafficPercent: Number(e.target.value) || 100 })} className={INPUT} />
                  </Field>
                  <Field label="Sticky by">
                    <select defaultValue={g.stickyBy ?? "visitor"} onChange={e => patchGroup(g.id, { stickyBy: e.target.value as "visitor" | "session" })} className={INPUT}>
                      <option value="visitor">Visitor</option>
                      <option value="session">Session</option>
                    </select>
                  </Field>
                  <Field label="Auto-stop at (optional)">
                    <input type="datetime-local" defaultValue={g.endsAt ? new Date(g.endsAt).toISOString().slice(0, 16) : ""} onBlur={e => patchGroup(g.id, { endsAt: e.target.value ? Date.parse(e.target.value) : undefined })} className={INPUT} />
                  </Field>
                </div>

                {/* Status controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-brand-cream/45">Status:</span>
                  {(["draft", "running", "paused", "completed"] as const).map(s => (
                    <button key={s} onClick={() => patchGroup(g.id, { setStatus: s })} className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${g.status === s ? statusTone(s) : "text-brand-cream/40 hover:text-brand-cream"}`}>{s}</button>
                  ))}
                  <button onClick={async () => { if (confirm("Delete this group + all its results?")) { await deleteGroup(g.id); void refresh(); } }} className="ml-auto text-[10px] text-brand-cream/40 hover:text-red-400">Delete</button>
                </div>

                {/* Results table */}
                <div className="rounded-lg border border-white/8 bg-black/20 overflow-hidden">
                  <p className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-brand-cream/45 border-b border-white/5">Results</p>
                  {groupResults.length === 0 ? (
                    <p className="p-3 text-[11px] text-brand-cream/45">No exposures yet — set status to running + visit the page.</p>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-left text-brand-cream/45 border-b border-white/5">
                          <th className="px-3 py-1.5">Variant</th>
                          <th className="px-3 py-1.5 text-right">Exposures</th>
                          <th className="px-3 py-1.5 text-right">Conversions</th>
                          <th className="px-3 py-1.5 text-right">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupResults.map(r => {
                          const rate = r.exposures > 0 ? (r.conversions / r.exposures) * 100 : 0;
                          return (
                            <tr key={r.variantId} className="border-b border-white/5">
                              <td className="px-3 py-1.5 font-mono text-brand-cream/85">{r.variantId}</td>
                              <td className="px-3 py-1.5 text-right tabular-nums">{r.exposures.toLocaleString()}</td>
                              <td className="px-3 py-1.5 text-right tabular-nums">{r.conversions.toLocaleString()}</td>
                              <td className="px-3 py-1.5 text-right tabular-nums">{rate.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <p className="text-[10px] text-brand-cream/40 leading-relaxed">
                  Add blocks to this group from the visual editor → Split tab. Goal events are recorded by calling{" "}
                  <code className="font-mono text-brand-cream/70">recordConversion(&quot;{g.id}&quot;, variantId)</code> from your storefront.
                </p>
              </div>
            </details>
          );
        })}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">{label}</span>
      {children}
    </label>
  );
}
