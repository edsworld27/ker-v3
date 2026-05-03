// Site audit (A-1).
//
// One-button "test my website": calls PageSpeed Insights (Google's free
// hosted Lighthouse), normalises findings into our typed shape, and
// optionally feeds them to Claude for a no-BS markdown report.
//
// Design notes:
//   • PSI is used because there's no Chrome on the server. Falls back
//     gracefully when the PSI key isn't configured (uses the public,
//     anon-rate-limited endpoint for the demo path).
//   • De-duplication: PSI sometimes surfaces the same opportunity twice
//     (e.g. once as "opportunity" once as "diagnostic"). We merge by
//     audit id so a "Reduce JS" issue isn't shown five times across
//     categories.
//   • Quota: 5 free reports per org. After that the admin must
//     supply their own PageSpeed key in /admin/portal-settings.
//   • LLM formatter caches the system prompt + tool schema; only the
//     per-page Lighthouse JSON varies between requests.

import crypto from "crypto";
import { getState, mutate } from "./storage";
import { getSettings } from "./settings";
import type {
  AuditFinding, AuditFindingCategory, AuditMetrics, AuditQuota,
  AuditScores, SiteAuditReport,
} from "./types";

const FREE_LIMIT_PER_ORG = 5;
const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const RELEVANT_CATEGORIES: AuditFindingCategory[] = ["performance", "seo", "accessibility", "best-practices"];

function makeId(): string { return `aud_${crypto.randomBytes(7).toString("hex")}`; }

// ── Quota helpers ────────────────────────────────────────────────────────

export function getQuota(orgId: string): AuditQuota {
  const existing = getState().auditQuotas[orgId];
  if (existing) return existing;
  return { orgId, freeUsed: 0, freeLimit: FREE_LIMIT_PER_ORG, totalRuns: 0 };
}

export function quotaRemaining(orgId: string): number {
  const q = getQuota(orgId);
  return Math.max(0, q.freeLimit - q.freeUsed);
}

function bumpQuota(orgId: string, paidByAdminKey: boolean) {
  mutate(state => {
    const cur = state.auditQuotas[orgId] ?? { orgId, freeUsed: 0, freeLimit: FREE_LIMIT_PER_ORG, totalRuns: 0 };
    state.auditQuotas[orgId] = {
      ...cur,
      freeUsed: paidByAdminKey ? cur.freeUsed : cur.freeUsed + 1,
      totalRuns: cur.totalRuns + 1,
      lastRunAt: Date.now(),
    };
  });
}

// ── Reports CRUD ─────────────────────────────────────────────────────────

