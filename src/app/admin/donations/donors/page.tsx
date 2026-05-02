"use client";

// /admin/donations/donors — Donor directory.
// List of everyone who's donated, with totals and Gift Aid status.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function DonorsPage() {
  return (
    <PluginPageScaffold
      pluginId="donations"
      eyebrow="Donations"
      title="Donors"
      description="Everyone who's donated, with their total contribution and recognition preferences. Export for thank-you mailings or Gift Aid claims."
      backHref="/admin/donations"
      backLabel="Donations"
      emptyTitle="No donors yet"
      emptyHint="Once people donate via the storefront's Donation block they'll appear here, with opt-in display preferences and Gift Aid status."
    />
  );
}
