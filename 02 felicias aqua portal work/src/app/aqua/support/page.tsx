"use client";

// /aqua/support — Aqua Support hub. The agency owner + their clients
// land here for feature requests, meeting bookings, billing/invoices,
// and resources/docs. Everything is org-scoped via the active-org id;
// the agency view sees all orgs at once.

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadOrgs, listOrgs, getActiveOrg, getActiveOrgId, type OrgRecord } from "@/lib/admin/orgs";
import { loadStats, formatMoney, onSupportChange, type SupportStatsResponse } from "@/lib/admin/support";

export default function AquaSupportLanding() {
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgRecord | null>(null);
  const [stats, setStats] = useState<SupportStatsResponse | null>(null);

  async function refresh() {
    const list = await loadOrgs(true);
    setOrgs(list);
    const active = getActiveOrg() ?? list.find(o => o.isPrimary) ?? list[0] ?? null;
    setActiveOrg(active ?? null);
    setStats(await loadStats(active?.id));
  }

  useEffect(() => {
    void refresh();
    return onSupportChange(() => { void refresh(); });
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header>
        <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Back to portals</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Help</p>
        <h1 className="font-display text-4xl text-brand-cream">Aqua support</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-2xl mt-1 leading-relaxed">
          File feature requests, book a meeting with your maker, view invoices, and grab the docs. Everything in one place.
        </p>
      </header>

      {/* Org switcher inline */}
      {orgs.length > 1 && (
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-brand-cream/55">Viewing:</span>
          <select
            value={activeOrg?.id ?? ""}
            onChange={async e => {
              const next = orgs.find(o => o.id === e.target.value) ?? null;
              setActiveOrg(next);
              setStats(await loadStats(next?.id));
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-brand-cream"
          >
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      )}

      {/* Quick stats */}
      <section className="grid sm:grid-cols-4 gap-3">
        <Stat label="Open requests"   value={stats ? String(stats.openRequests) : "—"}   tone="amber" />
        <Stat label="Pending meetings" value={stats ? String(stats.pendingMeetings) : "—"} tone="cyan" />
        <Stat label="Unpaid invoices" value={stats ? formatMoney(stats.unpaidPence) : "—"} tone={stats && stats.unpaidPence > 0 ? "warn" : "good"} />
        <Stat label="Total requests"  value={stats ? String(stats.totalRequests) : "—"}  tone="ink" />
      </section>

      {/* Cards */}
      <section className="grid md:grid-cols-2 gap-4">
        <SupportCard
          icon="💡"
          title="Feature requests"
          body="Tell us what's missing. Vote on existing ideas. Track status from open → planned → shipped."
          href="/aqua/support/feature-requests"
          cta="Open requests"
        />
        <SupportCard
          icon="📅"
          title="Book a meeting"
          body="Schedule a call with the team that built your portal. Suggest a few times that work for you."
          href="/aqua/support/book-meeting"
          cta="Request a meeting"
        />
        <SupportCard
          icon="💳"
          title="Plan + invoices"
          body="Switch plans, see every invoice with PDFs, and review what you've been billed."
          href="/aqua/support/billing"
          cta="View billing"
        />
        <SupportCard
          icon="📚"
          title="Resources + guides"
          body="Walkthroughs, video tutorials, API docs, and the full setup checklist."
          href="/aqua/support/resources"
          cta="Browse guides"
        />
      </section>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "amber" | "cyan" | "ink" }) {
  const cls =
    tone === "good"  ? "text-green-400 bg-green-500/10 border-green-500/20"
    : tone === "warn" ? "text-red-400 bg-red-500/10 border-red-500/20"
    : tone === "amber"? "text-brand-amber bg-brand-amber/10 border-brand-amber/25"
    : tone === "cyan" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"
    : "text-brand-cream/85 bg-white/[0.02] border-white/8";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] opacity-70 mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function SupportCard({ icon, title, body, href, cta }: { icon: string; title: string; body: string; href: string; cta: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-2xl shrink-0">{icon}</span>
        <div className="flex-1">
          <p className="font-display text-xl text-brand-cream">{title}</p>
          <p className="text-[12px] text-brand-cream/55 leading-relaxed mt-1">{body}</p>
        </div>
      </div>
      <span className="mt-auto pt-2 text-[12px] text-brand-orange group-hover:underline">{cta} →</span>
    </Link>
  );
}
