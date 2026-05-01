"use client";

import { useState } from "react";

// Reusable admin tooltip. Hover (or focus) shows a richer popup than the
// native `title` attribute — supports paragraphs and tap-to-toggle on mobile.

export default function Tip({
  text,
  size = "sm",
  align = "top",
}: {
  text: string;
  size?: "sm" | "md";
  align?: "top" | "bottom" | "right";
}) {
  const [open, setOpen] = useState(false);

  const dim = size === "md" ? "w-5 h-5 text-[10px]" : "w-4 h-4 text-[9px]";

  const popPos =
    align === "bottom" ? "top-full mt-2 left-1/2 -translate-x-1/2"
    : align === "right" ? "left-full ml-2 top-1/2 -translate-y-1/2"
    : "bottom-full mb-2 left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
        aria-label="More information"
        className={`${dim} inline-flex items-center justify-center rounded-full border border-white/20 text-brand-cream/45 hover:text-brand-cream hover:border-brand-cream/40 cursor-help shrink-0 transition-colors`}
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute z-[60] ${popPos} w-64 rounded-lg bg-brand-black border border-brand-orange/25 shadow-xl shadow-black/50 px-3 py-2 text-[11px] leading-relaxed text-brand-cream/85 normal-case tracking-normal pointer-events-none`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
