// Admin-scoped 404. Keeps the admin sidebar chrome — wraps inside the
// admin layout so users land here when they mistype a sub-route, with
// clear recovery options instead of the storefront 404 page.

import Link from "next/link";

export const metadata = {
  title: "Not found — Admin",
};

export default function AdminNotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-[10px] tracking-[0.32em] uppercase text-brand-amber">404</p>
        <h1 className="font-display text-2xl sm:text-3xl text-brand-cream">Admin page not found.</h1>
        <p className="text-[13px] text-brand-cream/65 leading-relaxed">
          The route you tried doesn&apos;t exist. It may have been moved, or the plugin that owns it isn&apos;t installed for this org.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-md text-[12px] font-medium bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange border border-brand-orange/30"
          >
            Back to dashboard
          </Link>
          <Link
            href="/admin/marketplace"
            className="px-4 py-2 rounded-md text-[12px] text-brand-cream/65 hover:text-brand-cream"
          >
            Browse plugins
          </Link>
          <Link
            href="/aqua"
            className="px-4 py-2 rounded-md text-[12px] text-brand-cream/65 hover:text-brand-cream"
          >
            Aqua portal
          </Link>
        </div>
      </div>
    </main>
  );
}
