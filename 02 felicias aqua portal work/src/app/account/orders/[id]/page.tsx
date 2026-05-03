"use client";

// /account/orders/[id] — public order detail. Linked from
// the order-confirmation email. Customer doesn't need to be
// signed in; the order id itself is the access token.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  name: string; description?: string; quantity: number;
  unitAmount: number; currency: string; digital?: boolean;
  downloadUrl?: string; licenseKey?: string;
}
interface Order {
  id: string;
  orgId: string;
  status: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: {
    line1?: string; line2?: string; city?: string;
    postalCode?: string; country?: string; state?: string;
  };
  items: OrderItem[];
  createdAt: number;
  paidAt?: number;
  shippedAt?: number;
  trackingNumber?: string;
  trackingCarrier?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid — being prepared",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const STATUS_COLOURS: Record<string, string> = {
  pending: "text-amber-300 bg-amber-500/10",
  paid: "text-cyan-300 bg-cyan-500/10",
  fulfilled: "text-emerald-300 bg-emerald-500/10",
  shipped: "text-blue-300 bg-blue-500/10",
  delivered: "text-emerald-300 bg-emerald-500/10",
  refunded: "text-red-300 bg-red-500/10",
  cancelled: "text-brand-cream/50 bg-white/5",
};

function formatMoney(amount: number, currency: string): string {
  const symbol = currency.toUpperCase() === "GBP" ? "£" :
                 currency.toUpperCase() === "USD" ? "$" :
                 currency.toUpperCase() === "EUR" ? "€" : "";
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

export default function AccountOrderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/portal/orders/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) setError(data.error ?? "Order not found.");
        else setOrder(data.order);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <main className="max-w-2xl mx-auto px-6 py-16 text-[12px] text-brand-cream/45">Loading order…</main>;
  }

  if (error || !order) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-3">
        <h1 className="font-display text-2xl text-brand-cream">Order not found</h1>
        <p className="text-[13px] text-brand-cream/55">
          {error ?? "We couldn't find an order with that id."}
        </p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 rounded-lg bg-brand-orange text-white text-[13px]">
          Back to site
        </Link>
      </main>
    );
  }

  const statusKey = order.status.toLowerCase();
  const statusLabel = STATUS_LABELS[statusKey] ?? order.status;
  const statusColour = STATUS_COLOURS[statusKey] ?? "text-brand-cream/65 bg-white/5";

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-brand-orange mb-1">Order</p>
        <h1 className="font-display text-3xl text-brand-cream">{order.id}</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">
          {order.customerName ? `Hi ${order.customerName}, ` : ""}placed {new Date(order.createdAt).toLocaleString()}.
        </p>
        <span className={`inline-block mt-3 px-2.5 py-1 rounded-md text-[11px] tracking-wider uppercase ${statusColour}`}>
          {statusLabel}
        </span>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {order.items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-brand-cream truncate">{item.name}</p>
              {item.description && (
                <p className="text-[11px] text-brand-cream/55 mt-0.5">{item.description}</p>
              )}
              <p className="text-[11px] text-brand-cream/45 mt-0.5">
                Qty {item.quantity} · {formatMoney(item.unitAmount, item.currency)} ea
              </p>
              {item.digital && item.downloadUrl && (
                <a href={item.downloadUrl} className="text-[11px] text-brand-orange hover:underline inline-block mt-1.5">
                  Download →
                </a>
              )}
              {item.licenseKey && (
                <p className="text-[10px] font-mono text-brand-cream/65 mt-1.5">
                  License: <span className="select-all">{item.licenseKey}</span>
                </p>
              )}
            </div>
            <p className="text-[13px] text-brand-cream tabular-nums">
              {formatMoney(item.unitAmount * item.quantity, item.currency)}
            </p>
          </div>
        ))}
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] tracking-wider uppercase text-brand-cream/55">Total</p>
          <p className="text-[15px] font-display text-brand-cream tabular-nums">
            {formatMoney(order.amountTotal, order.currency)}
          </p>
        </div>
      </section>

      {order.shippingAddress && (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-2">Shipping to</h2>
          <p className="text-[12px] text-brand-cream/85 leading-relaxed">
            {order.customerName && <span>{order.customerName}<br /></span>}
            {[order.shippingAddress.line1, order.shippingAddress.line2,
              order.shippingAddress.city, order.shippingAddress.state,
              order.shippingAddress.postalCode, order.shippingAddress.country]
              .filter(Boolean).join(", ")}
          </p>
          {order.trackingNumber && (
            <p className="text-[11px] text-brand-cream/55 mt-2">
              Tracking: <span className="font-mono">{order.trackingNumber}</span>
              {order.trackingCarrier && <span> · {order.trackingCarrier}</span>}
            </p>
          )}
        </section>
      )}

      <footer className="text-[11px] text-brand-cream/45 text-center pt-4 border-t border-white/5">
        Questions? Reply to your confirmation email.
      </footer>
    </main>
  );
}
