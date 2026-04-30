"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProduct, type Product } from "@/lib/products";
import { clearOverride, getOverride, saveOverride } from "@/lib/admin/productOverrides";
import { listInventory, adjustStock, upsertInventory, type InventoryItem } from "@/lib/admin/inventory";

const MAX_IMAGE_BYTES = 600 * 1024; // 600KB cap for localStorage uploads

export default function AdminProductEditPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [hasOverride, setHasOverride] = useState(false);

  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [archived, setArchived] = useState(false);
  const [stockSku, setStockSku] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [linkedItem, setLinkedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (!slug) return;
    const p = getProduct(slug);
    if (!p) return;
    setProduct(p);
    setHasOverride(!!getOverride(slug));
    setPrice(p.price.toFixed(2));
    setSalePrice(p.salePrice ? p.salePrice.toFixed(2) : "");
    setOnSale(!!p.onSale);
    setDescription(p.description.join("\n\n"));
    setImage(p.image ?? "");
    setBadge(p.badge ?? "");
    setArchived(!!p.archived);
    setStockSku(p.stockSku ?? "");
    setShowLowStock(!!p.showLowStock);
    const inv = listInventory();
    setInventoryItems(inv);
    setLinkedItem(inv.find(i => i.sku === (p.stockSku ?? "")) ?? null);
  }, [slug]);

  if (!slug) return <div className="p-8">Missing slug.</div>;
  if (!product) return <div className="p-8 text-brand-cream/40 text-sm">Loading product…</div>;

  function handleSave() {
    if (!slug) return;
    const priceNum = parseFloat(price);
    const saleNum = salePrice ? parseFloat(salePrice) : undefined;
    if (isNaN(priceNum)) return;
    if (saleNum !== undefined && (isNaN(saleNum) || saleNum >= priceNum)) {
      alert("Sale price must be a number lower than the regular price.");
      return;
    }
    saveOverride(slug, {
      price: priceNum,
      salePrice: saleNum,
      onSale: onSale && !!saleNum,
      description: description.split(/\n{2,}/).map(s => s.trim()).filter(Boolean),
      image: image || undefined,
      badge: badge || undefined,
      archived,
      stockSku: stockSku || undefined,
      showLowStock,
    });
    setHasOverride(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleReset() {
    if (!slug) return;
    if (!confirm("Discard your edits and revert to the original product?")) return;
    clearOverride(slug);
    const p = getProduct(slug);
    if (!p) return;
    setProduct(p);
    setHasOverride(false);
    setPrice(p.price.toFixed(2));
    setSalePrice(p.salePrice ? p.salePrice.toFixed(2) : "");
    setOnSale(!!p.onSale);
    setDescription(p.description.join("\n\n"));
    setImage(p.image ?? "");
    setBadge(p.badge ?? "");
    setArchived(!!p.archived);
    setStockSku(p.stockSku ?? "");
    setShowLowStock(!!p.showLowStock);
  }

  function handleStockSkuChange(sku: string) {
    setStockSku(sku);
    setLinkedItem(inventoryItems.find(i => i.sku === sku) ?? null);
  }

  function handleStockAdjust(delta: number) {
    if (!linkedItem) return;
    adjustStock(linkedItem.sku, delta);
    const updated = listInventory();
    setInventoryItems(updated);
    setLinkedItem(updated.find(i => i.sku === linkedItem.sku) ?? null);
  }

  function handleCreateInventoryItem() {
    if (!slug || !stockSku.trim()) return;
    const item: InventoryItem = {
      sku: stockSku.trim(),
      name: product?.name ?? stockSku,
      range: "odo",
      price: parseFloat(price) || 0,
      onHand: 0,
      reserved: 0,
      lowAt: 10,
    };
    upsertInventory(item);
    const updated = listInventory();
    setInventoryItems(updated);
    setLinkedItem(item);
  }

  function handleImageFile(file: File) {
    setImgError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImgError(`Image is ${(file.size / 1024).toFixed(0)}KB — keep under 600KB, or paste a URL instead.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  const activePrice = onSale && salePrice ? parseFloat(salePrice) : parseFloat(price);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-5xl">
      <Link href="/admin/products" className="text-xs text-brand-cream/55 hover:text-brand-cream">← All products</Link>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Edit product</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">{product.name}</h1>
          <p className="text-brand-cream/45 text-sm mt-1 font-mono">{product.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasOverride && (
            <button onClick={handleReset} className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30">
              Reset to original
            </button>
          )}
          <Link href={`/products/${product.slug}`} target="_blank" className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/60 hover:text-brand-cream hover:border-white/30">
            View on site →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Regular price (£)">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Sale price (£) — optional">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                  placeholder="—"
                  className="input"
                />
              </Field>
            </div>
            <label className={`mt-4 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              onSale ? "bg-brand-orange/10 border-brand-orange/30" : "border-white/10 hover:border-white/20"
            } ${!salePrice ? "opacity-50 cursor-not-allowed" : ""}`}>
              <input
                type="checkbox"
                checked={onSale}
                disabled={!salePrice}
                onChange={e => setOnSale(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              <div>
                <p className="text-sm text-brand-cream">Put this product on sale</p>
                <p className="text-[11px] text-brand-cream/45">
                  {salePrice
                    ? `Customers see £${parseFloat(salePrice).toFixed(2)} struck through £${parseFloat(price || "0").toFixed(2)}.`
                    : "Add a sale price first."}
                </p>
              </div>
            </label>
          </Section>

          {/* Description */}
          <Section title="Description" hint="Separate paragraphs with a blank line.">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={8}
              className="input resize-y leading-relaxed"
            />
          </Section>

          {/* Image */}
          <Section title="Hero image" hint="Paste a URL or upload (under 600KB).">
            <input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://… or leave blank to use the default visual"
              className="input mb-3"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/70 hover:border-white/30 cursor-pointer">
                Upload file
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                  className="hidden"
                />
              </label>
              {image && (
                <button
                  onClick={() => { setImage(""); setImgError(null); }}
                  className="text-xs text-brand-cream/55 hover:text-brand-orange"
                >
                  Remove image
                </button>
              )}
            </div>
            {imgError && <p className="text-[11px] text-brand-orange mt-2">{imgError}</p>}
          </Section>

          {/* Stock */}
          <Section title="Stock &amp; Inventory" hint="Link to an inventory SKU to track availability.">
            <Field label="Inventory SKU">
              <div className="flex gap-2">
                <select
                  value={stockSku}
                  onChange={e => handleStockSkuChange(e.target.value)}
                  className="input flex-1"
                >
                  <option value="">— Not linked —</option>
                  {inventoryItems.map(item => (
                    <option key={item.sku} value={item.sku}>{item.sku} · {item.name}</option>
                  ))}
                </select>
              </div>
            </Field>
            {stockSku && !linkedItem && (
              <div className="mt-3 flex items-center gap-3">
                <p className="text-[11px] text-brand-orange flex-1">SKU &quot;{stockSku}&quot; not found in inventory.</p>
                <button
                  onClick={handleCreateInventoryItem}
                  className="text-xs px-3 py-1.5 rounded-lg border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10"
                >
                  Create it
                </button>
              </div>
            )}
            {linkedItem && (
              <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/8 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-brand-cream/60">On hand</p>
                    <p className="font-display text-2xl text-brand-cream">{linkedItem.onHand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-cream/60">Reserved</p>
                    <p className="font-display text-2xl text-brand-cream">{linkedItem.reserved}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-cream/60">Available</p>
                    <p className={`font-display text-2xl ${Math.max(0, linkedItem.onHand - linkedItem.reserved) === 0 ? "text-brand-orange" : "text-brand-amber"}`}>
                      {Math.max(0, linkedItem.onHand - linkedItem.reserved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-cream/60">Low at</p>
                    <p className="font-display text-2xl text-brand-cream">{linkedItem.lowAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStockAdjust(-10)} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream">−10</button>
                  <button onClick={() => handleStockAdjust(-1)}  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream">−1</button>
                  <span className="text-xs text-brand-cream/40 px-1">Adjust stock</span>
                  <button onClick={() => handleStockAdjust(1)}   className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream">+1</button>
                  <button onClick={() => handleStockAdjust(10)}  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream">+10</button>
                </div>
              </div>
            )}
            <label className={`mt-4 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              showLowStock ? "bg-brand-orange/10 border-brand-orange/30" : "border-white/10 hover:border-white/20"
            } ${!linkedItem ? "opacity-50 cursor-not-allowed" : ""}`}>
              <input
                type="checkbox"
                checked={showLowStock}
                disabled={!linkedItem}
                onChange={e => setShowLowStock(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              <div>
                <p className="text-sm text-brand-cream">Show low-stock badge on storefront</p>
                <p className="text-[11px] text-brand-cream/45">Displays &quot;Only X left&quot; when stock is low — drives urgency.</p>
              </div>
            </label>
          </Section>

          {/* Badge / archived */}
          <Section title="Display">
            <Field label="Badge text — optional">
              <input
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="e.g. Best Seller, New, Limited"
                className="input"
                maxLength={30}
              />
            </Field>
            <label className="mt-4 flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer">
              <input
                type="checkbox"
                checked={archived}
                onChange={e => setArchived(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              <div>
                <p className="text-sm text-brand-cream">Archive product</p>
                <p className="text-[11px] text-brand-cream/45">Hide it from the storefront. Existing orders are unaffected.</p>
              </div>
            </label>
          </Section>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && <span className="text-xs text-brand-amber">Saved ✓</span>}
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-semibold transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 mb-3">Storefront preview</p>
          <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-purple-muted via-brand-black-card to-brand-purple-dark flex items-center justify-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-brand-cream/20">◆</span>
              )}
              {onSale && salePrice && (
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded bg-brand-orange text-white">
                  On sale
                </span>
              )}
              {badge && (
                <span className="absolute top-3 right-3 text-[10px] tracking-widest uppercase font-bold px-2 py-1 rounded bg-brand-purple text-white">
                  {badge}
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40">{product.tagline}</p>
              <h3 className="text-base font-semibold text-brand-cream">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                {onSale && salePrice ? (
                  <>
                    <span className="font-display text-xl text-brand-orange">£{(activePrice || 0).toFixed(2)}</span>
                    <span className="text-sm text-brand-cream/40 line-through">£{parseFloat(price || "0").toFixed(2)}</span>
                  </>
                ) : (
                  <span className="font-display text-xl text-brand-cream">£{parseFloat(price || "0").toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs text-brand-cream/55 leading-relaxed line-clamp-3">{description.split(/\n{2,}/)[0]}</p>
            </div>
          </div>
          {hasOverride && (
            <p className="text-[11px] text-brand-amber mt-3">This product has admin edits applied.</p>
          )}
        </aside>
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
        .input:focus {
          outline: none;
          border-color: rgba(255,140,80,0.45);
        }
        .input::placeholder { color: rgba(245,237,225,0.3); }
      `}</style>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm tracking-wide text-brand-cream/80">{title}</h2>
        {hint && <p className="text-[11px] text-brand-cream/40 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
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
