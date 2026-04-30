"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertCustomProduct, makeBlankProduct } from "@/lib/admin/customProducts";
import { listCollections } from "@/lib/admin/collections";

export default function AdminNewProductPage() {
  const router = useRouter();
  const collections = listCollections();

  const [name, setName]             = useState("");
  const [slug, setSlug]             = useState("");
  const [tagline, setTagline]       = useState("");
  const [range, setRange]           = useState(collections[0]?.slug ?? "odo");
  const [price, setPrice]           = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage]           = useState("");
  const [badge, setBadge]           = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function autoSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(autoSlug(v));
  }

  function handleSubmit() {
    setError(null);
    if (!name.trim())        { setError("Product name is required."); return; }
    if (!slug.trim())        { setError("Slug is required."); return; }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) { setError("Enter a valid price."); return; }

    const product = makeBlankProduct(slug.trim(), range);
    upsertCustomProduct({
      ...product,
      name: name.trim(),
      tagline: tagline.trim(),
      price: priceNum,
      description: description.split(/\n{2,}/).map(s => s.trim()).filter(Boolean),
      image: image || undefined,
      badge: badge || undefined,
    });
    router.push(`/admin/products/${slug.trim()}`);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-2xl">
      <Link href="/admin/products" className="text-xs text-brand-cream/55 hover:text-brand-cream">← All products</Link>

      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">New product</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Add a product</h1>
        <p className="text-brand-cream/40 text-sm mt-1">Creates a new product in your catalogue. You can edit all details after saving.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-sm text-brand-orange">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 space-y-4">

        <Field label="Product name *">
          <input
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Odo Eye Cream"
            className="input"
          />
        </Field>

        <Field label="Slug (URL handle) *">
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-cream/40 shrink-0">/products/</span>
            <input
              value={slug}
              onChange={e => { setSlug(autoSlug(e.target.value)); setSlugTouched(true); }}
              placeholder="odo-eye-cream"
              className="input"
            />
          </div>
          <p className="text-[10px] text-brand-cream/35 mt-1">Lowercase letters, numbers, and hyphens only. Cannot be changed later.</p>
        </Field>

        <Field label="Collection / range *">
          <select value={range} onChange={e => setRange(e.target.value)} className="input">
            {collections.map(c => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Price (£) *">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="input"
          />
        </Field>

        <Field label="Tagline">
          <input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Brightening · Eye Care"
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            placeholder="Separate paragraphs with a blank line."
            className="input resize-y leading-relaxed"
          />
        </Field>

        <Field label="Image URL — optional">
          <input
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="https://…"
            className="input"
          />
        </Field>

        <Field label="Badge — optional">
          <input
            value={badge}
            onChange={e => setBadge(e.target.value)}
            placeholder="e.g. New, Limited, Best Seller"
            className="input"
            maxLength={30}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href="/admin/products" className="text-sm text-brand-cream/50 hover:text-brand-cream px-4 py-2">
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
        >
          Create product →
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #f5ede1;
          transition: border-color 0.15s;
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
