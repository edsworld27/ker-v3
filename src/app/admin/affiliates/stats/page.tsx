"use client";

// /admin/affiliates/stats — Affiliate program performance.
// Top performers, click-through rates, conversion rates, total
// commission paid out vs. owed.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function AffiliateStatsPage() {
  return (
    <PluginPageScaffold
      pluginId="affiliates"
      eyebrow="Affiliates"
      title="Stats"
      description="Top performers, click-through rates, conversion rates, and total commission paid out vs. still owed."
      backHref="/admin/affiliates"
      backLabel="Affiliates"
      emptyTitle="No stats yet"
      emptyHint="Once affiliates drive traffic and conversions the rollups will populate here."
    />
  );
}
