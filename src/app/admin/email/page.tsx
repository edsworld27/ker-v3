"use client";

// /admin/email — Email plugin admin. Four tabs:
//   • Compose   — operator drafts a one-off message (recipient, subject,
//                 body, optional template prefill) and sends via the
//                 configured provider. Logged like any other send.
//   • Templates — every bundled template, editable per-org. Subject /
//                 HTML / text overrides persist server-side; reset
//                 reverts to the default.
//   • Log       — recent outbound messages with status.
//   • Test      — quick "verify provider keys" send.

import { useEffect, useState } from "react";
import PluginRequired from "@/components/admin/PluginRequired";
import SetupRequired from "@/components/admin/SetupRequired";
import PageSpinner from "@/components/admin/Spinner";
import { notify } from "@/components/admin/Toaster";
import { confirm } from "@/components/admin/ConfirmHost";
import { getActiveOrg, getActiveOrgId, loadOrgs, onOrgsChange } from "@/lib/admin/orgs";

interface ResolvedTemplate {
  id: string;
  subject: string;
  html: string;
  text: string;
  isOverridden: boolean;
  updatedAt?: number;
}
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
  const [tab, setTab] = useState<"compose" | "templates" | "log" | "test">("compose");
  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Email</p>
        <h1 className="font-display text-3xl text-brand-cream">Transactional email</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Compose one-offs, edit your templates, see what's gone out.</p>
      </header>

      <div className="flex gap-1 border-b border-white/5">
        {(["compose", "templates", "log", "test"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[12px] capitalize transition-colors ${tab === t ? "text-brand-cream border-b-2 border-cyan-400" : "text-brand-cream/55 hover:text-brand-cream"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "compose"   && <ComposePanel />}
      {tab === "templates" && <TemplatesPanel />}
      {tab === "log"       && <LogPanel />}
      {tab === "test"      && <TestSendPanel />}
    </main>
  );
}

function TemplatesPanel() {
  const [templates, setTemplates] = useState<ResolvedTemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Local edit buffer. Lives outside the rendered template so saving
  // commits the form state in one shot and reverting just discards it.
  const [draftSubject, setDraftSubject] = useState("");
  const [draftHtml, setDraftHtml]       = useState("");
  const [draftText, setDraftText]       = useState("");
  const [busy, setBusy]                 = useState(false);

  async function load() {
    setLoading(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/email/templates?orgId=${orgId}`);
      const data = await res.json();
      if (data.ok) setTemplates(data.templates ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function startEdit(t: ResolvedTemplate) {
    setEditingId(t.id);
    setDraftSubject(t.subject);
    setDraftHtml(t.html);
    setDraftText(t.text);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setBusy(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/email/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId, templateId: editingId,
          subject: draftSubject, html: draftHtml, text: draftText,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        notify({ tone: "error", title: "Couldn't save template", message: data.error ?? "Unknown error" });
        return;
      }
      notify({ tone: "success", title: "Template saved", message: editingId });
      setEditingId(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function resetTemplate(id: string) {
    if (!(await confirm({
      title: "Revert to bundled default?",
      message: "Your saved subject / HTML / text for this template will be discarded.",
      danger: true, confirmLabel: "Revert",
    }))) return;
    setBusy(true);
    try {
      const orgId = getActiveOrgId();
      const res = await fetch("/api/portal/email/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, templateId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        notify({ tone: "success", title: "Reverted", message: id });
        if (editingId === id) setEditingId(null);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageSpinner wrap={false} />;

  return (
    <section className="space-y-2">
      <p className="text-[11px] text-brand-cream/45">
        {"Each template uses {{variable}} placeholders that the server fills when the matching event fires "}
        (order placed, form submitted, etc.). Edits save to this org only — bundled defaults stay intact for
        other tenants.
      </p>

      {templates.map(t => {
        const isEditing = editingId === t.id;
        return (
          <article
            key={t.id}
            className={`rounded-xl border p-4 space-y-3 ${
              isEditing
                ? "border-cyan-400/30 bg-cyan-500/[0.04]"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-brand-cream/45">{t.id}</p>
                  {t.isOverridden && (
                    <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">edited</span>
                  )}
                </div>
                <p className="text-[13px] text-brand-cream font-mono break-words">{t.subject}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="text-[11px] px-3 py-1.5 rounded-md border border-white/10 text-brand-cream/70 hover:text-brand-cream hover:border-white/25"
                  >
                    Edit
                  </button>
                )}
                {t.isOverridden && !isEditing && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resetTemplate(t.id)}
                    className="text-[11px] px-3 py-1.5 rounded-md border border-white/10 text-brand-cream/55 hover:text-brand-cream/85 hover:border-white/25 disabled:opacity-40"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block">
                  <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Subject</span>
                  <input
                    type="text"
                    value={draftSubject}
                    onChange={e => setDraftSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream font-mono focus:outline-none focus:border-cyan-400/40"
                  />
                </label>
                <label className="block">
                  <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">HTML body</span>
                  <textarea
                    value={draftHtml}
                    onChange={e => setDraftHtml(e.target.value)}
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream font-mono focus:outline-none focus:border-cyan-400/40"
                  />
                </label>
                <label className="block">
                  <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Plain-text body</span>
                  <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream font-mono focus:outline-none focus:border-cyan-400/40"
                  />
                </label>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={busy}
                    className="text-[11px] px-3 py-1.5 rounded-md text-brand-cream/55 hover:text-brand-cream disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveEdit()}
                    disabled={busy}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 disabled:opacity-40"
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

function ComposePanel() {
  const [to, setTo]               = useState("");
  const [subject, setSubject]     = useState("");
  const [body, setBody]           = useState("");
  const [bodyMode, setBodyMode]   = useState<"text" | "html">("text");
  const [templateId, setTemplateId] = useState<string>("");
  const [templates, setTemplates] = useState<ResolvedTemplate[]>([]);
  const [busy, setBusy]           = useState(false);
  const [result, setResult]       = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);

  // Load org-resolved templates so the operator can prefill from one
  // (e.g. "newsletter-post") and then tweak before sending.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/email/templates?orgId=${orgId}`);
      const data = await res.json();
      if (!cancelled && data.ok) setTemplates(data.templates ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // Same pre-flight as TestSendPanel — gate the form on provider config.
  useEffect(() => {
    let cancelled = false;
    function check() {
      void loadOrgs(false).then(() => {
        if (cancelled) return;
        const org = getActiveOrg();
        const inst = org?.plugins?.find(p => p.pluginId === "email");
        const cfg = (inst?.config ?? {}) as { provider?: string; apiKey?: string; smtpHost?: string };
        const ok = !!cfg.provider && (cfg.provider === "smtp" ? !!cfg.smtpHost : !!cfg.apiKey);
        setProviderConfigured(ok);
      });
    }
    check();
    return onOrgsChange(check);
  }, []);

  function applyTemplate(id: string) {
    setTemplateId(id);
    if (!id) return;
    const t = templates.find(x => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setBody(bodyMode === "html" ? t.html : t.text);
  }

  async function send() {
    if (!to || !subject || !body || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const orgId = getActiveOrgId();
      const payload: Record<string, unknown> = {
        orgId, to, subject,
        ...(bodyMode === "html" ? { html: body } : { text: body }),
      };
      const res = await fetch("/api/portal/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ tone: "success", text: `Sent — ${data.messageId ?? "no id"}` });
        notify({ tone: "success", title: "Email sent", message: `to ${to}` });
      } else {
        setResult({ tone: "error", text: `Failed: ${data.error ?? "unknown error"}` });
      }
    } finally {
      setBusy(false);
    }
  }

  if (providerConfigured === false) {
    return (
      <SetupRequired
        title="Email transport not configured"
        message="Pick a provider (Resend, Postmark, or SMTP) and paste its credential before composing."
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

  const canSend = !busy && to.trim() && subject.trim() && body.trim();

  return (
    <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
      <p className="text-[12px] text-brand-cream/65">
        Draft and send a one-off email. Optional: prefill from a template, then tweak before sending.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Recipient</span>
          <input
            type="email"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="them@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Prefill from template</span>
          <select
            value={templateId}
            onChange={e => applyTemplate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream focus:outline-none focus:border-cyan-400/40"
          >
            <option value="">— None —</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.id}{t.isOverridden ? " (edited)" : ""}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Hello from Aqua"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
        />
      </label>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45">Body</span>
          <div className="flex gap-1">
            {(["text", "html"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setBodyMode(m)}
                className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${
                  bodyMode === m
                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                    : "text-brand-cream/45 hover:text-brand-cream/85"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={8}
          placeholder={bodyMode === "html" ? "<h1>Hello</h1><p>Your message here.</p>" : "Hello,\n\nYour message here."}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 font-mono focus:outline-none focus:border-cyan-400/40"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {result ? (
          <p className={`text-[11px] ${result.tone === "success" ? "text-emerald-300" : "text-red-300"}`}>
            {result.text}
          </p>
        ) : <span />}
        <button
          type="button"
          onClick={() => void send()}
          disabled={!canSend}
          className="px-3 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium disabled:opacity-40"
        >
          {busy ? "Sending…" : "Send email"}
        </button>
      </div>
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

  if (loading) return <PageSpinner wrap={false} />;
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
