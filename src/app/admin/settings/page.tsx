"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface InstalledPlugin {
  pluginId: string;
  enabled: boolean;
  installedAt: number;
}
interface RegistryPlugin {
  id: string; name: string; tagline: string; category: string; core: boolean;
}

export default function AdminSettingsPage() {
  const [installs, setInstalls] = useState<InstalledPlugin[]>([]);
  const [registry, setRegistry] = useState<RegistryPlugin[]>([]);
  const [orgId, setOrgId] = useState<string>("agency");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const id = getActiveOrgId();
      if (cancelled) return;
      setOrgId(id);
      try {
        const [r, i] = await Promise.all([
          fetch("/api/portal/plugins").then(x => x.json()),
          fetch(`/api/portal/orgs/${id}/plugins`).then(x => x.json()),
        ]);
        if (cancelled) return;
        setRegistry(r.plugins ?? []);
        setInstalls(i.installs ?? []);
      } catch { /* noop */ }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const installedMeta = installs
    .map(i => ({ install: i, meta: registry.find(p => p.id === i.pluginId) }))
    .filter((x): x is { install: InstalledPlugin; meta: RegistryPlugin } => Boolean(x.meta));

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-3xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-amber mb-2">Settings</p>
        <h1 className="font-display text-3xl sm:text-4xl text-brand-cream">Integrations</h1>
        <p className="text-brand-cream/55 text-sm mt-1">
          What's installed for this portal and what still needs wiring.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] tracking-[0.28em] uppercase text-brand-cream/55">Installed plugins</h2>
          <Link
            href={`/aqua/${orgId}/marketplace`}
            className="text-[11px] text-cyan-300/80 hover:text-cyan-200"
          >
            Open marketplace →
          </Link>
        </div>
        {installedMeta.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45">
            No plugins installed yet. Open the marketplace to add them.
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

      <Section
        title="Stripe"
        status="needs-keys"
        description="Hosted Checkout, Stripe Tax, and Radar are already wired in code — drop the keys in to go live."
        envVars={[
          "STRIPE_SECRET_KEY",
          "STRIPE_WEBHOOK_SECRET",
          "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
          "NEXT_PUBLIC_SITE_URL",
        ]}
        steps={[
          "Install package: npm i stripe @stripe/stripe-js",
          "Create a Stripe account → Developers → API keys → copy secret + publishable",
          "Add the keys to .env.local (and Vercel project env)",
          "Developers → Webhooks → add endpoint /api/stripe/webhook → copy signing secret",
          "Subscribe to events: checkout.session.completed, charge.refunded",
          "Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`",
        ]}
      />

      <Section
        title="Database (Supabase)"
        status="needs-setup"
        description="Currently the admin reads/writes localStorage so you can demo end-to-end. Swap to Postgres for real persistence."
        envVars={["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]}
        steps={[
          "Create a Supabase project (free tier is fine)",
          "Run the SQL from the TODO blocks in src/lib/admin/orders.ts and inventory.ts",
          "Replace the localStorage read/write functions with Supabase client calls",
          "Move the webhook handler's TODO into a real `orders` insert",
        ]}
      />

      <Section
        title="Shipping labels (EasyPost)"
        status="stubbed"
        description="Right now `Generate label` produces an SVG stub so the print flow works. EasyPost is the recommended single-API solution for Royal Mail / Evri / DPD."
        envVars={["EASYPOST_API_KEY"]}
        steps={[
          "Create an EasyPost account and add a Royal Mail carrier account",
          "npm i @easypost/api",
          "Replace the body of createLabel() in src/lib/admin/labels.ts with the EasyPost call (TODO block already in file)",
        ]}
      />

      <Section
        title="Email (Resend)"
        status="not-started"
        description="Order confirmations, shipped notifications, and verify-email flows. Resend has the cleanest Next.js integration."
        envVars={["RESEND_API_KEY"]}
        steps={[
          "Create a Resend account, verify your sending domain",
          "npm i resend",
          "Add a `sendOrderConfirmation(order)` helper and call it from the Stripe webhook",
        ]}
      />

      <Section
        title="Domain auth allowlist"
        status="ready"
        description="Admin access is gated by an email allowlist in src/lib/auth.ts (ADMIN_EMAILS). Edit it directly to add team members."
        envVars={[]}
        steps={[]}
      />
    </div>
  );
}

const STATUS_LABEL: Record<string, { label: string; colour: string }> = {
  ready:        { label: "Ready",         colour: "bg-brand-orange/15 text-brand-orange" },
  "needs-keys": { label: "Needs keys",    colour: "bg-brand-amber/15 text-brand-amber" },
  "needs-setup":{ label: "Needs setup",   colour: "bg-brand-amber/15 text-brand-amber" },
  stubbed:      { label: "Stubbed",       colour: "bg-brand-purple/15 text-brand-purple-light" },
  "not-started":{ label: "Not started",   colour: "bg-white/5 text-brand-cream/50" },
};

function Section({ title, status, description, envVars, steps }: {
  title: string; status: keyof typeof STATUS_LABEL; description: string;
  envVars: string[]; steps: string[];
}) {
  const s = STATUS_LABEL[status];
  return (
    <section className="rounded-2xl border border-white/8 bg-brand-black-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-brand-cream">{title}</h2>
        <span className={`text-[10px] tracking-widest uppercase px-2 py-1 rounded ${s.colour}`}>{s.label}</span>
      </div>
      <p className="text-sm text-brand-cream/65 leading-relaxed">{description}</p>

      {envVars.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 mb-2">Env vars</p>
          <div className="flex flex-wrap gap-1.5">
            {envVars.map(v => (
              <code key={v} className="text-[11px] font-mono px-2 py-1 rounded bg-brand-black border border-white/10 text-brand-cream/80">{v}</code>
            ))}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/40 mb-2">Steps</p>
          <ol className="text-sm text-brand-cream/70 space-y-1.5 list-decimal list-inside">
            {steps.map(st => <li key={st}>{st}</li>)}
          </ol>
        </div>
      )}
    </section>
  );
}
