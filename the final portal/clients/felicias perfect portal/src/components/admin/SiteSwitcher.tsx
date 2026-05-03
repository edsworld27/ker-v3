"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listSites, getActiveSiteId, setActiveSiteId, onSitesChange,
  type Site,
} from "@/lib/admin/sites";
import { getSession } from "@/lib/auth";

// Compact dropdown shown at the top of the admin sidebar so admins can
// switch which site they're editing. Persists per admin user (keyed by email).

export default function SiteSwitcher() {
  const [sites,    setSites]    = useState<Site[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open,     setOpen]     = useState(false);
  const [email,    setEmail]    = useState<string | undefined>(undefined);

  useEffect(() => {
    const refresh = () => {
      const s = getSession();
      const e = s?.user.email;
      setEmail(e);
      setSites(listSites());
      setActiveId(getActiveSiteId(e));
    };
    refresh();
    return onSitesChange(refresh);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-site-switcher]")) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  if (sites.length === 0) return null;

  const active = sites.find(s => s.id === activeId) ?? sites[0];

  function pick(siteId: string) {
    setActiveSiteId(siteId, email);
    setActiveId(siteId);
    setOpen(false);
  }

  return (
    <div className="relative" data-site-switcher>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 transition-colors"
        aria-label="Switch site"
      >
        <span className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-brand-orange/20 flex items-center justify-center text-brand-orange text-[11px] font-bold shrink-0 overflow-hidden">
            {active.logoUrl ? <img src={active.logoUrl} alt="" className="w-full h-full object-contain" /> : active.name.charAt(0)}
          </div>
          <span className="text-xs text-brand-cream truncate">{active.name}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-brand-cream/40 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-lg bg-brand-black border border-white/10 shadow-xl shadow-black/50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {sites.map(s => (
              <button
                key={s.id}
                onClick={() => pick(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  s.id === activeId ? "bg-brand-orange/15" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-brand-orange/20 flex items-center justify-center text-brand-orange text-[11px] font-bold shrink-0 overflow-hidden">
                  {s.logoUrl ? <img src={s.logoUrl} alt="" className="w-full h-full object-contain" /> : s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-cream truncate">{s.name}</p>
                  {s.primaryDomain && (
                    <p className="text-[10px] text-brand-cream/40 truncate font-mono">{s.primaryDomain}</p>
                  )}
                </div>
                {s.id === activeId && (
                  <span className="text-brand-orange text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
          <Link
            href="/admin/sites"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-[11px] text-brand-cream/55 hover:text-brand-cream border-t border-white/8 bg-white/[0.02]"
          >
            Manage sites →
          </Link>
        </div>
      )}
    </div>
  );
}
