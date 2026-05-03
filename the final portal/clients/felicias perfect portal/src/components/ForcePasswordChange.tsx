"use client";

import { useEffect, useState } from "react";
import { needsPasswordChange, changePassword, getSession, AUTH_EVENT, isImpersonating } from "@/lib/auth";

export default function ForcePasswordChange() {
  const [show, setShow] = useState(false);
  const [pw, setPw]     = useState("");
  const [pw2, setPw2]   = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);

  useEffect(() => {
    function check() {
      // Never show during impersonation — admin shouldn't be forced to change
      // the impersonated user's password
      if (isImpersonating()) { setShow(false); return; }
      setShow(needsPasswordChange());
    }
    check();
    window.addEventListener(AUTH_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(AUTH_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, []);

  if (!show) return null;

  const session  = getSession();
  const userName = session?.user.name ?? "there";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw !== pw2) { setError("Passwords don't match."); return; }
    if (pw.length < 8) { setError("Must be at least 8 characters."); return; }
    setBusy(true);
    const result = await changePassword(pw);
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    setDone(true);
    // Brief success flash, then hide
    setTimeout(() => setShow(false), 1200);
  }

  return (
    /* Fullscreen backdrop — can't be clicked away */
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-brand-black/90 backdrop-blur-md p-4"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md bg-brand-black-soft border border-brand-orange/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header stripe */}
        <div className="bg-brand-orange/10 border-b border-brand-orange/20 px-6 py-5">
          <p className="text-xs tracking-[0.25em] uppercase text-brand-orange mb-1">Action required</p>
          <h2 className="font-display text-2xl text-brand-cream">
            Welcome, {userName}!
          </h2>
          <p className="text-sm text-brand-cream/60 mt-1">
            Your account was set up by an admin. Please choose your own password before continuing.
          </p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {done ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3 text-2xl">
                ✓
              </div>
              <p className="text-brand-cream font-medium">Password updated!</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-brand-cream/50 mb-1.5">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-cream/50 mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="Same password again"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-orange/50"
                />
              </div>

              {/* Strength hints */}
              {pw.length > 0 && (
                <div className="flex gap-1">
                  {[8, 10, 14].map((len) => (
                    <div
                      key={len}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        pw.length >= len
                          ? pw.length >= 14 ? "bg-green-500" : pw.length >= 10 ? "bg-brand-amber" : "bg-brand-orange"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-brand-cream/35 ml-1">
                    {pw.length < 10 ? "Weak" : pw.length < 14 ? "Good" : "Strong"}
                  </span>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-brand-orange text-white font-semibold text-sm hover:bg-brand-orange-dark transition-colors disabled:opacity-60"
              >
                {busy ? "Saving…" : "Set my password"}
              </button>

              <p className="text-[11px] text-brand-cream/25 text-center">
                This screen won&apos;t appear again once your password is set.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