export function listReports(orgId?: string, siteId?: string): SiteAuditReport[] {
  return Object.values(getState().audits)
    .filter(r => (!orgId || r.orgId === orgId) && (!siteId || r.siteId === siteId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getReport(id: string): SiteAuditReport | undefined {
  return getState().audits[id];
}

function persistReport(report: SiteAuditReport) {
  mutate(state => { state.audits[report.id] = report; });
}

// ── PageSpeed Insights call + normaliser ─────────────────────────────────

interface RawLighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode?: "numeric" | "binary" | "informative" | "manual" | "notApplicable";
  displayValue?: string;
  numericValue?: number;
}

interface RawCategoryRef { id: string; weight: number }
interface RawCategory { id: string; score: number; auditRefs: RawCategoryRef[] }

interface RawLighthouseResult {
  categories: Record<string, RawCategory>;
  audits: Record<string, RawLighthouseAudit>;
  audits_v?: Record<string, never>; // unused, here only to satisfy `any`-free reads
}

interface RawPsiResponse { lighthouseResult?: RawLighthouseResult }

function categoryFromKey(key: string): AuditFindingCategory | null {
  if (key === "performance") return "performance";
  if (key === "seo") return "seo";
  if (key === "accessibility") return "accessibility";
  if (key === "best-practices") return "best-practices";
  return null;
}

function severityFor(score: number | null, weight: number): AuditFinding["severity"] {
  if (score === null) return "info";
  if (score >= 0.9) return "passed";
  if (score < 0.5 && weight >= 0.05) return "critical";
  return "warning";
}

function normaliseFindings(lh: RawLighthouseResult): { findings: AuditFinding[]; scores: AuditScores; metrics: AuditMetrics } {
  // De-duplicate by audit id so the same finding doesn't show twice when
  // it's listed in multiple categories.
  const seen = new Map<string, AuditFinding>();

  for (const [catKey, cat] of Object.entries(lh.categories)) {
    const category = categoryFromKey(catKey);
    if (!category) continue;
    for (const ref of cat.auditRefs) {
      const audit = lh.audits[ref.id];
      if (!audit) continue;
      const severity = severityFor(audit.score, ref.weight);
      // Skip the noise that's neither a problem nor useful info.
      if (severity === "passed" && audit.scoreDisplayMode !== "informative") continue;
      const existing = seen.get(audit.id);
      if (existing) {
        // Same audit id in another category — keep the most severe entry.
        const order: AuditFinding["severity"][] = ["critical", "warning", "info", "passed"];
        if (order.indexOf(severity) < order.indexOf(existing.severity)) {
          seen.set(audit.id, { ...existing, category, severity, weight: ref.weight });
        }
        continue;
      }
      seen.set(audit.id, {
        id: audit.id,
        category,
        severity,
        title: audit.title,
        description: audit.description,
        scoreDisplay: audit.displayValue,
        weight: ref.weight,
        numericValue: audit.numericValue,
      });
    }
  }

  const findings = Array.from(seen.values()).sort((a, b) => {
    const order: AuditFinding["severity"][] = ["critical", "warning", "info", "passed"];
    const cmp = order.indexOf(a.severity) - order.indexOf(b.severity);
    if (cmp !== 0) return cmp;
    return (b.weight ?? 0) - (a.weight ?? 0);
  });

  const scores: AuditScores = {
    performance:   to100(lh.categories.performance?.score),
    seo:           to100(lh.categories.seo?.score),
    accessibility: to100(lh.categories.accessibility?.score),
    bestPractices: to100(lh.categories["best-practices"]?.score),
  };

  const metrics: AuditMetrics = {
    fcp:        lh.audits["first-contentful-paint"]?.numericValue,
    lcp:        lh.audits["largest-contentful-paint"]?.numericValue,
    cls:        lh.audits["cumulative-layout-shift"]?.numericValue,
    tbt:        lh.audits["total-blocking-time"]?.numericValue,
    speedIndex: lh.audits["speed-index"]?.numericValue,
    ttfb:       lh.audits["server-response-time"]?.numericValue,
  };

  return { findings, scores, metrics };
}

function to100(score: number | undefined): number | undefined {
  if (score === undefined || score === null) return undefined;
  return Math.round(score * 100);
}

async function callPagespeedInsights(url: string, strategy: "mobile" | "desktop", apiKey?: string): Promise<RawLighthouseResult> {
  const params = new URLSearchParams({ url, strategy });
  for (const c of RELEVANT_CATEGORIES) params.append("category", c);
  if (apiKey) params.append("key", apiKey);
  const res = await fetch(`${PSI_BASE}?${params}`, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`PageSpeed Insights ${res.status}: ${txt.slice(0, 240)}`);
  }
  const data = await res.json() as RawPsiResponse;
  if (!data.lighthouseResult) throw new Error("PageSpeed Insights returned no lighthouseResult");
  return data.lighthouseResult;
}

// ── Public entry point ──────────────────────────────────────────────────

export interface RunAuditInput {
  orgId: string;
  siteId: string;
  url: string;
  strategy?: "mobile" | "desktop";
}

export async function runAudit(input: RunAuditInput): Promise<SiteAuditReport> {
  const settings = getSettings();
  const adminKey = settings.integrations?.pagespeedKey?.trim();
  const usingAdminKey = !!adminKey;
  const remaining = quotaRemaining(input.orgId);
  if (!usingAdminKey && remaining <= 0) {
    throw new Error(`Free quota exhausted (${getQuota(input.orgId).freeLimit} reports/org). Add a PageSpeed key in /admin/portal-settings to lift the cap.`);
  }

  const id = makeId();
  const strategy = input.strategy ?? "mobile";

  // Insert a "running" row immediately so the UI can show progress.
  let report: SiteAuditReport = {
    id,
    orgId: input.orgId,
    siteId: input.siteId,
    url: input.url,
    strategy,
    status: "running",
    scores: {},
    metrics: {},
    findings: [],
    summary: { critical: 0, warnings: 0, passed: 0 },
    createdAt: Date.now(),
  };
  persistReport(report);

  try {
    const lh = await callPagespeedInsights(input.url, strategy, adminKey);
    const { findings, scores, metrics } = normaliseFindings(lh);
    const summary = {
      critical: findings.filter(f => f.severity === "critical").length,
      warnings: findings.filter(f => f.severity === "warning").length,
      passed:   findings.filter(f => f.severity === "passed").length,
    };
    report = { ...report, status: "succeeded", scores, metrics, findings, summary, finishedAt: Date.now() };
    persistReport(report);
    bumpQuota(input.orgId, usingAdminKey);

    // Optional LLM formatter — fire-and-forget; updates the report in-place.
    if (settings.integrations?.anthropicKey) {
      void formatReportWithLLM(report.id).catch(err => {
        const msg = err instanceof Error ? err.message : String(err);
        mutate(state => {
          const cur = state.audits[report.id];
          if (cur) state.audits[report.id] = { ...cur, error: `LLM formatter failed: ${msg.slice(0, 240)}` };
        });
      });
    }

    return report;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    report = { ...report, status: "failed", error: msg, finishedAt: Date.now() };
    persistReport(report);
    return report;
  }
}

// ── LLM formatter — Claude (Anthropic SDK) ───────────────────────────────

const FORMATTER_SYSTEM_PROMPT = `You are a website-audit translator. You take a normalised JSON of Lighthouse findings + site context and produce a no-BS markdown report.

Tone: direct, specific, technical. No filler, no "as an AI", no marketing fluff.
Audience: a developer + their non-technical client looking at it together.

Strict rules:
1. Output GitHub-flavoured markdown only. No HTML tags except <details>/<summary> if useful.
2. Do not invent findings — only report what the data shows.
3. For every fix, name the file/path/element when the data has it.
4. Prefer concrete numbers over adjectives. "LCP 4.2s" beats "slow LCP".
5. Include exact code or config snippets when the audit's description provides them.
6. Treat each finding once — never repeat across sections.

Required sections, in order:
# Audit summary
A 3-line executive summary: overall verdict + the single biggest win + estimated effort to fix the criticals.

## Critical fixes
Numbered list of severity=critical findings. For each: title, observed value, why it matters in one sentence, exact remediation.

## Quick wins
Numbered list of the cheapest 3-5 fixes (low effort, measurable impact). Pull from severity=warning where the description suggests a one-line config change.

## Performance
Bullet list of perf findings + a Core Web Vitals line: LCP / CLS / TBT / TTFB with the current values.

## SEO
Bullet list of SEO findings.

## Accessibility
Bullet list of a11y findings.

## Best practices
Bullet list of best-practice findings.

## Methodology
Two lines: which Lighthouse categories ran, mobile or desktop, run timestamp.

End. No closing pleasantries.`;

const FORMATTER_MODEL = "claude-sonnet-4-6";

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  error?: { type?: string; message?: string };
}

