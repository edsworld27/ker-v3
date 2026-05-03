"use client";

import { useEffect, useState } from "react";
import {
  listABTests, createABTest, saveABTest, deleteABTest, setABTestStatus, onABTestsChange,
  type ABTest, type ABVariant, type ABTestStatus, type GoalType,
} from "@/lib/admin/abtests";
import { listPages } from "@/lib/admin/customPages";
import Tip from "@/components/admin/Tip";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";

const GOAL_LABELS: Record<GoalType, string> = {
  page_visit: "Page visit",
  add_to_cart: "Add to cart",
  purchase: "Purchase (checkout success)",
};

const STATUS_STYLE: Record<ABTestStatus, string> = {
  draft: "bg-white/10 text-brand-cream/50",
  running: "bg-green-500/20 text-green-400",
  paused: "bg-brand-amber/20 text-brand-amber",
  completed: "bg-white/5 text-brand-cream/30",
};

function convRate(views: number, conversions: number): string {
  if (views === 0) return "—";
  return `${((conversions / views) * 100).toFixed(1)}%`;
}

function TestModal({ test, pages, onClose }: {
  test: Partial<ABTest> | null;
  pages: Array<{ slug: string; title: string }>;
  onClose: () => void;
}) {
  const isNew = !test?.id;
  const [name, setName] = useState(test?.name ?? "");
  const [description, setDescription] = useState(test?.description ?? "");
  const [targetPath, setTargetPath] = useState(test?.targetPath ?? "/");
  const [goalType, setGoalType] = useState<GoalType>(test?.goalType ?? "page_visit");
  const [goalPath, setGoalPath] = useState(test?.goalPath ?? "/checkout/success");
  const [variants, setVariants] = useState<ABVariant[]>(
    test?.variants ?? [
      { id: crypto.randomUUID(), name: "Control (original)", weight: 50, pageSlug: "", description: "" },
      { id: crypto.randomUUID(), name: "Variant B", weight: 50, pageSlug: "", description: "" },
    ]
  );

  const totalWeight = variants.reduce((s, v) => s + v.weight, 0);

  function addVariant() {
    setVariants([...variants, { id: crypto.randomUUID(), name: `Variant ${String.fromCharCode(65 + variants.length)}`, weight: 0, pageSlug: "", description: "" }]);
  }

  function removeVariant(id: string) {
    if (variants.length <= 2) return;
    setVariants(variants.filter((v) => v.id !== id));
  }

  function patchVariant(id: string, patch: Partial<ABVariant>) {
    setVariants(variants.map((v) => v.id === id ? { ...v, ...patch } : v));
  }

  function distributeEvenly() {
    const w = Math.floor(100 / variants.length);
    const rem = 100 - w * variants.length;
    setVariants(variants.map((v, i) => ({ ...v, weight: w + (i === 0 ? rem : 0) })));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (totalWeight !== 100) { notify({ tone: "warn", message: "Variant weights must sum to 100%." }); return; }
    if (isNew) {
      createABTest({ name, description: description || undefined, status: "draft", targetPath, variants, goalType, goalPath: goalPath || undefined });
    } else {
      saveABTest({ ...test as ABTest, name, description: description || undefined, targetPath, variants, goalType, goalPath: goalPath || undefined });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <form onSubmit={submit} className="w-full max-w-2xl bg-brand-black-soft border border-white/10 rounded-2xl my-6 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-xl text-brand-cream">{isNew ? "New split test" : "Edit split test"}</h2>
          <button type="button" onClick={onClose} className="text-brand-cream/40 hover:text-brand-cream text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Test name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            </F>
            <F label="Description (optional)">
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} />
            </F>
            <F label="Target path (URL to intercept)" tipId="split-test.target-path" tip="The URL where visitors land. They'll then be redirected to one of the variants (preserving query strings).">
              <input required value={targetPath} onChange={(e) => setTargetPath(e.target.value)} placeholder="/" className={INPUT} />
              <p className="text-[11px] text-brand-cream/30 mt-1">Visitors to this URL are split between variants.</p>
            </F>
            <F label="Goal type" tipId="split-test.goal-type" tip="What you're measuring. Page visit fires when a user reaches goalPath. Add to cart fires on cart updates. Purchase fires on /checkout/success.">
              <select value={goalType} onChange={(e) => setGoalType(e.target.value as GoalType)} className={INPUT}>
                {Object.entries(GOAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </F>
            {goalType === "page_visit" && (
              <F label="Goal URL (conversion page)">
                <input value={goalPath} onChange={(e) => setGoalPath(e.target.value)} placeholder="/checkout/success" className={INPUT} />
              </F>
            )}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/40">Variants</p>
              <div className="flex gap-2">
                <button type="button" onClick={distributeEvenly} className="text-[11px] text-brand-amber hover:text-brand-orange">Distribute evenly</button>
                <button type="button" onClick={addVariant} className="text-[11px] text-brand-orange hover:underline">+ Add variant</button>
              </div>
            </div>
            <div className={`text-xs mb-2 font-mono ${totalWeight === 100 ? "text-green-400" : "text-red-400"}`}>
              Total: {totalWeight}% {totalWeight !== 100 ? "(must be 100%)" : "✓"}
            </div>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={v.id} className="rounded-xl border border-white/8 p-3 space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
                    <F label={i === 0 ? "Variant name" : undefined}>
                      <input value={v.name} onChange={(e) => patchVariant(v.id, { name: e.target.value })} className={INPUT} />
                    </F>
                    <F label={i === 0 ? "Page (leave blank = original)" : undefined}>
                      <select value={v.pageSlug ?? ""} onChange={(e) => patchVariant(v.id, { pageSlug: e.target.value })} className={INPUT}>
                        <option value="">Original page</option>
                        {pages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                      </select>
                    </F>
                    <F label={i === 0 ? "Weight %" : undefined}>
                      <input type="number" min={0} max={100} value={v.weight}
                        onChange={(e) => patchVariant(v.id, { weight: Number(e.target.value) })}
                        className={INPUT + " w-20 font-mono"} />
                    </F>
                    <button type="button" disabled={variants.length <= 2} onClick={() => removeVariant(v.id)}
                      className="text-red-400/50 hover:text-red-400 disabled:opacity-20 disabled:cursor-default text-lg pb-0.5">✕</button>
                  </div>
                  {/* SEO overrides */}
                  <details className="group">
                    <summary className="text-[11px] text-brand-cream/40 hover:text-brand-cream/70 cursor-pointer list-none flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">›</span> SEO overrides (optional)
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <F label="Meta title">
                        <input value={v.seoTitle ?? ""} onChange={(e) => patchVariant(v.id, { seoTitle: e.target.value })} placeholder="Leave blank to use default" className={INPUT} />
                      </F>
                      <F label="Meta description">
                        <input value={v.seoDescription ?? ""} onChange={(e) => patchVariant(v.id, { seoDescription: e.target.value })} placeholder="Leave blank to use default" className={INPUT} />
                      </F>
                      <F label="OG title">
                        <input value={v.seoOgTitle ?? ""} onChange={(e) => patchVariant(v.id, { seoOgTitle: e.target.value })} placeholder="Leave blank to use meta title" className={INPUT} />
                      </F>
                      <F label="OG description">
                        <input value={v.seoOgDescription ?? ""} onChange={(e) => patchVariant(v.id, { seoOgDescription: e.target.value })} placeholder="Leave blank to use meta description" className={INPUT} />
                      </F>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-white/5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-2 text-brand-cream/60 hover:text-brand-cream">Cancel</button>
          <button type="submit" className="text-sm px-5 py-2 bg-brand-orange text-white rounded-xl font-semibold">{isNew ? "Create test" : "Save test"}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminSplitTestPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([]);
  const [modal, setModal] = useState<Partial<ABTest> | null | false>(false);

  useEffect(() => {
    const refresh = () => setTests(listABTests());
    refresh();
    setPages(listPages().filter((p) => p.status === "published").map((p) => ({ slug: p.slug, title: p.title })));
    return onABTestsChange(refresh);
  }, []);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Growth</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Split testing</h1>
            <Tip id="split-test.header" text="Run controlled experiments. Each visitor sees a single variant for the lifetime of the test (sticky bucketing). Statistical significance kicks in around 200+ conversions per variant." align="bottom" />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">A/B test landing pages and measure which variant converts better.</p>
        </div>
        <button onClick={() => setModal({})} className="px-4 py-2 text-sm bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-dark">+ New test</button>
      </div>

      {tests.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-brand-cream/40 text-sm">No tests yet. Create one to start optimising.</p>
          <button onClick={() => setModal({})} className="mt-3 text-brand-orange text-sm hover:underline">Create your first test →</button>
        </div>
      )}

      <div className="space-y-4">
        {tests.map((test) => {
          const totalViews = Object.values(test.stats).reduce((s, v) => s + v.views, 0);
          const topVariant = test.variants.reduce((best, v) => {
            const rate = test.stats[v.id]?.views ? test.stats[v.id].conversions / test.stats[v.id].views : 0;
            const bestRate = test.stats[best.id]?.views ? test.stats[best.id].conversions / test.stats[best.id].views : 0;
            return rate > bestRate ? v : best;
          }, test.variants[0]);

          return (
            <div key={test.id} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-brand-cream">{test.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[test.status]}`}>{test.status}</span>
                  </div>
                  <p className="text-xs text-brand-cream/40 mt-0.5">
                    {test.targetPath} · {GOAL_LABELS[test.goalType]} · {totalViews} total views
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {test.status === "draft" && <button onClick={() => setABTestStatus(test.id, "running")} className="text-xs px-3 py-1.5 bg-green-600/80 text-white rounded-lg font-semibold">Start</button>}
                  {test.status === "running" && <button onClick={() => setABTestStatus(test.id, "paused")} className="text-xs px-3 py-1.5 border border-brand-amber/40 text-brand-amber rounded-lg">Pause</button>}
                  {test.status === "paused" && <button onClick={() => setABTestStatus(test.id, "running")} className="text-xs px-3 py-1.5 bg-green-600/80 text-white rounded-lg font-semibold">Resume</button>}
                  {(test.status === "running" || test.status === "paused") && <button onClick={() => setABTestStatus(test.id, "completed")} className="text-xs px-3 py-1.5 border border-white/10 text-brand-cream/50 rounded-lg">End</button>}
                  <button onClick={() => setModal(test)} className="text-xs px-3 py-1.5 border border-white/10 text-brand-cream/50 hover:text-brand-cream rounded-lg">Edit</button>
                  <button onClick={async () => { if (await confirm({ title: "Delete this test?", message: "Test + its results are removed.", danger: true, confirmLabel: "Delete" })) deleteABTest(test.id); }} className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg">Delete</button>
                </div>
              </div>

              {/* Variant stats */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="text-left px-5 py-2 text-xs text-brand-cream/40 font-medium">Variant</th>
                      <th className="text-right px-4 py-2 text-xs text-brand-cream/40 font-medium">Weight</th>
                      <th className="text-right px-4 py-2 text-xs text-brand-cream/40 font-medium">Views</th>
                      <th className="text-right px-4 py-2 text-xs text-brand-cream/40 font-medium">Conversions</th>
                      <th className="text-right px-4 py-2 text-xs text-brand-cream/40 font-medium">Conv. rate</th>
                      <th className="text-right px-5 py-2 text-xs text-brand-cream/40 font-medium">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.variants.map((v) => {
                      const s = test.stats[v.id] ?? { views: 0, conversions: 0 };
                      const isTop = v.id === topVariant?.id && totalViews > 0 && test.status !== "draft";
                      return (
                        <tr key={v.id} className={`border-b border-white/5 last:border-0 ${isTop ? "bg-green-500/5" : ""}`}>
                          <td className="px-5 py-2.5 text-brand-cream/80">
                            <span className="flex items-center gap-2">
                              {v.name}
                              {isTop && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">winning</span>}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-brand-cream/50 font-mono">{v.weight}%</td>
                          <td className="px-4 py-2.5 text-right text-brand-cream/70 font-mono">{s.views.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right text-brand-cream/70 font-mono">{s.conversions.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-brand-cream">{convRate(s.views, s.conversions)}</td>
                          <td className="px-5 py-2.5 text-right text-xs text-brand-cream/40">{v.pageSlug ? `/p/${v.pageSlug}` : "Original"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {modal !== false && <TestModal test={modal || null} pages={pages} onClose={() => setModal(false)} />}
    </div>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50";

function F({ label, tip, tipId, children }: { label?: string; tip?: string; tipId?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label className="text-xs text-brand-cream/50 mb-1.5 flex items-center gap-1.5">
          {label}
          {tip && <Tip id={tipId} text={tip} />}
        </label>
      )}
      {children}
    </div>
  );
}
