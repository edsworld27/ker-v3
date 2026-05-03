"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminMode, setAdminMode, onAdminConfigChange, type AdminMode } from "@/lib/admin/adminConfig";
import { getSession } from "@/lib/auth";

const MODES: Array<{ id: AdminMode; label: string; icon: string }> = [
  { id: "dark",     label: "Dark",     icon: "🌑" },
  { id: "light",    label: "Light",    icon: "☀️" },
  { id: "midnight", label: "Midnight", icon: "🌌" },
  { id: "sand",     label: "Sand",     icon: "🏜️" },
  { id: "custom",   label: "Custom",   icon: "🎨" },
];

export default function AdminModeSwitcher() {
  const [mode, setMode] = useState<AdminMode>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      const s = getSession();
      setMode(getAdminMode(s?.user.email));
    };
    refresh();
    return onAdminConfigChange(refresh);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function choose(m: AdminMode) {
    const s = getSession();
    setAdminMode(m, s?.user.email);
    setMode(m);
    setOpen(false);
  }

  const active = MODES.find(m => m.id === mode) ?? MODES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-white/10 hover:border-white/25 text-[11px] text-brand-cream/55 hover:text-brand-cream transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span>{active.icon}</span>
          <span>{active.label}</span>
        </span>
        <span className="opacity-50">▾</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-brand-black-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                m.id === mode ? "bg-brand-orange/15 text-brand-cream" : "text-brand-cream/65 hover:bg-white/5"
              }`}
            >
              <span>{m.icon}</span>
              <span className="flex-1">{m.label}</span>
              {m.id === mode && <span className="text-brand-orange text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
