"use client";

// /admin/site-test — one-button "Test my website".
// Runs PageSpeed Insights, normalises findings, optionally formats them
// via Claude (when an Anthropic key is configured in /admin/portal-settings).
//
// Quota: 5 free reports per org. After that, an admin must add a
// PageSpeed key to lift the cap.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteAuditReport, AuditFinding } from "@/portal/server/types";
import { getActiveOrgId, loadOrgs } from "@/lib/admin/orgs";
import { getActiveSite } from "@/lib/admin/sites";
import PluginRequired from "@/components/admin/PluginRequired";

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

const SEV_TONE: Record<AuditFinding["severity"], string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  warning:  "bg-brand-amber/15 text-brand-amber border-brand-amber/30",
  info:     "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  passed:   "bg-green-500/15 text-green-400 border-green-500/30",
};

const CAT_LABEL: Record<AuditFinding["category"], string> = {
  performance:    "Performance",
  seo:            "SEO",
  accessibility:  "Accessibility",
  "best-practices": "Best practices",
};

interface QuotaResponse {
  ok: boolean;
  quota?: { freeUsed: number; freeLimit: number; totalRuns: number };
  pagespeedKeyConfigured?: boolean;
  anthropicKeyConfigured?: boolean;
}

export default function SiteTestPage() {
  return <PluginRequired plugin="auditor"><SiteTestPageInner /></PluginRequired>;
}

