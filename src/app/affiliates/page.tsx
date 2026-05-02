"use client";

// /affiliates — customer-facing affiliates portal.
// Resolves the active "affiliates" portal variant for the current site
// and renders its block tree. Falls back to a default landing if no
// variant is configured. Designed in /admin/portals → Affiliates.

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockRenderer from "@/components/editor/BlockRenderer";
import type { EditorPage } from "@/portal/server/types";
import { getActiveSite } from "@/lib/admin/sites";
import { listPortalVariants } from "@/lib/admin/editorPages";

export default function AffiliatesPortalPage() {
  const [variant, setVariant] = useState<EditorPage | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const site = getActiveSite();
      if (!site) { if (!cancelled) setVariant(null); return; }
      const variants = await listPortalVariants(site.id, "affiliates");
      if (cancelled) return;
      setVariant(variants.find(v => v.isActivePortal) ?? null);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Navbar />
      <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
        {variant === undefined ? (
          <div className="max-w-3xl mx-auto px-6 text-brand-cream/45">Loading…</div>
        ) : variant ? (
          <BlockRenderer blocks={variant.publishedBlocks ?? variant.blocks} themeId={variant.themeId} />
        ) : (
          <DefaultAffiliatesLanding />
        )}
      </main>
      <Footer />
    </>
  );
}

function DefaultAffiliatesLanding() {
  return (
    <div className="max-w-3xl mx-auto px-6 space-y-6 text-center">
      <p className="text-[11px] tracking-[0.32em] uppercase text-brand-orange">Partners</p>
      <h1 className="font-display text-4xl sm:text-5xl text-brand-cream">Affiliate program</h1>
      <p className="text-brand-cream/65 text-sm sm:text-base leading-relaxed max-w-prose mx-auto">
        Welcome to the affiliate portal. Sign in to see your referral link, track conversions, and request payouts.
      </p>
      <div className="flex justify-center gap-3 pt-4">
        <Link
          href="/account"
          className="text-sm px-5 py-3 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold"
        >
          Sign in
        </Link>
        <Link
          href="/account?mode=signup"
          className="text-sm px-5 py-3 rounded-lg border border-white/15 text-brand-cream/85 hover:text-brand-cream hover:border-white/30"
        >
          Become an affiliate
        </Link>
      </div>
      <p className="text-[11px] text-brand-cream/40 pt-4">
        Operators can design this page with the visual editor — open <code className="font-mono text-brand-cream/65">/admin/portals</code> → Affiliates.
      </p>
    </div>
  );
}
