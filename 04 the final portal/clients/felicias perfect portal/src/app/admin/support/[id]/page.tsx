"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { confirm } from "@/components/admin/ConfirmHost";
import {
  getTicket, addMessage, setTicketStatus, setTicketPriority, deleteTicket, onTicketsChange,
  type Ticket, type TicketStatus, type TicketPriority,
} from "@/lib/admin/tickets";

const STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export default function TicketDetail() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);

  useEffect(() => {
    const refresh = () => setTicket(getTicket(id));
    refresh();
    return onTicketsChange(refresh);
  }, [id]);

  if (!ticket) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
        <Link href="/admin/support" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Support</Link>
        <p className="mt-6 text-brand-cream/60">Ticket not found.</p>
      </div>
    );
  }

  function send() {
    if (!reply.trim()) return;
    addMessage(ticket!.id, { author: "team", authorName: "Team", body: reply.trim(), internal });
    setReply("");
  }

  async function remove() {
    if (!(await confirm({ title: `Delete ticket ${ticket!.id}?`, message: "The ticket and its replies are removed permanently.", danger: true, confirmLabel: "Delete ticket" }))) return;
    deleteTicket(ticket!.id);
    router.push("/admin/support");
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl space-y-5">
      <Link href="/admin/support" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Support</Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">{ticket.id} · {ticket.source}</p>
          <h1 className="font-display text-2xl sm:text-3xl text-brand-cream">{ticket.subject}</h1>
          <p className="text-brand-cream/45 text-sm mt-1">
            {ticket.customerName} &lt;<span className="text-brand-cream/65">{ticket.customerEmail}</span>&gt;
            {ticket.orderId && <> · <Link href={`/admin/orders/${ticket.orderId}`} className="text-brand-orange hover:underline">{ticket.orderId}</Link></>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={ticket.status} onChange={e => setTicketStatus(ticket.id, e.target.value as TicketStatus)} className="bg-brand-black border border-white/10 rounded px-2 py-1.5 text-xs text-brand-cream">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={ticket.priority} onChange={e => setTicketPriority(ticket.id, e.target.value as TicketPriority)} className="bg-brand-black border border-white/10 rounded px-2 py-1.5 text-xs text-brand-cream">
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <button onClick={remove} className="text-xs text-brand-cream/40 hover:text-brand-orange">Delete</button>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3">
        {ticket.messages.map(m => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border ${
              m.internal ? "border-brand-amber/25 bg-brand-amber/5" :
              m.author === "team" ? "border-brand-orange/20 bg-brand-orange/5" :
              "border-white/8 bg-brand-black-card"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-brand-cream/45 mb-2">
              <span>
                <span className="font-semibold text-brand-cream/75">{m.authorName}</span>
                {m.internal && <span className="ml-2 text-brand-amber font-bold uppercase tracking-widest">internal note</span>}
              </span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-brand-cream/85 whitespace-pre-wrap leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      {/* Reply */}
      <div className="rounded-2xl border border-white/8 bg-brand-black-card p-4 space-y-3">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder={internal ? "Internal note (only the team will see this)…" : "Reply to the customer…"}
          rows={5}
          className="w-full bg-brand-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-brand-cream/90 focus:outline-none focus:border-brand-orange/40 resize-y"
        />
        <div className="flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-brand-cream/55 cursor-pointer">
            <input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)} className="accent-brand-amber" />
            Internal note (not sent to customer)
          </label>
          <button
            onClick={send}
            disabled={!reply.trim()}
            className="text-xs px-5 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold"
          >
            {internal ? "Save note" : "Send reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
