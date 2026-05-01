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

// Shape returned by GET /api/portal/heartbeats. Kept inline so the client
// page doesn't import server-only modules.
interface Heartbeat {
  siteId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  beats: number;
  lastUrl?: string;
  lastTitle?: string;
  lastReferrer?: string;
  lastEvent?: string;
}

type ConnectionState = "live" | "stale" | "never";

const LIVE_WINDOW_MS = 90 * 1000;            // ≤90s ago → green dot
const STALE_WINDOW_MS = 24 * 60 * 60 * 1000; // ≤24h ago → amber dot

function connectionState(beat: Heartbeat | undefined, now: number): ConnectionState {
  if (!beat) return "never";
  const age = now - beat.lastSeenAt;
  if (age <= LIVE_WINDOW_MS) return "live";
  if (age <= STALE_WINDOW_MS) return "stale";
  return "never";
}

function formatAge(ms: number): string {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

export default function AdminSitesPage() {
  const [sites,  setSites]  = useState<Site[]>([]);
  const [active, setActive] = useState<string>("");
  const [variants, setVariants] = useState<ThemeVariant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [heartbeats, setHeartbeats] = useState<Record<string, Heartbeat>>({});
  const [now, setNow] = useState<number>(() => Date.now());
  const [portalOrigin, setPortalOrigin] = useState<string>("");

  function refresh() {
    setSites(listSites());
    setActive(getActiveSiteId());
    setVariants(listVariants());
  }

  useEffect(() => {
    refresh();
    return onSitesChange(refresh);
  }, []);

  // Capture the portal origin once so the install snippet always reflects
  // the actual deployment URL the admin is using.
  useEffect(() => {
    if (typeof window !== "undefined") setPortalOrigin(window.location.origin);
  }, []);

  // Poll heartbeats every 10s while the page is mounted; also drift `now`
  // each second so age labels stay fresh.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch("/api/portal/heartbeats", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { heartbeats: Heartbeat[] };
        const map: Record<string, Heartbeat> = {};
        for (const h of data.heartbeats) map[h.siteId] = h;
        setHeartbeats(map);
      } catch { /* offline / dev-server hop — keep last snapshot */ }
    }
    pull();
    const pollId = setInterval(pull, 10_000);
    const tickId = setInterval(() => setNow(Date.now()), 1_000);
    return () => { cancelled = true; clearInterval(pollId); clearInterval(tickId); };
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
            heartbeat={heartbeats[site.id]}
            now={now}
            portalOrigin={portalOrigin}
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

function SiteRow({ site, isActive, isOpen, variants, heartbeat, now, portalOrigin, onToggle }: {
  site: Site;
  isActive: boolean;
  isOpen: boolean;
  variants: ThemeVariant[];
  heartbeat: Heartbeat | undefined;
  now: number;
  portalOrigin: string;
  onToggle: () => void;
}) {
  const [domain, setDomain] = useState("");
  const conn = connectionState(heartbeat, now);

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
            <ConnectionDot state={conn} heartbeat={heartbeat} now={now} />
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

          {/* Portal connection — install snippet + heartbeat status */}
          <PortalSnippet site={site} portalOrigin={portalOrigin} heartbeat={heartbeat} now={now} state={conn} />

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

// ─── Portal connection ──────────────────────────────────────────────────────

function ConnectionDot({ state, heartbeat, now }: {
  state: ConnectionState;
  heartbeat: Heartbeat | undefined;
  now: number;
}) {
  const colour = state === "live"
    ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
    : state === "stale"
      ? "bg-brand-amber"
      : "bg-white/15";
  const label = state === "live" ? "Live"
    : state === "stale" ? "Stale"
    : "Not connected";
  const subtitle = heartbeat
    ? `last seen ${formatAge(now - heartbeat.lastSeenAt)}`
    : "tag never reported in";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-cream/60"
      title={subtitle}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colour}`} />
      <span className="font-semibold uppercase tracking-wider">{label}</span>
    </span>
  );
}

function PortalSnippet({ site, portalOrigin, heartbeat, now, state }: {
  site: Site;
  portalOrigin: string;
  heartbeat: Heartbeat | undefined;
  now: number;
  state: ConnectionState;
}) {
  const origin = portalOrigin || "https://your-portal.example";
  const snippet = `<script src="${origin}/portal/tag.js" data-site="${site.id}" defer></script>`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — fall back: select-all the textarea */ }
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/55">Portal connection</p>
        <Tip text="Drop this single tag into the <head> of your site. It pings the portal so you see a live connection here, and is the same loader that will carry tracking modules and content overrides in the next phases — you only paste it once." />
        <span className="ml-auto"><ConnectionDot state={state} heartbeat={heartbeat} now={now} /></span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-[11px] text-brand-cream/55 leading-relaxed">
          Paste this into the <code className="font-mono text-brand-cream/80">&lt;head&gt;</code> of <strong className="text-brand-cream">{site.name}</strong>.
          Once the page loads, the dot above flips to <span className="text-green-400 font-semibold">Live</span>.
        </p>
        <div className="relative">
          <pre className="text-[11px] font-mono bg-brand-black border border-white/8 rounded-lg p-3 pr-20 overflow-x-auto text-brand-cream/85">
{snippet}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-md bg-brand-orange/20 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/30 font-semibold"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {heartbeat ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <Stat label="Beats" value={heartbeat.beats.toLocaleString()} />
            <Stat label="Last seen" value={formatAge(now - heartbeat.lastSeenAt)} />
            <Stat label="First seen" value={formatAge(now - heartbeat.firstSeenAt)} />
            <Stat label="Last event" value={heartbeat.lastEvent ?? "—"} />
            {heartbeat.lastUrl && (
              <p className="col-span-full text-brand-cream/40 truncate font-mono">
                {heartbeat.lastUrl}
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-brand-cream/40 italic">
            Waiting for first heartbeat. After installing the snippet, load any page and refresh here within ~10 seconds.
          </p>
        )}
        <p className="text-[10px] text-brand-cream/30">
          Heartbeats are stored in memory and reset when the server restarts. Persistence ships with Phase B (tracking config).
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-2 rounded-lg bg-brand-black border border-white/5">
      <p className="text-[9px] uppercase tracking-wider text-brand-cream/40">{label}</p>
      <p className="text-[12px] text-brand-cream font-medium truncate">{value}</p>
    </div>
  );
}
