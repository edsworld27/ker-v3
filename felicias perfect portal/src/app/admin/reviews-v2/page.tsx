"use client";

// /admin/reviews-v2 — Reviews v2 plugin landing.
// Universal reviews (anything with a URL/content id, not just products).
// Pending queue, published list, aggregate ratings — wired once the
// reviews-v2 runtime lands.

import Link from "next/link";
import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function AdminReviewsV2Page() {
  return (
    <PluginPageScaffold
      pluginId="reviews-v2"
      eyebrow="Universal reviews"
      title="Reviews"
      description="Reviews for anything — products, pages, services, blog posts. Photos, verified-buyer badges, threaded replies."
      actions={<Link href="/admin/reviews-v2/pending" className="text-xs px-3 py-2 rounded-lg border border-brand-orange/40 bg-brand-orange/10 text-brand-orange/90 hover:bg-brand-orange/20">Pending queue →</Link>}
      emptyTitle="No reviews yet"
      emptyHint="Once visitors leave reviews they'll appear here. Check the Pending queue tab if you've enabled moderation."
    />
  );
}
