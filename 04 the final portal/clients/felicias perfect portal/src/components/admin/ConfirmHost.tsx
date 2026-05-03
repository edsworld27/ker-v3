"use client";

// Singleton confirm() host — a styled replacement for window.confirm().
//
// Usage anywhere in the admin tree:
//
//   import { confirm } from "@/components/admin/ConfirmHost";
//
//   if (await confirm({ title: "Delete this funnel?", danger: true })) {
//     await deleteFunnel(id);
//   }
//
// The host is mounted once inside the admin layout. Pages get a real
// modal dialog (consistent with the rest of the admin chrome) instead
// of the browser's grey native prompt. Falls back to window.confirm if
// the host isn't mounted yet (server-render, early hydration).

import { useEffect, useState } from "react";

export interface ConfirmOpts {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface HostState {
  opts: ConfirmOpts;
  resolve: (v: boolean) => void;
}

let setHostState: ((s: HostState | null) => void) | null = null;

/** Open the styled confirm dialog. Resolves true if the user confirms. */
export function confirm(opts: ConfirmOpts): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!setHostState) {
    // Mount-race fallback — vanishingly rare since the host lives in the
    // admin layout, but keeps the app working if someone calls confirm()
    // before React has hydrated.
    return Promise.resolve(window.confirm([opts.title, opts.message].filter(Boolean).join("\n\n")));
  }
  return new Promise<boolean>(resolve => {
    setHostState!({ opts, resolve });
  });
}

export default function ConfirmHost() {
  const [state, setState] = useState<HostState | null>(null);

  useEffect(() => {
    setHostState = setState;
    return () => { setHostState = null; };
  }, []);

  // Esc cancels, Enter confirms — same as the native dialog.
  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (!state) return;
      if (e.key === "Escape") { e.preventDefault(); cancel(); }
      if (e.key === "Enter")  { e.preventDefault(); ok(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return null;

  function cancel() {
    state?.resolve(false);
    setState(null);
  }
  function ok() {
    state?.resolve(true);
    setState(null);
  }

  const { title, message, confirmLabel, cancelLabel, danger } = state.opts;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={cancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0e1a] p-5 space-y-4 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <span className="w-9 h-9 rounded-full bg-red-500/15 border border-red-400/30 text-red-300 flex items-center justify-center text-base shrink-0">
              !
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h2 id="confirm-title" className="font-display text-base text-brand-cream">{title}</h2>
            {message && <p className="text-[12px] text-brand-cream/65 mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={cancel}
            className="text-[12px] text-brand-cream/65 hover:text-brand-cream px-3 py-1.5"
          >
            {cancelLabel ?? "Cancel"}
          </button>
          <button
            onClick={ok}
            autoFocus
            className={`px-4 py-1.5 rounded-md text-[12px] font-medium border ${
              danger
                ? "bg-red-500/15 hover:bg-red-500/25 text-red-200 border-red-400/30"
                : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/20"
            }`}
          >
            {confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
