"use client";

// /admin/email — Email plugin admin. Two tabs:
//   • Templates — list bundled templates, preview rendered output
//   • Log       — recent outbound messages with status

import { useEffect, useState } from "react";
import PluginRequired from "@/components/admin/PluginRequired";
import SetupRequired from "@/components/admin/SetupRequired";
import { getActiveOrg, getActiveOrgId, loadOrgs, onOrgsChange } from "@/lib/admin/orgs";

interface Template { id: string; subject: string }
interface LogEntry {
  id: string;
  to: string[];
  subject: string;
  provider: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
  messageId?: string;
  createdAt: number;
  templateId?: string;
}

export default function AdminEmailPage() {
  return <PluginRequired plugin="email"><AdminEmailPageInner /></PluginRequired>;
}

function AdminEmailPageInner() {
  const [tab, setTab] = useState<"templates" | "log" | "test">("templates");
  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Email</p>
        <h1 className="font-display text-3xl text-brand-cream">Transactional email</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Templates, delivery log, and a test send to verify your provider keys.</p>
      </header>

      <div className="flex gap-1 border-b border-white/5">
        {(["templates", "log", "test"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[12px] capitalize transition-colors ${tab === t ? "text-brand-cream border-b-2 border-cyan-400" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "templates" && <TemplatesPanel />}
      {tab === "log"       && <LogPanel />}
      {tab === "test"      && <TestSendPanel />}
    </main>
  );
}

function TemplatesPanel() {
  // Hard-coded list mirroring the server's DEFAULT_TEMPLATES. A
  // future iteration will let operators upload their own templates,
  // but the bundled set covers the common transactional flows.
  const templates: Template[] = [
    { id: "order-confirmation",  subject: "Your order is confirmed — {{orderId}}" },
    { id: "digital-delivery",    subject: "Your downloads are ready — {{orderId}}" },
    { id: "form-submission",     subject: "New form submission — {{formName}}" },
    { id: "password-reset",      subject: "Reset your password" },
    { id: "email-verify",        subject: "Verify your email" },
    { id: "newsletter-post",     subject: "{{postTitle}}" },
  ];
  return (
    <section className="space-y-2">
      {templates.map(t => (
        <article key={t.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45 mb-1">{t.id}</p>
            <p className="text-[13px] text-brand-cream font-mono">{t.subject}</p>
          </div>
          <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300">Active</span>
        </article>
      ))}
      <p className="text-[11px] text-brand-cream/40 mt-3">
        Templates use {"{{variable}}"} substitution. The server-side sender renders these with the right
        values when the plugin's hook fires (e.g. order completion, form submission).
      </p>
    </section>
  );
}

function LogPanel() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const orgId = getActiveOrgId();
        const res = await fetch(`/api/portal/email/log?orgId=${orgId}`);
        const data = await res.json();
        if (!cancelled && data.ok) setLog(data.log ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-[12px] text-brand-cream/45">Loading…</p>;
  if (log.length === 0) return <p className="text-[12px] text-brand-cream/45">No email sent yet from this org.</p>;

  return (
    <section className="space-y-1">
      {log.map(e => (
        <article key={e.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
          <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded-md ${
            e.status === "sent" ? "bg-emerald-500/10 text-emerald-300" :
            e.status === "failed" ? "bg-red-500/10 text-red-300" :
            "bg-amber-500/10 text-amber-300"
          }`}>
            {e.status}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-brand-cream truncate">{e.subject}</p>
            <p className="text-[10px] text-brand-cream/45 truncate">
              {e.to.join(", ")} · {e.provider}{e.templateId ? ` · ${e.templateId}` : ""}
            </p>
            {e.error && <p className="text-[10px] text-red-300/80 mt-0.5">{e.error}</p>}
          </div>
          <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">
            {new Date(e.createdAt).toLocaleString()}
          </span>
        </article>
      ))}
    </section>
  );
}

function TestSendPanel() {
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);

  // Pre-flight: read the email plugin install for the active org and
  // check whether the operator has actually saved a provider + key. If
  // not, we render a SetupRequired CTA instead of letting them mash the
  // Send button and watch error toasts roll past.
  useEffect(() => {
    let cancelled = false;
    function check() {
      void loadOrgs(false).then(() => {
        if (cancelled) return;
        const org = getActiveOrg();
        const inst = org?.plugins?.find(p => p.pluginId === "email");
        const cfg = (inst?.config ?? {}) as { provider?: string; apiKey?: string; smtpHost?: string };
        // Provider is OK if (a) any provider is selected AND (b) it has
        // its credential filled (apiKey for resend/postmark, smtpHost
        // for smtp).
        const ok = !!cfg.provider && (
          cfg.provider === "smtp" ? !!cfg.smtpHost : !!cfg.apiKey
        );
        setProviderConfigured(ok);
      });
    }
    check();
    return onOrgsChange(check);
  }, []);

  async function send() {
    if (!to || busy) return;
    setBusy(true); setResult(null);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, to }),
      });
      const data = await res.json();
      setResult(data.ok ? `Sent — ${data.messageId ?? "no id"}` : `Failed: ${data.error}`);
    } finally { setBusy(false); }
  }

  if (providerConfigured === false) {
    return (
      <SetupRequired
        title="Email transport not configured"
        message="Pick a provider (Resend, Postmark, or SMTP) and paste its credential before sending email."
        steps={[
          "Open the Email plugin's settings",
          "Choose your provider",
          "Paste the API key (or SMTP host + creds)",
        ]}
        cta={{ label: "Configure email plugin", href: `/aqua/${getActiveOrgId()}/plugins/email` }}
        secondaryCta={{ label: "Marketplace", href: `/aqua/${getActiveOrgId()}/marketplace` }}
      />
    );
  }

  return (
    <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3 max-w-md">
      <p className="text-[12px] text-brand-cream/65">Send a test email to verify your provider config.</p>
      <input
        type="email"
        value={to}
        onChange={e => setTo(e.target.value)}
        placeholder="you@example.com"
        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
      />
      <button
        type="button"
        onClick={send}
        disabled={busy || !to}
        className="px-3 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send test"}
      </button>
      {result && (
        <p className={`text-[11px] ${result.startsWith("Sent") ? "text-emerald-300" : "text-red-300"}`}>{result}</p>
      )}
    </section>
  );
}
