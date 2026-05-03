"use client";

// Floating "?" help button + slide-out drawer.
//
// Mounted once in the admin layout. Reads the current pathname,
// looks up the matching HelpDoc from the registry, opens a drawer
// rendering its sections. Pages without a doc get a fallback panel
// pointing the operator at /admin/customise (the catch-all settings
// surface) and a hint that this page hasn't been documented yet.
//
// Keyboard: ? toggles. Esc closes. Click-outside closes.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getHelpDoc, type HelpDoc } from "@/lib/admin/helpDocs";

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const doc = getHelpDoc(pathname);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ? to toggle (when not typing in an input)
      const target = e.target as HTMLElement | null;
      const inField = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (e.key === "?" && !inField) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Help — what does this page do? (?)"
        aria-label="Open help"
        className="fixed bottom-5 right-5 z-30 w-10 h-10 rounded-full bg-brand-amber/85 hover:bg-brand-amber text-brand-black font-bold text-lg shadow-lg shadow-brand-amber/20 hover:shadow-brand-amber/40 transition-all hover:scale-105"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Help"
        >
          <aside
            onClick={e => e.stopPropagation()}
            className="w-full sm:w-[26rem] max-w-full h-full bg-brand-black-soft border-l border-white/10 overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between gap-3 px-5 py-3 bg-brand-black-soft border-b border-white/8">
              <div>
                <p className="text-[9px] tracking-[0.32em] uppercase text-brand-amber">Help</p>
                <h2 className="text-[14px] font-display text-brand-cream">{doc?.title ?? "This page"}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close help"
                className="text-brand-cream/55 hover:text-brand-cream w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-5 space-y-5">
              {doc ? (
                <>
                  {doc.intro && (
                    <p className="text-[13px] text-brand-cream/80 leading-relaxed">{doc.intro}</p>
                  )}
                  {doc.sections.map((s, i) => (
                    <section key={i} className="space-y-2">
                      <h3 className="text-[11px] uppercase tracking-[0.22em] text-brand-cream/55">{s.heading}</h3>
                      <p className="text-[12px] text-brand-cream/75 leading-relaxed">{s.body}</p>
                      {s.bullets && (
                        <ul className="list-disc list-outside ml-5 space-y-1 text-[12px] text-brand-cream/70 leading-relaxed">
                          {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      )}
                      {s.link && (
                        <Link
                          href={s.link.href}
                          onClick={() => setOpen(false)}
                          className="inline-block text-[11px] uppercase tracking-[0.18em] text-brand-amber hover:text-amber-300"
                        >
                          {s.link.label}
                        </Link>
                      )}
                    </section>
                  ))}
                </>
              ) : (
                <FallbackHelp pathname={pathname} />
              )}

              <hr className="border-white/8" />

              <AskAqua currentRoute={pathname} />

              <hr className="border-white/8" />

              <section className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-[0.22em] text-brand-cream/55">Need more?</h3>
                <ul className="list-disc list-outside ml-5 space-y-1 text-[12px] text-brand-cream/65">
                  <li><Link onClick={() => setOpen(false)} href="/admin" className="text-cyan-300/90 hover:text-cyan-200">Dashboard</Link> — your overview, setup checklist, recent activity.</li>
                  <li><Link onClick={() => setOpen(false)} href="/admin/marketplace" className="text-cyan-300/90 hover:text-cyan-200">Marketplace</Link> — install / configure plugins.</li>
                  <li><Link onClick={() => setOpen(false)} href="/admin/plugin-health" className="text-cyan-300/90 hover:text-cyan-200">Plugin health</Link> — see what&rsquo;s connected vs. broken.</li>
                  <li><Link onClick={() => setOpen(false)} href="/admin/portal-settings" className="text-cyan-300/90 hover:text-cyan-200">Portal settings</Link> — GitHub, database backend, deploy options.</li>
                </ul>
                <p className="text-[10px] text-brand-cream/40 mt-2">
                  Tip: hit <kbd className="px-1.5 py-0.5 rounded bg-white/8 text-brand-cream/70 text-[10px] font-mono">?</kbd> on any admin page to open this drawer.
                </p>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function FallbackHelp({ pathname }: { pathname: string | null }) {
  return (
    <>
      <p className="text-[13px] text-brand-cream/80 leading-relaxed">
        This page doesn&rsquo;t have a dedicated help doc yet. The shortlist below covers the surfaces you&rsquo;re most likely to need.
      </p>
      {pathname && (
        <p className="text-[10px] text-brand-cream/40 font-mono">{pathname}</p>
      )}
    </>
  );
}

interface AskTurn {
  question: string;
  answer?: string;
  error?: string;
  loading: boolean;
}

function AskAqua({ currentRoute }: { currentRoute: string | null }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<AskTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [keyMissing, setKeyMissing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    const turnIdx = history.length;
    setHistory(prev => [...prev, { question: q, loading: true }]);
    setQuestion("");

    try {
      const res = await fetch("/api/portal/help/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, currentRoute }),
      });
      const data = await res.json() as { ok: boolean; answer?: string; error?: string; message?: string };
      if (res.status === 503 && data.error === "anthropic-key-missing") {
        setKeyMissing(true);
        setHistory(prev => prev.filter((_, i) => i !== turnIdx));
        return;
      }
      if (!data.ok) {
        setHistory(prev => prev.map((t, i) => i === turnIdx
          ? { ...t, loading: false, error: data.message ?? data.error ?? "Something went wrong." }
          : t));
        return;
      }
      setHistory(prev => prev.map((t, i) => i === turnIdx
        ? { ...t, loading: false, answer: data.answer ?? "" }
        : t));
    } catch (e: unknown) {
      setHistory(prev => prev.map((t, i) => i === turnIdx
        ? { ...t, loading: false, error: e instanceof Error ? e.message : "Network error." }
        : t));
    } finally {
      setBusy(false);
      // Refocus the input so follow-ups feel snappy.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.22em] text-brand-amber">Ask Aqua</h3>
        <span className="text-[9px] uppercase tracking-[0.18em] text-brand-cream/40">AI · grounded in these docs</span>
      </div>

      {keyMissing ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] text-amber-200/85 leading-relaxed">
          <strong className="text-amber-200">Not connected.</strong>{" "}
          Ask-Aqua needs an Anthropic API key. Paste one under{" "}
          <Link href="/admin/portal-settings" className="underline">Portal settings → Integrations</Link>{" "}
          and reload.
        </div>
      ) : (
        <form onSubmit={ask} className="space-y-2">
          <textarea
            ref={inputRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              // Cmd/Ctrl + Enter submits — feels like chat clients.
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void ask(e as unknown as React.FormEvent);
              }
            }}
            placeholder='Try: "How do I add a custom domain?"'
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-amber/50 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-brand-cream/35">⌘+↵ to send</span>
            <button
              type="submit"
              disabled={!question.trim() || busy}
              className="text-[11px] uppercase tracking-[0.2em] text-brand-black bg-brand-amber hover:bg-brand-amber/90 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Thinking…" : "Ask"}
            </button>
          </div>
        </form>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((turn, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-[11px] text-brand-cream/55 italic">{turn.question}</div>
              {turn.loading ? (
                <div className="text-[12px] text-brand-cream/55">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-amber animate-pulse" />
                    Thinking…
                  </span>
                </div>
              ) : turn.error ? (
                <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-2 text-[11px] text-red-200/85">
                  {turn.error}
                </div>
              ) : (
                <div className="text-[12px] text-brand-cream/85 leading-relaxed whitespace-pre-wrap">
                  {turn.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {history.length === 0 && !keyMissing && (
        <p className="text-[10px] text-brand-cream/40 leading-relaxed">
          Ask anything you&rsquo;d normally Google about the admin. Aqua reads the help docs and answers grounded in them — no guessing.
        </p>
      )}
    </section>
  );
}
