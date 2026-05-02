"use client";

// /admin/memberships/tiers — Membership tier configuration.
// Define the tiers (Free / Standard / Premium etc), pricing, and
// what each tier unlocks. Wired into the Memberships plugin runtime.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function MembershipTiersPage() {
  return (
    <PluginPageScaffold
      pluginId="memberships"
      eyebrow="Memberships"
      title="Tiers"
      description="Define the tiers your members can join. Free tier is signup-gated; paid tiers bill recurring via Stripe (Subscriptions plugin)."
      backHref="/admin/memberships"
      backLabel="Memberships"
      emptyTitle="No tiers configured"
      emptyHint="Create tiers to start gating content. Each tier can have its own price, benefits, and welcome email."
    />
  );
}
