"use client";

// /admin/settings — operator-facing integrations overview. Shows
// installed plugins for the active org plus a real-time check of which
// integrations have credentials saved (GitHub PAT, Stripe webhook,
// email provider). Each card links to where the integration is
// configured so the operator never has to hunt.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrgId, getActiveOrg, loadOrgs, onOrgsChange } from "@/lib/admin/orgs";
import { loadSettings, hasSecret, onSettingsChange } from "@/lib/admin/portalSettings";
import AdminTabs from "@/components/admin/AdminTabs";
import { SETTINGS_TABS } from "@/lib/admin/tabSets";
import type { OrgRecord } from "@/portal/server/types";

interface InstalledPlugin {
  pluginId: string;
  enabled: boolean;
  installedAt: number;
}
interface RegistryPlugin {
  id: string; name: string; tagline: string; category: string; core: boolean;
}

type IntegrationStatus = "ready" | "needs-setup" | "not-installed";

interface IntegrationStatusInfo {
  status: IntegrationStatus;
  detail?: string;
}

const STATUS_TONE: Record<IntegrationStatus, { label: string; cls: string }> = {
  ready:           { label: "Ready",          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  "needs-setup":   { label: "Needs setup",    cls: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  "not-installed": { label: "Not installed",  cls: "bg-white/5 text-brand-cream/55 border-white/10" },
};

export default function AdminSettingsPage() {
  const [installs, setInstalls]   = useState<InstalledPlugin[]>([]);
  const [registry, setRegistry]   = useState<RegistryPlugin[]>([]);
  const [orgId, setOrgId]         = useState<string>("agency");
  const [org, setOrg]             = useState<OrgRecord | undefined>(undefined);
  const [github, setGithub]       = useState<IntegrationStatusInfo>({ status: "needs-setup" });
  const [emailInt, setEmailInt]   = useState<IntegrationStatusInfo>({ status: "not-installed" });
  const [stripeInt, setStripeInt] = useState<IntegrationStatusInfo>({ status: "not-installed" });

  // Run the per-integration checks. Re-runs whenever the active org or
  // settings change (so installing a plugin or saving a PAT updates the
  // dashboard live).
  async function refresh() {
    const id = getActiveOrgId();
    setOrgId(id);
    const activeOrg = getActiveOrg();
    setOrg(activeOrg);

    try {
      const [r, i] = await Promise.all([
        fetch("/api/portal/plugins").then(x => x.json() as Promise<{ plugins: RegistryPlugin[] }>),
        fetch(`/api/portal/orgs/${id}/plugins`).then(x => x.json() as Promise<{ installs: InstalledPlugin[] }>),
      ]);
      setRegistry(r.plugins ?? []);
      setInstalls(i.installs ?? []);
    } catch { /* surface elsewhere; nothing fatal here */ }

    // GitHub status — needs both repo URL and a saved PAT.
    try {
      const s = await loadSettings();
      const hasRepo = !!s.github.repoUrl?.trim();
      const hasPat  = hasSecret(s.github.pat);
      setGithub({
        status: hasRepo && hasPat ? "ready" : "needs-setup",
        detail: hasRepo && hasPat ? s.github.repoUrl : !hasRepo ? "Repo URL not set" : "Personal Access Token not set",
      });
    } catch { setGithub({ status: "needs-setup", detail: "Couldn't reach settings" }); }

    // Email plugin install + provider config.
    const o = getActiveOrg();
    const emailInst = o?.plugins?.find(p => p.pluginId === "email");
    if (!emailInst) {
      setEmailInt({ status: "not-installed", detail: "Install the Email plugin first" });
    } else {
      const cfg = (emailInst.config ?? {}) as { provider?: string; apiKey?: string; smtpHost?: string };
      const ready = !!cfg.provider && (cfg.provider === "smtp" ? !!cfg.smtpHost : !!cfg.apiKey);
      setEmailInt({
        status: ready ? "ready" : "needs-setup",
        detail: ready ? `${cfg.provider} configured` : cfg.provider ? `${cfg.provider} chosen, credential missing` : "No provider chosen",
      });
    }

    // Stripe plugin (commerce) — wired via the e-commerce plugin install.
    const stripeInst = o?.plugins?.find(p => p.pluginId === "ecommerce" || p.pluginId === "stripe");
    if (!stripeInst) {
      setStripeInt({ status: "not-installed", detail: "Install an e-commerce or Stripe plugin" });
    } else {
      const cfg = (stripeInst.config ?? {}) as { secretKey?: string; webhookSecret?: string };
      const ready = !!cfg.secretKey;
      setStripeInt({
        status: ready ? "ready" : "needs-setup",
        detail: ready ? "Secret key + webhook saved" : "Stripe secret key not set",
      });
    }
  }

  useEffect(() => {
    let cancelled = false;
    void loadOrgs(false).then(() => { if (!cancelled) void refresh(); });
    const offOrgs = onOrgsChange(() => { void refresh(); });
    const offSettings = onSettingsChange(() => { void refresh(); });
    return () => { cancelled = true; offOrgs(); offSettings(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const installedMeta = installs
    .map(i => ({ install: i, meta: registry.find(p => p.id === i.pluginId) }))
    .filter((x): x is { install: InstalledPlugin; meta: RegistryPlugin } => Boolean(x.meta));
  const enabledCount = installs.filter(i => i.enabled).length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-4xl">
      <AdminTabs tabs={SETTINGS_TABS} ariaLabel="Settings" />
      <header>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Settings</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">{org?.name ?? "Portal"} · integrations</h1>
        <p className="text-brand-cream/55 text-sm mt-1">
          {enabledCount} plugin{enabledCount === 1 ? "" : "s"} enabled · status of the integrations that need credentials.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <IntegrationCard
          title="GitHub"
          subtitle="Source-of-truth + Publish to repo"
          info={github}
          ctaLabel="Configure"
          ctaHref="/admin/portal-settings"
        />
        <IntegrationCard
          title="Email"
          subtitle="Transactional sends + log"
          info={emailInt}
          ctaLabel={emailInt.status === "not-installed" ? "Install" : "Configure"}
          ctaHref={emailInt.status === "not-installed" ? "/admin/marketplace" : `/aqua/${orgId}/plugins/email`}
        />
        <IntegrationCard
          title="Stripe"
          subtitle="Checkout + webhooks"
          info={stripeInt}
          ctaLabel={stripeInt.status === "not-installed" ? "Install" : "Configure"}
          ctaHref={stripeInt.status === "not-installed" ? "/admin/marketplace" : `/aqua/${orgId}/plugins/ecommerce`}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Installed plugins</h2>
          <Link href="/admin/marketplace" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">
            Open marketplace →
          </Link>
        </div>
        {installedMeta.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">
            No plugins installed yet.{" "}
            <Link href="/admin/marketplace" className="text-cyan-300 hover:text-cyan-200 underline">Browse the marketplace</Link>
            {" "}to add some.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {installedMeta.map(({ install, meta }) => (
              <article
                key={install.pluginId}
                className={`rounded-xl border p-3 flex items-start justify-between gap-2 ${
                  install.enabled ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] text-brand-cream truncate">{meta.name}</p>
                    {meta.core && <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-300">core</span>}
                    {!install.enabled && <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/5 text-brand-cream/45">disabled</span>}
                  </div>
                  <p className="text-[11px] text-brand-cream/55 line-clamp-2">{meta.tagline}</p>
                </div>
                <Link
                  href={`/aqua/${orgId}/plugins/${install.pluginId}`}
                  className="text-[11px] text-cyan-300/80 hover:text-cyan-200 shrink-0"
                >
                  Configure →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 space-y-2">
        <h2 className="font-display text-lg text-brand-cream">Where to look</h2>
        <ul className="text-[12px] text-brand-cream/65 leading-relaxed space-y-1">
          <li>· <Link href="/admin/portal-settings" className="text-cyan-300/80 hover:text-cyan-200">Portal settings</Link> — GitHub creds, default branch, database backend.</li>
          <li>· <Link href="/admin/marketplace" className="text-cyan-300/80 hover:text-cyan-200">Plugin marketplace</Link> — install / configure features for this client.</li>
          <li>· <Link href="/admin/plugin-health" className="text-cyan-300/80 hover:text-cyan-200">Plugin health</Link> — per-plugin self-check status.</li>
          <li>· <Link href="/admin/team" className="text-cyan-300/80 hover:text-cyan-200">Team</Link> — invite collaborators with scoped permissions.</li>
          <li>· <Link href="/admin/activity" className="text-cyan-300/80 hover:text-cyan-200">Activity log</Link> — audit every admin mutation.</li>
        </ul>
      </section>
    </div>
  );
}

function IntegrationCard({
  title, subtitle, info, ctaLabel, ctaHref,
}: {
  title: string;
  subtitle: string;
  info: IntegrationStatusInfo;
  ctaLabel: string;
  ctaHref: string;
}) {
  const tone = STATUS_TONE[info.status];
  return (
    <article className="rounded-xl border border-white/8 bg-brand-black-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-brand-cream">{title}</h3>
          <p className="text-[11px] text-brand-cream/55">{subtitle}</p>
        </div>
        <span className={`text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded border ${tone.cls} shrink-0`}>
          {tone.label}
        </span>
      </div>
      {info.detail && <p className="text-[11px] text-brand-cream/65 truncate" title={info.detail}>{info.detail}</p>}
      <Link
        href={ctaHref}
        className="mt-auto pt-2 text-[11px] text-cyan-300/80 hover:text-cyan-200"
      >
        {ctaLabel} →
      </Link>
    </article>
  );
}
