"use client";

// /admin/help — searchable index of every documented admin surface.
//
// The floating ? button shows the current page's doc; this page lets
// Felicia browse and search across all of them. Useful when she
// remembers reading something useful but can't find it again.

import { useMemo, useState } from "react";
import Link from "next/link";
import { HELP_DOCS, type HelpDoc } from "@/lib/admin/helpDocs";

interface Entry {
  route: string;
  doc: HelpDoc;
  matchScore: number;
}

function scoreMatch(doc: HelpDoc, route: string, q: string): number {
  if (!q) return 0;
  const needle = q.toLowerCase();
  let score = 0;
  if (doc.title.toLowerCase().includes(needle)) score += 10;
  if (route.toLowerCase().includes(needle)) score += 6;
  if (doc.intro?.toLowerCase().includes(needle)) score += 3;
  for (const s of doc.sections) {
    if (s.heading.toLowerCase().includes(needle)) score += 2;
    if (s.body.toLowerCase().includes(needle)) score += 1;
  }
  return score;
}

export default function HelpIndexPage() {
  const [query, setQuery] = useState("");

  const entries: Entry[] = useMemo(() => {
    const q = query.trim();
    const all: Entry[] = Object.entries(HELP_DOCS).map(([route, doc]) => ({
      route,
      doc,
      matchScore: scoreMatch(doc, route, q),
    }));
    if (!q) {
      // Default order: by route (alphabetical with /admin prefix grouping).
      return all.sort((a, b) => a.route.localeCompare(b.route));
    }
    return all
      .filter(e => e.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [query]);

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-4xl space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Help</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">How everything works</h1>
        <p className="text-brand-cream/55 text-sm mt-1 max-w-prose leading-relaxed">
          Every admin page that has a written explainer. Search by topic (&ldquo;Stripe&rdquo;, &ldquo;backup&rdquo;, &ldquo;refund&rdquo;) or browse the list. The floating <kbd className="px-1.5 py-0.5 rounded bg-white/8 text-brand-cream/70 text-[10px] font-mono">?</kbd> button on any admin page opens the same content scoped to where you are.
        </p>
      </header>

      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search help — Stripe, refund, domain, payout, …"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream focus:outline-none focus:border-brand-orange/50"
      />

      {entries.length === 0 ? (
        <section className="rounded-2xl border border-white/8 bg-brand-black-card p-8 text-center">
          <p className="text-[13px] text-brand-cream/85">No matches</p>
          <p className="text-[12px] text-brand-cream/55 mt-2">
            Try a broader term, or clear the search to see everything.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {entries.map(({ route, doc }) => (
            <li
              key={route}
              className="rounded-2xl border border-white/8 bg-brand-black-card p-5 hover:border-white/15 transition-colors"
            >
              <Link href={route} className="block">
                <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
                  <h2 className="text-[15px] font-display text-brand-cream">{doc.title}</h2>
                  <code className="text-[10px] font-mono text-brand-cream/40">{route}</code>
                </div>
                {doc.intro && (
                  <p className="text-[12px] text-brand-cream/65 leading-relaxed">{doc.intro}</p>
                )}
              </Link>
              {doc.sections.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doc.sections.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase tracking-[0.18em] text-brand-cream/55 px-2 py-0.5 rounded-full bg-white/5"
                    >
                      {s.heading}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-brand-cream/40 mt-8 max-w-prose leading-relaxed">
        Don&rsquo;t see what you&rsquo;re looking for? Each page&rsquo;s ? button gives the most up-to-date guidance for that page. If a page has no doc yet, mention it to your admin — adding one is a few lines in <code className="font-mono text-brand-cream/55">src/lib/admin/helpDocs.ts</code>.
      </p>
    </div>
  );
}
