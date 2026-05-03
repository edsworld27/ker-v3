// Catch-all route for visual-editor pages. Any URL under /p/<anything>
// is delegated to the host-side <PortalPageRenderer> which fetches the
// matching block tree from /api/portal/pages/[siteId]/by-slug and
// renders it. Without this the published pages would have no public
// surface — they'd live in cloud state but no route would consume them.
//
// Host sites that want their pages to live at root paths instead of
// under /p/ should add their own routes that mount PortalPageRenderer
// directly with the right slug; this catch-all is a sensible default.

import PortalPageRenderer from "@/components/PortalPageRenderer";

export const dynamic = "force-dynamic";

export default async function PortalPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + (slug ?? []).join("/");
  return (
    <PortalPageRenderer
      slug={path}
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <p className="text-[10px] tracking-[0.28em] uppercase text-brand-orange mb-2">404</p>
            <h1 className="font-display text-3xl text-brand-cream mb-2">Page not found</h1>
            <p className="text-[12px] text-brand-cream/55">No portal-managed page matches <code className="font-mono text-brand-cream/85">{path}</code>. Build one in the visual editor.</p>
          </div>
        </div>
      }
      loading={null}
    />
  );
}
