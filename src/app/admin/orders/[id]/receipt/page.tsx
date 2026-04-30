"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrder, type Order } from "@/lib/admin/orders";

const CURRENCY_SYMBOL = { GBP: "£", USD: "$", EUR: "€" } as const;

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    setOrder(getOrder(id));
  }, [id]);

  if (!id) return <div className="p-8">Missing order id.</div>;
  if (!order) return <div className="p-8 text-stone-400">Loading receipt…</div>;

  const sym = CURRENCY_SYMBOL[order.currency];
  const date = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-stone-100 border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <Link href={`/admin/orders/${order.id}`} className="text-sm text-stone-600 hover:text-stone-900">
          ← Back to order
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
          >
            Print receipt
          </button>
        </div>
      </div>

      {/* Printable receipt */}
      <div className="max-w-[680px] mx-auto px-8 py-12 print:py-0">
        <header className="flex items-start justify-between border-b border-stone-300 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LUV &amp; KER</h1>
            <p className="text-xs text-stone-500 mt-1">Odo by Felicia · Handcrafted in Accra, Ghana</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-stone-500">Receipt</p>
            <p className="text-sm font-mono mt-1">{order.id}</p>
            <p className="text-xs text-stone-500 mt-1">{date}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Billed to</p>
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-stone-600">{order.customerEmail}</p>
          </div>
          {order.shippingAddress && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">Ship to</p>
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-stone-600">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="text-stone-600">{order.shippingAddress.line2}</p>}
              <p className="text-stone-600">{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
              <p className="text-stone-600">{order.shippingAddress.country}</p>
            </div>
          )}
        </section>

        <section className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-[10px] uppercase tracking-widest text-stone-500">
                <th className="py-2 text-left font-medium">Item</th>
                <th className="py-2 text-right font-medium w-16">Qty</th>
                <th className="py-2 text-right font-medium w-20">Unit</th>
                <th className="py-2 text-right font-medium w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} className="border-b border-stone-200">
                  <td className="py-3">
                    <p className="font-semibold">{it.name}</p>
                    {it.variant && <p className="text-xs text-stone-500">{it.variant}</p>}
                  </td>
                  <td className="py-3 text-right">{it.quantity}</td>
                  <td className="py-3 text-right">{sym}{it.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-semibold">{sym}{(it.unitPrice * it.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="ml-auto w-full max-w-xs space-y-1 text-sm mb-8">
          <Row label="Subtotal" value={`${sym}${order.subtotal.toFixed(2)}`} />
          {order.discount > 0 && <Row label="Discount" value={`−${sym}${order.discount.toFixed(2)}`} />}
          <Row label="Shipping" value={order.shipping > 0 ? `${sym}${order.shipping.toFixed(2)}` : "Free"} />
          {order.tax > 0 && <Row label="Tax (incl.)" value={`${sym}${order.tax.toFixed(2)}`} />}
          <div className="border-t border-stone-300 pt-2 mt-2">
            <Row label="Total" value={`${sym}${order.total.toFixed(2)}`} bold />
          </div>
          <p className="text-xs text-stone-500 pt-1 capitalize">
            Payment status: <span className="font-semibold">{order.status}</span>
            {order.paymentIntent && <span className="font-mono ml-2">{order.paymentIntent}</span>}
          </p>
        </section>

        {order.tracking && (
          <section className="mb-8 p-4 bg-stone-50 rounded text-sm">
            <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Tracking</p>
            <p><span className="font-semibold">{order.tracking.carrier}</span> · <span className="font-mono">{order.tracking.code}</span></p>
          </section>
        )}

        <footer className="border-t border-stone-300 pt-6 text-xs text-stone-500 leading-relaxed">
          <p>Thank you for supporting Felicia&apos;s heritage skincare. Every order helps invest in farmer partnerships across Ghana.</p>
          <p className="mt-2">Questions? Reply to your confirmation email or contact hello@luvandker.com</p>
          <p className="mt-2 font-mono">luvandker.com · receipt {order.id}</p>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : "text-stone-700"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
