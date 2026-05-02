"use client";

// /admin/backups/restore — Restore a backup snapshot.
// Pick a snapshot, preview its contents, and roll the org back. Heavy
// operation — confirmation flow with explicit "I understand" checkbox.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function BackupRestorePage() {
  return (
    <PluginPageScaffold
      pluginId="backups"
      eyebrow="Backups"
      title="Restore"
      description="Roll the org's data + media back to a previous snapshot. This is destructive — current state is replaced — so you'll be asked to confirm."
      backHref="/admin/backups"
      backLabel="Backups"
      emptyTitle="No snapshots available"
      emptyHint="Snapshots appear here once the Backups plugin has run at least once. Configure cadence in the plugin settings."
    />
  );
}
