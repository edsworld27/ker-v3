"use client";

// Header bell — badge with unread count, dropdown showing the last
// 8 notifications. Polls every 30s; could swap to SSE / WebSocket
// later for true real-time.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getActiveOrgId } from "@/lib/admin/orgs";

interface Notification {
  id: string; category: string; title: string; body: string;
  link?: string; read: boolean; createdAt: number;
}

export default function NotificationBell() {
  const [list, setList] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const orgId = getActiveOrgId();
      const res = await fetch(`/api/portal/notifications?orgId=${orgId}`);
      const data = await res.json();
      if (data.ok) {
        setList((data.notifications ?? []).slice(0, 8));
        setUnread(data.unread ?? 0);
      }
    } catch { /* swallow */ }
  }

  useEffect(() => {
    void refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  // Click outside to close.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-cyan-400/15 bg-[#0a0e1a] shadow-2xl z-30 overflow-hidden">
          <header className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400">Notifications</p>
            <Link href="/admin/notifications" className="text-[10px] text-cyan-300/80 hover:text-cyan-200">All →</Link>
          </header>
          {list.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-brand-cream/45 text-center">Nothing yet.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {list.map(n => (
                <li key={n.id} className={`px-3 py-2 border-b border-white/5 last:border-0 ${n.read ? "opacity-60" : ""}`}>
                  {n.link ? (
                    <Link href={n.link} className="block hover:bg-white/[0.02] -mx-1 px-1 py-0.5 rounded">
                      <NotificationContent n={n} />
                    </Link>
                  ) : (
                    <NotificationContent n={n} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({ n }: { n: { title: string; body: string; createdAt: number } }) {
  return (
    <>
      <p className="text-[12px] text-brand-cream truncate">{n.title}</p>
      <p className="text-[10px] text-brand-cream/55 truncate">{n.body}</p>
      <p className="text-[9px] text-brand-cream/35 mt-0.5 tabular-nums">{new Date(n.createdAt).toLocaleString()}</p>
    </>
  );
}
