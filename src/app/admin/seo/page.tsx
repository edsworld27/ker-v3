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
import { listSites, getActiveSite, updateSite, type Site } from "@/lib/admin/sites";

interface LinkRef {
  url: string;
  source: { pageSlug: string; pageId: string; blockId: string; blockType: string; field: string };
  external: boolean;
  status?: number;
  ok?: boolean;
  error?: string;
}

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
  const [links, setLinks] = useState<LinkRef[]>([]);
  const [scanning, setScanning] = useState(false);
  const [siteNavJson, setSiteNavJson] = useState("");

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

  // Build a default Google-friendly Sitelinks JSON-LD from the
  // visual-editor pages. The admin can edit + override on the textarea
  // below; we only seed when the field is empty.
  useEffect(() => {
    if (!active || pages.length === 0) return;
    const existing = active.siteNavigationJsonLd;
    if (existing && existing.trim().length > 0) {
      setSiteNavJson(existing);
      return;
    }
    const items = pages
      .filter(p => !p.seo?.excludeFromSitemap)
      .map(p => ({
        "@type": "SiteNavigationElement",
        name: p.seo?.title ?? p.title,
        url: p.slug === "/" ? "/" : p.slug,
      }));
    const seeded = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": items,
    }, null, 2);
    setSiteNavJson(seeded);
  }, [active, pages]);

  async function scanLinks() {
    if (!active) return;
    setScanning(true);
    try {
      const res = await fetch(`/api/portal/links/${encodeURIComponent(active.id)}?check=1`, { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setLinks(data.links ?? []);
    } finally { setScanning(false); }
  }

  async function saveSiteNav() {
    if (!active) return;
    updateSite(active.id, { siteNavigationJsonLd: siteNavJson });
  }

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

      {/* Broken-link scanner */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">Broken links</p>
          <button
            onClick={scanLinks}
            disabled={scanning}
            className="px-3 py-1.5 rounded-lg bg-brand-orange text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {scanning ? "Scanning…" : links.length === 0 ? "Scan now" : "Re-scan"}
          </button>
        </div>
        {links.length === 0 ? (
          <p className="p-4 text-[12px] text-brand-cream/45">Click Scan to walk every page block and ping each external link.</p>
        ) : (
          <div className="p-2">
            <p className="text-[11px] text-brand-cream/65 px-2 pb-2">
              {links.length} link{links.length === 1 ? "" : "s"} found ·{" "}
              <span className="text-red-400">{links.filter(l => l.external && l.ok === false).length} broken</span> ·{" "}
              <span className="text-green-400">{links.filter(l => l.ok === true).length} ok</span> ·{" "}
              <span className="text-brand-cream/55">{links.filter(l => !l.external).length} internal</span>
            </p>
            <ul className="space-y-1 max-h-80 overflow-y-auto">
              {links.map((l, i) => (
                <li key={i} className={`flex items-start gap-2 px-2 py-1.5 rounded text-[11px] ${
                  l.external && l.ok === false ? "bg-red-500/5 border border-red-500/20" : "border border-white/5 bg-white/[0.02]"
                }`}>
                  <span className={`shrink-0 w-12 text-center font-mono ${
                    l.external && l.ok === false ? "text-red-400"
                    : l.external && l.ok === true ? "text-green-400"
                    : "text-brand-cream/45"
                  }`}>{l.external ? (l.status ?? "ERR") : "—"}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate font-mono text-brand-cream/85 hover:underline">{l.url}</a>
                  <span className="text-brand-cream/40 truncate max-w-[260px]">
                    {l.source.pageSlug} · {l.source.blockType}.{l.source.field}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Sitelinks / Site navigation JSON-LD */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/55">Sitelinks (Google sub-page indents)</p>
          <button onClick={saveSiteNav} className="px-3 py-1.5 rounded-lg bg-brand-orange text-white text-[11px] font-semibold hover:opacity-90">Save</button>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[11px] text-brand-cream/55 leading-relaxed">
            Google may show indented links beneath your domain in search results (Home / About / Shop / Contact …). This <code className="font-mono">SiteNavigationElement</code> JSON-LD is a strong hint about which pages to show. Auto-seeded from your visual-editor pages — edit + reorder freely.
          </p>
          <textarea
            value={siteNavJson}
            onChange={e => setSiteNavJson(e.target.value)}
            spellCheck={false}
            rows={10}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-brand-cream font-mono leading-relaxed focus:outline-none focus:border-brand-orange/50"
          />
          <p className="text-[10px] text-brand-cream/40">
            Injected as <code className="font-mono">&lt;script type=&quot;application/ld+json&quot;&gt;</code> on every page via the site&apos;s custom head.
          </p>
        </div>
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
