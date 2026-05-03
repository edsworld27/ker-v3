"use client";

import { useEffect, useState } from "react";
import {
  loadOrgs, listOrgs, getActiveOrgId, getActiveOrg, setActiveOrgId,
  onOrgsChange, type OrgRecord,
} from "@/lib/admin/orgs";

// Org-level switcher in the admin chrome. Renders above SiteSwitcher
// because changing orgs cascades — the active site list is filtered to
// the active org.

export default function OrgSwitcher() {
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadOrgs().then(list => {
      if (cancelled) return;
      setOrgs(list);
      setActiveId(getActiveOrgId());
    });
    const off = onOrgsChange(() => {
      setOrgs(listOrgs());
      setActiveId(getActiveOrgId());
    });
    return () => { cancelled = true; off(); };
  }, []);

  if (orgs.length === 0) return null;
  const active = getActiveOrg() ?? orgs[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-colors text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-brand-amber/15 border border-brand-amber/25 flex items-center justify-center shrink-0 overflow-hidden">
          {active.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.logoUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="font-display text-xs font-bold text-brand-amber">{active.name.charAt(0)}</span>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/40 block">Org</span>
          <span className="text-xs font-semibold text-brand-cream truncate block">{active.name}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-brand-cream/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-30 rounded-xl border border-white/10 bg-brand-black-soft shadow-2xl overflow-hidden">
          {orgs.map(o => {
            const isActive = o.id === activeId;
            return (
              <button
                key={o.id}
                onClick={() => { setActiveOrgId(o.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${isActive ? "bg-brand-amber/10" : "hover:bg-white/5"}`}
              >
                <span className="w-6 h-6 rounded-lg bg-brand-amber/15 border border-brand-amber/25 flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-bold text-brand-amber">
                  {o.name.charAt(0)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-brand-cream truncate block">{o.name}</span>
                  {o.isPrimary && <span className="text-[9px] uppercase tracking-wider text-brand-amber/70">Primary</span>}
                </span>
                {isActive && <span className="text-brand-amber text-xs">✓</span>}
              </button>
            );
          })}
          <a href="/admin/orgs" className="block px-3 py-2 text-[11px] text-brand-cream/55 hover:bg-white/5 border-t border-white/5 text-center">
            Manage orgs →
          </a>
        </div>
      )}
    </div>
  );
}
