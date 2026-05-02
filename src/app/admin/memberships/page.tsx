"use client";

// /admin/memberships — overview of members + tiers for the active org.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface MemberRecord {
  id: string; email: string; name?: string;
  tierId: string; joinedAt: number;
  active: boolean;
}
interface Tier { id: string; name: string; benefits: string[] }

export default function MembershipsPage() {
  return <PluginRequired plugin="memberships"><MembershipsPageInner /></PluginRequired>;
}

function MembershipsPageInner() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      try {
        const [m, t] = await Promise.all([
          fetch(`/api/portal/memberships?orgId=${orgId}`).then(r => r.json()),
          fetch(`/api/portal/memberships/tiers?orgId=${orgId}`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setMembers(m.members ?? []);
        setTiers(t.tiers ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const grouped = tiers.map(t => ({
    tier: t,
    members: members.filter(m => m.tierId === t.id && m.active),
  }));

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Memberships</p>
          <h1 className="font-display text-3xl text-brand-cream">Members</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            {members.filter(m => m.active).length} active members across {tiers.length} {tiers.length === 1 ? "tier" : "tiers"}.
          </p>
        </div>
        <Link href="/aqua/agency/plugins/memberships" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
          Configure plugin →
        </Link>
      </header>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : (
        <div className="space-y-4">
          {grouped.map(({ tier, members }) => (
            <section key={tier.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <header className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-[14px] text-brand-cream font-medium">{tier.name}</h2>
                  <p className="text-[11px] text-brand-cream/45 mt-0.5">{tier.benefits.join(" · ")}</p>
                </div>
                <span className="text-[11px] text-brand-cream/65 tabular-nums">{members.length} members</span>
              </header>
              {members.length === 0 ? (
                <p className="text-[11px] text-brand-cream/40">No members in this tier yet.</p>
              ) : (
                <ul className="space-y-1">
                  {members.slice(0, 20).map(m => (
                    <li key={m.id} className="flex items-center justify-between text-[12px]">
                      <div>
                        <span className="text-brand-cream">{m.name ?? m.email}</span>
                        {m.name && <span className="text-brand-cream/45 ml-2">{m.email}</span>}
                      </div>
                      <span className="text-[10px] text-brand-cream/35 tabular-nums">
                        Joined {new Date(m.joinedAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
