"use client";

// /admin/livechat/canned — Canned reply library.
// Save common responses ("How do I track my order?", "What are your
// shipping rates?") so operators can insert with one click.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function CannedRepliesPage() {
  return (
    <PluginPageScaffold
      pluginId="livechat"
      eyebrow="Live chat"
      title="Canned replies"
      description="Save the responses you find yourself typing over and over. Operators can insert them with one click during a conversation."
      backHref="/admin/livechat"
      backLabel="Live chat"
      emptyTitle="No canned replies yet"
      emptyHint="Add a canned reply with a name and body — the operator's chat input gets a quick-pick dropdown of these."
    />
  );
}