function SiteTestPageInner() {
  const [orgId, setOrgId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<SiteAuditReport | null>(null);
  const [history, setHistory] = useState<SiteAuditReport[]>([]);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshHistory() {
    if (!orgId || !siteId) return;
    const res = await fetch(`/api/portal/audit/${encodeURIComponent(siteId)}?orgId=${encodeURIComponent(orgId)}`, { cache: "no-store" });
    const data = await res.json();
    setHistory(data.reports ?? []);
  }

  async function refreshQuota(id: string) {
    if (!id) return;
    const res = await fetch(`/api/portal/audit/quota?orgId=${encodeURIComponent(id)}`, { cache: "no-store" });
    setQuota(await res.json() as QuotaResponse);
  }

  useEffect(() => {
    void loadOrgs(true).then(() => {
      const oid = getActiveOrgId();
      const site = getActiveSite();
      setOrgId(oid);
      setSiteId(site?.id ?? "");
      const fallback = site?.primaryDomain || site?.domains?.[0];
      if (fallback) setUrl(`https://${fallback}`);
      void refreshQuota(oid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void refreshHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [orgId, siteId]);

  async function handleRun() {
    if (!orgId || !siteId || !url.trim()) return;
    setRunning(true); setError(null); setReport(null);
    try {
      const res = await fetch(`/api/portal/audit/${encodeURIComponent(siteId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, url: url.trim(), strategy }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Run failed"); return; }
      setReport(data.report as SiteAuditReport);
      void refreshHistory();
      void refreshQuota(orgId);
      // If LLM formatter is configured, poll for the markdown a few
      // times — it runs async after the response returns.
      if (quota?.anthropicKeyConfigured && !data.report.llmReportMarkdown) {
        for (let i = 0; i < 6; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const r = await fetch(`/api/portal/audit/report/${encodeURIComponent(data.report.id)}`, { cache: "no-store" });
          const d = await r.json();
          if (d.ok && d.report.llmReportMarkdown) { setReport(d.report); break; }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setRunning(false); }
  }

  async function reformat(reportId: string) {
    setError(null);
    const res = await fetch(`/api/portal/audit/report/${encodeURIComponent(reportId)}`, { method: "POST" });
    const data = await res.json();
    if (data.ok) setReport(data.report);
  }

  const remaining = quota?.quota ? Math.max(0, quota.quota.freeLimit - quota.quota.freeUsed) : 0;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Quality</p>
        <h1 className="font-display text-3xl text-brand-cream">Test my website</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1 leading-relaxed">
          One-button audit. Runs Lighthouse via PageSpeed Insights, de-duplicates findings, and formats the result as a no-BS report.
        </p>
      </header>

      {/* Quota strip */}
      {quota?.quota && (
        <div className="flex items-center gap-3 text-[11px]">
          <span className={`px-2 py-1 rounded-full border ${quota.pagespeedKeyConfigured ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-brand-amber/10 text-brand-amber border-brand-amber/20"}`}>
            PageSpeed key: {quota.pagespeedKeyConfigured ? "configured" : "missing — using shared anon limits"}
          </span>
          <span className={`px-2 py-1 rounded-full border ${quota.anthropicKeyConfigured ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-brand-cream/55 border-white/10"}`}>
            Claude formatter: {quota.anthropicKeyConfigured ? "on" : "off (raw findings only)"}
          </span>
          <span className="text-brand-cream/55 ml-auto">
            {quota.pagespeedKeyConfigured ? `${quota.quota.totalRuns} runs total` : `${remaining} of ${quota.quota.freeLimit} free reports left`}
          </span>
        </div>
      )}

      {/* Run form */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="grid sm:grid-cols-[1fr_140px] gap-3">
          <label className="block">
            <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">URL to test</span>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className={INPUT + " font-mono"} />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Form factor</span>
            <select value={strategy} onChange={e => setStrategy(e.target.value as "mobile" | "desktop")} className={INPUT}>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </label>
        </div>
        <button
          onClick={handleRun}
          disabled={running || !url.trim() || (!quota?.pagespeedKeyConfigured && remaining === 0)}
          className="px-4 py-2.5 rounded-xl bg-brand-orange text-white text-[13px] font-semibold disabled:opacity-50 hover:opacity-90"
        >
          {running ? "Auditing… (30–60s)" : "Run audit"}
        </button>
        {!quota?.pagespeedKeyConfigured && remaining === 0 && (
          <p className="text-[11px] text-red-400">
            Free quota exhausted.{" "}
            <Link href="/admin/portal-settings" className="underline">Add a PageSpeed key</Link> to lift the cap.
          </p>
        )}
      </section>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}

      {/* Latest report */}
      {report && <ReportView report={report} onReformat={reformat} llmAvailable={!!quota?.anthropicKeyConfigured} />}

      {/* History */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">History ({history.length})</p>
          </div>
          <ul className="divide-y divide-white/5">
            {history.slice(0, 10).map(r => (
              <li key={r.id} className="px-4 py-2 flex items-center gap-3 text-[12px]">
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  r.status === "succeeded" ? "bg-green-500/15 text-green-400"
                  : r.status === "failed" ? "bg-red-500/15 text-red-400"
                  : "bg-brand-amber/15 text-brand-amber"
                }`}>{r.status}</span>
                <span className="font-mono text-brand-cream/85 truncate flex-1">{r.url}</span>
                <span className="text-brand-cream/55">{r.strategy}</span>
                <span className="text-brand-cream/40">{new Date(r.createdAt).toLocaleString()}</span>
                <button onClick={() => setReport(r)} className="text-brand-orange hover:underline">Open</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function ReportView({ report, onReformat, llmAvailable }: { report: SiteAuditReport; onReformat: (id: string) => void; llmAvailable: boolean }) {
  if (report.status === "running") return <p className="text-[12px] text-brand-cream/55 p-4">Running…</p>;
  if (report.status === "failed") {
    return <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{report.error ?? "Failed."}</div>;
  }

  const cats: AuditFinding["category"][] = ["performance", "seo", "accessibility", "best-practices"];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {/* Scores strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/8">
        {cats.map(cat => {
          const key = cat === "best-practices" ? "bestPractices" : cat;
          const score = (report.scores as Record<string, number | undefined>)[key];
          const tone = score === undefined ? "text-brand-cream/45"
            : score >= 90 ? "text-green-400"
            : score >= 50 ? "text-brand-amber"
            : "text-red-400";
          return (
            <div key={cat} className="px-4 py-3 border-r border-white/8 last:border-r-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45">{CAT_LABEL[cat]}</p>
              <p className={`font-display text-3xl ${tone}`}>{score ?? "—"}</p>
            </div>
          );
        })}
      </div>

      {/* Core Web Vitals */}
      <div className="px-4 py-3 border-b border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
        <Vital label="LCP"  value={report.metrics.lcp} unit="ms" goodMax={2500} okMax={4000} />
        <Vital label="CLS"  value={report.metrics.cls} unit=""    goodMax={0.1}   okMax={0.25} digits={2} />
        <Vital label="TBT"  value={report.metrics.tbt} unit="ms" goodMax={200}   okMax={600} />
        <Vital label="TTFB" value={report.metrics.ttfb} unit="ms" goodMax={800}   okMax={1800} />
      </div>

      {/* LLM-formatted report (when available) */}
      {report.llmReportMarkdown ? (
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase text-cyan-400">No-BS report (Claude {report.llmModel ?? "sonnet-4-6"})</p>
            <button onClick={() => onReformat(report.id)} className="text-[11px] text-brand-cream/55 hover:text-brand-orange">Regenerate</button>
          </div>
          <pre className="text-[12px] text-brand-cream/85 whitespace-pre-wrap font-sans leading-relaxed">{report.llmReportMarkdown}</pre>
        </div>
      ) : llmAvailable && report.status === "succeeded" ? (
        <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
          <span className="text-[11px] text-brand-cream/55">Claude formatter is configured but no report yet.</span>
          <button onClick={() => onReformat(report.id)} className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25">Format now</button>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-white/8 text-[11px] text-brand-cream/55">
          Add an Anthropic key in <Link href="/admin/portal-settings" className="text-brand-orange hover:underline">/admin/portal-settings</Link> to get a Claude-formatted report on every audit.
        </div>
      )}

      {/* Findings — grouped by category */}
      <div className="p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/45">Raw findings ({report.findings.length})</p>
        {cats.map(cat => {
          const findings = report.findings.filter(f => f.category === cat);
          if (findings.length === 0) return null;
          return (
            <details key={cat} className="rounded-lg border border-white/8 bg-white/[0.02]" open={cat === "performance"}>
              <summary className="cursor-pointer px-3 py-2 text-[12px] font-semibold text-brand-cream">
                {CAT_LABEL[cat]} <span className="text-brand-cream/55 font-normal">({findings.length})</span>
              </summary>
              <ul className="divide-y divide-white/5">
                {findings.map(f => (
                  <li key={f.id} className="px-3 py-2.5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${SEV_TONE[f.severity]}`}>{f.severity}</span>
                      <p className="text-[12px] font-semibold text-brand-cream flex-1">{f.title}</p>
                      {f.scoreDisplay && <code className="text-[10px] text-brand-amber font-mono">{f.scoreDisplay}</code>}
                    </div>
                    <p className="text-[11px] text-brand-cream/65 leading-relaxed">{stripMarkdown(f.description)}</p>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </article>
  );
}

function Vital({ label, value, unit, goodMax, okMax, digits = 0 }: { label: string; value?: number; unit: string; goodMax: number; okMax: number; digits?: number }) {
  const v = value ?? null;
  const tone = v === null ? "text-brand-cream/45"
    : v <= goodMax ? "text-green-400"
    : v <= okMax ? "text-brand-amber"
    : "text-red-400";
  const display = v === null ? "—" : digits > 0 ? v.toFixed(digits) : Math.round(v).toString();
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-brand-cream/45">{label}</p>
      <p className={`font-mono text-base font-semibold ${tone}`}>{display}{unit && <span className="ml-1 text-[10px] opacity-70">{unit}</span>}</p>
    </div>
  );
}

// PSI descriptions are markdown — strip the link/link-text noise for the
// inline list and let the LLM-formatted report render the rich version.
function stripMarkdown(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .trim();
}
