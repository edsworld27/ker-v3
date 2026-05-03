"use client";

// Empty-state shown when an admin page can't function until something
// upstream is configured. Use it instead of letting the page render in a
// broken / error-spamming state.
//
// Usage:
//   <SetupRequired
//     title="GitHub not connected"
//     message="Add your repo URL + Personal Access Token before browsing files."
//     steps={["Open Portal settings", "Paste your repo URL", "Generate + paste a PAT"]}
//     cta={{ label: "Open Portal settings", href: "/admin/portal-settings" }}
//   />

import Link from "next/link";

export interface SetupRequiredProps {
  title: string;
  message?: string;
  steps?: string[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  // Visual variant — "warning" is amber, "info" is cyan (default).
  tone?: "info" | "warning";
}

export default function SetupRequired({
  title, message, steps, cta, secondaryCta, tone = "info",
}: SetupRequiredProps) {
  const accent = tone === "warning"
    ? { ring: "border-amber-400/20",   bg: "bg-amber-500/5",   chip: "bg-amber-500/15 border-amber-400/30 text-amber-200", kicker: "text-amber-300" }
    : { ring: "border-cyan-400/20",    bg: "bg-cyan-500/5",    chip: "bg-cyan-500/15 border-cyan-400/30 text-cyan-200",    kicker: "text-cyan-300" };

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <div className={`rounded-2xl border ${accent.ring} ${accent.bg} p-6 sm:p-8 space-y-5`}>
        <div className="flex items-start gap-3">
          <span className={`w-9 h-9 rounded-full ${accent.chip} border flex items-center justify-center text-base shrink-0`}>
            {tone === "warning" ? "!" : "i"}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] tracking-[0.32em] uppercase ${accent.kicker} mb-1`}>Setup required</p>
            <h1 className="font-display text-xl sm:text-2xl text-brand-cream">{title}</h1>
            {message && (
              <p className="text-[13px] text-brand-cream/65 mt-2 leading-relaxed">{message}</p>
            )}
          </div>
        </div>

        {steps && steps.length > 0 && (
          <ol className="space-y-1.5 pl-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-brand-cream/85">
                <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-brand-cream/65 flex items-center justify-center text-[10px] tabular-nums shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {(cta || secondaryCta) && (
          <div className="flex items-center gap-2 pt-1">
            {cta && (
              <Link
                href={cta.href}
                className={`px-4 py-2 rounded-md text-[12px] font-medium border ${
                  tone === "warning"
                    ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border-amber-400/30"
                    : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/20"
                }`}
              >
                {cta.label} →
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="px-3 py-2 rounded-md text-[12px] text-brand-cream/65 hover:text-brand-cream"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
