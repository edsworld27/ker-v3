"use client";

// /admin/webhooks — manage outbound webhooks for the active org.
// Add URL + event filter + secret, see them in a table, enable
// /disable, delete, view delivery log.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface WebhookConfig {
  id: string; url: string; secret: string;
  events: string[]; enabled: boolean;
  description?: string; createdAt: number;
}

const EVENT_OPTIONS = [
  "*",
  "order.created", "order.paid", "order.refunded", "order.fulfilled", "order.shipped",
  "form.submitted",
  "newsletter.subscribed", "newsletter.unsubscribed",
  "subscription.created", "subscription.cancelled", "subscription.renewed", "subscription.payment_failed",
  "page.published", "blog.post.published",
  "user.signed_up", "user.signed_in",
  "plugin.installed", "plugin.uninstalled",
];

export default function WebhooksPage() {
  return <PluginRequired plugin="webhooks"><WebhooksPageInner /></PluginRequired>;
}

function WebhooksPageInner() {
  const [hooks, setHooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ url: "", events: ["*"], description: "" });

  async function load() {
    const orgId = getActiveOrgId();
    const res = await fetch(`/api/portal/webhooks?orgId=${orgId}`);
    const data = await res.json();
    setHooks(data.webhooks ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function create() {
    if (!form.url.trim()) return;
    const orgId = getActiveOrgId();
    await fetch("/api/portal/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, ...form }),
    });
    setForm({ url: "", events: ["*"], description: "" });
    setCreating(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this webhook? Future events won't be delivered.")) return;
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/webhooks/${id}?orgId=${orgId}`, { method: "DELETE" });
    await load();
  }

  async function toggle(id: string, enabled: boolean) {
    const orgId = getActiveOrgId();
    await fetch(`/api/portal/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, enabled }),
    });
    await load();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Webhooks</p>
          <h1 className="font-display text-3xl text-brand-cream">Outbound webhooks</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Subscribe external systems to internal events. HMAC-signed, retried, logged.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/webhooks/log" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">Delivery log →</Link>
          <button
            type="button"
            onClick={() => setCreating(c => !c)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium"
          >
            {creating ? "Cancel" : "+ Add webhook"}
          </button>
        </div>
      </header>

      {creating && (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div>
            <label className="text-[11px] text-brand-cream/65 block mb-1">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/webhooks/aqua"
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream"
            />
          </div>
          <div>
            <label className="text-[11px] text-brand-cream/65 block mb-1">Events (* = all)</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_OPTIONS.map(ev => {
                const active = form.events.includes(ev);
                return (
                  <button
                    key={ev}
                    type="button"
                    onClick={() => {
                      if (ev === "*") setForm({ ...form, events: active ? [] : ["*"] });
                      else setForm({
                        ...form,
                        events: active
                          ? form.events.filter(x => x !== ev)
                          : [...form.events.filter(x => x !== "*"), ev],
                      });
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors ${
                      active ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20" : "bg-white/5 text-brand-cream/55 hover:text-brand-cream"
                    }`}
                  >
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-brand-cream/65 block mb-1">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. CRM sync"
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[12px] text-brand-cream"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={create}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 text-[12px] font-medium"
            >
              Add webhook
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-[12px] text-brand-cream/45">Loading…</p>
      ) : hooks.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No webhooks yet.</p>
      ) : (
        <section className="space-y-2">
          {hooks.map(h => (
            <article key={h.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[12px] text-brand-cream font-mono truncate">{h.url}</p>
                    <span className={`text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${
                      h.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-brand-cream/45"
                    }`}>
                      {h.enabled ? "active" : "disabled"}
                    </span>
                  </div>
                  {h.description && <p className="text-[11px] text-brand-cream/45 mt-0.5">{h.description}</p>}
                  <p className="text-[10px] text-brand-cream/40 font-mono mt-1">{h.events.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(h.id, !h.enabled)} className="text-[11px] text-brand-cream/65 hover:text-brand-cream">
                    {h.enabled ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => remove(h.id)} className="text-[11px] text-red-300/70 hover:text-red-300">
                    Remove
                  </button>
                </div>
              </div>
              <details>
                <summary className="text-[10px] text-brand-cream/40 cursor-pointer">Show secret</summary>
                <code className="block mt-2 text-[11px] font-mono text-brand-cream/65 break-all">{h.secret}</code>
              </details>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
