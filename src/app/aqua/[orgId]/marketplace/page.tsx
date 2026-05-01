"use client";

// /aqua/[orgId]/marketplace — install / configure / uninstall plugins
// for a specific org. Mirrors the look-and-feel of the agency
// dashboard (cyan accent, dark glass cards). Each plugin is a card
// with status (installed / installable / unavailable-on-plan).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ApiPluginFeature {
  id: string; label: string; description: string | null;
  default: boolean; plans: string[] | null; requires: string[];
}
interface ApiPlugin {
  id: string; name: string; version: string;
  status: "stable" | "beta" | "alpha";
  category: string; core: boolean;
  tagline: string; description: string;
  plans: string[] | null;
  requires: string[]; conflicts: string[];
  features: ApiPluginFeature[];
}
interface OrgPluginInstall {
  pluginId: string; installedAt: number; enabled: boolean;
  config: Record<string, unknown>; features: Record<string, boolean>;
}

const CATEGORY_LABELS: Record<string, string> = {
  core: "Core", content: "Content", commerce: "Commerce",
  marketing: "Marketing", support: "Support", ops: "Ops",
};

export default function MarketplacePage() {
  const params = useParams<{ orgId: string }>();
  const router = useRouter();
  const orgId = params?.orgId ?? "";

  const [plugins, setPlugins] = useState<ApiPlugin[]>([]);
  const [installs, setInstalls] = useState<OrgPluginInstall[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    async function load() {
      const [p, i] = await Promise.all([
        fetch("/api/portal/plugins").then(r => r.json()),
        fetch(`/api/portal/orgs/${orgId}/plugins`).then(r => r.json()),
      ]);
      if (cancelled) return;
      setPlugins(p.plugins ?? []);
      setInstalls(i.installs ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [orgId]);

  function isInstalled(pluginId: string): OrgPluginInstall | undefined {
    return installs.find(x => x.pluginId === pluginId);
  }

  async function handleInstall(plugin: ApiPlugin) {
    setBusy(plugin.id); setError(null);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pluginId: plugin.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Install failed."); return; }
      setInstalls(prev => [...prev, data.install]);
    } finally { setBusy(null); }
  }

  async function uninstall(pluginId: string) {
    if (!confirm("Uninstall this plugin? Its data will be removed for this org.")) return;
    setBusy(pluginId); setError(null);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins/${pluginId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Uninstall failed."); return; }
      setInstalls(prev => prev.filter(x => x.pluginId !== pluginId));
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
    } finally { setBusy(null); }
  }

  // Group plugins by category for display.
  const byCategory = plugins.reduce<Record<string, ApiPlugin[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  const installedCount = installs.filter(i => i.enabled).length;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/aqua" className="text-[11px] text-cyan-400/70 hover:text-cyan-300 transition-colors">
            ← Back to portals
          </Link>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Marketplace</p>
          <h1 className="font-display text-3xl text-brand-cream mb-2">Plugins for {orgId}</h1>
          <p className="text-[13px] text-brand-cream/55 max-w-2xl leading-relaxed">
            Add or remove features for this client portal. Each plugin slots into the sidebar with its own
            settings — turn on the simple editor for non-tech clients, the advanced editor for tech-savvy ones.
            {installedCount > 0 && <span className="text-cyan-300/80"> {installedCount} installed.</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/admin?org=${orgId}`)}
          className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-[12px] text-cyan-200 hover:bg-cyan-500/15 transition-colors"
        >
          Open portal →
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[12px] text-brand-cream/45">Loading marketplace…</p>
      ) : (
        Object.entries(byCategory).map(([category, list]) => (
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
                            href={`/aqua/${orgId}/plugins/${plugin.id}`}
                            className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85 transition-colors"
                          >
                            Configure
                          </Link>
                          {!plugin.core && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEnabled(plugin.id, !install.enabled)}
                                disabled={isBusy}
                                className="px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-brand-cream/85 transition-colors disabled:opacity-40"
                              >
                                {install.enabled ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() => uninstall(plugin.id)}
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
        ))
      )}
    </main>
  );
}
