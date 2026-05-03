"use client";

// /admin/portal-settings/plugin-authoring — getting-started guide for
// authoring new Aqua plugins. Power-user docs surfaced inside the
// admin so plugin authors don't have to dig into the codebase to
// figure out how things plug in.

import Link from "next/link";
import AdminTabs from "@/components/admin/AdminTabs";
import { MARKETPLACE_TABS } from "@/lib/admin/tabSets";

export default function PluginAuthoringPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <AdminTabs tabs={MARKETPLACE_TABS} ariaLabel="Plugins" />
      <header>
        <Link href="/admin/portal-settings" className="text-[11px] text-cyan-400/70 hover:text-cyan-300">
          ← Portal settings
        </Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Plugin authoring</p>
        <h1 className="font-display text-3xl text-brand-cream">Build your own plugin</h1>
        <p className="text-[13px] text-brand-cream/55 mt-1 leading-relaxed">
          Aqua is plugin-driven — the marketplace, sidebar, settings UI and
          storefront contributions are all generated from manifests in
          <code className="font-mono mx-1 text-brand-cream/85">src/plugins/&lt;id&gt;/index.ts</code>.
          This page gets you from zero to a working plugin in five steps.
        </p>
      </header>

      <Section title="1. Create the directory">
        <p>One folder per plugin under <code>src/plugins/</code>:</p>
        <Code>{`src/plugins/my-plugin/
  index.ts            # the manifest (mandatory)
  server/             # server-side runtime, if any
  components/         # admin pages or storefront blocks
  api/                # route handlers (if you need server endpoints)`}</Code>
      </Section>

      <Section title="2. Author the manifest">
        <p>Default-export an <code>AquaPlugin</code>. Identity, lifecycle, sidebar items, settings schema and feature toggles all live here:</p>
        <Code>{`import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "my-plugin",
  name: "My Plugin",
  version: "0.1.0",
  status: "alpha",         // alpha / beta / stable
  category: "content",     // content / commerce / marketing / support / ops / core
  tagline: "One-line marketplace summary.",
  description: "Longer marketplace description.",

  // Optional — heavy plugins ask for credentials before install completes.
  setup: [{
    id: "creds",
    title: "API key",
    description: "Where do we send your data?",
    fields: [{ id: "apiKey", label: "API key", type: "password", required: true }],
  }],

  // Sidebar contributions. Filtered automatically per-org.
  navItems: [
    { id: "my-plugin", label: "My plugin", href: "/admin/my-plugin" },
  ],

  // Granular sub-feature toggles.
  features: [
    { id: "advancedMode", label: "Advanced mode", default: false, plans: ["pro", "enterprise"] },
    { id: "dailySync", label: "Daily sync", default: true },
  ],

  // Auto-rendered settings page.
  settings: {
    groups: [{
      id: "general",
      label: "General",
      fields: [{ id: "greeting", label: "Greeting", type: "text", default: "Hello!" }],
    }],
  },

  pages: [],   // see step 4
  api: [],     // see step 4
};

export default plugin;`}</Code>
      </Section>

      <Section title="3. Register it">
        <p>Add the import and entry in <code>src/plugins/_registry.ts</code>:</p>
        <Code>{`import myPlugin from "./my-plugin";

const PLUGINS: AquaPlugin[] = [
  // …existing plugins,
  myPlugin,
];`}</Code>
        <p className="text-[11px] text-brand-cream/45 mt-2">
          That&apos;s it — the marketplace at <code>/aqua/[orgId]/marketplace</code> picks it up
          automatically. Operators can install, configure features, and the auto-rendered
          settings page works from the schema you declared above.
        </p>
      </Section>

      <Section title="4. Add admin pages + API routes (if needed)">
        <p>Two ways to contribute admin pages:</p>
        <p>
          <strong>The simple way</strong> — add a regular Next.js page under
          <code className="font-mono mx-1">src/app/admin/&lt;your-path&gt;/page.tsx</code>
          and reference it from <code>navItems</code>. Wrap it with{" "}
          <code className="font-mono">&lt;PluginRequired plugin=&quot;my-plugin&quot;&gt;</code> so non-installed
          orgs see the empty state instead.
        </p>
        <Code>{`"use client";
import PluginRequired from "@/components/admin/PluginRequired";

export default function MyPluginPage() {
  return <PluginRequired plugin="my-plugin"><MyPluginPageInner /></PluginRequired>;
}

function MyPluginPageInner() {
  return <main>Hello from My Plugin.</main>;
}`}</Code>
        <p>
          <strong>API routes</strong> — same pattern, under
          <code className="font-mono mx-1">/api/portal/&lt;your-path&gt;/route.ts</code>. Use{" "}
          <code className="font-mono">requireAdmin()</code> at the top to gate to admins; use{" "}
          <code className="font-mono">getOrg(orgId)</code> +
          <code className="font-mono"> install.config</code> to read your plugin&apos;s settings.
        </p>
      </Section>

      <Section title="5. Lifecycle hooks + the event bus">
        <p>
          Plugins can react to lifecycle events (
          <code>onInstall</code>, <code>onUninstall</code>, <code>onEnable</code>,
          <code>onDisable</code>, <code>onConfigure</code>). They receive a
          <code className="font-mono mx-1">PluginCtx</code> with <code>orgId</code>,
          <code> install</code> (current state) and <code>storage</code> (a per-plugin
          namespaced KV).
        </p>
        <Code>{`onInstall: async (ctx, setupAnswers) => {
  // setupAnswers contains the values the operator typed during
  // the install wizard.
  await ctx.storage.set("apiKey", setupAnswers.apiKey);
  await ctx.storage.set("syncedAt", Date.now());
},`}</Code>
        <p>
          For real-time reactions to user actions (orders, form submissions,
          subscription changes…) subscribe to the event bus from your server module:
        </p>
        <Code>{`import { on } from "@/portal/server/eventBus";

on("order.paid", async (event) => {
  if (event.orgId !== "agency") return;
  // do your thing — sync to a CRM, kick off a webhook, send an email
});`}</Code>
        <p>
          A full list of event names is in{" "}
          <code className="font-mono">src/portal/server/eventBus.ts</code>.
        </p>
      </Section>

      <Section title="Things to watch">
        <ul className="list-disc list-inside space-y-1 text-[12px] text-brand-cream/75">
          <li><strong>No global side-effects on import</strong> — plugin manifests should be data-only. Heavy work goes in lifecycle hooks.</li>
          <li><strong>Use the storage namespacing</strong> — never read or write the global state directly; always go through <code>ctx.storage</code>.</li>
          <li><strong>Mark features that need a Pro/Enterprise plan</strong> — set <code>plans: [&quot;pro&quot;]</code> on features that should be locked off for Starter orgs.</li>
          <li><strong>Declare dependencies + conflicts</strong> — <code>requires</code> and <code>conflicts</code> on the manifest so the runtime can refuse incompatible installs.</li>
          <li><strong>Write a healthcheck</strong> — for plugins that integrate with external APIs, a quick health check shows green/red on the marketplace card.</li>
        </ul>
      </Section>

      <footer className="pt-6 border-t border-white/5 text-[11px] text-brand-cream/40">
        Examples: <code className="font-mono">src/plugins/email/</code>{" · "}
        <code className="font-mono">src/plugins/analytics/</code>{" · "}
        <code className="font-mono">src/plugins/webhooks/</code>{" · "}
        <code className="font-mono">src/plugins/crm/</code>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-brand-cream">{title}</h2>
      <div className="text-[13px] text-brand-cream/75 space-y-3 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-lg bg-black/40 border border-white/5 p-4 overflow-x-auto text-[11px] font-mono text-brand-cream/85 leading-relaxed">
      {children}
    </pre>
  );
}
