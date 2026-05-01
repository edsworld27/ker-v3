"use client";

import { useEffect, useState } from "react";
import {
  listSites, createSite, updateSite, deleteSite, setPrimarySite,
  addDomain, removeDomain, setPrimaryDomain, getActiveSiteId,
  onSitesChange, normaliseDomain, type Site,
} from "@/lib/admin/sites";
import { listVariants, type ThemeVariant } from "@/lib/admin/themeVariants";
import Tip from "@/components/admin/Tip";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

export default function AdminSitesPage() {
  const [sites,  setSites]  = useState<Site[]>([]);
  const [active, setActive] = useState<string>("");
  const [variants, setVariants] = useState<ThemeVariant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");

  function refresh() {
    setSites(listSites());
    setActive(getActiveSiteId());
    setVariants(listVariants());
  }

  useEffect(() => {
    refresh();
    return onSitesChange(refresh);
  }, []);

  function handleCreate() {
    if (!newName.trim()) return;
    const created = createSite({
      name: newName.trim(),
      domains: newDomain.trim() ? [normaliseDomain(newDomain)] : [],
    });
    setNewName("");
    setNewDomain("");
    setCreating(false);
    setEditingId(created.id);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Operations</p>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Sites</h1>
            <Tip
              id="sites.header"
              text="Run multiple storefronts from one admin. Each site has its own brand, domains and content but shares the product catalog. Visitors are routed to the correct site by hostname automatically."
              align="bottom"
            />
          </div>
          <p className="text-brand-cream/45 text-sm mt-1">
            {sites.length} {sites.length === 1 ? "site" : "sites"} · {sites.reduce((n, s) => n + s.domains.length, 0)} domains
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="text-xs px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
        >
          + New site
        </button>
      </div>

      {/* New site form */}
      {creating && (
        <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-5 space-y-3">
          <p className="text-sm font-medium text-brand-cream">New site</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Site name" tip="Display name shown in the admin and storefront chrome.">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Felicia Skincare" className={INPUT} autoFocus />
            </Field>
            <Field label="First domain (optional)" tip="You can add more later. Both apex and www. are accepted.">
              <input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="e.g. felicia.com" className={INPUT + " font-mono"} />
            </Field>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim()} className="text-xs px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-40">
              Create site
            </button>
            <button onClick={() => { setCreating(false); setNewName(""); setNewDomain(""); }} className="text-xs px-4 py-2 text-brand-cream/55 hover:text-brand-cream">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sites list */}
      <div className="space-y-4">
        {sites.map(site => (
          <SiteRow
            key={site.id}
            site={site}
            isActive={site.id === active}
            isOpen={editingId === site.id}
            variants={variants}
            onToggle={() => setEditingId(editingId === site.id ? null : site.id)}
          />
        ))}
      </div>

      {/* Domain conflicts notice */}
      {sites.some(s => s.domains.length === 0 && !s.isPrimary) && (
        <div className="rounded-xl border border-brand-amber/30 bg-brand-amber/5 px-4 py-3 text-xs text-brand-amber/80">
          Some sites have no domains yet. Add at least one domain to each so visitors can reach them.
        </div>
      )}
    </div>
  );
}

