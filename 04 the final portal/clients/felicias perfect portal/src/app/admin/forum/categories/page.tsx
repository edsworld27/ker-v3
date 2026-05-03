"use client";

// /admin/forum/categories — Forum category management.
// Create / rename / reorder / delete categories. Optional
// member-only flag per category.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function ForumCategoriesPage() {
  return (
    <PluginPageScaffold
      pluginId="forum"
      eyebrow="Forum"
      title="Categories"
      description="Top-level groupings for forum topics. Optional member-only flag per category gates discussion to paid Memberships tiers."
      backHref="/admin/forum"
      backLabel="Forum"
      emptyTitle="No categories yet"
      emptyHint="Add categories like 'General', 'Announcements', 'Help' so visitors can group their topics. The category page on the storefront lists all topics in that category."
    />
  );
}
