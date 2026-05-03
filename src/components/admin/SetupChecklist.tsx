"use client";

// Setup checklist — the dashboard's "what do I do next?" surface for
// non-technical operators. Reads /api/portal/setup-status and renders
// each item with either a "Set up" link or a green check.
//
// Design rules:
//   • Show progress prominently ("3 of 8 done") so operators feel forward
//     motion as they configure things.
//   • Auto-hide once everything is done OR when the operator dismisses.
//     Dismissal is per-org so switching tenants resurfaces the checklist
//     for a fresh portal that hasn't been configured yet.
//   • The dashboard's first-run card and this checklist are designed to
//     coexist — first-run is the "blank canvas" empty state; the
//     checklist is the standing reference once any data exists.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Item {
  id: string;
  label: string;
  hint: string;
  href: string;
  done: boolean;
  doneHint?: string;
}

interface Status {
  items: Item[];
  doneCount: number;
  totalCount: number;
  allDone: boolean;
}

const DISMISS_KEY_PREFIX = "lk_setup_checklist_dismissed_v1::";

function dismissKey(orgId: string): string {
  return DISMISS_KEY_PREFIX + orgId;
}

export default function SetupChecklist() {
  const [status, setStatus] = useState<Status | null>(null);
  const [orgId, setOrgId] = useState<string>("");
  const [dismissed, setDismissed] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = getActiveOrgId();
    setOrgId(id);
    try { setDismissed(localStorage.getItem(dismissKey(id)) === "1"); }
    catch { setDismissed(false); }
  }, []);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/portal/setup-status?orgId=${encodeURIComponent(orgId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json() as Status;
        if (!cancelled) setStatus(data);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  function dismiss() {
    if (!orgId) return;
    try { localStorage.setItem(dismissKey(orgId), "1"); } catch {}
    setDismissed(true);
  }

  // Hide while loading (avoid flash) and when fully done OR dismissed.
  if (!loaded || !status) return null;
  if (status.allDone || dismissed) return null;

  const pct = status.totalCount === 0 ? 0 : Math.round((status.doneCount / status.totalCount) * 100);

  return (
    <section className="rounded-2xl border border-brand-amber/25 bg-gradient-to-br from-brand-amber/8 via-orange-500/5 to-transparent p-5 sm:p-6 relative">
      <button
        onClick={dismiss}
        aria-label="Dismiss setup checklist"
        title="Hide — show again by visiting this page in incognito or clearing site data"
        className="absolute top-3 right-3 text-brand-cream/40 hover:text-brand-cream text-lg leading-none"
      >
        ×
      </button>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-brand-amber mb-1">Setup checklist</p>
          <h2 className="font-display text-xl sm:text-2xl text-brand-cream">
            {status.doneCount} of {status.totalCount} done
          </h2>
          <p className="text-[12px] text-brand-cream/55 mt-1">
            Tick these off and you&rsquo;ll have a portal that can take orders, send email, and ship updates.
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-brand-amber tabular-nums">{pct}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-brand-amber to-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-1">
        {status.items.map(item => (
          <li
            key={item.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              item.done ? "bg-emerald-500/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                item.done
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "border border-brand-cream/25 text-brand-cream/40"
              }`}
              aria-hidden
            >
              {item.done ? "✓" : ""}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-brand-cream">
                {item.label}
                {item.doneHint && (
                  <span className="ml-2 text-[11px] text-brand-cream/45">— {item.doneHint}</span>
                )}
              </div>
              {!item.done && (
                <div className="text-[11px] text-brand-cream/50">{item.hint}</div>
              )}
            </div>
            {!item.done && (
              <Link
                href={item.href}
                className="text-[11px] uppercase tracking-[0.2em] text-brand-amber hover:text-amber-300 px-3 py-1.5 rounded-md border border-brand-amber/30 hover:border-brand-amber/60 transition-colors shrink-0"
              >
                Set up →
              </Link>
            )}
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-brand-cream/35 mt-3">
        Need help? Each set-up step has its own page with inline guidance. Once everything&rsquo;s green this card hides itself.
      </p>
    </section>
  );
}
