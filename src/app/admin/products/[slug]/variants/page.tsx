"use client";

// /admin/products/[slug]/variants — manage option groups + variants.
//
// The admin workflow:
//   1. Add option groups (Colour, Size, Material…) with the right
//      display type (swatch, color-wheel, size, text, image).
//   2. Add values to each group with optional price modifiers, hex
//      colours, images, availability flag.
//   3. Toggle "Allow custom colour" on a colour-wheel option to enable
//      the storefront colour picker; set the surcharge in pence.
//   4. Optionally enumerate explicit variants in the matrix below for
//      per-combination prices / images / SKUs / stock.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Product, ProductOption, ProductOptionDisplay, ProductOptionValue, ProductVariant } from "@/lib/products";
import { getProduct } from "@/lib/products";
import { confirm } from "@/components/admin/ConfirmHost";
import { getCustomProduct, upsertCustomProduct, type CustomProduct } from "@/lib/admin/customProducts";
import AdminTabs from "@/components/admin/AdminTabs";
import { productDetailTabs } from "@/lib/admin/tabSets";

const DISPLAY_TYPES: Array<{ id: ProductOptionDisplay; label: string; help: string }> = [
  { id: "swatch",       label: "Colour swatch", help: "Round colour chips. Set hex on each value." },
  { id: "color-wheel",  label: "Colour + custom", help: "Same as swatch + a custom-colour wheel button." },
  { id: "size",         label: "Size pill",     help: "Pill buttons (label only)." },
  { id: "text",         label: "Text card",     help: "Radio cards with labels." },
  { id: "image",        label: "Image swatch",  help: "Image thumbnails. Set image on each value." },
];

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

