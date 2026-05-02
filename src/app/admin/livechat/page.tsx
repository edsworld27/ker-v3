"use client";

// /admin/livechat — Live chat plugin operator inbox.
// Real-time visitor → operator messaging. Threads list on the left,
// active conversation on the right (pattern to match once runtime
// lands). Until then, the page is the configuration / status hub.

import Link from "next/link";
import PluginPageScaffold from "@/components/admin/PluginPageScaffold";
import { getActiveOrgId } from "@/lib/admin/orgs";

export default function AdminLivechatPage() {
  return (
    <PluginPageScaffold
      pluginId="livechat"
      eyebrow="Visitor messaging"
      title="Live chat"
      description="Reply to visitors who open the chat widget on your storefront. Threads persist so returning visitors see history."
      actions={<Link href="/admin/livechat/canned" className="text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30">Canned replies →</Link>}
    >
      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-6 sm:p-8">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Inbox</h2>
        <p className="text-[12px] text-brand-cream/55">No active conversations. Visitors who open the widget on your storefront will appear here.</p>
        <p className="text-[11px] text-brand-cream/40 mt-3">
          Make sure the widget is enabled in the Live chat plugin's <Link
            href={`/aqua/${getActiveOrgId()}/plugins/livechat`}
            className="text-cyan-300/80 hover:text-cyan-200"
          >settings</Link>.
        </p>
      </section>
    </PluginPageScaffold>
  );
}
