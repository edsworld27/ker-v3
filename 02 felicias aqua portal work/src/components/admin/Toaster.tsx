"use client";

// Singleton toast helper — a styled replacement for window.alert(). Use
// from anywhere in the admin/aqua tree:
//
//   import { notify } from "@/components/admin/Toaster";
//
//   notify("Saved");                           // info
//   notify({ tone: "ok",   message: "Sent" }); // green
//   notify({ tone: "error", title: "Failed", message: "Network down" });
//
// The host is mounted once inside each top-level layout. Stacks
// up to 4 toasts; each auto-dismisses after ~4s.

import { useEffect, useState } from "react";

export type ToastTone = "info" | "ok" | "warn" | "error";

export interface ToastOpts {
  tone?: ToastTone;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ActiveToast extends ToastOpts {
  id: number;
}

let pushHandler: ((t: ToastOpts) => void) | null = null;

/** Show a styled toast. Accepts a string (info-tone, no title) or full opts. */
export function notify(input: string | ToastOpts) {
  const opts: ToastOpts = typeof input === "string" ? { message: input } : input;
  if (typeof window === "undefined") return;
  if (!pushHandler) {
    // Mount-race fallback — vanishingly rare. Native alert keeps the user
    // informed if the host hasn't hydrated yet.
    window.alert([opts.title, opts.message].filter(Boolean).join("\n\n"));
    return;
  }
  pushHandler(opts);
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    pushHandler = (opts: ToastOpts) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev.slice(-3), { id, ...opts }]);
      const ms = opts.durationMs ?? 4000;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, ms);
    };
    return () => { pushHandler = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  const tone = toast.tone ?? "info";
  const palette =
    tone === "ok"    ? { ring: "border-emerald-400/30", bg: "bg-emerald-500/10", icon: "✓", iconCls: "text-emerald-300" } :
    tone === "warn"  ? { ring: "border-amber-400/30",   bg: "bg-amber-500/10",   icon: "!", iconCls: "text-amber-300" } :
    tone === "error" ? { ring: "border-red-400/30",     bg: "bg-red-500/10",     icon: "!", iconCls: "text-red-300" } :
                       { ring: "border-cyan-400/30",    bg: "bg-cyan-500/10",    icon: "i", iconCls: "text-cyan-300" };

  return (
    <div
      role="status"
      className={`pointer-events-auto rounded-xl border ${palette.ring} ${palette.bg} px-4 py-3 backdrop-blur-md shadow-lg shadow-black/30 flex items-start gap-3`}
    >
      <span className={`w-6 h-6 rounded-full bg-white/5 ${palette.iconCls} flex items-center justify-center text-[12px] shrink-0 font-bold`}>
        {palette.icon}
      </span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-[12px] font-semibold text-brand-cream mb-0.5">{toast.title}</p>}
        <p className="text-[12px] text-brand-cream/85 leading-relaxed whitespace-pre-line">{toast.message}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-brand-cream/45 hover:text-brand-cream text-[14px] leading-none -mt-0.5"
      >
        ×
      </button>
    </div>
  );
}
