"use client";

// /admin/affiliates/payouts — Affiliate commission payouts.
// Approve owed commissions and mark them paid (manual transfer or
// Stripe Connect when wired).

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function AffiliatePayoutsPage() {
  return (
    <PluginPageScaffold
      pluginId="affiliates"
      eyebrow="Affiliates"
      title="Payouts"
      description="Owed commissions waiting for payout, plus a history of paid commissions. Approve and mark paid as you transfer."
      backHref="/admin/affiliates"
      backLabel="Affiliates"
      emptyTitle="No payouts owed"
      emptyHint="As affiliates drive conversions their accrued commission shows up here. Pay manually or via Stripe Connect (when configured)."
    />
  );
}
