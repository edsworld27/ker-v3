"use client";

import { useEffect, useState } from "react";
import {
  listFunnels, createFunnel, saveFunnel, deleteFunnel, setFunnelStatus,
  funnelConversionRate, onFunnelsChange,
  type Funnel, type FunnelStep, type FunnelStatus, type StepType,
} from "@/lib/admin/funnels";
import PluginRequired from "@/components/admin/PluginRequired";

const STATUS_STYLE: Record<FunnelStatus, string> = {
  active: "bg-green-500/20 text-green-400",
  paused: "bg-brand-amber/20 text-brand-amber",
  draft: "bg-white/10 text-brand-cream/50",
};

const STEP_TYPE_ICONS: Record<StepType, string> = {
  page: "📄",
  product: "🛒",
  checkout: "💳",
  external: "🔗",
};

const STEP_TYPE_LABELS: Record<StepType, string> = {
  page: "Custom page",
  product: "Product page",
  checkout: "Checkout / cart",
  external: "External URL",
};

function FunnelModal({ funnel, onClose }: { funnel: Partial<Funnel> | null; onClose: () => void }) {
  const isNew = !funnel?.id;
  const [name, setName] = useState(funnel?.name ?? "");
  const [description, setDescription] = useState(funnel?.description ?? "");
  const [steps, setSteps] = useState<FunnelStep[]>(
    funnel?.steps ?? []
  );

  function addStep() {
    setSteps([...steps, {
      id: crypto.randomUUID(),
      name: `Step ${steps.length + 1}`,
      type: "page",
      path: "",
      description: "",
      stats: { reached: 0, completed: 0 },
    }]);
  }

  function removeStep(id: string) {
    setSteps(steps.filter((s) => s.id !== id));
  }

  function patchStep(id: string, patch: Partial<FunnelStep>) {
    setSteps(steps.map((s) => s.id === id ? { ...s, ...patch } : s));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (steps.length < 2) { alert("A funnel needs at least 2 steps"); return; }
    if (steps.some((s) => !s.path)) { alert("All steps need a path"); return; }
    if (isNew) {
      createFunnel({ name, description: description || undefined, status: "draft", steps });
    } else {
      saveFunnel({ ...funnel as Funnel, name, description: description || undefined, steps });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-start justify-center">
      <form onSubmit={submit} className="w-full max-w-2xl bg-brand-black-soft border border-white/10 rounded-2xl my-6 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-xl text-brand-cream">{isNew ? "New funnel" : "Edit funnel"}</h2>
          <button type="button" onClick={onClose} className="text-brand-cream/40 hover:text-brand-cream text-xl">✕</button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Funnel name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            </F>
            <F label="Description (optional)">
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} />
            </F>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/40">Steps</p>
              <button type="button" onClick={addStep} className="text-xs text-brand-orange hover:underline">+ Add step</button>
            </div>

            {steps.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-brand-cream/35">Add at least 2 steps to define the funnel flow.</p>
                <button type="button" onClick={addStep} className="mt-2 text-xs text-brand-orange hover:underline">+ Add first step</button>
              </div>
            )}

            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-2 items-start">
                  {/* Connector line */}
                  <div className="flex flex-col items-center shrink-0 mt-3">
                    <div className="w-6 h-6 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-[11px] text-brand-orange font-bold">{i + 1}</div>
                    {i < steps.length - 1 && <div className="w-px h-6 bg-brand-orange/20 mt-1" />}
                  </div>
                  <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                    <select value={step.type} onChange={(e) => patchStep(step.id, { type: e.target.value as StepType })}
                      className="text-sm bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-brand-cream focus:outline-none focus:border-brand-orange/50">
                      {Object.entries(STEP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input value={step.name} onChange={(e) => patchStep(step.id, { name: e.target.value })}
                      placeholder="Step name" className={INPUT} />
                    <input value={step.path} onChange={(e) => patchStep(step.id, { path: e.target.value })}
                      placeholder="/p/page-slug or /products/soap" className={INPUT} />
                  </div>
                  {/* Open this step's page in the visual editor. We pass
                      the slug as a query string so the pages list can
                      jump straight to it. */}
                  {step.path && (step.type === "page" || step.type === "checkout") && (
                    <a
                      href={`/admin/sites?openSlug=${encodeURIComponent(step.path)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open this step's page in the visual editor"
                      className="text-cyan-400/80 hover:text-cyan-400 mt-2 text-xs whitespace-nowrap"
                    >
                      Edit ↗
                    </a>
                  )}
                  <button type="button" onClick={() => removeStep(step.id)}
                    className="text-red-400/50 hover:text-red-400 mt-2 text-lg leading-none">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-2 text-brand-cream/60 hover:text-brand-cream">Cancel</button>
          <button type="submit" className="text-sm px-5 py-2 bg-brand-orange text-white rounded-xl font-semibold">{isNew ? "Create funnel" : "Save funnel"}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminFunnelsPage() {
  return <PluginRequired plugin="funnels" feature="funnels"><AdminFunnelsPageInner /></PluginRequired>;
}

function AdminFunnelsPageInner() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [modal, setModal] = useState<Partial<Funnel> | null | false>(false);

  useEffect(() => {
    const refresh = () => setFunnels(listFunnels());
    refresh();
    return onFunnelsChange(refresh);
  }, []);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Growth</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Funnels</h1>
          <p className="text-brand-cream/45 text-sm mt-1">Build multi-step funnels and track drop-off at each stage.</p>
        </div>
        <button onClick={() => setModal({})} className="px-4 py-2 text-sm bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-dark">+ New funnel</button>
      </div>

      {funnels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-brand-cream/40 text-sm">No funnels yet.</p>
          <button onClick={() => setModal({})} className="mt-3 text-brand-orange text-sm hover:underline">Build your first funnel →</button>
        </div>
      )}

      <div className="space-y-4">
        {funnels.map((funnel) => {
          const cr = funnelConversionRate(funnel);
          const totalReached = funnel.steps[0]?.stats.reached ?? 0;

          return (
            <div key={funnel.id} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-brand-cream">{funnel.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[funnel.status]}`}>{funnel.status}</span>
                  </div>
                  {funnel.description && <p className="text-xs text-brand-cream/40 mt-0.5">{funnel.description}</p>}
                  <p className="text-xs text-brand-cream/30 mt-0.5">{funnel.steps.length} steps · {totalReached} entered · {cr}% overall conversion</p>
                </div>
                <div className="flex gap-2 items-center">
                  {funnel.status === "draft" && <button onClick={() => setFunnelStatus(funnel.id, "active")} className="text-xs px-3 py-1.5 bg-green-600/80 text-white rounded-lg font-semibold">Activate</button>}
                  {funnel.status === "active" && <button onClick={() => setFunnelStatus(funnel.id, "paused")} className="text-xs px-3 py-1.5 border border-brand-amber/40 text-brand-amber rounded-lg">Pause</button>}
                  {funnel.status === "paused" && <button onClick={() => setFunnelStatus(funnel.id, "active")} className="text-xs px-3 py-1.5 bg-green-600/80 text-white rounded-lg font-semibold">Resume</button>}
                  <button onClick={() => setModal(funnel)} className="text-xs px-3 py-1.5 border border-white/10 text-brand-cream/50 hover:text-brand-cream rounded-lg">Edit</button>
                  <button onClick={() => { if (confirm("Delete this funnel?")) deleteFunnel(funnel.id); }} className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg">Delete</button>
                </div>
              </div>

              {/* Steps flow */}
              <div className="px-5 py-4 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max">
                  {funnel.steps.map((step, i) => {
                    const dropOff = i > 0 && funnel.steps[i - 1].stats.reached > 0
                      ? Math.round((1 - step.stats.reached / funnel.steps[i - 1].stats.reached) * 100)
                      : null;

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center text-center w-32">
                          <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-sm mb-1.5">
                            {STEP_TYPE_ICONS[step.type]}
                          </div>
                          <p className="text-xs font-medium text-brand-cream/80 leading-tight">{step.name}</p>
                          <p className="text-[10px] text-brand-cream/35 mt-0.5 leading-tight">{step.path}</p>
                          <p className="text-xs font-mono text-brand-cream/60 mt-1.5">{step.stats.reached.toLocaleString()}</p>
                          <p className="text-[10px] text-brand-cream/30">reached</p>
                        </div>
                        {i < funnel.steps.length - 1 && (
                          <div className="flex flex-col items-center mx-2">
                            <div className="flex items-center gap-1">
                              <div className="w-8 h-px bg-white/10" />
                              <span className="text-brand-cream/20">→</span>
                              <div className="w-8 h-px bg-white/10" />
                            </div>
                            {dropOff !== null && (
                              <span className="text-[10px] text-red-400/70 mt-0.5 font-mono">
                                −{dropOff}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Conversion endpoint */}
                  {funnel.steps.length > 0 && (
                    <div className="flex items-center">
                      <div className="flex items-center gap-1 mx-2">
                        <div className="w-8 h-px bg-green-500/20" />
                        <span className="text-green-500/40">→</span>
                      </div>
                      <div className="flex flex-col items-center text-center w-24">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-sm mb-1.5">✓</div>
                        <p className="text-xs font-medium text-green-400/80">Converted</p>
                        <p className="text-xs font-mono text-green-400/60 mt-1.5">{cr}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal !== false && <FunnelModal funnel={modal || null} onClose={() => setModal(false)} />}
    </div>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50";

function F({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs text-brand-cream/50 mb-1.5">{label}</label>}
      {children}
    </div>
  );
}
