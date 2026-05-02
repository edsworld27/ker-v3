"use client";

// /admin/memberships/members — Member directory.
// Lists every signed-up member with their tier, signup date, and
// status. Edit per-member tier from here.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function MembershipMembersPage() {
  return (
    <PluginPageScaffold
      pluginId="memberships"
      eyebrow="Memberships"
      title="Members"
      description="Everyone who's signed up across your tiers. Edit a member's tier, suspend access, or export to CSV."
      backHref="/admin/memberships"
      backLabel="Memberships"
      emptyTitle="No members yet"
      emptyHint="When someone signs up via the storefront they'll appear here. Members from forms / e-commerce orders are auto-imported."
    />
  );
}
