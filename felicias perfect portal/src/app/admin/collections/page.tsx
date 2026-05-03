"use client";

import { useEffect, useState } from "react";
import {
  listCustomCollections,
  upsertCollection,
  deleteCollection,
  onCollectionsChange,
  type Collection,
} from "@/lib/admin/collections";
import PluginRequired from "@/components/admin/PluginRequired";

export default function AdminCollectionsPage() {
  return <PluginRequired plugin="ecommerce"><AdminCollectionsPageInner /></PluginRequired>;
}

function AdminCollectionsPageInner() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const refresh = () => setCollections(listCustomCollections());
    refresh();
    return onCollectionsChange(refresh);
  }, []);

  function startNew() {
    setEditing({ slug: "", label: "", sub: "" });
    setIsNew(true);
  }

  function startEdit(col: Collection) {
    setEditing({ ...col });
    setIsNew(false);
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.label.trim()) return;
    upsertCollection({ ...editing, slug: editing.slug.trim() });
    setEditing(null);
  }

  function handleDelete(slug: string) {
    if (!confirm(`Delete collection "${slug}"? Products in this collection won't be deleted.`)) return;
    deleteCollection(slug);
  }

  const BUILT_IN = ["odo", "nkrabea", "unisex"];

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-3xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Catalogue</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Collections</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          Manage custom product collections. Built-in ranges (Odo, Nkrabea, Black Soap) are always available.
        </p>
      </div>

      {/* Built-in */}
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
        <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/40 mb-4">Built-in collections</h2>
        <div className="space-y-2">
          {[
            { slug: "odo",     label: "Odo · For Her",        sub: "Heritage skincare for women" },
            { slug: "nkrabea", label: "Nkrabea · For Him",    sub: "Strength rituals for men" },
            { slug: "unisex",  label: "Felicia's Black Soap", sub: "World renowned formula" },
          ].map(c => (
            <div key={c.slug} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5">
              <div>
                <p className="text-sm text-brand-cream">{c.label}</p>
                <p className="text-[11px] text-brand-cream/40">{c.sub}</p>
              </div>
              <span className="text-[10px] text-brand-cream/30 font-mono">{c.slug}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Custom */}
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-[0.22em] uppercase text-brand-cream/40">Custom collections</h2>
          <button
            onClick={startNew}
            className="text-xs px-3 py-1.5 rounded-lg bg-brand-orange/15 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/25"
          >
            + Add collection
          </button>
        </div>

        {collections.filter(c => !BUILT_IN.includes(c.slug)).length === 0 && !isNew && (
          <p className="text-sm text-brand-cream/30 py-4 text-center">No custom collections yet.</p>
        )}

        <div className="space-y-2">
          {collections.filter(c => !BUILT_IN.includes(c.slug)).map(col => (
            <div key={col.slug} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${col.archived ? "border-white/5 opacity-50" : "border-white/8 bg-white/3"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-cream">{col.label}</p>
                <p className="text-[11px] text-brand-cream/40">{col.sub || "—"}</p>
              </div>
              <span className="text-[10px] text-brand-cream/30 font-mono shrink-0">{col.slug}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(col)}
                  className="text-xs px-2.5 py-1 rounded border border-white/15 text-brand-cream/60 hover:text-brand-cream"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(col.slug)}
                  className="text-xs px-2.5 py-1 rounded border border-white/15 text-brand-cream/40 hover:text-brand-orange"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit / new form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-black-card border border-white/15 rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xl text-brand-cream">{isNew ? "New collection" : "Edit collection"}</h3>

            <label className="block">
              <span className="block text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">Label *</span>
              <input
                value={editing.label}
                onChange={e => setEditing({ ...editing, label: e.target.value })}
                placeholder="e.g. Gift Sets"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40 placeholder:text-brand-cream/25"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">Slug (URL handle) *</span>
              <input
                value={editing.slug}
                readOnly={!isNew}
                onChange={e => isNew && setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                placeholder="gift-sets"
                className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40 placeholder:text-brand-cream/25 ${!isNew ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">Subtitle</span>
              <input
                value={editing.sub}
                onChange={e => setEditing({ ...editing, sub: e.target.value })}
                placeholder="e.g. Curated ritual bundles"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40 placeholder:text-brand-cream/25"
              />
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-white/20">
              <input
                type="checkbox"
                checked={!!editing.archived}
                onChange={e => setEditing({ ...editing, archived: e.target.checked })}
                className="w-4 h-4 accent-brand-orange"
              />
              <span className="text-sm text-brand-cream">Archive (hide from shop)</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="text-sm text-brand-cream/50 hover:text-brand-cream px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editing.slug.trim() || !editing.label.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-40 text-white text-sm font-semibold transition-colors"
              >
                {isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
