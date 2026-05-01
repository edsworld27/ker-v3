"use client";

// /aqua/felicia — Felicia's dedicated portal overview.
//
// Lives inside the Aqua portal app. Acts as the "home" for the
// felicia tenant: brand identity, installed plugins, recent activity,
// quick links into her admin. When Felicia's storefront is extracted
// to its own repo, an <EmbeddedPortal /> on her site iframes
// /embed/login (and from there, admin?org=felicia) — this page is the
// landing the iframe reaches once the operator is signed in.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setActiveOrgId, getOrg, loadOrgs, type OrgRecord } from "@/lib/admin/orgs";

interface InstalledPlugin {
  pluginId: string;
  enabled: boolean;
  installedAt: number;
}
interface RegistryPlugin {
  id: string; name: string; tagline: string; category: string;
}

const FELICIA_ORG_ID = "felicia";

export default function FeliciaPortalPage() {
  const router = useRouter();
  const [org, setOrg] = useState<OrgRecord | null>(null);
  const [installs, setInstalls] = useState<InstalledPlugin[]>([]);
  const [registry, setRegistry] = useState<RegistryPlugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await loadOrgs(true);
      const found = getOrg(FELICIA_ORG_ID) ?? null;
      if (!cancelled) setOrg(found);
      try {
        const [r, i] = await Promise.all([
          fetch("/api/portal/plugins").then(x => x.json()),
          fetch(`/api/portal/orgs/${FELICIA_ORG_ID}/plugins`).then(x => x.json()),
        ]);
        if (!cancelled) {
          setRegistry(r.plugins ?? []);
          setInstalls(i.installs ?? []);
        }
      } catch { /* portal might be cold-starting; show empty state */ }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function openAdmin() {
    setActiveOrgId(FELICIA_ORG_ID);
    router.push("/admin");
  }

  const installedMeta = installs
    .filter(i => i.enabled)
    .map(i => ({ install: i, meta: registry.find(p => p.id === i.pluginId) }))
    .filter((x): x is { install: InstalledPlugin; meta: RegistryPlugin } => Boolean(x.meta));

  if (loading) {
    return <main className="max-w-5xl mx-auto px-6 py-12 text-[12px] text-brand-cream/45">Loading Felicia&apos;s portal…</main>;
  }

  if (!org) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Felicia portal</p>
        <h1 className="font-display text-2xl text-brand-cream">Org not seeded yet.</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-md mx-auto">
          Create an org with id <code className="font-mono text-brand-cream/85">felicia</code>
          (or pick the &ldquo;E-commerce store&rdquo; preset on the new-portal flow) to wire this page up.
        </p>
        <Link
          href="/aqua/new"
          className="inline-block px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 text-[12px]"
        >
          + New portal →
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/aqua" className="text-[11px] text-cyan-400/70 hover:text-cyan-300 transition-colors">
            ← All portals
          </Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Felicia</p>
          <div className="flex items-center gap-3">
            {org.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={org.logoUrl} alt="" className="h-10 w-auto object-contain" />
            )}
            <h1 className="font-display text-3xl text-brand-cream">{org.name}</h1>
          </div>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-xl">
            Felicia&apos;s portal lives here inside Aqua. When her storefront is split into its own repo,
            an <code className="font-mono text-[11px]">&lt;EmbeddedPortal /&gt;</code> on luvandker.com iframes
            <code className="font-mono text-[11px]"> /embed/login</code>, then admin once the operator signs in.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={openAdmin}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-[13px] font-semibold hover:opacity-90"
          >
            Open admin →
          </button>
          <Link
            href={`/aqua/${FELICIA_ORG_ID}/marketplace`}
            className="px-3 py-2 rounded-lg border border-cyan-400/20 text-cyan-300 text-[12px] text-center hover:bg-cyan-500/10"
          >
            Plugins
          </Link>
          <Link
            href={`/aqua/${FELICIA_ORG_ID}/configure`}
            className="px-3 py-2 rounded-lg border border-white/10 text-brand-cream/65 text-[12px] text-center hover:bg-white/5"
          >
            Configure
          </Link>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Installed plugins</h2>
          <span className="text-[11px] text-brand-cream/45 tabular-nums">{installedMeta.length} active</span>
        </div>
        {installedMeta.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">
            No plugins installed yet. Open the marketplace to add the storefront essentials.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {installedMeta.map(({ install, meta }) => (
              <Link
                key={install.pluginId}
                href={`/aqua/${FELICIA_ORG_ID}/plugins/${install.pluginId}`}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-[12px] text-brand-cream font-medium">{meta.name}</p>
                <p className="text-[11px] text-brand-cream/55 line-clamp-2 mt-1">{meta.tagline}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Embedding in the storefront</h2>
        <p className="text-[12px] text-brand-cream/65 leading-relaxed mb-3">
          When you split Felicia&apos;s site into its own repo, drop this on any of her routes:
        </p>
        <pre className="rounded-lg bg-black/40 border border-white/5 p-3 text-[11px] font-mono text-brand-cream/85 overflow-x-auto">
{`import EmbeddedPortal from "@/components/EmbeddedPortal";

export default function AdminGate() {
  return (
    <EmbeddedPortal
      portalUrl="https://portal.aqua.com"
      siteId="felicia"
      mode="login"
    />
  );
}`}
        </pre>
        <p className="text-[11px] text-brand-cream/45 mt-3">
          Cookies + sessions live on portal.aqua.com (the iframe&apos;s origin).
          Felicia&apos;s site never touches credentials. Cross-origin signal flows
          through <code className="font-mono">postMessage</code> for resize + auth-status hints only.
        </p>
      </section>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Extraction status</h2>
        <p className="text-[12px] text-brand-cream/65 leading-relaxed">
          Today this monorepo holds both Felicia&apos;s storefront <em>and</em> the Aqua portal.
          Run <code className="font-mono text-brand-cream/85">bash scripts/extract.sh</code> to split into
          two deployable folders under <code className="font-mono">out/</code>. See <a href="/EXTRACTION.md" className="text-cyan-300 hover:underline">EXTRACTION.md</a> for the
          full plan + cross-origin checklist.
        </p>
      </section>
    </main>
  );
}
