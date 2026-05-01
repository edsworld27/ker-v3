"use client";

// /admin/notifications — full feed, mark-all-read, category filter.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Notification {
  id: string; category: string; title: string; body: string;
  link?: string; read: boolean; createdAt: number;
}

const CATEGORY_DOTS: Record<string, string> = {
  order: "bg-emerald-400",
  booking: "bg-cyan-400",
  form: "bg-amber-400",
  subscription: "bg-purple-400",
  newsletter: "bg-pink-400",
  plugin: "bg-blue-400",
  system: "bg-white/30",
};

export default function NotificationsPage() {
  return <PluginRequired plugin="notifications"><NotificationsPageInner /></PluginRequired>;
}

function NotificationsPageInner() {
  const [list, setList] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/notifications?orgId=${orgId}`);
    const data = await res.json();
    setList(data.notifications ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function markAllRead() {
    const orgId = getActiveOrgId();
    await fetch("/api/portal/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    await load();
  }

  async function markRead(id: string) {
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    await load();
  }

  const categories = [...new Set(list.map(n => n.category))];
  const visible = filter === "all" ? list : list.filter(n => n.category === filter);
  const unread = list.filter(n => !n.read).length;

  if (loading) return <main className="p-6 text-[12px] text-brand-cream/45">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Notifications</p>
          <h1 className="font-display text-3xl text-brand-cream">Activity feed</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{unread} unread of {list.length}</p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="px-3 py-1.5 rounded-md text-[11px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20">
              Mark all read
            </button>
          )}
          <Link href="/admin/notifications/preferences" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
            Preferences →
          </Link>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-white/5 pb-2">
        <FilterButton current={filter} value="all" onClick={setFilter} label={`All (${list.length})`} />
        {categories.map(c => (
          <FilterButton key={c} current={filter} value={c} onClick={setFilter}
            label={`${c} (${list.filter(n => n.category === c).length})`} />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">All caught up — nothing new.</p>
      ) : (
        <ul className="space-y-1">
          {visible.map(n => (
            <li key={n.id} className={`rounded-lg border p-3 flex items-start gap-3 ${
              n.read ? "border-white/5 bg-white/[0.02] opacity-65" : "border-cyan-400/20 bg-cyan-500/5"
            }`}>
              <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOTS[n.category] ?? "bg-white/30"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream">{n.title}</p>
                <p className="text-[11px] text-brand-cream/55 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-brand-cream/35 mt-1 tabular-nums">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link href={n.link} className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
                    View →
                  </Link>
                )}
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-[10px] text-brand-cream/55 hover:text-brand-cream">
                    Read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function FilterButton({ current, value, onClick, label }: {
  current: string; value: string; onClick: (v: string) => void; label: string;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-2.5 py-1 rounded-md text-[11px] capitalize transition-colors ${
        current === value ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20" : "text-brand-cream/65 hover:text-brand-cream"
      }`}
    >
      {label}
    </button>
  );
}
