"use client";

// /admin/seo — sitewide SEO dashboard. Lists every visual-editor page's
// SEO health (title length, description length, sitemap inclusion,
// noindex/nofollow), with deep-links into each page's editor. Plus a
// preview of /sitemap.xml + /robots.txt so admins know what crawlers
// see without leaving the panel.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EditorPage } from "@/portal/server/types";
import { listPages } from "@/lib/admin/editorPages";
import { listSites, getActiveSite, type Site } from "@/lib/admin/sites";

interface Score { value: number; label: string; tone: "good" | "warn" | "bad" }

function scorePage(p: EditorPage): Score {
  let score = 100;
  const flags: string[] = [];
  const titleLen = (p.seo?.title ?? p.title).length;
  const descLen = (p.seo?.metaDescription ?? p.description ?? "").length;
  if (titleLen < 20)  { score -= 15; flags.push("title short"); }
  if (titleLen > 60)  { score -= 10; flags.push("title long"); }
  if (descLen < 50)   { score -= 15; flags.push("description short"); }
  if (descLen > 160)  { score -= 10; flags.push("description long"); }
  if (!p.seo?.ogImage){ score -= 10; flags.push("no og:image"); }
  if (p.seo?.noindex) { score -= 30; flags.push("noindex"); }
  if (p.publishedBlocks === undefined) { score -= 5; flags.push("draft only"); }
  const tone: Score["tone"] = score >= 80 ? "good" : score >= 60 ? "warn" : "bad";
  return { value: Math.max(0, score), label: flags.join(" · ") || "looks good", tone };
}

export default function SeoDashboard() {
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [active, setActive] = useState<Site | null>(null);
  const [sitemap, setSitemap] = useState("");
  const [robots, setRobots] = useState("");

  async function refresh() {
    setSites(listSites());
    setActive(getActiveSite() ?? null);
    if (active) setPages(await listPages(active.id, true));
    try {
      setSitemap(await fetch("/sitemap.xml").then(r => r.text()));
      setRobots(await fetch("/robots.txt").then(r => r.text()));
    } catch {}
  }

  useEffect(() => { void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [active?.id]);

  useEffect(() => {
    setSites(listSites());
    setActive(getActiveSite() ?? null);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-1">Search engine optimisation</p>
        <h1 className="font-display text-3xl text-brand-cream">SEO</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Per-page meta, sitemap, robots — all read from the visual editor.</p>
      </header>

      {sites.length > 1 && (
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-brand-cream/55">Site:</span>
          <select
            value={active?.id ?? ""}
            onChange={e => { const s = sites.find(x => x.id === e.target.value); if (s) setActive(s); }}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-brand-cream"
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Pages SEO health */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">Pages ({pages.length})</p>
        </div>
        {pages.length === 0 ? (
          <p className="p-6 text-[12px] text-brand-cream/45 text-center">No pages yet — build one in the visual editor.</p>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-brand-cream/45 border-b border-white/5">
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Slug</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Title</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Description</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Score</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => {
                const score = scorePage(p);
                const title = p.seo?.title ?? p.title;
                const desc = p.seo?.metaDescription ?? p.description ?? "";
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-mono text-brand-cream/85">{p.slug}</td>
                    <td className="px-3 py-2">
                      <p className="text-brand-cream truncate max-w-[280px]" title={title}>{title}</p>
                      <p className="text-[10px] text-brand-cream/40">{title.length} chars</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-brand-cream/75 truncate max-w-[320px]" title={desc}>{desc || <span className="italic opacity-50">(none)</span>}</p>
                      <p className="text-[10px] text-brand-cream/40">{desc.length} chars</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        score.tone === "good" ? "bg-green-500/20 text-green-400"
                        : score.tone === "warn" ? "bg-brand-amber/20 text-brand-amber"
                        : "bg-red-500/20 text-red-400"
                      }`}>
                        {score.value}
                      </span>
                      <p className="text-[10px] text-brand-cream/55 mt-0.5">{score.label}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/sites/${active?.id ?? ""}/editor/${p.id}`} className="text-[11px] text-brand-orange hover:underline">Edit →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Live sitemap.xml + robots.txt preview */}
      <div className="grid lg:grid-cols-2 gap-3">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
            <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">/sitemap.xml</p>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-orange hover:underline">Open ↗</a>
          </div>
          <pre className="p-3 text-[10px] font-mono text-brand-cream/75 overflow-auto max-h-80">{sitemap}</pre>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
            <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">/robots.txt</p>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-orange hover:underline">Open ↗</a>
          </div>
          <pre className="p-3 text-[10px] font-mono text-brand-cream/75 overflow-auto max-h-80">{robots}</pre>
        </section>
      </div>
    </div>
  );
}
