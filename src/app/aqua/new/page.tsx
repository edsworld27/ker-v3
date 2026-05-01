"use client";

// /aqua/new — onboard a new client portal. Creates an org + a primary
// site for it, sets the active org so the agency owner drops straight
// into the new tenant's admin.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrg, setActiveOrgId } from "@/lib/admin/orgs";
import { createSiteForOrg, setActiveSiteId } from "@/lib/admin/sites";

const PRESETS = [
  { name: "E-commerce store",   icon: "🛍", color: "#ff6b35", tagline: "Sell physical or digital goods.", siteSlug: "shop" },
  { name: "Service business",   icon: "✦", color: "#06b6d4", tagline: "Booking-driven studio or agency.",  siteSlug: "services" },
  { name: "Personal brand",     icon: "★", color: "#a855f7", tagline: "Author, coach, or creator.",        siteSlug: "site" },
  { name: "Restaurant / cafe",  icon: "🍽", color: "#ef4444", tagline: "Menu + reservations + ordering.",   siteSlug: "menu" },
  { name: "Custom",             icon: "▢", color: "#888888", tagline: "Start from scratch.",                siteSlug: "site" },
];

export default function NewPortalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#ff6b35");
  const [logoUrl, setLogoUrl] = useState("");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [siteDomain, setSiteDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickPreset(p: typeof PRESETS[0]) {
    setPreset(p);
    setBrandColor(p.color);
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
      });
      if (!org) { setError("Could not create portal — try again"); return; }
      // Seed a primary site so the new portal's admin isn't empty.
      const site = createSiteForOrg(org.id, {
        name: trimmed,
        slug: preset.siteSlug,
        domains: siteDomain.trim() ? [siteDomain.trim()] : [],
        tagline: preset.tagline,
      });
      setActiveOrgId(org.id);
      setActiveSiteId(site.id);
      router.push("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <header>
        <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Back to portals</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Onboard</p>
        <h1 className="font-display text-3xl text-brand-cream">New client portal</h1>
        <p className="text-[13px] text-brand-cream/55 mt-1">Each portal is an isolated tenant with its own sites, branding + plan.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset picker */}
        <section>
          <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-2">What kind of portal?</p>
          <div className="grid sm:grid-cols-3 gap-2">
            {PRESETS.map(p => {
              const active = p.name === preset.name;
              return (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => pickPreset(p)}
                  className={`text-left p-3 rounded-xl border transition-colors ${active ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
                >
                  <p className="text-base mb-1">{p.icon}</p>
                  <p className="text-[12px] font-semibold text-brand-cream">{p.name}</p>
                  <p className="text-[10px] text-brand-cream/55 leading-relaxed mt-0.5">{p.tagline}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Identity */}
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

        {/* Branding */}
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
            className="px-4 py-2.5 rounded-xl bg-brand-orange text-white text-[13px] font-semibold disabled:opacity-30 hover:opacity-90"
          >
            {busy ? "Creating…" : "Create portal + open admin"}
          </button>
          <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">Cancel</Link>
        </div>
      </form>
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">
        {label}{required && <span className="text-brand-orange ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
