"use client";

// Storefront variant picker. Renders one selector per option group with
// the right UI for each displayType (swatches, colour wheel, sizes,
// images, text). Selected state lifts up via onChange so the consuming
// page (or block) can show the resolved price.

import { useEffect, useMemo, useState } from "react";
import type { Product, ProductOption, ProductOptionValue } from "@/lib/products";
import {
  defaultSelection, isCustomValueId, makeCustomValueId, resolveVariant,
  type ResolvedVariant, type SelectedVariantState,
} from "@/lib/variants";

interface ProductVariantPickerProps {
  product: Product;
  initialSelection?: Record<string, string>;
  onChange?: (state: SelectedVariantState, resolved: ResolvedVariant) => void;
  className?: string;
}

export default function ProductVariantPicker({ product, initialSelection, onChange, className }: ProductVariantPickerProps) {
  const options = product.options ?? [];

  const [selection, setSelection] = useState<Record<string, string>>(
    () => initialSelection ?? defaultSelection(options)
  );
  const [customHex, setCustomHex] = useState<string | undefined>(() => {
    for (const v of Object.values(initialSelection ?? {})) {
      if (isCustomValueId(v)) return v.slice("custom:".length);
    }
    return undefined;
  });

  const resolved = useMemo(() => resolveVariant(product, { selection, customHex }), [product, selection, customHex]);

  useEffect(() => {
    onChange?.({ selection, customHex }, resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, customHex, resolved.price, resolved.variant?.id]);

  function pickValue(optionId: string, valueId: string) {
    setSelection(prev => ({ ...prev, [optionId]: valueId }));
    if (!isCustomValueId(valueId)) setCustomHex(undefined);
  }

  function pickCustom(optionId: string, hex: string) {
    setCustomHex(hex);
    setSelection(prev => ({ ...prev, [optionId]: makeCustomValueId(hex) }));
  }

  if (options.length === 0) return null;

  return (
    <div className={className ?? "space-y-4"}>
      {options.map(option => (
        <OptionRow
          key={option.id}
          option={option}
          selectedValueId={selection[option.id]}
          customHex={customHex}
          customSurcharge={product.customColorSurcharge ?? 0}
          onPick={valueId => pickValue(option.id, valueId)}
          onPickCustom={hex => pickCustom(option.id, hex)}
        />
      ))}
    </div>
  );
}

function OptionRow({
  option, selectedValueId, customHex, customSurcharge, onPick, onPickCustom,
}: {
  option: ProductOption;
  selectedValueId: string | undefined;
  customHex: string | undefined;
  customSurcharge: number;
  onPick: (valueId: string) => void;
  onPickCustom: (hex: string) => void;
}) {
  const selectedLabel = option.values.find(v => v.id === selectedValueId)?.label
    ?? (selectedValueId && isCustomValueId(selectedValueId) ? `Custom ${customHex ?? ""}` : "");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">
          {option.name}
        </p>
        {selectedLabel && <p className="text-[11px] text-brand-cream/75">{selectedLabel}</p>}
      </div>
      {(option.displayType === "swatch" || option.displayType === "color-wheel") && (
        <SwatchPicker
          option={option}
          selectedValueId={selectedValueId}
          customHex={customHex}
          customSurcharge={customSurcharge}
          onPick={onPick}
          onPickCustom={onPickCustom}
        />
      )}
      {option.displayType === "size" && <SizePicker option={option} selectedValueId={selectedValueId} onPick={onPick} />}
      {option.displayType === "text" && <TextPicker option={option} selectedValueId={selectedValueId} onPick={onPick} />}
      {option.displayType === "image" && <ImagePicker option={option} selectedValueId={selectedValueId} onPick={onPick} />}
    </div>
  );
}

