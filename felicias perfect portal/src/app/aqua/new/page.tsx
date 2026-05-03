"use client";

// /aqua/new — onboard a new client portal. Creates an org, applies a
// preset (which installs a bundle of plugins), seeds a primary site,
// and drops the operator into the new tenant's admin.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrg, setActiveOrgId } from "@/lib/admin/orgs";
import { createSiteForOrg, setActiveSiteId } from "@/lib/admin/sites";
import { notify } from "@/components/admin/Toaster";

interface ApiPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  plugins: { pluginId: string }[];
}

// Visual hints layered on top of the data-driven preset list. Falls
// back to a neutral palette if the preset id isn't recognised here.
const HINTS: Record<string, { icon: string; color: string; siteSlug: string }> = {
  empty:               { icon: "▢", color: "#64748b", siteSlug: "site" },
  "website-scratch":   { icon: "✦", color: "#06b6d4", siteSlug: "site" },
  "website-existing":  { icon: "↻", color: "#06b6d4", siteSlug: "site" },
  "ecommerce-physical":{ icon: "🛍", color: "#ff6b35", siteSlug: "shop" },
  "ecommerce-digital": { icon: "↓", color: "#a855f7", siteSlug: "shop" },
  "ecommerce-hybrid":  { icon: "◇", color: "#f59e0b", siteSlug: "shop" },
  blog:                { icon: "✎", color: "#22d3ee", siteSlug: "blog" },
  marketing:           { icon: "★", color: "#ef4444", siteSlug: "site" },
  saas:                { icon: "◈", color: "#0ea5e9", siteSlug: "site" },
};

