"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FeatureRequest } from "@/portal/server/types";
import { getActiveOrgId, loadOrgs } from "@/lib/admin/orgs";
import {
  createFeatureRequest, deleteFeatureRequest, listFeatureRequests, onSupportChange,
  patchFeatureRequest,
} from "@/lib/admin/support";
import { confirm } from "@/components/admin/ConfirmHost";

const STATUS_TONE: Record<FeatureRequest["status"], string> = {
  "open":         "bg-brand-amber/15 text-brand-amber",
  "planned":      "bg-cyan-500/15 text-cyan-400",
  "in-progress":  "bg-brand-orange/15 text-brand-orange",
  "shipped":      "bg-green-500/15 text-green-400",
  "declined":     "bg-red-500/15 text-red-400",
};

const PRIORITY_LABEL: Record<FeatureRequest["priority"], string> = {
  low: "Low", medium: "Medium", high: "High", urgent: "Urgent",
};

export default function FeatureRequestsPage() {
  const [orgId, setOrgId] = useState("");
  const [items, setItems] = useState<FeatureRequest[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<FeatureRequest["priority"]>("medium");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  async function refresh(id?: string) {
    const target = id ?? orgId;
    if (!target) return;
    setItems(await listFeatureRequests(target));
  }

  useEffect(() => {
    void loadOrgs(true).then(() => {
      const id = getActiveOrgId();
      setOrgId(id);
      void refresh(id);
    });
    return onSupportChange(() => { if (orgId) void refresh(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !orgId) return;
    setBusy(true);
    try {
      await createFeatureRequest({ orgId, title: title.trim(), body: body.trim(), priority });
      setTitle(""); setBody(""); setPriority("medium"); setCreating(false);
      void refresh();
    } finally { setBusy(false); }
  }

  async function handleVote(id: string, delta: 1 | -1) {
    await patchFeatureRequest(id, { voteDelta: delta });
    void refresh();
  }

  async function handleStatus(id: string, status: FeatureRequest["status"]) {
    await patchFeatureRequest(id, { status });
    void refresh();
  }

  async function handleComment(id: string) {
    if (!commentText.trim()) return;
    await patchFeatureRequest(id, { addComment: { author: "you", body: commentText.trim() } });
    setCommentText("");
    void refresh();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <Link href="/aqua/support" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Aqua support</Link>
          <h1 className="font-display text-3xl text-brand-cream mt-2">Feature requests</h1>
          <p className="text-[12px] text-brand-cream/55 mt-1">Vote, comment, track from open to shipped.</p>
        </div>
        <button onClick={() => setCreating(c => !c)} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold hover:opacity-90">
          {creating ? "Cancel" : "+ New request"}
        </button>
      </header>

      {creating && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short title" required className={INPUT} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe what you'd like — examples help" rows={4} required className={INPUT} />
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-brand-cream/55">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value as FeatureRequest["priority"])} className={INPUT + " w-32"}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="submit" disabled={busy || !title.trim() || !body.trim()} className="ml-auto px-3 py-2 rounded-lg bg-brand-orange text-white text-[12px] font-semibold disabled:opacity-50">
              {busy ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-2">
        {items.length === 0 ? (
          <p className="text-[12px] text-brand-cream/45 text-center py-12">No requests yet — file the first one.</p>
        ) : items.map(item => (
          <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="p-4 flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button onClick={() => handleVote(item.id, 1)} className="text-brand-cream/55 hover:text-brand-orange text-lg leading-none">▲</button>
                <span className="text-sm font-bold text-brand-cream tabular-nums">{item.votes}</span>
                <button onClick={() => handleVote(item.id, -1)} className="text-brand-cream/55 hover:text-brand-orange text-lg leading-none">▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-brand-cream">{item.title}</h2>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${STATUS_TONE[item.status]}`}>{item.status}</span>
                  <span className="text-[10px] text-brand-cream/40">{PRIORITY_LABEL[item.priority]}</span>
                </div>
                <p className="text-[12px] text-brand-cream/65 mt-1 leading-relaxed whitespace-pre-wrap">{item.body}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-brand-cream/45">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.submittedBy && <span>by {item.submittedBy}</span>}
                  <button onClick={() => setOpenId(openId === item.id ? null : item.id)} className="ml-auto hover:text-brand-orange">
                    {item.comments?.length ?? 0} comments {openId === item.id ? "▴" : "▾"}
                  </button>
                </div>
              </div>
            </div>
            {openId === item.id && (
              <div className="border-t border-white/8 p-4 space-y-2">
                {(item.comments ?? []).map(c => (
                  <div key={c.id} className={`rounded-lg p-2 ${c.isAgency ? "bg-cyan-500/5 border border-cyan-500/15" : "bg-white/[0.02] border border-white/5"}`}>
                    <p className="text-[10px] text-brand-cream/55">
                      <strong className={c.isAgency ? "text-cyan-400" : "text-brand-cream"}>{c.author}</strong>
                      {c.isAgency && <span className="text-cyan-400/70 ml-1">· agency</span>}
                      <span className="ml-2 opacity-60">{new Date(c.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="text-[12px] text-brand-cream/85 mt-1 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
                <div className="flex items-end gap-2">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment…" rows={2} className={INPUT} />
                  <button onClick={() => handleComment(item.id)} disabled={!commentText.trim()} className="px-3 py-2 rounded-lg bg-brand-orange text-white text-[11px] font-semibold disabled:opacity-50 shrink-0">Send</button>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-brand-cream/45">Update status:</span>
                  {(["open", "planned", "in-progress", "shipped", "declined"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatus(item.id, s)}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${item.status === s ? STATUS_TONE[s] : "text-brand-cream/40 hover:text-brand-cream"}`}
                    >
                      {s}
                    </button>
                  ))}
                  <button onClick={async () => { if (await confirm({ title: "Delete this feature request?", danger: true, confirmLabel: "Delete" })) { await deleteFeatureRequest(item.id); void refresh(); } }} className="ml-auto text-[10px] text-brand-cream/40 hover:text-red-400">Delete</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";
