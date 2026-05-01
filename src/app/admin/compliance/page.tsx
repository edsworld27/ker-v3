"use client";

// /admin/compliance — pick a compliance mode (none/GDPR/HIPAA/SOC 2),
// see live red/amber/green checks, and acknowledge non-blocking warnings.
//
// The mode applies portal-wide (not per-site) and gates which third-party
// providers admins can enable in tracking + embeds, plus how long the
// activity log is retained.

import { useEffect, useState } from "react";
import Tip from "@/components/admin/Tip";
import type { ComplianceMode, ComplianceSettings } from "@/portal/server/types";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

interface ComplianceCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  fixHint?: string;
}

interface ComplianceResponse {
  ok: boolean;
  settings: ComplianceSettings;
  report: {
    mode: ComplianceMode;
    retentionDays: number;
    checks: ComplianceCheck[];
  };
}

const MODES: Array<{
  id: ComplianceMode;
  label: string;
  retentionLabel: string;
  blurb: string;
  rules: string[];
}> = [
  {
    id: "none",
    label: "None",
    retentionLabel: "90 days",
    blurb: "Development default. No restrictions on providers, no minimum retention.",
    rules: ["All trackers and embeds allowed", "Audit log retained 90 days", "Customer impersonation allowed"],
  },
  {
    id: "gdpr",
    label: "GDPR",
    retentionLabel: "6 months",
    blurb: "EU consumer data protection. Consent gating + data subject rights.",
    rules: [
      "Marketing trackers wait for consent.grant() by default",
      "Audit log retained 6 months minimum",
      "Cookie banner enforced sitewide",
      "Customer export + delete actions surfaced",
    ],
  },
  {
    id: "hipaa",
    label: "HIPAA",
    retentionLabel: "6 years",
    blurb: "US healthcare data. Strict provider whitelist + 6-year audit retention.",
    rules: [
      "Non-BAA trackers blocked: GA4, GTM, Meta Pixel, TikTok, Hotjar, Clarity",
      "Non-BAA embeds blocked: Crisp, Intercom, Tidio, Calendly, YouTube, Vimeo",
      "Customer impersonation disabled",
      "Audit log retained 6 years (45 CFR §164.530(j))",
    ],
  },
  {
    id: "soc2",
    label: "SOC 2",
    retentionLabel: "1 year",
    blurb: "Service organisation controls. Audit + access reviews mandatory.",
    rules: [
      "Audit log retained 1 year",
      "Settings changes require a reason",
      "Customer impersonation disabled (use Edit/Configure)",
    ],
  },
];

export default function AdminCompliancePage() {
  const [data, setData] = useState<ComplianceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pull() {
    setError(null);
    try {
      const res = await fetch("/api/portal/compliance", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const body = await res.json() as ComplianceResponse;
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }

  useEffect(() => { void pull(); }, []);

  async function setMode(mode: ComplianceMode) {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/portal/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`save failed: ${res.status} ${txt.slice(0, 120)}`);
      }
      const body = await res.json() as ComplianceResponse;
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  async function acknowledge(checkId: string) {
    setBusy(true);
    try {
      await fetch("/api/portal/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acknowledgeWarning: checkId }),
      });
      await pull();
    } finally { setBusy(false); }
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-5xl">
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Admin panel</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Compliance</h1>
        <p className="text-brand-cream/45 text-sm mt-3">Loading compliance state from the cloud store…</p>
      </div>
    );
  }

  const active = data?.report.mode ?? "none";
  const checks = data?.report.checks ?? [];
  const ackd = new Set(data?.settings.acknowledgedWarnings ?? []);

  const counts = {
    fail: checks.filter(c => c.status === "fail").length,
    warn: checks.filter(c => c.status === "warn" && !ackd.has(c.id)).length,
    ok:   checks.filter(c => c.status === "ok").length,
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Privacy & policy</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Compliance</h1>
        <p className="text-brand-cream/45 text-sm mt-1">
          Pick a mode to gate which third-party providers admins can enable, plus
          set the audit-log retention. The mode applies portal-wide.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Mode picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map(m => {
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              disabled={busy || isActive}
              className={`text-left p-4 rounded-2xl border transition-colors ${
                isActive
                  ? "border-brand-orange bg-brand-orange/10 text-brand-cream"
                  : "border-white/10 text-brand-cream/65 hover:border-white/25 hover:text-brand-cream"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-semibold">{m.label}</p>
                {isActive && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange">Active</span>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-wider text-brand-cream/40">
                  Audit · {m.retentionLabel}
                </span>
              </div>
              <p className="text-[12px] text-brand-cream/60 leading-relaxed mb-2">{m.blurb}</p>
              <ul className="text-[11px] text-brand-cream/45 space-y-0.5">
                {m.rules.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Compliance dashboard */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-cream/60">Live checks</p>
          <Tip text="Computed against the current settings + active backend. Failing checks indicate the chosen mode isn't actually being met right now; warnings are non-blocking but worth a look." />
          <span className="ml-auto flex items-center gap-2 text-[11px]">
            {counts.fail > 0 && <Pill tone="fail">{counts.fail} failing</Pill>}
            {counts.warn > 0 && <Pill tone="warn">{counts.warn} warning</Pill>}
            <Pill tone="ok">{counts.ok} ok</Pill>
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {checks.map(c => {
            const acknowledged = ackd.has(c.id);
            return (
              <div key={c.id} className="px-5 py-3 flex items-start gap-3">
                <Dot status={acknowledged && c.status === "warn" ? "ok" : c.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-brand-cream font-medium">{c.label}</p>
                  <p className="text-[11px] text-brand-cream/55 leading-relaxed mt-0.5">{c.detail}</p>
                  {c.fixHint && (
                    <p className="text-[11px] text-brand-cream/45 leading-relaxed mt-1 italic">→ {c.fixHint}</p>
                  )}
                </div>
                {c.status === "warn" && !acknowledged && (
                  <button
                    onClick={() => acknowledge(c.id)}
                    disabled={busy}
                    className="text-[10px] px-2 py-1 rounded-md border border-white/15 text-brand-cream/55 hover:text-brand-cream hover:border-white/30"
                    title="Suppress this warning until something changes"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-brand-cream/40">
        Compliance is a process, not a checkbox. This panel encodes the technical gates we can enforce at the admin layer
        (provider whitelists, audit retention, impersonation). Legal compliance also requires signed BAAs / DPAs with your
        hosting provider, training, breach notification procedures, and periodic access reviews.
      </p>
    </div>
  );
}

function Dot({ status }: { status: "ok" | "warn" | "fail" }) {
  const colour = status === "ok" ? "bg-green-400"
    : status === "warn" ? "bg-brand-amber"
    : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]";
  return <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colour}`} />;
}

function Pill({ tone, children }: { tone: "ok" | "warn" | "fail"; children: React.ReactNode }) {
  const cls = tone === "ok"   ? "bg-green-500/15 text-green-400 border-green-500/25"
            : tone === "warn" ? "bg-brand-amber/15 text-brand-amber border-brand-amber/30"
            :                   "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}
