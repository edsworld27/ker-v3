"use client";

import { useEffect, useState } from "react";
import {
  listReviews,
  upsertReview,
  deleteReview,
  nextReviewId,
  onReviewsChange,
  type AdminReview,
} from "@/lib/admin/reviews";
import { getProducts, type Product } from "@/lib/products";
import PluginRequired from "@/components/admin/PluginRequired";

export default function AdminReviewsPage() {
  return <PluginRequired plugin="ecommerce" feature="reviews"><AdminReviewsPageInner /></PluginRequired>;
}

function AdminReviewsPageInner() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<AdminReview | null>(null);
  const [filterSlug, setFilterSlug] = useState<string>("all");

  useEffect(() => {
    const refresh = () => { setReviews(listReviews()); setProducts(getProducts()); };
    refresh();
    return onReviewsChange(refresh);
  }, []);

  function startNew() {
    setEditing({
      id: nextReviewId(),
      productSlug: products[0]?.slug ?? "*",
      name: "",
      location: "",
      stars: 5,
      title: "",
      body: "",
      createdAt: Date.now(),
    });
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.body.trim()) return;
    upsertReview(editing);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    deleteReview(id);
  }

  const filtered = reviews.filter(r => filterSlug === "all" || r.productSlug === filterSlug);

  function productName(slug: string): string {
    if (slug === "*") return "Site-wide testimonial";
    return products.find(p => p.slug === slug)?.name ?? slug;
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Social proof</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Reviews</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            {reviews.length} reviews · admin-managed reviews show alongside built-in ones on the storefront
          </p>
        </div>
        <button
          onClick={startNew}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
        >
          + Add review
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] tracking-[0.22em] uppercase text-brand-cream/40">Filter</span>
        <select
          value={filterSlug}
          onChange={e => setFilterSlug(e.target.value)}
          className="bg-brand-black-card border border-white/10 rounded-lg px-3 py-1.5 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/40"
        >
          <option value="all">All products</option>
          <option value="*">Site-wide testimonials</option>
          {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div key={r.id} className={`rounded-2xl border bg-brand-black-card p-5 ${r.hidden ? "opacity-50 border-white/5" : "border-white/8"}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-cream">{r.name}</p>
                <p className="text-[11px] text-brand-cream/40">{r.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-amber text-sm">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
              </div>
            </div>
            {r.title && <p className="text-sm text-brand-cream/85 font-semibold mb-1">{r.title}</p>}
            <p className="text-sm text-brand-cream/65 leading-relaxed mb-3">{r.body}</p>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/40 truncate">
                {productName(r.productSlug)}
                {r.featured && <span className="ml-2 text-brand-orange">· featured</span>}
                {r.hidden && <span className="ml-2 text-brand-cream/30">· hidden</span>}
              </span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditing({ ...r })} className="text-xs px-2.5 py-1 rounded border border-white/15 text-brand-cream/60 hover:text-brand-cream">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="text-xs px-2.5 py-1 rounded border border-white/15 text-brand-cream/40 hover:text-brand-orange">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-brand-cream/40 col-span-2 text-sm py-12 text-center">
            No reviews yet. Click <span className="text-brand-cream">+ Add review</span> to create one.
          </p>
        )}
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-brand-black-card border border-white/15 rounded-2xl p-6 space-y-4 my-8">
            <h3 className="font-display text-xl text-brand-cream">{reviews.find(r => r.id === editing.id) ? "Edit review" : "New review"}</h3>

            <Field label="Product *">
              <select
                value={editing.productSlug}
                onChange={e => setEditing({ ...editing, productSlug: e.target.value })}
                className="input"
              >
                <option value="*">Site-wide testimonial</option>
                {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Customer name *">
                <input
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. Abena K."
                  className="input"
                />
              </Field>
              <Field label="Location">
                <input
                  value={editing.location}
                  onChange={e => setEditing({ ...editing, location: e.target.value })}
                  placeholder="e.g. London, UK"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Rating">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setEditing({ ...editing, stars: n })}
                    className={`text-2xl transition-colors ${n <= editing.stars ? "text-brand-amber" : "text-brand-cream/15 hover:text-brand-cream/40"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Headline — optional">
              <input
                value={editing.title ?? ""}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. My new daily ritual"
                className="input"
                maxLength={80}
              />
            </Field>

            <Field label="Review body *">
              <textarea
                value={editing.body}
                onChange={e => setEditing({ ...editing, body: e.target.value })}
                rows={5}
                placeholder="What did the customer say?"
                className="input resize-y leading-relaxed"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={!!editing.featured}
                  onChange={e => setEditing({ ...editing, featured: e.target.checked })}
                  className="w-4 h-4 accent-brand-orange"
                />
                <span className="text-sm text-brand-cream">Featured</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={!!editing.hidden}
                  onChange={e => setEditing({ ...editing, hidden: e.target.checked })}
                  className="w-4 h-4 accent-brand-orange"
                />
                <span className="text-sm text-brand-cream">Hidden</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="text-sm text-brand-cream/50 hover:text-brand-cream px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editing.name.trim() || !editing.body.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light disabled:opacity-40 text-white text-sm font-semibold transition-colors"
              >
                Save review
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #f5ede1;
        }
        .input:focus { outline: none; border-color: rgba(255,140,80,0.45); }
        .input::placeholder { color: rgba(245,237,225,0.3); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
