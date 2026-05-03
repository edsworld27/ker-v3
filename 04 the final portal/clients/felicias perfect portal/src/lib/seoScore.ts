// Pure SEO scoring heuristics.
//
// Used by the admin Website editor to surface a quick "how good is this page's
// SEO" badge alongside the SEO field group, and (in future) by automated
// audits to flag pages that need attention before launch.
//
// The function is deliberately framework-agnostic — no React, no DOM, no
// localStorage — so it can run server-side, in tests, or be reused by the
// portal cloud audit. Inputs are all strings or booleans; output is a numeric
// score 0–100 plus a list of human-readable suggestions for any failing
// heuristic.
//
// Heuristics are intentionally simple and well-known. None of them are silver
// bullets — they're guard-rails that catch the obvious misses (missing title,
// description too short, no JSON-LD, etc.). A perfect 100 is achievable.
//
// If you change the weights or rules, keep the maximum at exactly 100 so the
// admin badge stays a clean percentage.

export interface SeoScoreInput {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  hasJsonLd?: boolean;
  slug?: string;
  body?: string;
}

export interface SeoScoreResult {
  score: number;            // 0–100 inclusive
  suggestions: string[];    // human-readable problems, in priority order
  passed: number;           // count of checks that passed
  total: number;            // count of checks scored
}

interface Check {
  id: string;
  weight: number;           // points awarded if this check passes (sum to 100)
  passed: boolean;
  suggestion?: string;      // reported when !passed
}

export function scoreSeo(input: SeoScoreInput): SeoScoreResult {
  const title = (input.title ?? "").trim();
  const description = (input.description ?? "").trim();
  const keywords = (input.keywords ?? "").trim();
  const ogImage = (input.ogImage ?? "").trim();
  const slug = (input.slug ?? "").trim();
  const body = (input.body ?? "").trim();

  const titleLen = title.length;
  const descLen = description.length;
  const keywordCount = keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean).length : 0;
  const slugLen = slug.length;
  // Detect at least one h2 — we accept either an HTML <h2> tag or a markdown
  // "## " heading at the start of a line. Body is optional input.
  const hasH2 = /<h2[\s>]/i.test(body) || /(^|\n)\s*##\s+\S/.test(body);

  const checks: Check[] = [
    {
      id: "title-present",
      weight: 15,
      passed: titleLen > 0,
      suggestion: "Add a meta title — Google needs it for the result tab.",
    },
    {
      id: "title-length",
      weight: 15,
      passed: titleLen >= 30 && titleLen <= 60,
      suggestion: titleLen === 0
        ? undefined // already covered by title-present
        : titleLen < 30
          ? `Title is too short (${titleLen} chars). Aim for 30–60 to fill the search result.`
          : `Title is too long (${titleLen} chars). Keep under 60 so Google doesn’t truncate.`,
    },
    {
      id: "description-present",
      weight: 15,
      passed: descLen > 0,
      suggestion: "Add a meta description — it’s what appears under the link in search results.",
    },
    {
      id: "description-length",
      weight: 15,
      passed: descLen >= 120 && descLen <= 160,
      suggestion: descLen === 0
        ? undefined
        : descLen < 120
          ? `Description is short (${descLen} chars). 120–160 is the sweet spot for Google snippets.`
          : `Description is too long (${descLen} chars). Keep under 160 — Google will truncate the rest.`,
    },
    {
      id: "keywords-bounded",
      weight: 5,
      passed: keywordCount <= 10,
      suggestion: `Trim keywords to 10 or fewer (currently ${keywordCount}). Long keyword stuffing is treated as spam.`,
    },
    {
      id: "og-image",
      weight: 15,
      passed: ogImage.length > 0,
      suggestion: "Add a social share image — without one, links in tweets / posts look bare.",
    },
    {
      id: "json-ld",
      weight: 10,
      passed: !!input.hasJsonLd,
      suggestion: "Add JSON-LD structured data so Google can display rich results.",
    },
    {
      id: "slug-length",
      weight: 5,
      passed: slugLen === 0 || slugLen <= 60,
      suggestion: `Shorten the URL slug (${slugLen} chars). Google prefers concise, readable URLs under 60 chars.`,
    },
    {
      id: "body-h2",
      weight: 5,
      passed: body.length === 0 || hasH2,
      suggestion: "Add at least one <h2> in the page body — sub-headings help both users and search engines.",
    },
  ];

  const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const suggestions = checks
    .filter(c => !c.passed && c.suggestion)
    .map(c => c.suggestion as string);
  const passed = checks.filter(c => c.passed).length;

  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    passed,
    total: checks.length,
  };
}

// Convenience grade for the admin badge — maps a numeric score to a colour
// and a label so the editor doesn't have to repeat that mapping.
export type SeoGrade = "excellent" | "good" | "okay" | "poor";

export function gradeFromScore(score: number): SeoGrade {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "okay";
  return "poor";
}
