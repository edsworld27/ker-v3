"use client";

// /aqua/[orgId]/configure — per-portal settings reachable from the
// agency dashboard's Configure button. Adjusts identity + branding
// without dropping into the tenant's admin first.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { loadOrgs, getOrg, updateOrg, setActiveOrgId, type OrgRecord } from "@/lib/admin/orgs";
import { listSitesForOrg } from "@/lib/admin/sites";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

export default function ConfigurePortalPage() {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const orgId = params?.orgId ?? "";

  const [org, setOrg] = useState<OrgRecord | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#ff6b35");
  const [logoUrl, setLogoUrl] = useState("");
  const [status, setStatus] = useState<OrgRecord["status"]>("active");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await loadOrgs(true);
      const loaded = getOrg(orgId);
      if (!loaded) { setError("Portal not found"); return; }
      setOrg(loaded);
      setName(loaded.name);
      setSlug(loaded.slug);
      setOwnerEmail(loaded.ownerEmail ?? "");
      setBrandColor(loaded.brandColor ?? "#ff6b35");
      setLogoUrl(loaded.logoUrl ?? "");
      setStatus(loaded.status);
    })();
  }, [orgId]);

  async function save(patch: Partial<OrgRecord>) {
    setError(null);
    try {
      const next = await updateOrg(orgId, patch);
      if (next) { setOrg(next); setSavedAt(Date.now()); }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function openPortal() {
    setActiveOrgId(orgId);
    router.push("/admin");
  }

  if (!org && !error) return <main className="max-w-3xl mx-auto px-6 py-10 text-[12px] text-brand-cream/55">Loading…</main>;
  if (error) return <main className="max-w-3xl mx-auto px-6 py-10 text-[12px] text-red-400">{error} · <Link href="/aqua" className="underline">back to portals</Link></main>;
  if (!org) return null;

  const sites = listSitesForOrg(orgId);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Back to portals</Link>
          <h1 className="font-display text-3xl text-brand-cream mt-3">{org.name}</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1 font-mono">{org.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openPortal} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90">
            Open portal →
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Identity</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name">
            <input value={name} onChange={e => setName(e.target.value)} onBlur={() => name !== org.name && save({ name })} className={INPUT} />
          </Field>
          <Field label="Slug">
            <input value={slug} onChange={e => setSlug(e.target.value)} onBlur={() => slug !== org.slug && save({ slug })} className={INPUT + " font-mono"} />
          </Field>
          <Field label="Owner email">
            <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} onBlur={() => ownerEmail !== (org.ownerEmail ?? "") && save({ ownerEmail: ownerEmail || undefined })} className={INPUT} />
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => { const s = e.target.value as OrgRecord["status"]; setStatus(s); save({ status: s }); }} className={INPUT}>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Branding</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Brand colour">
            <div className="flex gap-2">
              <input type="color" value={brandColor} onChange={e => { setBrandColor(e.target.value); save({ brandColor: e.target.value }); }} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10" />
              <input value={brandColor} onChange={e => setBrandColor(e.target.value)} onBlur={() => brandColor !== (org.brandColor ?? "") && save({ brandColor: brandColor || undefined })} className={INPUT + " font-mono"} />
            </div>
          </Field>
          <Field label="Logo URL">
            <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} onBlur={() => logoUrl !== (org.logoUrl ?? "") && save({ logoUrl: logoUrl || undefined })} placeholder="https://..." className={INPUT + " font-mono"} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-3">Sites in this portal</p>
        {sites.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No sites yet — create one inside the portal admin.</p>
        ) : (
          <ul className="space-y-1.5">
            {sites.map(s => (
              <li key={s.id} className="flex items-center gap-3 text-[12px] text-brand-cream/85">
                <span className="font-medium">{s.name}</span>
                <span className="text-brand-cream/45 font-mono">{s.primaryDomain || s.domains?.[0] || "—"}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5">{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {savedAt && <p className="text-[11px] text-brand-cream/55">Saved</p>}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">{label}</span>
      {children}
    </label>
  );
}
