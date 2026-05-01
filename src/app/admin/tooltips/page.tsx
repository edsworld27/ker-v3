"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DEFAULT_TOOLTIPS, listTooltipOverrides,
  saveTooltipOverride, resetTooltipOverride, resetAllTooltipOverrides,
  onTooltipsChange,
} from "@/lib/admin/tooltips";
import Tip from "@/components/admin/Tip";

export default function AdminTooltipsPage() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [query,     setQuery]     = useState("");
  const [filter,    setFilter]    = useState<"all" | "edited" | "default">("all");
  const [drafts,    setDrafts]    = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setOverrides(listTooltipOverrides());
    refresh();
    return onTooltipsChange(refresh);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    Object.values(DEFAULT_TOOLTIPS).forEach(t => set.add(t.category));
    return [...set].sort();
  }, []);

  function flash(id: string) {
    setSavedFlash(id);
    setTimeout(() => setSavedFlash(null), 1400);
  }

  function handleSave(id: string) {
    const draft = drafts[id];
    if (draft === undefined) return;
    const def = DEFAULT_TOOLTIPS[id]?.text ?? "";
    if (draft === def || draft.trim() === "") {
      resetTooltipOverride(id);
    } else {
      saveTooltipOverride(id, draft);
    }
    setDrafts(d => { const n = { ...d }; delete n[id]; return n; });
    flash(id);
  }

  function handleReset(id: string) {
    resetTooltipOverride(id);
    setDrafts(d => { const n = { ...d }; delete n[id]; return n; });
    flash(id);
  }

  function visible(id: string, def: typeof DEFAULT_TOOLTIPS[string]) {
    if (filter === "edited" && !(id in overrides)) return false;
    if (filter === "default" && (id in overrides)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      id.toLowerCase().includes(q)
      || def.text.toLowerCase().includes(q)
      || def.location.toLowerCase().includes(q)
      || (overrides[id] ?? "").toLowerCase().includes(q)
    );
  }

  const editedCount = Object.keys(overrides).length;
  const totalCount  = Object.keys(DEFAULT_TOOLTIPS).length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Help & onboarding</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Tooltips</h1>
            <Tip
              id="tooltips.header"
              text="Every ? icon in the admin reads from this catalog. Edit a tooltip here and live <Tip> instances re-render across the panel without a refresh."
              align="bottom"
            />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">
            Edit the help text shown next to admin form fields.
            <span className="text-brand-cream/30 ml-2">{editedCount} edited · {totalCount} total</span>
          </p>
        </div>
        <button
          onClick={() => {
            if (editedCount > 0 && confirm(`Reset all ${editedCount} edited tooltip(s) back to defaults?`)) {
              resetAllTooltipOverrides();
              setDrafts({});
            }
          }}
          disabled={editedCount === 0}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset all
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tooltips, locations or text…"
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/40 w-full sm:w-72"
        />
        <div className="flex gap-1 p-1 bg-brand-black-card border border-white/8 rounded-lg">
          {(["all", "edited", "default"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs capitalize transition-colors ${
                filter === f ? "bg-brand-orange text-white" : "text-brand-cream/55 hover:text-brand-cream"
              }`}
            >
              {f}{f === "edited" ? ` (${editedCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Tooltips by category */}
      {categories.map(cat => {
        const items = Object.entries(DEFAULT_TOOLTIPS)
          .filter(([id, def]) => def.category === cat && visible(id, def));
        if (items.length === 0) return null;
        return (
          <div key={cat} className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5 bg-brand-black-soft/40">
              <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/60">{cat}</h2>
            </div>
            <div className="divide-y divide-white/5">
              {items.map(([id, def]) => {
                const override = overrides[id];
                const drafted  = drafts[id];
                const current  = drafted !== undefined ? drafted : (override ?? def.text);
                const dirty    = drafted !== undefined && drafted !== (override ?? def.text);
                const edited   = override !== undefined;

                return (
                  <div key={id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-[11px] text-brand-cream/45">{id}</span>
                      {edited && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-amber/15 text-brand-amber font-semibold uppercase tracking-wider">
                          Edited
                        </span>
                      )}
                      {savedFlash === id && (
                        <span className="text-[10px] text-green-400">✓ Saved</span>
                      )}
                      <span className="ml-auto text-[11px] text-brand-cream/30">{def.location}</span>
                    </div>
                    <textarea
                      value={current}
                      onChange={e => setDrafts(d => ({ ...d, [id]: e.target.value }))}
                      onKeyDown={e => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleSave(id);
                        }
                      }}
                      rows={Math.max(2, Math.ceil(current.length / 90))}
                      className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2 text-sm text-brand-cream/85 leading-relaxed focus:outline-none focus:border-brand-orange/40 resize-y"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleSave(id)}
                        disabled={!dirty}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      {edited && (
                        <button
                          onClick={() => handleReset(id)}
                          className="text-[11px] px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream"
                        >
                          Reset to default
                        </button>
                      )}
                      {dirty && (
                        <span className="text-[11px] text-brand-amber/70">Unsaved · ⌘+Enter to save</span>
                      )}
                    </div>
                    {edited && !dirty && (
                      <p className="text-[11px] text-brand-cream/30 mt-1.5">
                        Default: <span className="italic">{def.text}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(DEFAULT_TOOLTIPS).every(id => !visible(id, DEFAULT_TOOLTIPS[id])) && (
        <div className="text-center py-10 text-brand-cream/40 text-sm">
          No tooltips match your filter.
        </div>
      )}
    </div>
  );
}
