"use client";

import { useEffect, useState } from "react";
import {
  listFlags, saveFlag, createFlag, deleteFlag, setUserOverride,
  onFlagsChange, CATEGORY_LABELS,
  type FeatureFlag, type FlagStatus, type FlagCategory,
} from "@/lib/admin/featureFlags";
import Tip from "@/components/admin/Tip";

const STATUS_STYLE: Record<FlagStatus, string> = {
  on:      "bg-green-500/20 text-green-400",
  off:     "bg-white/8 text-brand-cream/40",
  rollout: "bg-brand-amber/20 text-brand-amber",
};

const STATUS_LABELS: Record<FlagStatus, string> = {
  on: "On", off: "Off", rollout: "Rollout %",
};

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [filter, setFilter] = useState<FlagCategory | "all">("all");
  const [editing, setEditing] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    const refresh = () => setFlags(listFlags());
    refresh();
    return onFlagsChange(refresh);
  }, []);

  const categories = ["all", ...Object.keys(CATEGORY_LABELS)] as Array<FlagCategory | "all">;
  const visible = filter === "all" ? flags : flags.filter(f => f.category === filter);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Growth</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Feature flags</h1>
            <Tip text="Toggle parts of the site without redeploying. Use rollout % to gradually expose new features to a subset of users (deterministic by stable hash of email)." align="bottom" />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">
            Turn features on/off, do percentage rollouts, or override per user. Store future features here until ready to launch.
          </p>
        </div>
        <button
          onClick={() => {
            const name = prompt("Flag name", "New feature");
            if (!name) return;
            const desc = prompt("Description", "") ?? "";
            const cat = (prompt("Category (storefront/marketing/upsell/admin/experimental/future)", "future") ?? "future") as FlagCategory;
            createFlag(name, desc, cat);
          }}
          className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
        >
          + New flag
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              filter === cat ? "bg-brand-orange text-white font-semibold" : "bg-white/5 text-brand-cream/55 hover:text-brand-cream"
            }`}
          >
            {cat === "all" ? "All" : CATEGORY_LABELS[cat as FlagCategory]}
          </button>
        ))}
      </div>

      {/* Flags list */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
        {visible.length === 0 && (
          <div className="px-6 py-10 text-center text-brand-cream/40 text-sm">No flags in this category.</div>
        )}
        {visible.map(flag => (
          <div key={flag.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02]">
            {/* Status toggle */}
            <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
              {(["on", "off", "rollout"] as FlagStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => saveFlag(flag.id, { status: s })}
                  title={s === "on" ? "Always on for everyone" : s === "off" ? "Always off for everyone" : "Use rollout % below"}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    flag.status === s ? STATUS_STYLE[s] : "bg-white/5 text-brand-cream/25 hover:text-brand-cream/50"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-sm font-medium text-brand-cream">{flag.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-brand-cream/40">
                  {CATEGORY_LABELS[flag.category]}
                </span>
                {flag.isBuiltIn && <span className="text-[10px] text-brand-cream/25">built-in</span>}
              </div>
              <p className="text-xs text-brand-cream/45">{flag.description}</p>
              <p className="text-[11px] text-brand-cream/25 font-mono mt-0.5">{flag.id}</p>

              {/* Rollout % slider */}
              {flag.status === "rollout" && (
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min={0} max={100} step={5}
                    value={flag.rolloutPercent}
                    onChange={e => saveFlag(flag.id, { rolloutPercent: Number(e.target.value) })}
                    className="w-32 accent-brand-amber"
                  />
                  <span className="text-xs font-mono text-brand-amber">{flag.rolloutPercent}%</span>
                  <span className="text-[11px] text-brand-cream/35">of users</span>
                  <Tip text="Sticky bucketing: each user is hashed to a stable number 0–99, and stays in or out for the lifetime of this flag. Increase the percentage to widen exposure." />
                </div>
              )}

              {/* Per-user overrides */}
              {Object.entries(flag.userOverrides).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(flag.userOverrides).map(([email, enabled]) => (
                    <span key={email} className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${enabled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {email} ({enabled ? "on" : "off"})
                      <button
                        onClick={() => setUserOverride(flag.id, email, null)}
                        className="opacity-60 hover:opacity-100"
                      >✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(flag)}
                className="text-[11px] text-brand-cream/40 hover:text-brand-cream"
              >
                Edit
              </button>
              {!flag.isBuiltIn && (
                <button
                  onClick={() => { if (confirm(`Delete "${flag.name}"?`)) deleteFlag(flag.id); }}
                  className="text-[11px] text-brand-cream/40 hover:text-brand-orange"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["on", "off", "rollout"] as FlagStatus[]).map(s => (
          <div key={s} className="rounded-xl border border-white/8 bg-brand-black-card px-4 py-3 text-center">
            <p className={`text-2xl font-display font-bold ${s === "on" ? "text-green-400" : s === "rollout" ? "text-brand-amber" : "text-brand-cream/30"}`}>
              {flags.filter(f => f.status === s).length}
            </p>
            <p className="text-xs text-brand-cream/40 mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {editing && <EditModal flag={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditModal({ flag, onClose }: { flag: FeatureFlag; onClose: () => void }) {
  const [name, setName] = useState(flag.name);
  const [description, setDescription] = useState(flag.description);
  const [category, setCategory] = useState(flag.category);
  const [emailOverride, setEmailOverride] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);

  function save() {
    saveFlag(flag.id, { name, description, category });
    onClose();
  }

  function addOverride() {
    if (!emailOverride.includes("@")) return;
    setUserOverride(flag.id, emailOverride.toLowerCase(), emailEnabled);
    setEmailOverride("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-brand-black-soft border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="font-display text-lg text-brand-cream">Edit flag</h3>
          <button onClick={onClose} className="text-brand-cream/40 hover:text-brand-cream">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-brand-cream/40 mb-1.5">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50" />
          </div>
          <div>
            <label className="block text-xs text-brand-cream/40 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-brand-cream/40 mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as FlagCategory)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream focus:outline-none">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Per-user override */}
          <div>
            <label className="block text-xs text-brand-cream/40 mb-1.5">Add user override</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailOverride}
                onChange={e => setEmailOverride(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
              />
              <select
                value={emailEnabled ? "on" : "off"}
                onChange={e => setEmailEnabled(e.target.value === "on")}
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-brand-cream focus:outline-none"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
              <button
                type="button"
                onClick={addOverride}
                className="text-xs px-3 py-2 rounded-lg bg-brand-orange text-white font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {Object.entries(flag.userOverrides).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(flag.userOverrides).map(([email, enabled]) => (
                <span key={email} className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${enabled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                  {email}
                  <button onClick={() => setUserOverride(flag.id, email, null)} className="opacity-60 hover:opacity-100">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-white/8 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 text-brand-cream/55 hover:text-brand-cream">Cancel</button>
          <button onClick={save} className="text-sm px-5 py-2 bg-brand-orange text-white rounded-xl font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}
