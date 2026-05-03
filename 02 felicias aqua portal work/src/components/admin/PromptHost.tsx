"use client";

// Singleton prompt() host — styled replacement for window.prompt(). Use:
//
//   import { prompt } from "@/components/admin/PromptHost";
//
//   const name = await prompt({ title: "Flag name", placeholder: "New feature" });
//   if (name == null) return; // cancelled
//
// Mounted once per layout. Keeps mobile UX (no native browser prompt
// box) and lets us match the rest of the chrome.

import { useEffect, useRef, useState } from "react";

export interface PromptOpts {
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use a textarea instead of an input for multi-line input. */
  multiline?: boolean;
  /** Optional client-side validator; return error string to block submit. */
  validate?: (value: string) => string | null;
}

interface HostState {
  opts: PromptOpts;
  resolve: (v: string | null) => void;
}

let setHostState: ((s: HostState | null) => void) | null = null;

/** Open the styled prompt dialog. Resolves with the entered string, or null if cancelled. */
export function prompt(opts: PromptOpts): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!setHostState) {
    return Promise.resolve(window.prompt(opts.title, opts.defaultValue ?? ""));
  }
  return new Promise<string | null>(resolve => {
    setHostState!({ opts, resolve });
  });
}

export default function PromptHost() {
  const [state, setState] = useState<HostState | null>(null);
  const [value, setValue] = useState("");
  const [err, setErr]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setHostState = (next) => {
      setState(next);
      setValue(next?.opts.defaultValue ?? "");
      setErr(null);
    };
    return () => { setHostState = null; };
  }, []);

  // Auto-focus the input when the dialog opens.
  useEffect(() => {
    if (state) queueMicrotask(() => inputRef.current?.focus());
  }, [state]);

  // Esc cancels, Enter submits (single-line only).
  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (!state) return;
      if (e.key === "Escape") { e.preventDefault(); cancel(); }
      if (e.key === "Enter" && !state.opts.multiline) { e.preventDefault(); submit(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, value]);

  if (!state) return null;

  function cancel() { state?.resolve(null); setState(null); }
  function submit() {
    if (!state) return;
    const v = value;
    if (state.opts.validate) {
      const e = state.opts.validate(v);
      if (e) { setErr(e); return; }
    }
    state.resolve(v);
    setState(null);
  }

  const { title, message, placeholder, multiline, confirmLabel, cancelLabel } = state.opts;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={cancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e1a] p-5 space-y-4 shadow-2xl shadow-black/40"
      >
        <div>
          <h2 id="prompt-title" className="font-display text-base text-brand-cream">{title}</h2>
          {message && <p className="text-[12px] text-brand-cream/65 mt-1 leading-relaxed">{message}</p>}
        </div>

        {multiline ? (
          <textarea
            ref={r => { inputRef.current = r; }}
            value={value}
            onChange={e => { setValue(e.target.value); setErr(null); }}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        ) : (
          <input
            ref={r => { inputRef.current = r; }}
            value={value}
            onChange={e => { setValue(e.target.value); setErr(null); }}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-[13px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-cyan-400/40"
          />
        )}

        {err && <p className="text-[11px] text-red-300">{err}</p>}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={cancel}
            className="text-[12px] text-brand-cream/65 hover:text-brand-cream px-3 py-1.5"
          >
            {cancelLabel ?? "Cancel"}
          </button>
          <button
            onClick={submit}
            className="px-4 py-1.5 rounded-md text-[12px] font-medium border bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/20"
          >
            {confirmLabel ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
