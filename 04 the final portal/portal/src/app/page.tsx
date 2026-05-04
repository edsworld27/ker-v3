// Public landing — placeholder marketing surface. The real Milesy Media
// site lives in `04 the final portal/milesymedia website/` and is served
// from a separate Vercel project; this page exists so a fresh
// `npm run dev` shows something coherent at `/` and the rest of the
// portal reachable via the "Sign in" link.

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 inline-flex rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs uppercase tracking-wide text-black/60">
        Aqua portal
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-black/90 md:text-6xl">
        A portal to anywhere.
      </h1>
      <p className="mt-4 max-w-xl text-base text-black/60 md:text-lg">
        Agency, client, and end-customer portals — same engine, branded for each tenant.
        Powered by manifest plugins.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          href="/embed/login"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/5"
        >
          Embed preview
        </Link>
      </div>
      <p className="mt-12 max-w-md text-xs text-black/40">
        Built by Milesy Media. Ship a polished branded portal per client in minutes.
      </p>
    </main>
  );
}
