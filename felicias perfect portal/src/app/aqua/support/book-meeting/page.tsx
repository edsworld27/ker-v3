"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MeetingBooking } from "@/portal/server/types";
import { getActiveOrgId, loadOrgs } from "@/lib/admin/orgs";
import { createMeeting, listMeetings, onSupportChange, patchMeeting } from "@/lib/admin/support";

const STATUS_TONE: Record<MeetingBooking["status"], string> = {
  requested: "bg-brand-amber/15 text-brand-amber",
  confirmed: "bg-cyan-500/15 text-cyan-400",
  completed: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function BookMeetingPage() {
  const [orgId, setOrgId] = useState("");
  const [items, setItems] = useState<MeetingBooking[]>([]);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [dates, setDates] = useState<string[]>(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(s: string) { setToast(s); setTimeout(() => setToast(null), 2400); }

  async function refresh(id?: string) {
    const target = id ?? orgId;
    if (!target) return;
    setItems(await listMeetings(target));
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

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    const validDates = dates.map(d => d.trim()).filter(Boolean);
    if (busy || !orgId || !topic.trim() || validDates.length === 0) return;
    setBusy(true);
    try {
      await createMeeting({ orgId, topic: topic.trim(), preferredDates: validDates, notes: notes.trim() || undefined, contactEmail: contactEmail.trim() || undefined });
      setTopic(""); setNotes(""); setContactEmail(""); setDates(["", "", ""]);
      void refresh();
      showToast("Meeting requested — we'll confirm a slot");
    } finally { setBusy(false); }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <header>
        <Link href="/aqua/support" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Aqua support</Link>
        <h1 className="font-display text-3xl text-brand-cream mt-2">Book a meeting</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1 leading-relaxed">
          Suggest 2–3 times that work for you. We&apos;ll confirm one + send the call link.
        </p>
      </header>

      <form onSubmit={handleBook} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <Field label="Topic">
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Onboarding walkthrough" required className={INPUT} />
        </Field>
        <Field label="Contact email">
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="you@example.com" className={INPUT} />
        </Field>
        <Field label="Preferred times (suggest 2–3)" help="Pick dates + times in your local timezone — we'll confirm in the meeting URL.">
          {dates.map((d, i) => (
            <input
              key={i}
              type="datetime-local"
              value={d}
              onChange={e => { const next = [...dates]; next[i] = e.target.value; setDates(next); }}
              className={INPUT + " mb-2"}
            />
          ))}
        </Field>
        <Field label="Notes (optional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="What would you like to cover?" className={INPUT} />
        </Field>
        <button type="submit" disabled={busy || !topic.trim() || dates.every(d => !d.trim())} className="w-full px-3 py-2.5 rounded-xl bg-brand-orange text-white text-[13px] font-semibold disabled:opacity-50">
          {busy ? "Sending…" : "Request meeting"}
        </button>
      </form>

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-brand-cream/55">Your meetings ({items.length})</p>
        {items.length === 0 && <p className="text-[12px] text-brand-cream/45">No meetings booked yet.</p>}
        {items.map(m => (
          <article key={m.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-sm font-semibold text-brand-cream">{m.topic}</p>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${STATUS_TONE[m.status]}`}>{m.status}</span>
            </div>
            <p className="text-[11px] text-brand-cream/55 mb-2">Suggested: {m.preferredDates.map(d => new Date(d).toLocaleString()).join(" · ")}</p>
            {m.notes && <p className="text-[12px] text-brand-cream/65 leading-relaxed">{m.notes}</p>}
            {m.meetingUrl && <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer" className="block text-[12px] text-cyan-400 hover:underline mt-2">Join meeting ↗ {m.meetingUrl}</a>}
            {/* Agency-side controls */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5 flex-wrap">
              <span className="text-[10px] text-brand-cream/45">Agency:</span>
              {(["requested", "confirmed", "completed", "cancelled"] as const).map(s => (
                <button
                  key={s}
                  onClick={async () => { await patchMeeting(m.id, { status: s }); void refresh(); }}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === s ? STATUS_TONE[s] : "text-brand-cream/40 hover:text-brand-cream"}`}
                >
                  {s}
                </button>
              ))}
              <input
                type="url"
                placeholder="Set Zoom/Meet URL"
                defaultValue={m.meetingUrl ?? ""}
                onBlur={async e => { if (e.target.value !== (m.meetingUrl ?? "")) { await patchMeeting(m.id, { meetingUrl: e.target.value || undefined }); void refresh(); } }}
                className="ml-auto bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-brand-cream w-56 focus:outline-none focus:border-brand-orange/50"
              />
            </div>
          </article>
        ))}
      </section>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-brand-cream text-brand-black text-[12px] font-medium shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50";

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.18em] uppercase text-brand-cream/45 mb-1">{label}</span>
      {children}
      {help && <span className="block text-[10px] text-brand-cream/35 mt-1">{help}</span>}
    </label>
  );
}
