"use client";

// /admin/subscriptions/plans — Subscription plan catalogue.
// Define the recurring offerings (monthly / annual / trial) that
// customers can subscribe to via Stripe.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function SubscriptionPlansPage() {
  return (
    <PluginPageScaffold
      pluginId="subscriptions"
      eyebrow="Subscriptions"
      title="Plans"
      description="The recurring plans you offer — monthly, annual, with optional free trial periods. Plan changes prorate via Stripe."
      backHref="/admin/subscriptions"
      backLabel="Subscriptions"
      emptyTitle="No plans configured"
      emptyHint="Add a plan with a name, billing interval, and price. The plan id syncs to a Stripe price; existing subscribers can switch between plans."
    />
  );
}
