"use client";

// /admin/portals/preview/[id] — render a portal variant exactly as a
// customer would see it, but without activating it. Lets the operator
// flip between candidate variants quickly to pick which one to ship.
// Reachable from each variant row's "Preview ↗" link in /admin/portals.
//
// Differs from "View live ↗" (which links to the public route and only
// works for the currently-active variant): preview works for ANY variant
// the operator has saved, including drafts that aren't live.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockRenderer from "@/components/editor/BlockRenderer";
import { getActiveSite } from "@/lib/admin/sites";
import { getPage } from "@/lib/admin/editorPages";
import type { EditorPage } from "@/portal/server/types";

export default function PortalVariantPreviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [variant, setVariant] = useState<EditorPage | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      const site = getActiveSite();
      if (!site) { if (!cancelled) setVariant(null); return; }
      const page = await getPage(site.id, id);
      if (!cancelled) setVariant(page);
    }
    void load();
    return () => { cancelled = true; };
  }, [id]);

  // Banner shown above the rendered variant so the operator never
  // mistakes preview for the live page. Sticks to the top with a
  // close-this-tab affordance.
  const banner = (
    <div className="sticky top-0 z-50 px-4 py-2 bg-cyan-500/15 border-b border-cyan-400/30 text-cyan-100 text-[12px] flex items-center justify-between gap-3">
      <span>
        Previewing variant <strong>{variant?.title ?? id}</strong>
        {variant?.portalRole && <> · {variant.portalRole} portal</>}
        {variant?.isActivePortal && <> · <span className="text-emerald-300">live</span></>}
      </span>
      <span className="flex items-center gap-3">
        <Link
          href={`/admin/editor?page=${id}`}
          className="text-[11px] px-2 py-1 rounded-md border border-brand-orange/40 bg-brand-orange/10 text-brand-orange/90 hover:bg-brand-orange/20"
        >
          Edit
        </Link>
        <Link
          href={variant?.portalRole ? `/admin/portals?role=${variant.portalRole}` : "/admin/portals"}
          className="text-[11px] text-cyan-200/80 hover:text-cyan-100"
        >
          ← Back to portals
        </Link>
      </span>
    </div>
  );

  if (variant === undefined) {
    return (
      <>
        {banner}
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
          <p className="max-w-3xl mx-auto px-6 text-brand-cream/45">Loading variant…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!variant) {
    return (
      <>
        {banner}
        <Navbar />
        <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
          <div className="max-w-3xl mx-auto px-6 space-y-4 text-center">
            <p className="text-brand-cream/85 text-sm">Variant not found.</p>
            <Link
              href="/admin/portals"
              className="inline-block text-xs px-3 py-2 rounded-lg border border-white/15 text-brand-cream/70 hover:text-brand-cream hover:border-white/30"
            >
              Back to portals
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const renderableBlocks = variant.publishedBlocks ?? variant.blocks ?? [];
  const isEmpty = renderableBlocks.length === 0;

  return (
    <>
      {banner}
      <Navbar />
      <main className="w-full pt-32 pb-20 min-h-screen bg-brand-black">
        {isEmpty ? (
          <div className="max-w-3xl mx-auto px-6 space-y-3 text-center">
            <p className="text-brand-cream/85 text-sm">This variant has no blocks yet.</p>
            <p className="text-brand-cream/55 text-xs">
              Open it in the editor and drop in some blocks to preview.
            </p>
            <Link
              href={`/admin/editor?page=${id}`}
              className="inline-block text-xs px-3 py-2 rounded-lg border border-brand-orange/40 bg-brand-orange/10 text-brand-orange/90 hover:bg-brand-orange/20"
            >
              Open in editor →
            </Link>
          </div>
        ) : (
          <BlockRenderer blocks={renderableBlocks} themeId={variant.themeId} />
        )}
      </main>
      <Footer />
    </>
  );
}