export async function formatReportWithLLM(reportId: string): Promise<SiteAuditReport | null> {
  const report = getReport(reportId);
  if (!report) return null;
  const settings = getSettings();
  const apiKey = settings.integrations?.anthropicKey?.trim();
  if (!apiKey) return report;

  // Compact JSON the model receives — no metadata bloat.
  const payload = {
    site: { url: report.url, strategy: report.strategy },
    scores: report.scores,
    metrics: report.metrics,
    findings: report.findings.map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      scoreDisplay: f.scoreDisplay,
      weight: f.weight,
    })),
  };

  // Prompt-caching shape per shared/prompt-caching.md: stable system
  // prompt is cached, the per-request user message (the audit JSON)
  // varies and falls outside the breakpoint.
  const body = {
    model: FORMATTER_MODEL,
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: FORMATTER_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Format this audit report.\n\n${JSON.stringify(payload)}` },
        ],
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as AnthropicResponse;
  if (!res.ok || !data.content) {
    const errMsg = data.error?.message ?? `Anthropic ${res.status}`;
    mutate(state => {
      const cur = state.audits[reportId];
      if (cur) state.audits[reportId] = { ...cur, error: `LLM formatter failed: ${errMsg}` };
    });
    return getReport(reportId) ?? null;
  }

  const markdown = (data.content ?? [])
    .filter(b => b.type === "text")
    .map(b => b.text ?? "")
    .join("\n");

  mutate(state => {
    const cur = state.audits[reportId];
    if (!cur) return;
    state.audits[reportId] = {
      ...cur,
      llmReportMarkdown: markdown,
      llmModel: FORMATTER_MODEL,
      llmTokensIn: data.usage?.input_tokens,
      llmTokensOut: data.usage?.output_tokens,
    };
  });
  return getReport(reportId) ?? null;
}
