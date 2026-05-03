// /help — public-facing knowledge base index for the active org.
// Lists every published article grouped by category.

import Link from "next/link";
import { ensureHydrated } from "@/portal/server/storage";
import { listCategories, listArticles } from "@/portal/server/knowledgebase";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  await ensureHydrated();
  const orgId = "agency";   // first iteration — single-tenant resolution
  const categories = listCategories(orgId);
  const articles = listArticles(orgId, undefined, true);

  const byCategory = categories.map(c => ({
    category: c,
    articles: articles.filter(a => a.categoryId === c.id),
  }));
  const uncategorised = articles.filter(a => !categories.some(c => c.id === a.categoryId));

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <header className="text-center">
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-2">Help centre</p>
        <h1 className="font-display text-4xl text-brand-cream mb-3">Find your answer fast.</h1>
        <p className="text-[14px] text-brand-cream/55 max-w-lg mx-auto">
          Browse by topic below, or use search to jump straight to what you need.
        </p>
      </header>

      {byCategory.map(({ category, articles }) => articles.length > 0 && (
        <section key={category.id} className="space-y-3">
          <h2 className="text-[12px] tracking-wider uppercase text-brand-cream/70">{category.name}</h2>
          {category.description && <p className="text-[12px] text-brand-cream/55">{category.description}</p>}
          <ul className="space-y-1">
            {articles.map(a => (
              <li key={a.id}>
                <Link
                  href={`/help/${a.slug}`}
                  className="block rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 transition-colors"
                >
                  <p className="text-[13px] text-brand-cream">{a.title}</p>
                  <p className="text-[11px] text-brand-cream/45 line-clamp-1">{a.body.slice(0, 120)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {uncategorised.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[12px] tracking-wider uppercase text-brand-cream/70">Other</h2>
          <ul className="space-y-1">
            {uncategorised.map(a => (
              <li key={a.id}>
                <Link
                  href={`/help/${a.slug}`}
                  className="block rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3"
                >
                  <p className="text-[13px] text-brand-cream">{a.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {articles.length === 0 && (
        <p className="text-center text-[12px] text-brand-cream/45">
          No articles published yet.
        </p>
      )}
    </main>
  );
}
