"use client";

// Empty-state wrapper for admin pages whose owning plugin isn't
// installed on the active org. Wrap the page body:
//
//   <PluginRequired plugin="ecommerce">
//     <ProductsPage />
//   </PluginRequired>
//
// Behaviour:
//   • Primary (agency) org always has access — operator sees everything.
//   • Other orgs: show "Install [plugin] from marketplace" if not
//     installed, render children otherwise.
//   • Optional sub-feature gate via `feature="…"` prop.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrg, getActiveOrgId, loadOrgs } from "@/lib/admin/orgs";
import type { OrgPluginInstall } from "@/portal/server/types";

interface Props {
  plugin: string;
  feature?: string;
  children: React.ReactNode;
}

export default function PluginRequired({ plugin, feature, children }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [orgId, setOrgId] = useState<string>("agency");
  const [isPrimary, setIsPrimary] = useState(false);
  const [install, setInstall] = useState<OrgPluginInstall | null>(null);
  const [pluginName, setPluginName] = useState<string>(plugin);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await loadOrgs(false);
      const active = getActiveOrg();
      if (cancelled || !active) {
        setHydrated(true);
        return;
      }
      setOrgId(active.id);
      setIsPrimary(active.isPrimary);
      const found = (active.plugins ?? []).find(p => p.pluginId === plugin) ?? null;
      setInstall(found);
      // Best-effort fetch the plugin name for the empty-state copy.
      try {
        const res = await fetch("/api/portal/plugins");
        const data = await res.json() as { plugins: { id: string; name: string }[] };
        const meta = data.plugins.find(p => p.id === plugin);
        if (meta) setPluginName(meta.name);
      } catch { /* leave id as fallback */ }
      setHydrated(true);
    }
    void load();
    return () => { cancelled = true; };
  }, [plugin]);

  if (!hydrated) {
    return <div className="px-6 py-10 text-[12px] text-brand-cream/45">Loading…</div>;
  }

  // Primary org sees everything regardless of installs.
  if (isPrimary) return <>{children}</>;

  // Plugin not installed (or disabled) for this org.
  if (!install || !install.enabled) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Plugin not installed</p>
        <h1 className="font-display text-2xl text-brand-cream">{pluginName} isn&apos;t set up for this portal yet.</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-md mx-auto leading-relaxed">
          This page belongs to the <span className="text-brand-cream/85">{pluginName}</span> plugin.
          Install it from the marketplace to start using these features for this client.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/aqua/${orgId}/marketplace`}
            className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium transition-colors"
          >
            Open marketplace →
          </Link>
          <Link
            href="/aqua"
            className="text-[12px] text-brand-cream/55 hover:text-brand-cream transition-colors"
          >
            Back to portals
          </Link>
        </div>
      </main>
    );
  }

  // Plugin installed but the requested sub-feature isn't enabled.
  if (feature && install.features?.[feature] !== true) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-[10px] tracking-[0.32em] uppercase text-amber-300">Feature off</p>
        <h1 className="font-display text-2xl text-brand-cream">This feature is turned off for this portal.</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-md mx-auto">
          The <span className="text-brand-cream/85">{feature}</span> feature is part of the {pluginName} plugin
          but isn&apos;t enabled for this client. Toggle it from the plugin&apos;s configure page.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={`/aqua/${orgId}/plugins/${plugin}`}
            className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium transition-colors"
          >
            Configure {pluginName} →
          </Link>
          <Link
            href={`/aqua/${getActiveOrgId()}/marketplace`}
            className="text-[12px] text-brand-cream/55 hover:text-brand-cream transition-colors"
          >
            Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
