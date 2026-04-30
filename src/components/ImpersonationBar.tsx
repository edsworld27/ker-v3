"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isImpersonating, getImpersonationState, stopImpersonation,
  AUTH_EVENT, type ImpersonationState,
} from "@/lib/auth";

export default function ImpersonationBar() {
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState | null>(null);

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

  if (!state) return null;

  function handleStop() {
    stopImpersonation();
    router.push("/admin/team");
  }

  const target = state.targetUser;
  const admin  = state.adminSession.user;

  return (
    <div className="fixed top-0 inset-x-0 z-[200] bg-brand-amber text-brand-black flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium shadow-lg">
      <div className="flex items-center gap-2 min-w-0">
        {/* Warning icon */}
        <span className="shrink-0 w-5 h-5 rounded-full bg-brand-black/15 flex items-center justify-center text-[11px] font-bold">!</span>

        <span className="truncate">
          Impersonating{" "}
          <strong>{target.name}</strong>
          <span className="opacity-70 hidden sm:inline"> ({target.email})</span>
          <span className="opacity-60 hidden md:inline">
            {" "}· role: <em>{target.role}</em>
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
        <button
          onClick={handleStop}
          className="text-xs px-3 py-1.5 rounded-lg bg-brand-black text-brand-amber font-semibold hover:bg-brand-black/80 transition-colors"
        >
          ← Back to {admin.name || "your account"}
        </button>
      </div>
    </div>
  );
}
