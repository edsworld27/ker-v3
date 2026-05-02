"use client";

// /admin/kb — knowledge base article authoring + publishing.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Article {
  id: string; title: string; slug: string; categoryId: string;
  body: string; published: boolean; upvotes: number; downvotes: number;
  updatedAt: number;
}
interface Category { id: string; name: string; slug: string }

export default function KBPage() {
  return <PluginRequired plugin="knowledgebase"><KBPageInner /></PluginRequired>;
}

function KBPageInner() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const orgId = getActiveOrgId();
    const [a, c] = await Promise.all([
      fetch(`/api/portal/kb?orgId=${orgId}`).then(x => x.json()),
      fetch(`/api/portal/kb/categories?orgId=${orgId}`).then(x => x.json()),
    ]);
    setArticles(a.articles ?? []);
    setCategories(c.categories ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function publish(id: string) {
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/kb/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    await load();
  }

  if (loading) return <PageSpinner />;

  function categoryName(id: string): string {
    return categories.find(c => c.id === id)?.name ?? "Uncategorised";
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Knowledge base</p>
          <h1 className="font-display text-3xl text-brand-cream">Articles</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            {articles.filter(a => a.published).length} published, {articles.filter(a => !a.published).length} drafts
          </p>
        </div>
        <Link href="/admin/kb/categories" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
          Manage categories →
        </Link>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-[13px] text-brand-cream/85">No knowledge-base articles yet.</p>
          <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto">
            Articles surface on your storefront <code className="font-mono text-brand-cream/65">/help</code> index. Group them under{" "}
            <Link href="/admin/kb/categories" className="text-cyan-300/80 hover:text-cyan-200">categories</Link> for navigation.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {articles.map(a => (
            <li key={a.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded-md ${
                a.published ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
              }`}>
                {a.published ? "live" : "draft"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brand-cream truncate">{a.title}</p>
                <p className="text-[10px] text-brand-cream/45">
                  {categoryName(a.categoryId)} · /help/{a.slug} · {a.upvotes}↑ {a.downvotes}↓
                </p>
              </div>
              {!a.published && (
                <button
                  onClick={() => publish(a.id)}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20"
                >
                  Publish
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
