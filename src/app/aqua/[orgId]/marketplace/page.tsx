"use client";

// /aqua/[orgId]/marketplace — agency view of the plugin marketplace
// for a specific client portal. Wraps the shared <PluginMarketplace />
// component with aqua chrome (back link + "Open portal" CTA).

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PluginMarketplace from "@/components/admin/PluginMarketplace";

export default function MarketplacePage() {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const orgId = params?.orgId ?? "";

  if (!orgId) return null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/aqua" className="text-[11px] text-cyan-400/70 hover:text-cyan-300 transition-colors">
            ← Back to portals
          </Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Marketplace</p>
          <h1 className="font-display text-3xl text-brand-cream mb-2">Plugins for {orgId}</h1>
          <p className="text-[13px] text-brand-cream/55 max-w-2xl leading-relaxed">
            Add or remove features for this client portal. Each plugin slots into the sidebar with its own
            settings — turn on the simple editor for non-tech clients, the advanced editor for tech-savvy ones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/admin?org=${orgId}`)}
          className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-[12px] text-cyan-200 hover:bg-cyan-500/15 transition-colors"
        >
          Open portal →
        </button>
      </header>

      <PluginMarketplace orgId={orgId} />
    </main>
  );
}
