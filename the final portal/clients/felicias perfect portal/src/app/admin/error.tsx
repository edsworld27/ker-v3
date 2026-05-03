"use client";

// Admin-scoped error boundary. Keeps the admin chrome while showing a
// recovery path so the operator can retry without losing their place.

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[admin/error.tsx]", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-[10px] tracking-[0.32em] uppercase text-red-300/85">Admin error</p>
        <h1 className="font-display text-2xl sm:text-3xl text-brand-cream">This page hit an error.</h1>
        <p className="text-[13px] text-brand-cream/65 leading-relaxed">
          The data probably loaded fine but something in the rendering threw. Retry usually works; if not, jump to a different panel and come back.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-brand-cream/35 select-all">ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-md text-[12px] font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-md text-[12px] text-brand-cream/65 hover:text-brand-cream"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
