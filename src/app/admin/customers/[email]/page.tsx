"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getCustomerDetail, saveCustomerNotes, saveCustomerTags,
  type CustomerDetail,
} from "@/lib/admin/customers";
import {
  setOrderStatus, type Order, type OrderStatus,
} from "@/lib/admin/orders";
import { listFlags, setUserOverride } from "@/lib/admin/featureFlags";
import type { FeatureFlag } from "@/lib/admin/featureFlags";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-white/8 text-brand-cream/55",
  paid:      "bg-brand-purple/20 text-brand-purple-light",
  fulfilled: "bg-brand-amber/15 text-brand-amber",
  refunded:  "bg-red-500/15 text-red-400",
  cancelled: "bg-white/5 text-brand-cream/30",
};

type Tab = "orders" | "flags" | "notes";

export default function CustomerDetailPage() {
  const params  = useParams();
  const email   = decodeURIComponent((params?.email as string) ?? "");

  const [customer, setCustomer] = useState<CustomerDetail | null | undefined>(undefined);
  const [tab,      setTab]      = useState<Tab>("orders");
  const [flags,    setFlags]    = useState<FeatureFlag[]>([]);
  const [notes,    setNotes]    = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [tagInput,  setTagInput]   = useState("");
  const [tags,      setTags]       = useState<string[]>([]);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function refresh() {
    const d = getCustomerDetail(email);
    setCustomer(d);
    if (d) { setNotes(d.notes); setTags(d.tags); }
    setFlags(listFlags());
  }

  useEffect(() => { refresh(); }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNotesChange(v: string) {
    setNotes(v);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      saveCustomerNotes(email, v);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }, 800);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || tags.includes(t)) { setTagInput(""); return; }
    const next = [...tags, t];
    setTags(next);
    saveCustomerTags(email, next);
    setTagInput("");
  }

  function removeTag(t: string) {
    const next = tags.filter(x => x !== t);
    setTags(next);
    saveCustomerTags(email, next);
  }

  function handleStatusChange(order: Order, status: OrderStatus) {
    setOrderStatus(order.id, status);
    refresh();
  }

  function handleFlagOverride(flagId: string, val: boolean | null) {
    setUserOverride(flagId, email, val);
    setFlags(listFlags());
  }

  if (customer === undefined) {
    return <div className="p-8 text-brand-cream/40 text-sm">Loading…</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 max-w-xl">
        <Link href="/admin/customers" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Customers</Link>
        <h1 className="font-display text-2xl text-brand-cream mt-4 mb-2">Customer not found</h1>
        <p className="text-sm text-brand-cream/55">No orders found for <code className="text-brand-cream/70">{email}</code>.</p>
      </div>
    );
  }

  const joinDate    = customer.firstOrderAt ? new Date(customer.firstOrderAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Unknown";
  const lastDate    = customer.lastOrderAt  ? new Date(customer.lastOrderAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link href="/admin/customers" className="text-[11px] text-brand-cream/40 hover:text-brand-cream transition-colors">
        ← All customers
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center shrink-0">
          <span className="font-display text-2xl font-bold text-brand-orange">
            {customer.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl text-brand-cream">{customer.name}</h1>
          <p className="text-sm text-brand-cream/50 mt-0.5">{customer.email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white/8 text-brand-cream/60">
                {t}
                <button onClick={() => removeTag(t)} className="text-brand-cream/30 hover:text-red-400 transition-colors">×</button>
              </span>
            ))}
            <form onSubmit={e => { e.preventDefault(); addTag(); }} className="inline-flex">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="+ tag"
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-cream/60 placeholder:text-brand-cream/25 focus:outline-none focus:border-white/25 w-20"
              />
            </form>
          </div>
        </div>
        <a
          href={`mailto:${customer.email}`}
          className="shrink-0 text-xs px-4 py-2 rounded-lg border border-white/10 text-brand-cream/60 hover:text-brand-cream hover:border-white/25 transition-colors"
        >
          Email ↗
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Orders",       value: customer.orders },
          { label: "Total spend",  value: `£${customer.spend.toFixed(2)}` },
          { label: "Avg order",    value: `£${customer.avgOrderValue.toFixed(2)}` },
          { label: "First order",  value: joinDate },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-brand-black-card border border-white/5 px-4 py-4">
            <p className="font-display text-xl font-bold text-brand-amber truncate">{s.value}</p>
            <p className="text-[11px] tracking-wide text-brand-cream/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-brand-black-card border border-white/8 rounded-xl w-fit">
        {([
          { id: "orders", label: `Orders (${customer.allOrders.length})` },
          { id: "flags",  label: "Feature flags" },
          { id: "notes",  label: "Notes" },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-brand-black-soft border border-white/10 text-brand-cream"
                : "text-brand-cream/50 hover:text-brand-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_100px_110px_160px] gap-3 px-5 py-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 border-b border-white/5">
            <span>Order</span>
            <span>Date</span>
            <span className="text-right">Total</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {customer.allOrders.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-brand-cream/40">No orders.</p>
            )}
            {customer.allOrders.map(order => (
              <OrderRow
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feature flags tab */}
      {tab === "flags" && (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-sm text-brand-cream/55 leading-relaxed">
              Per-user overrides take priority over global flag settings.
              <span className="text-brand-cream/30"> Last order: {lastDate}</span>
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {flags.map(flag => {
              const override = flag.userOverrides[email] ?? null;
              return (
                <div key={flag.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm text-brand-cream truncate">{flag.name}</p>
                    <p className="text-[11px] text-brand-cream/40 truncate">{flag.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(["on", "off", null] as (boolean | null)[]).map(val => {
                      const active = val === null ? override === null : override === val;
                      const label  = val === null ? "default" : val ? "on" : "off";
                      return (
                        <button
                          key={label}
                          onClick={() => handleFlagOverride(flag.id, val)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                            active
                              ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange"
                              : "bg-transparent border-white/10 text-brand-cream/40 hover:text-brand-cream"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes tab */}
      {tab === "notes" && (
        <div className="rounded-2xl border border-white/8 bg-brand-black-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <p className="text-sm font-medium text-brand-cream">Internal notes</p>
            {notesSaved && <span className="text-[11px] text-brand-amber">Saved</span>}
          </div>
          <div className="p-5">
            <textarea
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              rows={10}
              placeholder="Add private notes about this customer — order issues, preferences, support history…"
              className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder:text-brand-cream/25 focus:outline-none focus:border-brand-orange/40 resize-y leading-relaxed"
            />
            <p className="text-[11px] text-brand-cream/30 mt-2">Auto-saved • Not visible to the customer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, onStatusChange }: {
  order: Order;
  onStatusChange: (order: Order, status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: OrderStatus[] = ["pending", "paid", "fulfilled", "refunded", "cancelled"];

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="md:grid md:grid-cols-[1fr_140px_100px_110px_160px] md:gap-3 md:items-center flex flex-col gap-1">
          <div>
            <p className="text-sm font-medium text-brand-cream">{order.id}</p>
            <p className="text-[11px] text-brand-cream/35 font-mono truncate md:hidden">
              {order.items.map(i => i.name).join(", ")}
            </p>
          </div>
          <span className="text-xs text-brand-cream/50">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-sm font-medium text-brand-cream md:text-right">£{order.total.toFixed(2)}</span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full w-fit capitalize ${STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/admin/orders/${order.id}`}
              onClick={e => e.stopPropagation()}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream transition-colors"
            >
              View
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-brand-cream/25 transition-transform duration-200 ml-auto ${open ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4 bg-white/[0.01]">
          {/* Items */}
          <div className="space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-brand-cream/65">{item.name}{item.variant ? ` · ${item.variant}` : ""}</span>
                <span className="text-brand-cream/45 shrink-0">
                  {item.quantity > 1 ? `×${item.quantity} · ` : ""}£{(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="text-xs text-brand-cream/45 leading-relaxed">
              <span className="text-brand-cream/30 uppercase tracking-wider text-[10px]">Shipping · </span>
              {[
                order.shippingAddress.name,
                order.shippingAddress.line1,
                order.shippingAddress.line2,
                order.shippingAddress.city,
                order.shippingAddress.postcode,
                order.shippingAddress.country,
              ].filter(Boolean).join(", ")}
            </div>
          )}

          {/* Status changer */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] uppercase tracking-wider text-brand-cream/30">Change status:</span>
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(order, s)}
                disabled={order.status === s}
                className={`text-[11px] px-2.5 py-1 rounded-full border capitalize transition-colors ${
                  order.status === s
                    ? STATUS_COLORS[s] + " border-transparent"
                    : "border-white/10 text-brand-cream/40 hover:text-brand-cream"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