function SwatchPicker({
  option, selectedValueId, customHex, customSurcharge, onPick, onPickCustom,
}: {
  option: ProductOption;
  selectedValueId: string | undefined;
  customHex: string | undefined;
  customSurcharge: number;
  onPick: (valueId: string) => void;
  onPickCustom: (hex: string) => void;
}) {
  const [wheelOpen, setWheelOpen] = useState(false);
  const [pendingHex, setPendingHex] = useState<string>(customHex ?? "#ff6b35");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {option.values.map(value => {
          const active = value.id === selectedValueId;
          return (
            <button
              key={value.id}
              type="button"
              onClick={() => onPick(value.id)}
              disabled={value.available === false}
              title={value.label}
              aria-label={value.label}
              aria-pressed={active}
              className={`relative w-10 h-10 rounded-full transition-all disabled:opacity-30 ${active ? "ring-2 ring-offset-2 ring-offset-brand-black ring-brand-cream" : "ring-1 ring-white/15 hover:ring-white/40"}`}
              style={{ background: value.hexColor ?? "#888" }}
            >
              {value.available === false && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 bg-black/50 rounded-full">×</span>
              )}
            </button>
          );
        })}
        {option.allowCustom && option.displayType === "color-wheel" && (
          <button
            type="button"
            onClick={() => setWheelOpen(o => !o)}
            className={`w-10 h-10 rounded-full ring-1 ring-white/15 hover:ring-white/40 transition-all flex items-center justify-center ${customHex && selectedValueId && isCustomValueId(selectedValueId) ? "ring-2 ring-brand-cream ring-offset-2 ring-offset-brand-black" : ""}`}
            style={{ background: customHex ? customHex : "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
            title="Custom colour"
            aria-label="Choose custom colour"
          >
            <span className="w-3 h-3 rounded-full bg-white/70 backdrop-blur-sm" />
          </button>
        )}
      </div>
      {wheelOpen && option.allowCustom && (
        <div className="mt-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={pendingHex}
              onChange={e => setPendingHex(e.target.value)}
              className="w-14 h-14 rounded-lg cursor-pointer border border-white/10 bg-transparent"
            />
            <div className="flex-1">
              <input
                type="text"
                value={pendingHex}
                onChange={e => setPendingHex(e.target.value)}
                placeholder="#ff6b35"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-brand-cream font-mono focus:outline-none focus:border-brand-orange/50"
              />
              {customSurcharge > 0 && (
                <p className="text-[10px] text-brand-amber/80 mt-1">
                  +£{(customSurcharge / 100).toFixed(2)} for custom colours
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => { onPickCustom(pendingHex); setWheelOpen(false); }}
              className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90"
            >
              Use this colour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SizePicker({ option, selectedValueId, onPick }: { option: ProductOption; selectedValueId: string | undefined; onPick: (valueId: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {option.values.map(value => {
        const active = value.id === selectedValueId;
        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onPick(value.id)}
            disabled={value.available === false}
            className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-30 disabled:line-through ${active ? "bg-brand-orange text-white" : "bg-white/5 text-brand-cream/85 border border-white/10 hover:bg-white/10"}`}
          >
            {value.label}
            {value.priceModifier ? <span className="ml-1.5 text-[10px] opacity-70">+£{(value.priceModifier / 100).toFixed(2)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function TextPicker({ option, selectedValueId, onPick }: { option: ProductOption; selectedValueId: string | undefined; onPick: (valueId: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {option.values.map(value => {
        const active = value.id === selectedValueId;
        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onPick(value.id)}
            disabled={value.available === false}
            className={`text-left p-3 rounded-xl border transition-colors disabled:opacity-30 ${active ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
          >
            <p className="text-[12px] font-semibold text-brand-cream">{value.label}</p>
            {value.priceModifier ? <p className="text-[10px] text-brand-amber/80 mt-0.5">+£{(value.priceModifier / 100).toFixed(2)}</p> : null}
          </button>
        );
      })}
    </div>
  );
}

function ImagePicker({ option, selectedValueId, onPick }: { option: ProductOption; selectedValueId: string | undefined; onPick: (valueId: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {option.values.map((value: ProductOptionValue) => {
        const active = value.id === selectedValueId;
        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onPick(value.id)}
            disabled={value.available === false}
            title={value.label}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors disabled:opacity-30 ${active ? "border-brand-orange" : "border-white/10 hover:border-white/30"}`}
          >
            {value.image
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={value.image} alt={value.label} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-white/[0.04] flex items-center justify-center text-[10px] text-brand-cream/40">{value.label}</div>
            }
          </button>
        );
      })}
    </div>
  );
}
