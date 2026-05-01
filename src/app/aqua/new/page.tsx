"use client";

// /aqua/new — onboard a new client portal. Creates an org, applies a
// preset (which installs a bundle of plugins), seeds a primary site,
// and drops the operator into the new tenant's admin.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrg, setActiveOrgId } from "@/lib/admin/orgs";
import { createSiteForOrg, setActiveSiteId } from "@/lib/admin/sites";

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

export default function NewPortalPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<ApiPreset[]>([]);
  const [presetId, setPresetId] = useState<string>("website-scratch");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#06b6d4");
  const [logoUrl, setLogoUrl] = useState("");
  const [siteDomain, setSiteDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/portal/presets")
      .then(r => r.json())
      .then((data: { presets: ApiPreset[] }) => setPresets(data.presets ?? []))
      .catch(() => setPresets([]));
  }, []);

  function pickPreset(id: string) {
    setPresetId(id);
    const hint = HINTS[id];
    if (hint) setBrandColor(hint.color);
  }

  function autoSlug(value: string) {
    setName(value);
    if (!slug) {
      setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const trimmed = name.trim();
      if (!trimmed) { setError("Portal name is required"); return; }
      const org = await createOrg({
        name: trimmed,
        slug: slug.trim() || undefined,
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
      router.push(`/aqua/${org.id}/marketplace`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  const activePreset = presets.find(p => p.id === presetId);

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {presets.map(p => {
              const hint = HINTS[p.id] ?? { icon: "◦", color: "#888888" };
              const active = p.id === presetId;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => pickPreset(p.id)}
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
          {activePreset && (
            <p className="text-[11px] text-brand-cream/45 mt-3 leading-relaxed">{activePreset.description}</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Identity</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Client / portal name" required>
              <input value={name} onChange={e => autoSlug(e.target.value)} placeholder="Felicia" required className={INPUT} />
            </Field>
            <Field label="URL slug">
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="felicia" className={INPUT + " font-mono"} />
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
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10" />
                <input value={brandColor} onChange={e => setBrandColor(e.target.value)} className={INPUT + " font-mono"} />
              </div>
            </Field>
            <Field label="Logo URL">
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className={INPUT + " font-mono"} />
            </Field>
          </div>
        </section>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !name}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-white text-[13px] font-semibold disabled:opacity-30 hover:opacity-90"
          >
            {busy ? "Creating…" : "Create portal + apply preset"}
          </button>
          <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/50";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">
        {label}{required && <span className="text-cyan-400 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
