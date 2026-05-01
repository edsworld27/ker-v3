"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listTickets, onTicketsChange, type Ticket, type TicketStatus } from "@/lib/admin/tickets";
import PluginRequired from "@/components/admin/PluginRequired";

const STATUS_FILTERS: (TicketStatus | "all")[] = ["all", "open", "pending", "resolved", "closed"];

export default function AdminSupportPage() {
  return <PluginRequired plugin="support"><AdminSupportPageInner /></PluginRequired>;
}

function AdminSupportPageInner() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<TicketStatus | "all">("open");

  useEffect(() => {
    const refresh = () => setTickets(listTickets());
    refresh();
    return onTicketsChange(refresh);
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
  const counts: Record<string, number> = {};
  tickets.forEach(t => { counts[t.status] = (counts[t.status] ?? 0) + 1; });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-6xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Support</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Customer tickets</h1>
        <p className="text-brand-cream/45 text-sm mt-1">{tickets.length} total · {counts.open ?? 0} open · {counts.pending ?? 0} awaiting customer.</p>
      </div>

      <div className="flex flex-wrap gap-1 text-xs">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full ${filter === f ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/30" : "border border-white/10 text-brand-cream/55 hover:text-brand-cream"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && counts[f] && <span className="ml-1.5 text-brand-amber font-semibold">{counts[f]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card px-6 py-10 text-center">
          <p className="text-brand-cream/45 text-sm">No tickets in this view.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden divide-y divide-white/5">
          {filtered.map(t => {
            const last = t.messages[t.messages.length - 1];
            return (
              <Link key={t.id} href={`/admin/support/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-brand-cream truncate">{t.subject}</span>
                    <StatusPill status={t.status} />
                    <PriorityPill priority={t.priority} />
                    {t.orderId && <span className="text-[10px] text-brand-cream/40">{t.orderId}</span>}
                  </div>
                  <p className="text-xs text-brand-cream/45 truncate">
                    <span className="text-brand-cream/65">{t.customerName}</span> · {last?.body.slice(0, 100)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-brand-cream/40 shrink-0">
                  <p>{t.id}</p>
                  <p>{new Date(t.updatedAt).toLocaleDateString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: TicketStatus }) {
  const cls = {
    open: "bg-brand-orange/20 text-brand-orange",
    pending: "bg-brand-amber/20 text-brand-amber",
    resolved: "bg-green-400/20 text-green-300",
    closed: "bg-white/10 text-brand-cream/55",
  }[status];
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{status}</span>;
}
function PriorityPill({ priority }: { priority: string }) {
  if (priority === "normal" || priority === "low") return null;
  const cls = priority === "urgent" ? "bg-red-500/20 text-red-300" : "bg-brand-amber/15 text-brand-amber";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{priority}</span>;
}