function normaliseSlug(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewPortalPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<ApiPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<string>("website-scratch");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#06b6d4");
  const [logoUrl, setLogoUrl] = useState("");
  const [siteDomain, setSiteDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Move focus to the name field as soon as the page renders so the
  // operator can start typing without reaching for the mouse.
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Load presets — surface errors so the form isn't silently empty.
  useEffect(() => {
    let cancelled = false;
    setPresetsLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/portal/presets");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { presets?: ApiPreset[] };
        if (cancelled) return;
        setPresets(data.presets ?? []);
        setPresetsError(null);
      } catch (e) {
        if (cancelled) return;
        setPresetsError(e instanceof Error ? e.message : "Failed to load presets");
      } finally {
        if (!cancelled) setPresetsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function pickPreset(id: string) {
    setPresetId(id);
    const hint = HINTS[id];
    if (hint) setBrandColor(hint.color);
  }

  function autoSlug(value: string) {
    setName(value);
    if (!slugTouched.current) setSlug(normaliseSlug(value));
  }

  function handleSlugInput(value: string) {
    slugTouched.current = true;
    setSlug(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const trimmed = name.trim();
      if (!trimmed) { setError("Portal name is required"); return; }
      const finalSlug = (slug.trim() || normaliseSlug(trimmed));
      const org = await createOrg({
        name: trimmed,
        slug: finalSlug || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
        brandColor: brandColor || undefined,
        logoUrl: logoUrl.trim() || undefined,
        presetId,
      });
      if (!org) { setError("Could not create portal — try again"); return; }
      const siteSlug = HINTS[presetId]?.siteSlug ?? "site";
      const site = createSiteForOrg(org.id, {
        name: trimmed,
        slug: siteSlug,
        domains: siteDomain.trim() ? [siteDomain.trim()] : [],
        tagline: presets.find(p => p.id === presetId)?.tagline ?? "",
      });
      setActiveOrgId(org.id);
      setActiveSiteId(site.id);
      notify({
        tone: "ok",
        title: `${trimmed} portal created`,
        message: presets.find(p => p.id === presetId)?.plugins.length
          ? `Applied ${presets.find(p => p.id === presetId)!.plugins.length} preset plugins. You can install more from the marketplace.`
          : "You can install plugins from the marketplace.",
      });
      router.push(`/aqua/${org.id}/marketplace`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  const activePreset = presets.find(p => p.id === presetId);
  const slugPreview = slug.trim() || normaliseSlug(name);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <header>
        <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Back to portals</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Onboard</p>
        <h1 className="font-display text-3xl text-brand-cream">New client portal</h1>
        <p className="text-[13px] text-brand-cream/55 mt-1">
          Pick a preset (a bundle of plugins) and we&apos;ll boot the portal with everything wired up.
          You can install or remove plugins later from the marketplace.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-2">Pick a preset</p>
          {presetsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 animate-pulse">
                  <div className="h-5 w-5 rounded bg-white/5 mb-2" />
                  <div className="h-3 w-24 rounded bg-white/5 mb-1" />
                  <div className="h-2 w-32 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : presetsError ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/5 p-4 text-[12px] text-red-300 flex items-center gap-3">
              <span>{presetsError}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="ml-auto text-[11px] underline hover:text-red-200"
              >Retry</button>
            </div>
          ) : presets.length === 0 ? (
            <p className="text-[12px] text-brand-cream/45">No presets available. The portal will be created empty.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presets.map(p => {
                const hint = HINTS[p.id] ?? { icon: "◦", color: "#888888" };
                const active = p.id === presetId;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => pickPreset(p.id)}
                    aria-pressed={active}
                    className={`text-left p-3 rounded-xl border transition-colors ${active ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
                  >
                    <p className="text-base mb-1" style={{ color: hint.color }}>{hint.icon}</p>
                    <p className="text-[12px] font-semibold text-brand-cream">{p.name}</p>
                    <p className="text-[10px] text-brand-cream/55 leading-relaxed mt-0.5">{p.tagline}</p>
                    <p className="text-[10px] text-brand-cream/40 mt-1">
                      {p.plugins.length} {p.plugins.length === 1 ? "plugin" : "plugins"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          {activePreset && (
            <p className="text-[11px] text-brand-cream/45 mt-3 leading-relaxed">{activePreset.description}</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-start gap-4">
            {/* Live brand chip — preview the new portal card before it exists */}
            <div
              className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold border border-white/10"
              style={{ background: brandColor || "linear-gradient(135deg, #ff6b35 0%, #ff9a5a 100%)" }}
              aria-hidden="true"
            >
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="" className="w-full h-full object-cover rounded-xl" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                initial
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Identity</p>
              <p className="text-[11px] text-brand-cream/55 mt-1">Live preview of how this portal will appear in the agency dashboard.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Client / portal name" required>
              <input ref={nameRef} value={name} onChange={e => autoSlug(e.target.value)} placeholder="Felicia" required autoComplete="off" className={INPUT} />
            </Field>
            <Field label="URL slug" hint={slugPreview && slug !== slugPreview ? `Auto: ${slugPreview}` : undefined}>
              <input value={slug} onChange={e => handleSlugInput(e.target.value)} placeholder={slugPreview || "felicia"} className={INPUT + " font-mono"} />
            </Field>
            <Field label="Client email">
              <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="felicia@example.com" className={INPUT} />
            </Field>
            <Field label="Primary domain">
              <input value={siteDomain} onChange={e => setSiteDomain(e.target.value)} placeholder="luvandker.com" className={INPUT + " font-mono"} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Branding</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Brand colour">
              <div className="flex gap-2">
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10" aria-label="Pick brand colour" />
                <input value={brandColor} onChange={e => setBrandColor(e.target.value)} placeholder="#06b6d4" className={INPUT + " font-mono"} />
              </div>
            </Field>
            <Field label="Logo URL">
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className={INPUT + " font-mono"} />
            </Field>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-white text-[13px] font-semibold disabled:opacity-30 hover:opacity-90"
          >
            {busy ? "Creating…" : "Create portal + apply preset →"}
          </button>
          <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/50";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2 text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">
        <span>{label}{required && <span className="text-cyan-400 ml-1">*</span>}</span>
        {hint && <span className="ml-auto normal-case tracking-normal text-[10px] text-brand-cream/40 font-mono">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
