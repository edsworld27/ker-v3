"use client";

import { useEffect, useRef, useState } from "react";
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

// Tracking config — mirrors src/portal/server/types.ts. Inlined for the
// same reason as Heartbeat above.
type TrackerProvider = "ga4" | "gtm" | "meta-pixel" | "tiktok-pixel" | "hotjar" | "clarity" | "plausible";
type ConsentCategory = "analytics" | "marketing" | "functional";

interface Tracker {
  id: string;
  provider: TrackerProvider;
  enabled: boolean;
  consentCategory: ConsentCategory;
  value: string;
  label?: string;
}

interface AdminTrackingConfig {
  siteId: string;
  requireConsent: boolean;
  trackers: Tracker[];
  updatedAt: number;
}

// Content overrides — mirrors src/portal/server/types.ts.
type OverrideType = "text" | "html" | "image-src" | "href";

interface ContentOverride {
  value: string;
  type: OverrideType;
  updatedAt: number;
}

interface DiscoveredKey {
  firstSeen: number;
  lastSeen: number;
  seenOn: string[];
  type?: OverrideType;
}

interface AdminContentState {
  siteId: string;
  overrides: Record<string, ContentOverride>;
  discovered: Record<string, DiscoveredKey>;
  updatedAt: number;
}

const OVERRIDE_TYPE_LABEL: Record<OverrideType, string> = {
  "text":      "Text",
  "html":      "HTML",
  "image-src": "Image src",
  "href":      "Link href",
};

const PROVIDER_OPTIONS: { id: TrackerProvider; label: string; placeholder: string; defaultCategory: ConsentCategory }[] = [
  { id: "ga4",          label: "Google Analytics 4", placeholder: "G-XXXXXXXXXX",  defaultCategory: "analytics" },
  { id: "gtm",          label: "Google Tag Manager", placeholder: "GTM-XXXXXX",    defaultCategory: "marketing" },
  { id: "meta-pixel",   label: "Meta Pixel",         placeholder: "1234567890",    defaultCategory: "marketing" },
  { id: "tiktok-pixel", label: "TikTok Pixel",       placeholder: "C4XXXXXXXXXX",  defaultCategory: "marketing" },
  { id: "hotjar",       label: "Hotjar",             placeholder: "1234567",       defaultCategory: "analytics" },
  { id: "clarity",      label: "Microsoft Clarity",  placeholder: "abcdef1234",    defaultCategory: "analytics" },
  { id: "plausible",    label: "Plausible",          placeholder: "yourdomain.com",defaultCategory: "analytics" },
];

const PROVIDER_BY_ID: Record<TrackerProvider, (typeof PROVIDER_OPTIONS)[number]> =
  PROVIDER_OPTIONS.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<TrackerProvider, (typeof PROVIDER_OPTIONS)[number]>);

