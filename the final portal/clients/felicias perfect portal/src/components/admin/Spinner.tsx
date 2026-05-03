"use client";

// Shared loading affordances for admin pages. Two flavours:
//
//   <Spinner />           — small inline spinner (e.g. inside a button)
//   <PageSpinner label /> — full-page centred spinner with a hint label
//
// Pages that previously rendered <main>Loading…</main> should use
// <PageSpinner /> so loading feels intentional + matches the rest of
// the chrome.

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "sm" }: SpinnerProps) {
  const px = size === "sm" ? 14 : size === "md" ? 18 : 24;
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block align-middle border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"
      style={{ width: px, height: px }}
    />
  );
}

interface PageSpinnerProps {
  label?: string;
  /** Render inside <main>; turn off for already-wrapped contexts. */
  wrap?: boolean;
}

export default function PageSpinner({ label = "Loading…", wrap = true }: PageSpinnerProps) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-cream/55" role="status">
      <Spinner size="lg" />
      <p className="text-[12px]">{label}</p>
    </div>
  );
  if (!wrap) return inner;
  return <main className="max-w-3xl mx-auto px-6">{inner}</main>;
}
