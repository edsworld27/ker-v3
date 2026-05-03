"use client";

// /admin/memberships/members — member directory.
//
// Searchable / tier-filtered list. Operators can change a member's
// tier inline or cancel their membership (sets active=false). CSV
// export for the whole filtered view.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { confirm } from "@/components/admin/ConfirmHost";
import { notify } from "@/components/admin/Toaster";
import { friendlyError } from "@/lib/admin/friendlyError";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface MemberRecord {
  id: string;
  email: string;
  name?: string;
  tierId: string;
  joinedAt: number;
  expiresAt?: number;
  active: boolean;
  cancelledAt?: number;
}
interface Tier { id: string; name: string; benefits: string[] }

export default function MembershipMembersPage() {
  return (
    <PluginRequired plugin="memberships">
      <MembersPageInner />
    </PluginRequired>
  );
}

function MembersPageInner() {
  const [orgId, setOrgId] = useState<string>("");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  useEffect(() => {
    setOrgId(getActiveOrgId());
  }, []);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [mRes, tRes] = await Promise.all([
          fetch(`/api/portal/memberships?orgId=${orgId}&includeCancelled=${includeCancelled ? 1 : 0}`, { cache: "no-store" }),
          fetch(`/api/portal/memberships/tiers?orgId=${orgId}`, { cache: "no-store" }),
        ]);
        const m = await mRes.json() as { members?: MemberRecord[] };
        const t = await tRes.json() as { tiers?: Tier[] };
        if (cancelled) return;
        setMembers(m.members ?? []);
        setTiers(t.tiers ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId, includeCancelled]);

  const tierName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tiers) map[t.id] = t.name;
    return (id: string) => map[id] ?? id;
  }, [tiers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(m => {
      if (tierFilter !== "all" && m.tierId !== tierFilter) return false;
      if (!q) return true;
      return m.email.toLowerCase().includes(q) ||
        (m.name?.toLowerCase().includes(q) ?? false);
    });
  }, [members, tierFilter, query]);

  async function changeTier(member: MemberRecord, newTierId: string) {
    if (newTierId === member.tierId || !orgId) return;
    setBusyEmail(member.email);
    try {
      const res = await fetch("/api/portal/memberships", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgId, email: member.email, name: member.name, tierId: newTierId,
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string; member?: MemberRecord };
      if (!data.ok || !data.member) {
        const f = friendlyError(data.error, "Couldn't update tier");
        notify({ tone: "error", title: f.title, message: f.hint ? `${f.message} ${f.hint}` : f.message });
        return;
      }
      setMembers(prev => prev.map(m => m.email === member.email ? data.member! : m));
      notify({ tone: "ok", message: `Moved ${member.email} to ${tierName(newTierId)}` });
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusyEmail(null);
    }
  }

  async function cancel(member: MemberRecord) {
    if (!orgId) return;
    const ok = await confirm({
      title: `Cancel ${member.email}'s membership?`,
      message: "They'll lose access to gated content immediately. Their record stays so you can reactivate later.",
      danger: true,
      confirmLabel: "Cancel membership",
    });
    if (!ok) return;
    setBusyEmail(member.email);
    try {
      const res = await fetch(
        `/api/portal/memberships?orgId=${encodeURIComponent(orgId)}&email=${encodeURIComponent(member.email)}`,
        { method: "DELETE" },
      );
      const data = await res.json() as { ok: boolean; cancelled?: boolean };
      if (!data.cancelled) {
        notify({ tone: "warn", message: "Member not found." });
        return;
      }
      setMembers(prev => prev.map(m => m.email === member.email
        ? { ...m, active: false, cancelledAt: Date.now() }
        : m));
      if (!includeCancelled) {
        setMembers(prev => prev.filter(m => m.email !== member.email));
      }
      notify({ tone: "ok", message: `Cancelled ${member.email}` });
    } catch (e: unknown) {
      notify({ tone: "error", title: "Network error", message: e instanceof Error ? e.message : "Try again." });
    } finally {
      setBusyEmail(null);
    }
  }

  function exportCsv() {
    if (filtered.length === 0) {
      notify("Nothing to export with these filters.");
      return;
    }
    const header = ["email", "name", "tier", "status", "joined", "expires"].join(",");
    const rows = filtered.map(m => [
      m.email,
      m.name ?? "",
      tierName(m.tierId),
      m.active ? "active" : "cancelled",
      new Date(m.joinedAt).toISOString(),
      m.expiresAt ? new Date(m.expiresAt).toISOString() : "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${orgId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = members.filter(m => m.active).length;
  const cancelledCount = members.filter(m => !m.active).length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <Link href="/admin/memberships" className="text-xs text-brand-cream/55 hover:text-brand-cream inline-block">
        ← Memberships
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Memberships</p>
          <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Members</h1>
          <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
            Everyone who's signed up across your tiers. {activeCount} active
            {cancelledCount > 0 && <> · {cancelledCount} cancelled</>}.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 hover:border-white/30 px-3 py-1.5 disabled:opacity-40 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[12rem] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        />
        <select
          value={tierFilter}
          onChange={e => setTierFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
        >
          <option value="all">All tiers</option>
          {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-[12px] text-brand-cream/65 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeCancelled}
            onChange={e => setIncludeCancelled(e.target.checked)}
            className="accent-brand-amber"
          />
          Show cancelled
        </label>
      </div>

      {loading ? (
        <PageSpinner wrap={false} />
      ) : members.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No members yet</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto leading-relaxed">
            When someone signs up via the storefront they'll appear here. Members from forms / e-commerce orders are auto-imported.
          </p>
          <Link
            href="/admin/memberships/tiers"
            className="inline-block mt-4 text-[11px] uppercase tracking-[0.2em] text-brand-cream/85 hover:text-brand-cream rounded-lg border border-white/15 px-3 py-1.5"
          >
            Configure tiers →
          </Link>
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No matches</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">Try clearing the filters above.</p>
        </section>
      ) : (
        <ul className="rounded-2xl border border-white/8 bg-brand-black-card divide-y divide-white/5 overflow-hidden">
          {filtered.map(m => (
            <li key={m.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[12rem]">
                <div className="text-[13px] text-brand-cream">{m.name ?? m.email}</div>
                {m.name && (
                  <Link
                    href={`/admin/customers/${encodeURIComponent(m.email)}`}
                    className="text-[11px] text-brand-cream/55 hover:text-cyan-200 font-mono"
                  >
                    {m.email}
                  </Link>
                )}
                {!m.name && (
                  <Link
                    href={`/admin/customers/${encodeURIComponent(m.email)}`}
                    className="text-[11px] text-cyan-300/80 hover:text-cyan-200"
                  >
                    Profile →
                  </Link>
                )}
              </div>

              <div className="text-[11px] text-brand-cream/55 tabular-nums w-24">
                {new Date(m.joinedAt).toLocaleDateString()}
              </div>

              <select
                value={m.tierId}
                onChange={e => changeTier(m, e.target.value)}
                disabled={!m.active || busyEmail === m.email || tiers.length === 0}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[12px] text-brand-cream focus:outline-none focus:border-brand-orange/50 disabled:opacity-50"
              >
                {tiers.find(t => t.id === m.tierId) ? null : (
                  <option value={m.tierId}>{m.tierId} (deleted)</option>
                )}
                {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <span
                className={`text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ${
                  m.active
                    ? "bg-green-500/15 text-green-400"
                    : "bg-red-500/10 text-red-400/80"
                }`}
              >
                {m.active ? "Active" : "Cancelled"}
              </span>

              {m.active ? (
                <button
                  type="button"
                  onClick={() => cancel(m)}
                  disabled={busyEmail === m.email}
                  className="text-[11px] text-brand-cream/55 hover:text-red-400 disabled:opacity-40"
                >
                  {busyEmail === m.email ? "…" : "Cancel"}
                </button>
              ) : (
                <span className="w-[3.5rem]" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