function SiteRow({ site, isActive, isOpen, variants, onToggle }: {
  site: Site; isActive: boolean; isOpen: boolean; variants: ThemeVariant[]; onToggle: () => void;
}) {
  const [domain, setDomain] = useState("");

  function handleAddDomain() {
    if (!domain.trim()) return;
    addDomain(site.id, domain);
    setDomain("");
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isActive ? "border-brand-orange/40 bg-brand-orange/5" : "border-white/8 bg-brand-black-card"}`}>
      {/* Header row */}
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02]">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center shrink-0 overflow-hidden">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="font-display text-lg font-bold text-brand-orange">{site.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-brand-cream">{site.name}</p>
            {site.isPrimary && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-semibold uppercase tracking-wider">Primary</span>}
            {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-semibold uppercase tracking-wider">Editing</span>}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${site.status === "live" ? "bg-green-500/20 text-green-400" : "bg-white/8 text-brand-cream/40"}`}>
              {site.status}
            </span>
          </div>
          <p className="text-[11px] text-brand-cream/45 truncate font-mono mt-0.5">
            {site.domains.length === 0 ? "no domains yet" : site.domains.join(" · ")}
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-brand-cream/30 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Editor */}
      {isOpen && (
        <div className="border-t border-white/5 p-5 space-y-5 bg-black/10">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Display name">
              <input value={site.name} onChange={e => updateSite(site.id, { name: e.target.value })} className={INPUT} />
            </Field>
            <Field label="Tagline (optional)">
              <input value={site.tagline ?? ""} onChange={e => updateSite(site.id, { tagline: e.target.value })} className={INPUT} placeholder="One-line strapline" />
            </Field>
            <Field label="Logo URL" tip="Used in the navbar and email receipts. Leave empty to fall back to the brand mark.">
              <input value={site.logoUrl ?? ""} onChange={e => updateSite(site.id, { logoUrl: e.target.value })} className={INPUT + " font-mono"} placeholder="https://…" />
            </Field>
            <Field label="Favicon URL">
              <input value={site.faviconUrl ?? ""} onChange={e => updateSite(site.id, { faviconUrl: e.target.value })} className={INPUT + " font-mono"} placeholder="https://…" />
            </Field>
            <Field label="Theme variant" tip="Pick which visual variant this site renders by default. Variants are managed under Theme → Variants.">
              <select
                value={site.themeVariantId ?? "dark"}
                onChange={e => updateSite(site.id, { themeVariantId: e.target.value })}
                className={INPUT}
              >
                {variants.map(v => <option key={v.id} value={v.id}>{v.icon} {v.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={site.status}
                onChange={e => updateSite(site.id, { status: e.target.value as "draft" | "live" })}
                className={INPUT}
              >
                <option value="draft">Draft (admin-only)</option>
                <option value="live">Live</option>
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description (about/SEO)">
            <textarea value={site.description ?? ""} onChange={e => updateSite(site.id, { description: e.target.value })} rows={2} className={INPUT} />
          </Field>

          {/* Domains */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/55">Domains</p>
              <Tip text="Every domain that should serve this site. Visitors are routed by hostname (www and non-www are treated identically). The primary domain is used for absolute URLs." />
            </div>
            <div className="p-4 space-y-2">
              {site.domains.length === 0 ? (
                <p className="text-xs text-brand-cream/40 italic">No domains yet — add one below.</p>
              ) : (
                site.domains.map(d => (
                  <div key={d} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-black border border-white/5">
                    <span className="font-mono text-sm text-brand-cream flex-1 truncate">{d}</span>
                    {site.primaryDomain === d ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-amber/20 text-brand-amber font-semibold uppercase tracking-wider">Primary</span>
                    ) : (
                      <button
                        onClick={() => setPrimaryDomain(site.id, d)}
                        className="text-[11px] text-brand-cream/45 hover:text-brand-cream"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      onClick={() => removeDomain(site.id, d)}
                      className="text-brand-cream/40 hover:text-red-400 text-sm"
                      aria-label={`Remove ${d}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
              <form onSubmit={e => { e.preventDefault(); handleAddDomain(); }} className="flex gap-2">
                <input
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="e.g. felicia.com"
                  className={INPUT + " font-mono"}
                />
                <button type="submit" disabled={!domain.trim()} className="text-xs px-3 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-40 shrink-0">
                  Add
                </button>
              </form>
              <p className="text-[11px] text-brand-cream/30 leading-relaxed">
                Point each domain&apos;s DNS A record to your hosting provider, then add it here.
                The site loads automatically based on hostname.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {!site.isPrimary && (
              <button
                onClick={() => setPrimarySite(site.id)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/10"
              >
                Make primary
              </button>
            )}
            {!site.isPrimary && (
              <button
                onClick={() => {
                  if (confirm(`Delete "${site.name}"? Domains will be unrouted.`)) {
                    deleteSite(site.id);
                  }
                }}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
              >
                Delete site
              </button>
            )}
            {site.isPrimary && (
              <p className="text-[11px] text-brand-cream/35 italic">The primary site cannot be deleted.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/50 mb-1.5 flex items-center gap-1.5">
        {label}
        {tip && <Tip text={tip} />}
      </label>
      {children}
    </div>
  );
}