function newTrackerId(): string {
  return `tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
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

          {/* Tracking & analytics — central config served to the loader */}
          <TrackingBlock siteId={site.id} />

          {/* Content overrides — instrumented regions on the host site */}
          <ContentOverridesBlock siteId={site.id} />

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

// ─── Tracking & analytics ───────────────────────────────────────────────────
//
// Each site has a list of trackers. The portal tag fetches this list and
// injects only what's enabled, gated by consent for marketing/analytics
// categories. Replaces five copy-pasted snippets with one config row.

function TrackingBlock({ siteId }: { siteId: string }) {
  const [cfg, setCfg] = useState<AdminTrackingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [addProvider, setAddProvider] = useState<TrackerProvider>("ga4");
  const [addValue, setAddValue] = useState("");

  // Load full admin config on mount.
  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(`/api/portal/config/${encodeURIComponent(siteId)}?admin=1`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as AdminTrackingConfig;
        if (!cancelled) setCfg(data);
      } catch { /* leave cfg null — UI shows error state */ }
      finally { if (!cancelled) setLoading(false); }
    }
    pull();
    return () => { cancelled = true; };
  }, [siteId]);

  async function save(next: AdminTrackingConfig) {
    setCfg(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/portal/config/${encodeURIComponent(siteId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requireConsent: next.requireConsent,
          trackers: next.trackers,
        }),
      });
      if (res.ok) setSavedAt(Date.now());
    } catch { /* keep optimistic state */ }
    finally { setSaving(false); }
  }

  function ensure(): AdminTrackingConfig {
    return cfg ?? { siteId, requireConsent: true, trackers: [], updatedAt: 0 };
  }

  function addTracker() {
    const value = addValue.trim();
    if (!value) return;
    const meta = PROVIDER_BY_ID[addProvider];
    const t: Tracker = {
      id: newTrackerId(),
      provider: addProvider,
      enabled: true,
      consentCategory: meta.defaultCategory,
      value,
    };
    save({ ...ensure(), trackers: [...ensure().trackers, t] });
    setAddValue("");
  }

  function patchTracker(id: string, patch: Partial<Tracker>) {
    save({ ...ensure(), trackers: ensure().trackers.map(t => t.id === id ? { ...t, ...patch } : t) });
  }

  function deleteTracker(id: string) {
    if (!confirm("Remove this tracker?")) return;
    save({ ...ensure(), trackers: ensure().trackers.filter(t => t.id !== id) });
  }

  const trackers = cfg?.trackers ?? [];
  const enabledCount = trackers.filter(t => t.enabled && t.value).length;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/55">Tracking & analytics</p>
        <Tip text="Configure GA4, GTM, Meta Pixel, TikTok, Hotjar, Clarity and Plausible once here. The portal tag fetches this config and injects only what's enabled, gated by consent for marketing/analytics. Replaces every per-pixel snippet with a single managed config." />
        <span className="ml-auto text-[10px] text-brand-cream/40">
          {loading ? "loading…" : `${enabledCount} active`}
        </span>
        {savedAt && Date.now() - savedAt < 2500 && (
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Saved</span>
        )}
        {saving && !savedAt && <span className="text-[10px] text-brand-cream/40">saving…</span>}
      </div>
      <div className="p-4 space-y-4">
        {/* Consent toggle */}
        <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-brand-black border border-white/5">
          <button
            onClick={() => save({ ...ensure(), requireConsent: !ensure().requireConsent })}
            className={`mt-0.5 w-9 h-5 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
              ensure().requireConsent ? "bg-brand-orange justify-end" : "bg-white/15 justify-start"
            }`}
            aria-pressed={ensure().requireConsent}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-cream">Require consent before loading</p>
            <p className="text-[11px] text-brand-cream/45 leading-relaxed mt-0.5">
              When on, marketing/analytics trackers wait until your site calls
              <code className="font-mono text-brand-cream/65"> window.__portal.consent.grant() </code>
              (e.g. after an Accept on your cookie banner). Functional trackers always load.
            </p>
          </div>
        </div>

        {/* Tracker list */}
        {trackers.length === 0 && !loading && (
          <p className="text-xs text-brand-cream/40 italic px-1">No trackers yet — add one below.</p>
        )}
        {trackers.map(t => (
          <TrackerRow
            key={t.id}
            tracker={t}
            onPatch={p => patchTracker(t.id, p)}
            onDelete={() => deleteTracker(t.id)}
          />
        ))}

        {/* Add tracker */}
        <div className="rounded-lg border border-white/5 bg-brand-black p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-brand-cream/40">Add tracker</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={addProvider}
              onChange={e => setAddProvider(e.target.value as TrackerProvider)}
              className={INPUT + " sm:w-48"}
            >
              {PROVIDER_OPTIONS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <input
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTracker(); } }}
              placeholder={PROVIDER_BY_ID[addProvider].placeholder}
              className={INPUT + " font-mono text-xs flex-1 min-w-[160px]"}
            />
            <button
              onClick={addTracker}
              disabled={!addValue.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-40 shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        <p className="text-[10px] text-brand-cream/30">
          Changes apply within ~30 seconds (the loader caches the config that long). The portal tag must be installed on the site for any of this to take effect.
        </p>
      </div>
    </div>
  );
}

function TrackerRow({ tracker, onPatch, onDelete }: {
  tracker: Tracker;
  onPatch: (p: Partial<Tracker>) => void;
  onDelete: () => void;
}) {
  const meta = PROVIDER_BY_ID[tracker.provider];
  return (
    <div className="rounded-lg border border-white/8 bg-brand-black/40 p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPatch({ enabled: !tracker.enabled })}
          className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
            tracker.enabled ? "bg-green-500/80 justify-end" : "bg-white/15 justify-start"
          }`}
          aria-pressed={tracker.enabled}
          title={tracker.enabled ? "Enabled — click to pause" : "Disabled — click to enable"}
        >
          <div className="w-3 h-3 rounded-full bg-white" />
        </button>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-brand-cream/65 border border-white/10 shrink-0">
          {meta.label}
        </span>
        <input
          value={tracker.value}
          onChange={e => onPatch({ value: e.target.value })}
          placeholder={meta.placeholder}
          className={INPUT + " font-mono text-xs flex-1 min-w-[140px] py-1.5"}
        />
        <select
          value={tracker.consentCategory}
          onChange={e => onPatch({ consentCategory: e.target.value as ConsentCategory })}
          className={INPUT + " text-xs py-1.5 sm:w-32"}
          title="Which consent category gates this tracker"
        >
          <option value="functional">Functional</option>
          <option value="analytics">Analytics</option>
          <option value="marketing">Marketing</option>
        </select>
        <button
          onClick={onDelete}
          className="text-[12px] px-2 py-1 text-brand-cream/45 hover:text-red-400 shrink-0"
          aria-label="Remove tracker"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Content overrides ─────────────────────────────────────────────────────
