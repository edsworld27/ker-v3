"use client";

// /admin/affiliates — manage affiliate program, approve pending,
// see per-affiliate performance.

import { useEffect, useState } from "react";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Affiliate {
  id: string; email: string; name: string; code: string;
  commissionRate: number; status: "pending" | "approved" | "suspended";
  totalEarned: number; totalPaid: number; createdAt: number;
}

export default function AffiliatesPage() {
  return <PluginRequired plugin="affiliates"><AffiliatesPageInner /></PluginRequired>;
}

function AffiliatesPageInner() {
  const [list, setList] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/affiliates?orgId=${orgId}`);
    const data = await res.json();
    setList(data.affiliates ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function setStatus(id: string, status: Affiliate["status"]) {
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/affiliates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, status }),
    });
    await load();
  }

  if (loading) return <main className="p-6 text-[12px] text-brand-cream/45">Loading…</main>;

  const pending  = list.filter(a => a.status === "pending");
  const approved = list.filter(a => a.status === "approved");
  const suspended = list.filter(a => a.status === "suspended");

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Affiliates</p>
        <h1 className="font-display text-3xl text-brand-cream">Affiliate program</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">
          {approved.length} approved · {pending.length} pending · {suspended.length} suspended
        </p>
      </header>

      {pending.length > 0 && (
        <Section title="Pending approval">
          {pending.map(a => (
            <Row key={a.id} aff={a}>
              <button onClick={() => setStatus(a.id, "approved")} className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200">Approve</button>
              <button onClick={() => setStatus(a.id, "suspended")} className="px-2.5 py-1 rounded-md text-[11px] text-red-300/70 hover:text-red-300">Reject</button>
            </Row>
          ))}
        </Section>
      )}

      <Section title="Approved">
        {approved.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">No approved affiliates yet.</p>
        ) : approved.map(a => (
          <Row key={a.id} aff={a}>
            <button onClick={() => setStatus(a.id, "suspended")} className="px-2.5 py-1 rounded-md text-[11px] text-red-300/70 hover:text-red-300">Suspend</button>
          </Row>
        ))}
      </Section>

      {suspended.length > 0 && (
        <Section title="Suspended">
          {suspended.map(a => (
            <Row key={a.id} aff={a}>
              <button onClick={() => setStatus(a.id, "approved")} className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200">Re-approve</button>
            </Row>
          ))}
        </Section>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({ aff, children }: { aff: Affiliate; children: React.ReactNode }) {
  const earned = `£${(aff.totalEarned / 100).toFixed(2)}`;
  return (
    <article className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-brand-cream font-medium">{aff.name}</span>
          <span className="text-[10px] font-mono text-cyan-300/80">{aff.code}</span>
        </div>
        <p className="text-[11px] text-brand-cream/55">{aff.email} · {aff.commissionRate}% · earned {earned}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {children}
      </div>
    </article>
  );
}
