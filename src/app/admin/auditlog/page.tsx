"use client";

// /admin/auditlog — Audit log plugin landing.
// Filterable timeline of every admin mutation. Hooks into the event
// bus + admin-action wrappers (the plugin's runtime is what records
// the entries; this page renders them).

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function AdminAuditLogPage() {
  return (
    <PluginPageScaffold
      pluginId="auditlog"
      eyebrow="Compliance"
      title="Audit log"
      description="Every admin-side mutation: logins, role changes, plugin installs, settings updates, content publishes. Each entry has actor, IP, timestamp, target resource, before/after diff."
      emptyTitle="No audit entries yet"
      emptyHint="Once admin actions are recorded (logins, edits, plugin installs) they'll appear here. SOC 2 + HIPAA compliance modes auto-enable retention."
    />
  );
}
