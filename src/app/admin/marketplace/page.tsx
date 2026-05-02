"use client";

// /admin/marketplace — agency-facing plugin marketplace inside the
// per-tenant admin chrome. Operates on the active org so the agency
// owner can install / configure / disable plugins for the client they're
// currently working with, without bouncing back to /aqua.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginMarketplace from "@/components/admin/PluginMarketplace";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId, getActiveOrg, loadOrgs, onOrgsChange } from "@/lib/admin/orgs";
import { refreshInstalledPlugins } from "@/lib/admin/installedPlugins";
import type { OrgRecord } from "@/portal/server/types";

export default function AdminMarketplacePage() {
  const [orgId, setOrgId] = useState<string>("");
  const [org, setOrg] = useState<OrgRecord | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    function refresh() {
      const id = getActiveOrgId();
      if (cancelled) return;
      setOrgId(id);
      setOrg(getActiveOrg());
    }
    void loadOrgs(false).then(refresh);
    return onOrgsChange(refresh);
  }, []);

  if (!orgId) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <PageSpinner wrap={false} />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Marketplace</p>
        <h1 className="font-display text-3xl text-brand-cream mb-2">
          Plugins for {org?.name ?? orgId}
          {org?.isPrimary && <span className="ml-3 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 align-middle">Agency</span>}
        </h1>
        <p className="text-[13px] text-brand-cream/55 max-w-2xl leading-relaxed">
          Install or remove features for the active client portal. Sidebar nav updates immediately as plugins go in or out — installed plugins surface their admin pages in the matching panel.
        </p>
        <p className="text-[11px] text-brand-cream/40 mt-2">
          Need the agency-wide view across all clients? <Link href="/aqua" className="text-cyan-300/80 hover:text-cyan-200">Open the Aqua dashboard →</Link>
        </p>
      </header>

      <PluginMarketplace
        orgId={orgId}
        // After every install/uninstall, refresh the per-tenant sidebar
        // so the new plugin's pages show up (or removed plugin's go away)
        // without a full reload.
        onChange={() => { void refreshInstalledPlugins(); }}
      />
    </main>
  );
}
