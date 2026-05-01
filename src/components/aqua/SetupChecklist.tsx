"use client";

// End-to-end setup checklist surfaced on /aqua so the operator sees at a
// glance which step of the flow they're at:
//   AI prompt → portal files → upload to GitHub → connect repo → inject
//   tag → publish in editor → push to GitHub → Vercel pulls → live.

import { useEffect, useState } from "react";
import Link from "next/link";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  href: string;
  cta: string;
  status: "ok" | "pending" | "blocked" | "unknown";
  detail?: string;
}

interface SettingsResponse {
  ok: boolean;
  settings?: {
    github?: { repoUrl?: string; pat?: string };
    database?: { backend?: string };
  };
}

interface HealthResponse {
  capabilities?: Record<string, boolean>;
}

export default function SetupChecklist() {
  const [items, setItems] = useState<CheckItem[]>(seed());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [settingsRes, healthRes, sitesRes, pagesRes] = await Promise.all([
          fetch("/api/portal/settings", { cache: "no-store" }).then(r => r.json() as Promise<SettingsResponse>).catch(() => ({ ok: false } as SettingsResponse)),
          fetch("/api/portal/health", { cache: "no-store" }).then(r => r.json() as Promise<HealthResponse>).catch(() => ({} as HealthResponse)),
          fetch("/api/portal/orgs", { cache: "no-store" }).then(r => r.json()).catch(() => ({ orgs: [] })),
          // Use a known site id via window for now — can't list pages without one
          Promise.resolve({ pages: [] }),
        ]);

        const repoUrl = settingsRes.settings?.github?.repoUrl ?? "";
        const hasPat = Boolean(settingsRes.settings?.github?.pat);
        const backend = settingsRes.settings?.database?.backend ?? "file";
        const orgCount = (sitesRes.orgs?.length ?? 0);

        setItems([
          {
            id: "ai-convert",
            label: "AI Convert your site",
            description: "Drop your existing site into a prompt. We generate the portal.config.ts, the script tag and editable region markers.",
            href: "/admin/sites",
            cta: "Run AI Convert",
            status: healthRes.capabilities?.aiConvert ? "pending" : "blocked",
            detail: healthRes.capabilities?.aiConvert ? "Available in /admin/sites quick-setup" : "Capability disabled",
          },
          {
            id: "github",
            label: "Connect GitHub repo",
            description: "Set the repo URL + GitHub App or PAT so the portal can open PRs to commit your changes.",
            href: "/admin/portal-settings",
            cta: "Configure GitHub",
            status: repoUrl && hasPat ? "ok" : repoUrl ? "pending" : "pending",
            detail: repoUrl ? `${repoUrl}${hasPat ? " · PAT saved" : " · needs PAT"}` : "no repo set",
          },
          {
            id: "tag",
            label: "Inject the portal tag",
            description: "Open a PR adding /portal/tag.js to your site's <head>. Without it, the portal can't talk to your live site.",
            href: "/admin/portal-settings",
            cta: "Inject tag",
            status: healthRes.capabilities?.injectTag ? "pending" : "blocked",
            detail: healthRes.capabilities?.injectTag ? "Click Inject tag in /admin/portal-settings" : "needs GitHub connected first",
          },
          {
            id: "database",
            label: "Pick a database",
            description: "File / KV / Supabase / Postgres. File works for dev; pick KV or Supabase for production.",
            href: "/admin/portal-settings",
            cta: "Configure backend",
            status: backend === "file" ? "pending" : "ok",
            detail: `current: ${backend}`,
          },
          {
            id: "site",
            label: "Add at least one site",
            description: "Each tenant maps a domain → site → org. The aqua portal manages many at once.",
            href: "/aqua/new",
            cta: "+ New portal",
            status: orgCount > 1 ? "ok" : "pending", // primary "agency" always exists
            detail: `${orgCount} org${orgCount === 1 ? "" : "s"} (incl. agency)`,
          },
          {
            id: "publish",
            label: "Build a page + publish",
            description: "Visual editor at /admin/sites/<id>/pages. Draft → Publish snapshots, Push to GitHub raises a PR.",
            href: "/aqua/example",
            cta: "Open example portal",
            status: healthRes.capabilities?.visualBuilder ? "pending" : "blocked",
            detail: healthRes.capabilities?.visualBuilder ? "use the Example portal to walk through" : "Visual builder not loaded",
          },
          {
            id: "promote",
            label: "Push to GitHub → Vercel",
            description: "From the editor, click Push to GitHub. The PR includes pages + content + site code; merging triggers Vercel.",
            href: "/aqua/example",
            cta: "Try the flow",
            status: repoUrl && hasPat ? "pending" : "blocked",
            detail: repoUrl && hasPat ? "Ready when you are" : "needs GitHub connected first",
          },
        ]);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return null;

  const okCount = items.filter(i => i.status === "ok").length;
  const total = items.length;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <header className="flex items-baseline justify-between gap-4 mb-3">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Setup</p>
          <h2 className="font-display text-2xl text-brand-cream">End-to-end flow</h2>
        </div>
        <span className="text-[12px] text-brand-cream/55">{okCount} / {total} done</span>
      </header>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03]">
            <span className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
              item.status === "ok" ? "bg-green-500/25 text-green-400"
              : item.status === "blocked" ? "bg-red-500/15 text-red-400/85"
              : "bg-brand-amber/20 text-brand-amber"
            }`}>{item.status === "ok" ? "✓" : i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-cream">{item.label}</p>
              <p className="text-[12px] text-brand-cream/55 leading-relaxed">{item.description}</p>
              {item.detail && <p className="text-[10px] text-brand-cream/40 font-mono mt-0.5">{item.detail}</p>}
            </div>
            <Link
              href={item.href}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                item.status === "ok" ? "border border-white/10 text-brand-cream/55 hover:bg-white/5"
                : "bg-brand-orange/10 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange/20"
              }`}
            >
              {item.cta}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function seed(): CheckItem[] {
  return [
    { id: "ai-convert", label: "AI Convert your site", description: "Loading…", href: "/admin/sites", cta: "Run AI Convert", status: "unknown" },
    { id: "github", label: "Connect GitHub repo", description: "Loading…", href: "/admin/portal-settings", cta: "Configure GitHub", status: "unknown" },
    { id: "tag", label: "Inject the portal tag", description: "Loading…", href: "/admin/portal-settings", cta: "Inject tag", status: "unknown" },
    { id: "database", label: "Pick a database", description: "Loading…", href: "/admin/portal-settings", cta: "Configure backend", status: "unknown" },
    { id: "site", label: "Add at least one site", description: "Loading…", href: "/aqua/new", cta: "+ New portal", status: "unknown" },
    { id: "publish", label: "Build a page + publish", description: "Loading…", href: "/aqua/example", cta: "Open example portal", status: "unknown" },
    { id: "promote", label: "Push to GitHub → Vercel", description: "Loading…", href: "/aqua/example", cta: "Try the flow", status: "unknown" },
  ];
}
