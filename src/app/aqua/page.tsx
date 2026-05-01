"use client";

// /aqua — agency dashboard. Each client portal (org) is a card. Click
// "Open portal" to set the active org + drop into /admin as that tenant.
// "Configure" opens the per-org settings inline. The header has shortcuts
// to create a new portal or open the seeded Example portal.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadOrgs, listOrgs, setActiveOrgId, deleteOrg, type OrgRecord } from "@/lib/admin/orgs";
import { listSitesForOrg } from "@/lib/admin/sites";

export default function AquaDashboard() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void loadOrgs(true).then(list => {
      setOrgs(list);
      setHydrated(true);
    });
  }, []);

  function openPortal(org: OrgRecord) {
    setActiveOrgId(org.id);
    router.push("/admin");
  }

  async function handleDelete(org: OrgRecord) {
    if (org.isPrimary) { alert("The primary agency org can't be removed."); return; }
    if (!confirm(`Delete portal "${org.name}"? This removes the org but keeps its sites + content.`)) return;
    setBusy(org.id);
    try {
      const ok = await deleteOrg(org.id);
      if (ok) setOrgs(listOrgs());
    } finally { setBusy(null); }
  }

  if (!hydrated) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-[12px] text-brand-cream/45">Loading portals…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Welcome</p>
        <h1 className="font-display text-4xl text-brand-cream mb-2">Your client portals</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-2xl leading-relaxed">
          Each card below is one of your clients. Click <em>Open portal</em> to drop into their admin as that tenant —
          sidebar, sites, products, pages, billing all switch to theirs. Use <em>+ New portal</em> in the header to onboard another client.
        </p>
      </header>

      {/* Example portal callout — only when no real client portals exist yet */}
      {orgs.filter(o => !o.isPrimary).length === 0 && (
        <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-6">
          <p className="text-[10px] tracking-[0.28em] uppercase text-cyan-400 mb-2">First time here?</p>
          <h2 className="font-display text-2xl text-brand-cream mb-2">Try the example portal</h2>
          <p className="text-[12px] text-brand-cream/65 max-w-2xl leading-relaxed mb-4">
            One click seeds an &ldquo;Example Co&rdquo; portal pre-loaded with a homepage, shop, cart, checkout and a colourful
            tee with a custom-colour wheel. Walk through the visual editor, swap blocks, change colours, publish — all without
            touching a real client.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/aqua/example" className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-[13px] font-semibold hover:opacity-90">
              Open example portal →
            </Link>
            <Link href="/aqua/new" className="px-4 py-2 rounded-lg border border-white/15 text-brand-cream/85 hover:bg-white/5 text-[13px] font-semibold">
              + Create real portal
            </Link>
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs.map(org => {
          const sites = listSitesForOrg(org.id);
          return (
            <div key={org.id} className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: org.brandColor || "linear-gradient(135deg, #ff6b35 0%, #ff9a5a 100%)" }}
                >
                  {org.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={org.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    org.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg font-bold text-brand-cream truncate">
                    {org.name}
                    {org.isPrimary && <span className="ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 align-middle">Agency</span>}
                  </p>
                  <p className="text-[11px] text-brand-cream/55 font-mono truncate">{org.slug}</p>
                  {org.ownerEmail && <p className="text-[10px] text-brand-cream/40 truncate mt-0.5">{org.ownerEmail}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-brand-cream/55">
                <span>{sites.length} site{sites.length === 1 ? "" : "s"}</span>
                <span className="opacity-30">·</span>
                <span className={
                  org.status === "active" ? "text-green-400"
                  : org.status === "trialing" ? "text-brand-amber"
                  : "text-red-400"
                }>{org.status}</span>
              </div>

              <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <button
                  onClick={() => openPortal(org)}
                  className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90"
                >
                  Open portal →
                </button>
                <div className="flex gap-1.5">
                  <Link
                    href={`/aqua/${encodeURIComponent(org.id)}/configure`}
                    className="flex-1 text-center px-3 py-1.5 rounded-lg border border-white/15 text-[11px] text-brand-cream/65 hover:text-brand-cream hover:bg-white/5"
                  >
                    Configure
                  </Link>
                  {!org.isPrimary && (
                    <button
                      onClick={() => handleDelete(org)}
                      disabled={busy === org.id}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-red-500/15 text-[11px] text-red-400/70 hover:text-red-400 hover:bg-red-500/5 disabled:opacity-30"
                    >
                      {busy === org.id ? "…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <Link
          href="/aqua/new"
          className="rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-colors p-5 flex flex-col items-center justify-center gap-2 min-h-[220px] text-center"
        >
          <span className="text-3xl">＋</span>
          <span className="font-display text-base text-brand-cream">New portal</span>
          <span className="text-[11px] text-brand-cream/55 max-w-[200px] leading-relaxed">Onboard a new client. Creates an org + first site.</span>
        </Link>
      </div>
    </main>
  );
}