function makeId(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 8)}`; }
function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function ProductVariantsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [customSurcharge, setCustomSurcharge] = useState<number>(0);
  const [isCustom, setIsCustom] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = getProduct(slug);
    if (!p) { setError("Product not found"); return; }
    setProduct(p);
    setOptions(p.options ?? []);
    setVariants(p.variants ?? []);
    setCustomSurcharge(p.customColorSurcharge ?? 0);
    setIsCustom(Boolean(getCustomProduct(slug)));
  }, [slug]);

  function persist(nextOptions: ProductOption[], nextVariants: ProductVariant[], nextSurcharge: number) {
    if (!product) return;
    const cust = getCustomProduct(slug);
    if (!cust) {
      setError("Variants can only be edited on custom products created via /admin/products/new. The seeded catalog is read-only.");
      return;
    }
    const next: CustomProduct = {
      ...cust,
      options: nextOptions,
      variants: nextVariants,
      customColorSurcharge: nextSurcharge,
    };
    upsertCustomProduct(next);
    setSavedAt(Date.now());
    setError(null);
  }

  function commitOptions(next: ProductOption[]) {
    setOptions(next);
    persist(next, variants, customSurcharge);
  }

  function commitVariants(next: ProductVariant[]) {
    setVariants(next);
    persist(options, next, customSurcharge);
  }

  function commitSurcharge(next: number) {
    setCustomSurcharge(next);
    persist(options, variants, next);
  }

  function addOption() {
    const opt: ProductOption = {
      id: makeId("opt"),
      name: "Colour",
      displayType: "swatch",
      values: [],
      required: true,
    };
    commitOptions([...options, opt]);
  }

  function patchOption(id: string, patch: Partial<ProductOption>) {
    commitOptions(options.map(o => o.id === id ? { ...o, ...patch } : o));
  }

  async function removeOption(id: string) {
    if (!(await confirm({ title: "Remove this option group?", message: "All its values will be deleted.", danger: true, confirmLabel: "Remove" }))) return;
    commitOptions(options.filter(o => o.id !== id));
    commitVariants(variants.filter(v => !(id in v.optionValues)));
  }

  function addValue(optionId: string) {
    commitOptions(options.map(o => o.id === optionId ? {
      ...o,
      values: [...o.values, { id: makeId("val"), label: "New value" }],
    } : o));
  }

  function patchValue(optionId: string, valueId: string, patch: Partial<ProductOptionValue>) {
    commitOptions(options.map(o => o.id === optionId ? {
      ...o,
      values: o.values.map(v => v.id === valueId ? { ...v, ...patch } : v),
    } : o));
  }

  function removeValue(optionId: string, valueId: string) {
    commitOptions(options.map(o => o.id === optionId ? {
      ...o,
      values: o.values.filter(v => v.id !== valueId),
    } : o));
  }

  // Auto-generate variant matrix entries for each combination of values.
  // Existing variants keep their price/image/stock; new combinations get
  // default values pulled from the product's base price.
  function generateMatrix() {
    if (!product) return;
    if (options.length === 0) { commitVariants([]); return; }
    const combos = cartesian(options.map(o => o.values.map(v => ({ optionId: o.id, valueId: v.id }))));
    const next: ProductVariant[] = combos.map(combo => {
      const optionValues: Record<string, string> = {};
      for (const c of combo) optionValues[c.optionId] = c.valueId;
      const existing = variants.find(v => keyEqual(v.optionValues, optionValues));
      return existing ?? {
        id: makeId("var"),
        optionValues,
        price: product.price,
      };
    });
    commitVariants(next);
  }

  function patchVariant(id: string, patch: Partial<ProductVariant>) {
    commitVariants(variants.map(v => v.id === id ? { ...v, ...patch } : v));
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-[12px] text-brand-cream/55">
        {error ?? "Loading…"}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <AdminTabs tabs={productDetailTabs(product.slug)} ariaLabel="Product" />

      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Variants</p>
          <h1 className="font-display text-3xl text-brand-cream">{product.name}</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1 font-mono">{product.slug}</p>
        </div>
        <Link href={`/admin/products/${product.slug}`} className="text-[11px] text-brand-cream/55 hover:text-brand-cream">← Back to product</Link>
      </header>

      {!isCustom && (
        <div className="rounded-xl border border-brand-amber/30 bg-brand-amber/5 px-4 py-3 text-[12px] text-brand-amber/85">
          This is a seeded catalog product — its options + variants live in code, not the admin store. Use <Link href="/admin/products/new" className="underline">/admin/products/new</Link> to create a custom product whose variants you can edit here.
        </div>
      )}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}

      <div className="flex items-center gap-3">
        <button onClick={addOption} disabled={!isCustom} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold disabled:opacity-30 hover:opacity-90">+ Add option group</button>
        {savedAt && <span className="text-[11px] text-brand-cream/55">Saved</span>}
      </div>

      {/* Option groups */}
      <div className="space-y-3">
        {options.map(option => (
          <div key={option.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
              <input
                value={option.name}
                onChange={e => patchOption(option.id, { name: e.target.value, id: slugify(e.target.value) || option.id })}
                disabled={!isCustom}
                className="flex-1 bg-transparent text-brand-cream text-sm font-semibold focus:outline-none focus:bg-white/5 px-2 py-1 rounded"
              />
              <select
                value={option.displayType}
                onChange={e => patchOption(option.id, { displayType: e.target.value as ProductOptionDisplay })}
                disabled={!isCustom}
                className={INPUT + " w-44"}
              >
                {DISPLAY_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              {option.displayType === "color-wheel" && (
                <label className="flex items-center gap-2 text-[11px] text-brand-cream/65 whitespace-nowrap">
                  <input type="checkbox" checked={option.allowCustom === true} onChange={e => patchOption(option.id, { allowCustom: e.target.checked })} disabled={!isCustom} />
                  Allow custom colours
                </label>
              )}
              <button onClick={() => removeOption(option.id)} disabled={!isCustom} className="text-[11px] text-brand-cream/55 hover:text-red-400 disabled:opacity-30">Remove</button>
            </div>
            <div className="p-3 space-y-2">
              {option.values.length === 0 && (
                <p className="text-[11px] text-brand-cream/45 px-2 py-2">No values yet. Add at least one.</p>
              )}
              {option.values.map(value => (
                <div key={value.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    value={value.label}
                    onChange={e => patchValue(option.id, value.id, { label: e.target.value, id: slugify(e.target.value) || value.id })}
                    disabled={!isCustom}
                    placeholder="Label"
                    className={INPUT + " col-span-3"}
                  />
                  {(option.displayType === "swatch" || option.displayType === "color-wheel") && (
                    <div className="col-span-3 flex gap-1">
                      <input
                        type="color"
                        value={value.hexColor ?? "#888888"}
                        onChange={e => patchValue(option.id, value.id, { hexColor: e.target.value })}
                        disabled={!isCustom}
                        className="w-9 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                      />
                      <input
                        value={value.hexColor ?? ""}
                        onChange={e => patchValue(option.id, value.id, { hexColor: e.target.value })}
                        disabled={!isCustom}
                        placeholder="#hex"
                        className={INPUT + " font-mono"}
                      />
                    </div>
                  )}
                  {option.displayType === "image" && (
                    <input
                      value={value.image ?? ""}
                      onChange={e => patchValue(option.id, value.id, { image: e.target.value })}
                      disabled={!isCustom}
                      placeholder="Image URL"
                      className={INPUT + " col-span-3"}
                    />
                  )}
                  {option.displayType !== "swatch" && option.displayType !== "color-wheel" && option.displayType !== "image" && (
                    <div className="col-span-3" />
                  )}
                  <input
                    type="number"
                    value={value.priceModifier ?? ""}
                    onChange={e => patchValue(option.id, value.id, { priceModifier: e.target.value === "" ? undefined : Number(e.target.value) })}
                    placeholder="+/- pence"
                    disabled={!isCustom}
                    className={INPUT + " col-span-2"}
                    title="Price modifier in pence (e.g. 500 = +£5.00)"
                  />
                  <label className="col-span-3 flex items-center gap-2 text-[11px] text-brand-cream/65">
                    <input type="checkbox" checked={value.available !== false} onChange={e => patchValue(option.id, value.id, { available: e.target.checked })} disabled={!isCustom} />
                    Available
                  </label>
                  <button onClick={() => removeValue(option.id, value.id)} disabled={!isCustom} className="col-span-1 text-[11px] text-brand-cream/45 hover:text-red-400 disabled:opacity-30">×</button>
                </div>
              ))}
              <button onClick={() => addValue(option.id)} disabled={!isCustom} className="text-[11px] text-brand-orange/80 hover:text-brand-orange disabled:opacity-30 mt-1">+ Add value</button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom-colour surcharge */}
      {options.some(o => o.displayType === "color-wheel" && o.allowCustom) && (
        <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-4">
          <p className="text-[11px] tracking-[0.18em] uppercase text-brand-amber/85 mb-2">Custom colour surcharge</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={customSurcharge}
              onChange={e => commitSurcharge(Number(e.target.value) || 0)}
              disabled={!isCustom}
              placeholder="500"
              className={INPUT + " w-32"}
            />
            <span className="text-[12px] text-brand-cream/55">pence — added when a customer picks a custom colour from the wheel ({customSurcharge ? `+£${(customSurcharge / 100).toFixed(2)}` : "free"})</span>
          </div>
        </div>
      )}

      {/* Variant matrix */}
      {options.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">Variants</p>
            <button onClick={generateMatrix} disabled={!isCustom} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] disabled:opacity-30">
              Generate matrix from options ({options.reduce((acc, o) => acc * Math.max(1, o.values.length), 1)})
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-brand-cream/45 text-center">
              Optional — generate the matrix to give every combination its own price + stock. If you skip this step, prices fall back to the option-value modifiers.
            </p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-brand-cream/45 border-b border-white/5">
                  {options.map(o => <th key={o.id} className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">{o.name}</th>)}
                  <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Price (pence)</th>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">SKU</th>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Stock</th>
                  <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Image</th>
                </tr>
              </thead>
              <tbody>
                {variants.map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    {options.map(o => {
                      const valueId = v.optionValues[o.id];
                      const value = o.values.find(val => val.id === valueId);
                      return <td key={o.id} className="px-3 py-2 text-brand-cream/85">{value?.label ?? "—"}</td>;
                    })}
                    <td className="px-3 py-2"><input type="number" value={v.price} onChange={e => patchVariant(v.id, { price: Number(e.target.value) || 0 })} disabled={!isCustom} className={INPUT + " w-24"} /></td>
                    <td className="px-3 py-2"><input value={v.sku ?? ""} onChange={e => patchVariant(v.id, { sku: e.target.value || undefined })} disabled={!isCustom} className={INPUT + " w-32"} /></td>
                    <td className="px-3 py-2"><input type="number" value={v.available ?? ""} onChange={e => patchVariant(v.id, { available: e.target.value === "" ? undefined : Number(e.target.value) })} disabled={!isCustom} className={INPUT + " w-20"} /></td>
                    <td className="px-3 py-2"><input value={v.image ?? ""} onChange={e => patchVariant(v.id, { image: e.target.value || undefined })} disabled={!isCustom} placeholder="Image URL" className={INPUT + " w-48"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>((acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])), [[]]);
}

function keyEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}
