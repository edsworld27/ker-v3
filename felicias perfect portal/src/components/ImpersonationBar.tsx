"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isImpersonating, getImpersonationState, stopImpersonation,
  AUTH_EVENT, type ImpersonationState,
} from "@/lib/auth";
import {
  loadCompliance, isImpersonationAllowedSync, getComplianceModeSync, onComplianceChange,
} from "@/lib/admin/portalCompliance";

export default function ImpersonationBar() {
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [allowed, setAllowed] = useState(true);
  const [mode, setMode] = useState<string>("none");

  useEffect(() => {
    function refresh() {
      const active = isImpersonating() ? getImpersonationState() : null;
      setState(active);
      // Push the fixed navbar down so it doesn't overlap the bar
      document.documentElement.style.setProperty(
        "--impersonation-bar-h",
        active ? "2.5rem" : "0px"
      );
    }
    refresh();
    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Compliance probe — if the active mode forbids impersonation, the
  // bar auto-stops the session. This handles the case where an admin
  // is mid-impersonation when compliance is flipped to HIPAA/SOC 2.
  useEffect(() => {
    void loadCompliance().then(() => {
      setAllowed(isImpersonationAllowedSync());
      setMode(getComplianceModeSync());
    });
    const off = onComplianceChange(() => {
      setAllowed(isImpersonationAllowedSync());
      setMode(getComplianceModeSync());
    });
    return off;
  }, []);

  // Auto-stop when the mode flips to a non-permissive one while
  // someone is impersonating.
  useEffect(() => {
    if (state && !allowed) {
      stopImpersonation();
      router.replace("/admin/team");
    }
  }, [state, allowed, router]);

  if (!state) return null;

  function handleStop() {
    stopImpersonation();
    router.push("/admin/team");
  }

  const target = state.targetUser;
  const admin  = state.adminSession.user;

  return (
    <div className={`fixed top-0 inset-x-0 z-[200] flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium shadow-lg ${
      allowed ? "bg-brand-amber text-brand-black" : "bg-red-500 text-white"
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
          allowed ? "bg-brand-black/15" : "bg-white/20"
        }`}>!</span>

        <span className="truncate">
          {allowed ? "Impersonating" : `Stopping impersonation — compliance mode "${mode}"`}{" "}
          <strong>{target.name}</strong>
          <span className="opacity-70 hidden sm:inline"> ({target.email})</span>
          {allowed && (
            <span className="opacity-60 hidden md:inline">
              {" "}· role: <em>{target.role}</em>
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {allowed && (
          <>
            <a
              href="/"
              className="text-xs px-2.5 py-1 rounded-lg bg-brand-black/10 hover:bg-brand-black/20 transition-colors"
            >
              Storefront ↗
            </a>
            <a
              href="/admin"
              className="text-xs px-2.5 py-1 rounded-lg bg-brand-black/10 hover:bg-brand-black/20 transition-colors"
            >
              Admin ↗
            </a>
          </>
        )}
        <button
          onClick={handleStop}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            allowed
              ? "bg-brand-black text-brand-amber hover:bg-brand-black/80"
              : "bg-white text-red-500 hover:bg-white/90"
          }`}
        >
          ← Back to {admin.name || "your account"}
        </button>
      </div>
    </div>
  );
}
