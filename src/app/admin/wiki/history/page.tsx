"use client";

// /admin/wiki/history — Wiki revision history.
// Every page edit, who made it, when, with diffs. Restore old
// revisions if needed.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function WikiHistoryPage() {
  return (
    <PluginPageScaffold
      pluginId="wiki"
      eyebrow="Wiki"
      title="Revisions"
      description="Every wiki page edit, with author, timestamp, and diff. Restore an old revision if a recent change introduced a regression."
      backHref="/admin/wiki"
      backLabel="Wiki"
      emptyTitle="No revisions recorded"
      emptyHint="Once members edit wiki pages each save creates a revision here, restorable with one click."
    />
  );
}
