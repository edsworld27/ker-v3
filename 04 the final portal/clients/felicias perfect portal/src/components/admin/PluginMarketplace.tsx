"use client";

// Shared plugin-marketplace UI used by both /aqua/[orgId]/marketplace
// (agency view) and /admin/marketplace (per-tenant, agency operating
// inside the client portal).
//
// Loads the global plugin registry plus the org's installs, lets the
// operator install / configure / enable / disable / uninstall each
// plugin. Setup wizards run for plugins that declare them (Stripe,
// Resend, GitHub, etc.).

import { useEffect, useState } from "react";
import Link from "next/link";
import SetupWizardModal from "@/components/aqua/SetupWizardModal";
import { confirm } from "@/components/admin/ConfirmHost";

interface ApiPluginFeature {
  id: string; label: string; description: string | null;
  default: boolean; plans: string[] | null; requires: string[];
}
interface ApiSetupField {
  id: string; label: string;
  type: "text" | "password" | "url" | "email" | "select" | "boolean" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}
interface ApiSetupStep {
  id: string; title: string; description: string;
  fields: ApiSetupField[];
  optional?: boolean;
}
interface ApiPlugin {
  id: string; name: string; version: string;
  status: "stable" | "beta" | "alpha";
  category: string; core: boolean;
  tagline: string; description: string;
  plans: string[] | null;
  requires: string[]; conflicts: string[];
  features: ApiPluginFeature[];
  setup: ApiSetupStep[];
}
interface OrgPluginInstall {
  pluginId: string; installedAt: number; enabled: boolean;
  config: Record<string, unknown>; features: Record<string, boolean>;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: "Core", content: "Content", commerce: "Commerce",
  marketing: "Marketing", support: "Support", ops: "Ops",
};

interface Props {
  orgId: string;
  // Where the per-plugin "Configure" button should link to. Defaults to
  // the aqua flow; admin pages can route to /admin/portal-settings or
  // similar if they prefer.
  configureHrefForPlugin?: (pluginId: string) => string;
  // Optional onChange callback fires after every install / uninstall /
  // toggle so the parent (admin layout) can refresh sidebar visibility.
  onChange?: () => void;
}

export default function PluginMarketplace({ orgId, configureHrefForPlugin, onChange }: Props) {
  const [plugins, setPlugins] = useState<ApiPlugin[]>([]);
  const [installs, setInstalls] = useState<OrgPluginInstall[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wizardPlugin, setWizardPlugin] = useState<ApiPlugin | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    async function load() {
      try {
        const [p, i] = await Promise.all([
          fetch("/api/portal/plugins").then(r => r.json()),
          fetch(`/api/portal/orgs/${orgId}/plugins`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setPlugins(p.plugins ?? []);
        setInstalls(i.installs ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [orgId]);

  function isInstalled(pluginId: string): OrgPluginInstall | undefined {
    return installs.find(x => x.pluginId === pluginId);
  }

  async function performInstall(plugin: ApiPlugin, setupAnswers?: Record<string, string>) {
    setBusy(plugin.id); setError(null);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pluginId: plugin.id, setupAnswers }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Install failed."); return false; }
      setInstalls(prev => [...prev, data.install]);
      onChange?.();
      return true;
    } finally { setBusy(null); }
  }

  function handleInstall(plugin: ApiPlugin) {
    if (plugin.setup && plugin.setup.length > 0) { setWizardPlugin(plugin); return; }
    void performInstall(plugin);
  }

  async function handleWizardComplete(answers: Record<string, string>) {
    if (!wizardPlugin) return;
    const ok = await performInstall(wizardPlugin, answers);
    if (ok) setWizardPlugin(null);
  }

  async function uninstall(pluginId: string) {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!(await confirm({
      title: `Uninstall ${plugin?.name ?? "this plugin"}?`,
      message: "Its data + admin pages are removed for this org. Re-install later to recover the manifest defaults; saved data is gone.",
      danger: true,
      confirmLabel: "Uninstall",
    }))) return;
    setBusy(pluginId); setError(null);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins/${pluginId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Uninstall failed."); return; }
      setInstalls(prev => prev.filter(x => x.pluginId !== pluginId));
      onChange?.();
    } finally { setBusy(null); }
  }

  async function setEnabled(pluginId: string, enabled: boolean) {
    setBusy(pluginId); setError(null);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins/${pluginId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Update failed."); return; }
      setInstalls(prev => prev.map(x => x.pluginId === pluginId ? { ...x, enabled } : x));
      onChange?.();
    } finally { setBusy(null); }
  }

  const byCategory = plugins.reduce<Record<string, ApiPlugin[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});
  const installedCount = installs.filter(i => i.enabled).length;
  const configureHref = configureHrefForPlugin ?? ((id: string) => `/aqua/${orgId}/plugins/${id}`);

  if (loading) {
    return <p className="text-[12px] text-brand-cream/45">Loading marketplace…</p>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-200 flex items-center gap-2">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-[11px] underline hover:text-red-100">Dismiss</button>
        </div>
      )}

      {wizardPlugin && (
        <SetupWizardModal
          plugin={wizardPlugin}
          onCancel={() => setWizardPlugin(null)}
          onComplete={handleWizardComplete}
        />
      )}

      <p className="text-[11px] text-brand-cream/55">
        {installedCount} plugin{installedCount === 1 ? "" : "s"} installed and enabled.
      </p>

      {Object.entries(byCategory).map(([category, list]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map(plugin => {
              const install = isInstalled(plugin.id);
              const isBusy = busy === plugin.id;
              return (
                <article
                  key={plugin.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3"
                  style={{ minHeight: 200 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display text-base text-brand-cream truncate">{plugin.name}</h3>
                        {plugin.core && (
                          <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-300">
                            core
                          </span>
                        )}
                        {plugin.status !== "stable" && (
                          <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">
                            {plugin.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-brand-cream/50 leading-relaxed">{plugin.tagline}</p>
                    </div>
                  </div>

                  {plugin.requires.length > 0 && (
                    <p className="text-[10px] text-brand-cream/40">
                      Requires: <span className="text-brand-cream/60">{plugin.requires.join(", ")}</span>
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-2 flex-wrap">
                    {install ? (
                      <>
                        <span
                          className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded ${
                            install.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-brand-cream/45"
                          }`}
                        >
                          {install.enabled ? "Installed" : "Disabled"}
                        </span>
                        <Link
                          href={configureHref(plugin.id)}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85 transition-colors"
                        >
                          Configure
                        </Link>
                        {!plugin.core && (
                          <>
                            <button
                              type="button"
                              onClick={() => void setEnabled(plugin.id, !install.enabled)}
                              disabled={isBusy}
                              className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85 transition-colors disabled:opacity-40"
                            >
                              {install.enabled ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void uninstall(plugin.id)}
                              disabled={isBusy}
                              className="px-2.5 py-1 rounded-md text-[11px] text-red-300/70 hover:text-red-300 transition-colors disabled:opacity-40"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInstall(plugin)}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-md text-[11px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 transition-colors disabled:opacity-40"
                      >
                        {isBusy ? "Installing…" : "Install"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
