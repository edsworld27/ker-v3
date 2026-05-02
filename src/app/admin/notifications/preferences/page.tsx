"use client";

// /admin/notifications/preferences — Per-user notification preferences.
// Choose which event categories notify you, on which channels (in-app,
// email, browser push). Per-user, so each team member tunes their own.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function NotificationPreferencesPage() {
  return (
    <PluginPageScaffold
      pluginId="notifications"
      eyebrow="Notifications"
      title="Preferences"
      description="Choose which events notify you and on which channel — in-app bell, email digest, or browser push. Per-user, so each team member sets their own."
      backHref="/admin/notifications"
      backLabel="Notifications"
      emptyTitle="Defaults active"
      emptyHint="Until you tune them, you'll receive in-app notifications for every category. Tighten or loosen here."
    />
  );
}
