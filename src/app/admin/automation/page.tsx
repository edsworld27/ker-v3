"use client";

// /admin/automation — list rules with enable/disable; deep-links to runs page.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Rule {
  id: string; name: string; trigger: string;
  enabled: boolean; createdAt: number;
  actions: Array<{ type: string }>;
}

export default function AutomationPage() {
  return <PluginRequired plugin="automation"><AutomationPageInner /></PluginRequired>;
}

function AutomationPageInner() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/automation/rules?orgId=${orgId}`);
    const data = await res.json();
    setRules(data.rules ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function toggle(id: string, enabled: boolean) {
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/automation/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, enabled }),
    });
    await load();
  }

  if (loading) return <main className="p-6 text-[12px] text-brand-cream/45">Loading…</main>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Automation</p>
          <h1 className="font-display text-3xl text-brand-cream">Rules</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">{rules.filter(r => r.enabled).length} active rules</p>
        </div>
        <Link href="/admin/automation/runs" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Run history →</Link>
      </header>

      {rules.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No rules yet — define your first via the API or import a template.</p>
      ) : (
        <ul className="space-y-1">
          {rules.map(r => (
            <li key={r.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded-md ${
                r.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-brand-cream/45"
              }`}>
                {r.enabled ? "active" : "off"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{r.name}</p>
                <p className="text-[10px] font-mono text-brand-cream/45">
                  on {r.trigger} → {r.actions.map(a => a.type).join(" → ")}
                </p>
              </div>
              <button
                onClick={() => toggle(r.id, !r.enabled)}
                className="text-[11px] text-brand-cream/65 hover:text-brand-cream"
              >
                {r.enabled ? "Disable" : "Enable"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
