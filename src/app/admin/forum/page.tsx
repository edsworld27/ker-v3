"use client";

// /admin/forum — categories overview + recent topics.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import PageSpinner from "@/components/admin/Spinner";
import { getActiveOrgId } from "@/lib/admin/orgs";
import AdminTabs from "@/components/admin/AdminTabs";
import { CONTENT_TABS } from "@/lib/admin/tabSets";

interface Category { id: string; name: string; slug: string; membersOnly: boolean }
interface Topic {
  id: string; categoryId: string; title: string; slug: string;
  authorEmail: string; replyCount: number; pinned: boolean;
  status: "open" | "flagged" | "removed";
  createdAt: number; lastReplyAt?: number;
}

export default function ForumPage() {
  return <PluginRequired plugin="forum"><ForumPageInner /></PluginRequired>;
}

function ForumPageInner() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const [c, t] = await Promise.all([
        fetch(`/api/portal/forum/categories?orgId=${orgId}`).then(r => r.json()),
        fetch(`/api/portal/forum/topics?orgId=${orgId}`).then(r => r.json()),
      ]);
      if (cancelled) return;
      setCategories(c.categories ?? []);
      setTopics(t.topics ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageSpinner />;

  function categoryName(id: string): string {
    return categories.find(c => c.id === id)?.name ?? "Uncategorised";
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <AdminTabs tabs={CONTENT_TABS} ariaLabel="Content" />
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Forum</p>
          <h1 className="font-display text-3xl text-brand-cream">Community</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            {categories.length} {categories.length === 1 ? "category" : "categories"} · {topics.length} topics
          </p>
        </div>
        <Link href="/admin/forum/moderation" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
          Moderation queue →
        </Link>
      </header>

      <section>
        <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55 mb-3">Recent topics</h2>
        {topics.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-[13px] text-brand-cream/85">No topics yet.</p>
            <p className="text-[12px] text-brand-cream/55 mt-2 max-w-sm mx-auto">
              Topics are created by signed-in visitors on the storefront <code className="font-mono text-brand-cream/65">/forum</code> page.
              Make sure the forum plugin&apos;s feature flag is on and your storefront has a link to it.
            </p>
            <Link href="/forum" target="_blank" className="inline-block mt-3 text-[11px] text-cyan-300/80 hover:text-cyan-200">
              Open the live forum →
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {topics.slice(0, 30).map(t => (
              <li key={t.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
                {t.pinned && <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">pinned</span>}
                {t.status === "flagged" && <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">flagged</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-brand-cream truncate">{t.title}</p>
                  <p className="text-[10px] text-brand-cream/45">
                    {categoryName(t.categoryId)} · by {t.authorEmail} · {t.replyCount} replies
                  </p>
                </div>
                <span className="text-[10px] text-brand-cream/40 tabular-nums shrink-0">
                  {new Date(t.lastReplyAt ?? t.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
