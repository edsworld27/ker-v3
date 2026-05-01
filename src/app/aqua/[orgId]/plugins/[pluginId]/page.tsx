"use client";

// /aqua/[orgId]/plugins/[pluginId] — configure an installed plugin.
// Auto-renders the plugin's SettingsSchema as a form. Lower section
// shows the granular feature toggles (e.g. simpleEditor / codeView)
// the agency operator flips per-client based on plan + tech-savviness.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ApiSettingsField {
  id: string; label: string;
  type: "text" | "password" | "url" | "email" | "number" | "select" | "boolean" | "textarea" | "color";
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
  placeholder?: string;
  plans?: string[] | null;
}
interface ApiSettingsGroup {
  id: string; label: string; description?: string;
  fields: ApiSettingsField[];
}
interface ApiPluginFeature {
  id: string; label: string; description: string | null;
  default: boolean; plans: string[] | null; requires: string[];
}
interface ApiPlugin {
  id: string; name: string; tagline: string; description: string;
  core: boolean;
  settings: { customPage?: boolean; groups: ApiSettingsGroup[] };
  features: ApiPluginFeature[];
}
interface OrgPluginInstall {
  pluginId: string; enabled: boolean;
  config: Record<string, unknown>; features: Record<string, boolean>;
}

export default function PluginConfigurePage() {
  const params = useParams<{ orgId: string; pluginId: string }>();
  const orgId = params?.orgId ?? "";
  const pluginId = params?.pluginId ?? "";

  const [plugin, setPlugin] = useState<ApiPlugin | null>(null);
  const [install, setInstall] = useState<OrgPluginInstall | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !pluginId) return;
    let cancelled = false;
    async function load() {
      const [p, i] = await Promise.all([
        fetch("/api/portal/plugins").then(r => r.json()),
        fetch(`/api/portal/orgs/${orgId}/plugins`).then(r => r.json()),
      ]);
      if (cancelled) return;
      const found = (p.plugins as ApiPlugin[]).find(x => x.id === pluginId) ?? null;
      const inst = (i.installs as OrgPluginInstall[]).find(x => x.pluginId === pluginId) ?? null;
      setPlugin(found);
      setInstall(inst);
      setConfig(inst?.config ?? {});
      setFeatures(inst?.features ?? {});
    }
    void load();
    return () => { cancelled = true; };
  }, [orgId, pluginId]);

  async function save() {
    setBusy(true); setError(null); setSaved(false);
    try {
      const res = await fetch(`/api/portal/orgs/${orgId}/plugins/${pluginId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config, features }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Save failed."); return; }
      setInstall(data.install);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally { setBusy(false); }
  }

  if (!plugin || !install) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-[12px] text-brand-cream/45">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <header>
        <Link href={`/aqua/${orgId}/marketplace`} className="text-[11px] text-cyan-400/70 hover:text-cyan-300">
          ← Back to marketplace
        </Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Configure plugin</p>
        <h1 className="font-display text-3xl text-brand-cream mb-2">{plugin.name}</h1>
        <p className="text-[12px] text-brand-cream/55 leading-relaxed">{plugin.description}</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Features</h2>
        <p className="text-[11px] text-brand-cream/45 -mt-2">
          Granular sub-features. Turn things off here to give a simpler experience to non-tech clients.
        </p>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
          {plugin.features.map(feature => {
            const on = features[feature.id] === true;
            return (
              <label key={feature.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={e => setFeatures(prev => ({ ...prev, [feature.id]: e.target.checked }))}
                  className="w-4 h-4 accent-cyan-400"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] text-brand-cream">{feature.label}</span>
                    {feature.plans?.length && (
                      <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">
                        {feature.plans.join(" / ")} only
                      </span>
                    )}
                  </div>
                  {feature.description && (
                    <p className="text-[11px] text-brand-cream/45 mt-0.5">{feature.description}</p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {plugin.settings.groups.map(group => (
        <section key={group.id} className="space-y-4">
          <div>
            <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">{group.label}</h2>
            {group.description && <p className="text-[11px] text-brand-cream/45 mt-1">{group.description}</p>}
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4">
            {group.fields.map(field => (
              <FieldRow
                key={field.id}
                field={field}
                value={config[field.id]}
                onChange={v => setConfig(prev => ({ ...prev, [field.id]: v }))}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        {saved && <span className="text-[11px] text-emerald-300">Saved.</span>}
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-[12px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 transition-colors disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

function FieldRow({
  field, value, onChange,
}: {
  field: ApiSettingsField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-brand-cream/75 font-medium">{field.label}</label>
        {field.plans?.length && (
          <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">
            {field.plans.join(" / ")}
          </span>
        )}
      </div>
      {field.helpText && <p className="text-[10px] text-brand-cream/40">{field.helpText}</p>}
      {field.type === "boolean" ? (
        <input
          type="checkbox"
          checked={value === true}
          onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 accent-cyan-400"
        />
      ) : field.type === "select" ? (
        <select
          value={String(value ?? field.default ?? "")}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={String(value ?? field.default ?? "")}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={inputClass}
        />
      ) : field.type === "color" ? (
        <input
          type="color"
          value={String(value ?? field.default ?? "#06b6d4")}
          onChange={e => onChange(e.target.value)}
          className="w-16 h-9 bg-transparent rounded-md cursor-pointer"
        />
      ) : (
        <input
          type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
          value={String(value ?? field.default ?? "")}
          onChange={e => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}
