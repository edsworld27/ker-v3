"use client";

import { useEffect, useRef, useState } from "react";
import {
  listVariants,
  getActiveVariantId,
  setActiveVariantId,
  onVariantChange,
  type ThemeVariant,
} from "@/lib/admin/themeVariants";

export default function ThemeSwitcher() {
  const [variants, setVariants] = useState<ThemeVariant[]>([]);
  const [activeId, setActiveId] = useState<string>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refresh() {
      setVariants(listVariants());
      setActiveId(getActiveVariantId());
    }
    refresh();
    return onVariantChange(refresh);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const active = variants.find(v => v.id === activeId);

  function choose(id: string) {
    setActiveVariantId(id);
    setActiveId(id);
    setOpen(false);
  }

  if (variants.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch theme"
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-base leading-none"
        title={active?.name ?? "Theme"}
      >
        {active?.icon ?? "🎨"}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-brand-black-card border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[170px]">
          <div className="px-3 py-2 border-b border-white/8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/40">Theme</p>
          </div>
          <div className="py-1">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => choose(v.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  v.id === activeId
                    ? "bg-brand-orange/15 text-brand-cream"
                    : "text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream"
                }`}
              >
                <span className="text-base leading-none">{v.icon}</span>
                <span className="flex-1 truncate">{v.name}</span>
                {v.id === activeId && <span className="text-brand-orange text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
