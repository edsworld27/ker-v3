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

import { useEffect, useState } from "react";
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
