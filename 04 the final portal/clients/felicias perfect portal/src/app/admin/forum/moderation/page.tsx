"use client";

// /admin/forum/moderation — queue of flagged forum posts. Backend
// flagging isn't wired yet (no /api/portal/forum/moderation endpoint),
// so we surface a placeholder pointing at the topics list. When
// flagging lands this page can become a queue with approve/remove.

import PluginRequired from "@/components/admin/PluginRequired";
import SetupRequired from "@/components/admin/SetupRequired";

export default function ForumModerationPage() {
  return (
    <PluginRequired plugin="forum">
      <SetupRequired
        title="Moderation queue is coming"
        message="Flagged posts will land here once the forum runtime starts capturing reports. Until then, browse topics directly to remove abusive content manually."
        steps={[
          "Visitors / signed-in users flag posts as spam or abuse",
          "Flagged posts appear here with context + reporter count",
          "One-click approve, hide, or ban the author",
        ]}
        cta={{ label: "Forum topics", href: "/admin/forum" }}
      />
    </PluginRequired>
  );
}
