"use client";

// /admin/i18n — translation table for the i18n plugin. Pick a locale,
// see all keys + their translations. Inline edit; save commits to the
// per-org translations store.

import { useEffect, useState } from "react";
import PluginRequired from "@/components/admin/PluginRequired";
import SetupRequired from "@/components/admin/SetupRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface ApiResp {
  ok: boolean;
  locales: string[];
  defaultLocale: string;
  keys: string[];
  translations: Record<string, string>;   // for selected locale
}

export default function AdminI18nPage() {
  return <PluginRequired plugin="i18n"><AdminI18nPageInner /></PluginRequired>;
}

function AdminI18nPageInner() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [locale, setLocale] = useState<string>("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { void load(""); }, []);

  async function load(targetLocale: string) {
    const orgId = getActiveOrgId();
    const url = `/api/portal/i18n?orgId=${orgId}${targetLocale ? `&locale=${targetLocale}` : ""}`;
    const res = await fetch(url);
    const json = await res.json() as ApiResp;
    if (!json.ok) return;
    setData(json);
    setLocale(targetLocale || json.defaultLocale);
    setEdits({});
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      const orgId = getActiveOrgId();
      const all = { ...data.translations, ...edits };
      if (newKey.trim()) all[newKey.trim()] = newValue;
      await fetch("/api/portal/i18n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, locale, entries: all }),
      });
      setNewKey(""); setNewValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await load(locale);
    } finally { setSaving(false); }
  }

  if (!data) return <main className="p-8 text-[12px] text-brand-cream/45">Loading…</main>;

  // Pre-flight: the translation table is meaningless until at least one
  // locale is configured on the i18n plugin install. Direct the operator
  // there before they try to edit a non-existent locale.
  if (data.locales.length === 0) {
    return (
      <SetupRequired
        title="No locales configured"
        message="Add at least one locale (e.g. fr-FR, es-ES) to the i18n plugin before editing translations."
        steps={[
          "Open the i18n plugin's settings",
          "Add the locale codes you want to support",
          "Set a default locale",
        ]}
        cta={{ label: "Configure i18n", href: `/aqua/${getActiveOrgId()}/plugins/i18n` }}
      />
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Translations</p>
        <h1 className="font-display text-3xl text-brand-cream">i18n</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Edit translations for each enabled locale. Default locale fills in for missing keys.</p>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-brand-cream/55">Locale</span>
        {data.locales.map(l => (
          <button
            key={l}
            onClick={() => void load(l)}
            className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
              l === locale
                ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20"
                : "bg-white/5 text-brand-cream/65 hover:text-brand-cream"
            }`}
          >
            {l.toUpperCase()}{l === data.defaultLocale && <span className="text-[9px] ml-1 opacity-65">(default)</span>}
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
        {data.keys.length === 0 && (
          <div className="px-4 py-8 text-center text-[12px] text-brand-cream/45">
            No keys yet. Add your first below.
          </div>
        )}
        {data.keys.map(key => {
          const value = edits[key] ?? data.translations[key] ?? "";
          const empty = !data.translations[key];
          return (
            <div key={key} className="px-4 py-2.5 flex items-center gap-3">
              <span className={`text-[11px] font-mono w-56 truncate ${empty ? "text-amber-300/65" : "text-brand-cream/65"}`}>{key}</span>
              <input
                type="text"
                value={value}
                onChange={e => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
                placeholder={empty ? "Untranslated — falls back to default locale" : ""}
              />
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
        <h3 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Add key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder="website.nav.home"
            className="w-56 bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-[12px] font-mono text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder="Translation"
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        {saved && <span className="text-[11px] text-emerald-300">Saved.</span>}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-[12px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save translations"}
        </button>
      </div>
    </main>
  );
}
