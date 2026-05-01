"use client";

// /admin/webhooks/log — recent webhook delivery attempts.

import { useEffect, useState } from "react";
import Link from "next/link";
import PluginRequired from "@/components/admin/PluginRequired";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Delivery {
  id: string; webhookId: string; event: string; url: string;
  status: "delivered" | "failed" | "retrying";
  attempt: number; responseCode?: number; error?: string;
  createdAt: number;
}

export default function WebhookLogPage() {
  return <PluginRequired plugin="webhooks"><WebhookLogPageInner /></PluginRequired>;
}

function WebhookLogPageInner() {
  const [log, setLog] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/webhooks/deliveries?orgId=${orgId}`);
      const data = await res.json();
      if (!cancelled) {
        setLog(data.deliveries ?? []);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Webhooks</p>
          <h1 className="font-display text-3xl text-brand-cream">Delivery log</h1>
        </div>
        <Link href="/admin/webhooks" className="text-[11px] text-cyan-300/80 hover:text-cyan-200">← Webhooks</Link>
      </header>

      {loading ? (
        <p className="text-[12px] text-brand-cream/45">Loading…</p>
      ) : log.length === 0 ? (
        <p className="text-[12px] text-brand-cream/45">No deliveries yet — outbound calls will appear here once events fire.</p>
      ) : (
        <section className="space-y-1">
          {log.map(d => (
            <article key={d.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center gap-3">
              <span className={`text-[10px] tracking-wider uppercase px-2 py-1 rounded-md ${
                d.status === "delivered" ? "bg-emerald-500/10 text-emerald-300" :
                d.status === "failed" ? "bg-red-500/10 text-red-300" :
                "bg-amber-500/10 text-amber-300"
              }`}>
                {d.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono text-brand-cream truncate">{d.event}</p>
                <p className="text-[10px] text-brand-cream/45 truncate">
                  {d.url} · attempt {d.attempt}
                  {d.responseCode && ` · HTTP ${d.responseCode}`}
                </p>
                {d.error && <p className="text-[10px] text-red-300/80 mt-0.5">{d.error}</p>}
              </div>
              <span className="text-[10px] text-brand-cream/35 tabular-nums shrink-0">
                {new Date(d.createdAt).toLocaleString()}
              </span>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
