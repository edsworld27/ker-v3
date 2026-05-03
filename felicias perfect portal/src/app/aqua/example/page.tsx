"use client";

// /aqua/example — guided walkthrough of a fully-built example portal so
// a new agency owner can click through the editor + storefront without
// onboarding a real client first. The first POST seeds an "Example Co"
// org, an example site, and 4 pages (home / shop / cart / checkout)
// built from the visual editor block schema.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EditorPage } from "@/portal/server/types";
import { setActiveOrgId, loadOrgs } from "@/lib/admin/orgs";
import { setActiveSiteId, listSitesForOrg, createSiteForOrg } from "@/lib/admin/sites";

interface SeedResponse {
  ok: boolean;
  orgId: string;
  siteId: string;
  pages: EditorPage[];
  seeded?: number;
}

const STEPS = [
  { id: "1", title: "Open the agency dashboard", body: "/aqua lists every client portal you manage." },
  { id: "2", title: "Open the example portal", body: "Click the card and you drop into Example Co's admin — sidebar, sites, products, billing all switch to theirs." },
  { id: "3", title: "Build a page in the visual editor", body: "Sites → Pages → Edit. Drag blocks, set colours, publish." },
  { id: "4", title: "Try the variant picker", body: "Pick a colour from the wheel — price updates with the configured surcharge." },
  { id: "5", title: "Replicate for real clients", body: "+ New portal in the header gives you the same flow with a fresh tenant." },
];

export default function ExamplePortalPage() {
  const router = useRouter();
  const [data, setData] = useState<SeedResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/portal/example", { cache: "no-store" });
        const json = await res.json() as SeedResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  async function seed() {
    setBusy("seed"); setError(null);
    try {
      const res = await fetch("/api/portal/example", { method: "POST" });
      const json = await res.json() as SeedResponse;
      setData(json);
      await loadOrgs(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  async function openPortal() {
    if (!data?.orgId) return;
    setBusy("open"); setError(null);
    try {
      // Seed if needed.
      if (data.pages.length === 0) {
        const res = await fetch("/api/portal/example", { method: "POST" });
        const json = await res.json() as SeedResponse;
        setData(json);
      }
      await loadOrgs(true);
      // Make sure there's a Site row in admin localStorage that
      // listSitesForOrg() can return for this org.
      const sites = listSitesForOrg(data.orgId);
      if (sites.length === 0) {
        const created = createSiteForOrg(data.orgId, {
          name: "Example Co",
          slug: "example",
          domains: ["example.com"],
          tagline: "Demo portal seeded by /aqua/example",
        });
        setActiveSiteId(created.id);
      } else {
        setActiveSiteId(sites[0].id);
      }
      setActiveOrgId(data.orgId);
      router.push("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(null); }
  }

  async function openEditor(pageId: string) {
    if (!data) return;
    // Make sure a Site row exists so /admin/sites/[siteId] resolves.
    const sites = listSitesForOrg(data.orgId);
    if (sites.length === 0) {
      const created = createSiteForOrg(data.orgId, {
        name: "Example Co",
        slug: "example",
        domains: ["example.com"],
      });
      setActiveSiteId(created.id);
    }
    setActiveOrgId(data.orgId);
    router.push(`/admin/sites/${data.siteId}/editor/${pageId}`);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header>
        <Link href="/aqua" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Back to portals</Link>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mt-3 mb-1">Demo</p>
        <h1 className="font-display text-4xl text-brand-cream">Example portal</h1>
        <p className="text-[13px] text-brand-cream/55 max-w-2xl mt-1 leading-relaxed">
          A pre-built tenant you can poke at without touching a real client. One click seeds it,
          drops you in as the agency owner, and lets you walk through the full visual editor + storefront flow.
        </p>
      </header>

      {/* Hero card */}
      <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 p-6">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #6366f1 100%)" }}
          >
            E
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-2xl text-brand-cream mb-1">Example Co</p>
            <p className="text-[12px] text-brand-cream/55 mb-3">demo@example.com · {data?.pages.length ?? 0} pages seeded</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={openPortal}
                disabled={busy === "open"}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {busy === "open" ? "Opening…" : "Open portal →"}
              </button>
              <button
                onClick={seed}
                disabled={busy === "seed"}
                className="px-4 py-2 rounded-lg border border-white/15 text-brand-cream/85 hover:bg-white/5 text-[13px] font-semibold disabled:opacity-50"
              >
                {busy === "seed" ? "Seeding…" : data?.pages.length ? "Re-seed missing pages" : "Seed example data"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">{error}</div>}

      {/* Pages preview */}
      <section>
        <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/45 mb-3">Pre-built pages</p>
        {data && data.pages.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.pages.map(page => (
              <div key={page.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                  {page.slug === "/" ? "🏠" : page.slug === "/shop" ? "🛍" : page.slug === "/cart" ? "🛒" : page.slug === "/checkout" ? "💳" : "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-cream">{page.title}</p>
                  <p className="text-[11px] text-brand-cream/55 font-mono truncate">{page.slug}</p>
                  <p className="text-[10px] text-brand-cream/40 mt-0.5">{(page.blocks?.length ?? 0)} top-level block{page.blocks?.length === 1 ? "" : "s"}</p>
                </div>
                <button
                  onClick={() => openEditor(page.id)}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-brand-orange text-white font-semibold hover:opacity-90"
                >
                  Open editor →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-brand-cream/45">No pages yet. Click <em>Seed example data</em> above to create them.</p>
        )}
      </section>

      {/* Walkthrough steps */}
      <section>
        <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/45 mb-3">Walkthrough</p>
        <ol className="space-y-2">
          {STEPS.map(s => (
            <li key={s.id} className="flex gap-3 items-start p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold flex items-center justify-center shrink-0">{s.id}</span>
              <div>
                <p className="text-sm font-semibold text-brand-cream">{s.title}</p>
                <p className="text-[12px] text-brand-cream/55 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
