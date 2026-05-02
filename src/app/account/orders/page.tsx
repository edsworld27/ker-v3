"use client";

// /account/orders — customer-facing order history index.
// Resolves the active "orders" portal variant and renders its block
// tree. Falls back to a default order-list view (reads from the
// orders client store) if no variant is configured.
//
// Per-order detail still lives at /account/orders/[id].

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockRenderer from "@/components/editor/BlockRenderer";
import type { EditorPage } from "@/portal/server/types";
import { getActiveSite } from "@/lib/admin/sites";
import { listPortalVariants } from "@/lib/admin/editorPages";
import { listOrders, type Order } from "@/lib/admin/orders";

export default function CustomerOrdersIndexPage() {
  const [variant, setVariant] = useState<EditorPage | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const site = getActiveSite();
      if (!site) { if (!cancelled) setVariant(null); return; }
      const variants = await listPortalVariants(site.id, "orders");
      if (cancelled) return;
      setVariant(variants.find(v => v.isActivePortal) ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Navbar />
      <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
        {variant === undefined ? (
          <div className="max-w-3xl mx-auto px-6 text-brand-cream/45">Loading…</div>
        ) : variant ? (
          <BlockRenderer blocks={variant.publishedBlocks ?? variant.blocks} themeId={variant.themeId} />
        ) : (
          <DefaultOrdersList />
        )}
      </main>
      <Footer />
    </>
  );
}

function DefaultOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { setOrders(listOrders()); }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 space-y-6">
      <header className="text-center">
        <p className="text-[11px] tracking-[0.32em] uppercase text-brand-orange mb-2">Account</p>
        <h1 className="font-display text-4xl sm:text-5xl text-brand-cream">Your orders</h1>
        <p className="text-brand-cream/55 text-sm mt-2">Every order you've placed with us, with status and tracking.</p>
      </header>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-10 text-center">
          <p className="text-brand-cream/85">No orders yet.</p>
          <Link
            href="/shop"
            className="inline-block mt-4 text-sm px-5 py-3 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold"
          >
            Browse the shop
          </Link>
        </section>
      ) : (
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.id}`}
                className="block rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-brand-cream font-mono truncate">{o.id}</p>
                    <p className="text-[11px] text-brand-cream/45">
                      {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-brand-cream">£{o.total.toFixed(2)}</p>
                    <p className="text-[10px] tracking-wider uppercase text-brand-cream/55">{o.status}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-brand-cream/40 text-center pt-4">
        Operators can redesign this page with the visual editor — open <code className="font-mono text-brand-cream/65">/admin/portals</code> → Orders.
      </p>
    </div>
  );
}
