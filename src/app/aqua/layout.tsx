"use client";

// Aqua portal — agency landing route. The agency owner lands here, sees
// every client portal as a card, picks one to drop into that tenant's
// admin panel, or creates a new portal. Lives outside /admin so it has
// its own minimal chrome (no sidebar, no per-org switcher) — the whole
// point is that it's an org chooser.

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConfirmHost from "@/components/admin/ConfirmHost";

export default function AquaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-body antialiased">
      <header className="px-6 py-4 border-b border-white/8 flex items-center gap-4">
        <Link href="/aqua" className="flex items-center gap-2 group">
          <span
            className="w-8 h-8 rounded-xl"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #6366f1 100%)" }}
            aria-hidden="true"
          />
          <span className="font-display text-xl font-bold text-brand-cream group-hover:text-brand-orange transition-colors">
            Aqua portal
          </span>
        </Link>
        <span className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/45 hidden sm:inline">Agency dashboard</span>
        <span className="ml-auto" />
        <Link
          href="/aqua/support"
          className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${pathname.startsWith("/aqua/support") ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" : "border-white/15 text-brand-cream/65 hover:text-brand-cream hover:bg-white/5"}`}
        >
          Support
        </Link>
        <Link
          href="/aqua/example"
          className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${pathname.startsWith("/aqua/example") ? "border-brand-amber/50 bg-brand-amber/10 text-brand-amber" : "border-white/15 text-brand-cream/65 hover:text-brand-cream hover:bg-white/5"}`}
        >
          Example portal
        </Link>
        <Link
          href="/aqua/new"
          className="text-[12px] px-3 py-1.5 rounded-lg bg-brand-orange text-white font-semibold hover:opacity-90"
        >
          + New portal
        </Link>
        <Link href="/admin" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">
          Skip to admin →
        </Link>
      </header>
      {children}
      <ConfirmHost />
    </div>
  );
}