//
// Displays every key the loader has auto-discovered on the host site
// (via [data-portal-edit] in the markup), plus any keys the admin has
// added manually. Saves the override map to /api/portal/content/[siteId]
// with a 750ms debounce so the admin can keep typing.

function ContentOverridesBlock({ siteId }: { siteId: string }) {
  const [state, setState] = useState<AdminContentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<OverrideType>("text");
  const stateRef = useRef<AdminContentState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(`/api/portal/content/${encodeURIComponent(siteId)}?admin=1`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as AdminContentState;
        if (!cancelled) setState(data);
      } catch {} finally { if (!cancelled) setLoading(false); }
    }
    pull();
    return () => { cancelled = true; };
  }, [siteId]);

  // Debounced save: 750ms after the last edit. Driven by the dirty flag so
  // the initial fetch doesn't trigger a write.
  useEffect(() => {
    if (!dirty || !state) return;
    const id = setTimeout(async () => {
      setSaving(true);
      const overrides = Object.entries(state.overrides).map(([key, o]) => ({
        key, value: o.value, type: o.type,
      }));
      try {
        const res = await fetch(`/api/portal/content/${encodeURIComponent(siteId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrides }),
        });
        if (res.ok) { setSavedAt(Date.now()); setDirty(false); }
      } catch {} finally { setSaving(false); }
    }, 750);
    return () => clearTimeout(id);
  }, [dirty, state, siteId]);

  function patchOverride(key: string, patch: Partial<ContentOverride>) {
    setState(prev => {
      if (!prev) return prev;
      const existing = prev.overrides[key] ?? { value: "", type: "text" as OverrideType, updatedAt: 0 };
      return {
        ...prev,
        overrides: { ...prev.overrides, [key]: { ...existing, ...patch, updatedAt: Date.now() } },
      };
    });
    setDirty(true);
  }

  function clearOverride(key: string) {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev.overrides };
      delete next[key];
      return { ...prev, overrides: next };
    });
    setDirty(true);
  }

  function addManual() {
    const k = newKey.trim();
    if (!k || !state) return;
    if (state.overrides[k]) return;       // already exists
    patchOverride(k, { value: "", type: newType });
    setNewKey("");
    setNewType("text");
    setAdding(false);
  }

  // Union of every key the admin should see: any discovered + any with an
  // override value. Sorted alphabetically.
  const allKeys = state
    ? Array.from(new Set([
        ...Object.keys(state.discovered),
        ...Object.keys(state.overrides),
      ])).sort()
    : [];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/55">Content overrides</p>
        <Tip text='Mark editable regions on your site with data-portal-edit="hero.headline" (and optionally data-portal-type="text|html|image-src|href"). The loader scans every page and auto-discovers keys, then applies whatever value you set here. Changes propagate within ~15 seconds.' />
        <span className="ml-auto text-[10px] text-brand-cream/40">
          {loading ? "loading…" : `${allKeys.length} ${allKeys.length === 1 ? "key" : "keys"}`}
        </span>
        {savedAt && Date.now() - savedAt < 2500 && (
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Saved</span>
        )}
        {saving && !savedAt && <span className="text-[10px] text-brand-cream/40">saving…</span>}
      </div>
      <div className="p-4 space-y-3">
        {!loading && allKeys.length === 0 && !adding && (
          <p className="text-xs text-brand-cream/40 leading-relaxed px-1">
            No editable regions discovered yet. Add <code className="font-mono text-brand-cream/65">data-portal-edit=&quot;your.key&quot;</code> attributes
            to the markup on <strong className="text-brand-cream">{siteId}</strong>; they&apos;ll appear here automatically once the page loads with the tag installed.
          </p>
        )}

        {allKeys.map(key => {
          const o = state?.overrides[key];
          const d = state?.discovered[key];
          const type: OverrideType = o?.type ?? d?.type ?? "text";
          const value = o?.value ?? "";
          return (
            <OverrideRow
              key={key}
              keyName={key}
              type={type}
              value={value}
              discovered={d}
              hasOverride={!!o}
              onChangeType={t => patchOverride(key, { type: t })}
              onChangeValue={v => patchOverride(key, { value: v })}
              onClear={() => clearOverride(key)}
            />
          );
        })}

        {adding ? (
          <div className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-brand-cream/55">Add key</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addManual(); } }}
                placeholder="hero.headline"
                className={INPUT + " font-mono text-xs flex-1 min-w-[160px]"}
                autoFocus
              />
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as OverrideType)}
                className={INPUT + " text-xs sm:w-32"}
              >
                {(Object.keys(OVERRIDE_TYPE_LABEL) as OverrideType[]).map(t => (
                  <option key={t} value={t}>{OVERRIDE_TYPE_LABEL[t]}</option>
                ))}
              </select>
              <button onClick={addManual} disabled={!newKey.trim()} className="text-xs px-3 py-2 rounded-lg bg-brand-orange text-white font-semibold disabled:opacity-40 shrink-0">
                Add
              </button>
              <button onClick={() => { setAdding(false); setNewKey(""); }} className="text-[11px] px-2 py-2 text-brand-cream/55 hover:text-brand-cream">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-white/15 text-brand-cream/65 hover:text-brand-cream hover:border-white/30"
          >
            + Add key manually
          </button>
        )}

        <p className="text-[10px] text-brand-cream/30">
          Host sites apply overrides via <code className="font-mono">window.__portal.applyOverrides()</code> automatically (a MutationObserver re-runs on SPA route changes). Call <code className="font-mono">window.__portal.refresh()</code> to bypass the 15-second cache.
        </p>
      </div>
    </div>
  );
}

function OverrideRow({ keyName, type, value, discovered, hasOverride, onChangeType, onChangeValue, onClear }: {
  keyName: string;
  type: OverrideType;
  value: string;
  discovered: DiscoveredKey | undefined;
  hasOverride: boolean;
  onChangeType: (t: OverrideType) => void;
  onChangeValue: (v: string) => void;
  onClear: () => void;
}) {
  const isMultiline = type === "text" || type === "html";
  const seenLabel = discovered?.seenOn?.length
    ? `seen on ${discovered.seenOn.slice(0, 3).join(", ")}${discovered.seenOn.length > 3 ? "…" : ""}`
    : "manually added";
  return (
    <div className="rounded-lg border border-white/8 bg-brand-black/40 p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-xs text-brand-cream bg-white/5 px-2 py-1 rounded border border-white/10 flex-1 min-w-0 truncate" title={keyName}>
          {keyName}
        </code>
        <select
          value={type}
          onChange={e => onChangeType(e.target.value as OverrideType)}
          className={INPUT + " text-xs py-1.5 sm:w-32"}
        >
          {(Object.keys(OVERRIDE_TYPE_LABEL) as OverrideType[]).map(t => (
            <option key={t} value={t}>{OVERRIDE_TYPE_LABEL[t]}</option>
          ))}
        </select>
        {hasOverride && (
          <button onClick={onClear} className="text-[11px] px-2 py-1 text-brand-cream/45 hover:text-red-400 shrink-0" title="Clear this override">
            Clear
          </button>
        )}
      </div>
      {isMultiline ? (
        <textarea
          value={value}
          onChange={e => onChangeValue(e.target.value)}
          placeholder={hasOverride ? "" : "(empty — host markup wins)"}
          rows={2}
          className={INPUT + " font-mono text-xs"}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChangeValue(e.target.value)}
          placeholder={type === "image-src" ? "https://… or /path/to.jpg" : "https://…"}
          className={INPUT + " font-mono text-xs"}
        />
      )}
      <p className="text-[10px] text-brand-cream/30 truncate" title={seenLabel}>{seenLabel}</p>
    </div>
  );
}
