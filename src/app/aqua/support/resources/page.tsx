"use client";

import Link from "next/link";

const RESOURCES: Array<{ category: string; items: Array<{ title: string; body: string; href: string; icon: string }> }> = [
  {
    category: "Getting started",
    items: [
      { title: "Setup checklist", body: "Step-by-step from AI Convert to live deployment.", href: "/aqua", icon: "✓" },
      { title: "Try the example portal", body: "Pre-seeded org with 4 pages — open the editor and play.", href: "/aqua/example", icon: "★" },
      { title: "Onboard a new client portal", body: "Preset picker, identity, branding.", href: "/aqua/new", icon: "＋" },
    ],
  },
  {
    category: "The visual editor",
    items: [
      { title: "Three-mode editor", body: "Text mode for simple edits, Visual for drag-drop, Code for JSON + custom HTML.", href: "/admin/sites", icon: "✎" },
      { title: "Page templates", body: "13 starter templates: homepage, shop, cart, landing, pricing, FAQ, services, blog…", href: "/admin/sites", icon: "▢" },
      { title: "Themes", body: "Per-site palettes (Default + Light + Dark seeded). Pages can pick which theme to use.", href: "/admin/themes", icon: "🎨" },
      { title: "Asset library", body: "Drag-drop image uploads, alt text, copy-as-data-URL.", href: "/admin/assets", icon: "🖼" },
    ],
  },
  {
    category: "SEO + accessibility",
    items: [
      { title: "Per-page SEO", body: "Title, description, og:image, canonical, JSON-LD, sitemap priority — all editable.", href: "/admin/seo", icon: "🔍" },
      { title: "Broken-link scanner", body: "Walks every block, pings external URLs, flags 404s.", href: "/admin/seo", icon: "🔗" },
      { title: "Block accessibility", body: "aria-label, role, html-id on every block via the A11y tab.", href: "/admin/sites", icon: "♿" },
    ],
  },
  {
    category: "Commerce",
    items: [
      { title: "Variants + colour wheel", body: "Per-product options with custom-colour pricing.", href: "/admin/products", icon: "🎨" },
      { title: "Variant picker block", body: "Drop into any visual-editor page; pulls live catalog data.", href: "/admin/sites", icon: "🛍" },
    ],
  },
  {
    category: "Repository + deployment",
    items: [
      { title: "GitHub connection", body: "Repo URL + PAT, then Push to GitHub from any editor page.", href: "/admin/portal-settings", icon: "⌥" },
      { title: "Repository browser", body: "Browse + edit any file in your connected repo. Each save is a real commit.", href: "/admin/repo", icon: "📁" },
      { title: "Inject portal tag", body: "Auto-PR adding /portal/tag.js to your <head>.", href: "/admin/portal-settings", icon: "↗" },
    ],
  },
  {
    category: "Support",
    items: [
      { title: "Feature requests", body: "Vote, comment, track from open to shipped.", href: "/aqua/support/feature-requests", icon: "💡" },
      { title: "Book a meeting", body: "Suggest 2–3 times — we confirm + send the call link.", href: "/aqua/support/book-meeting", icon: "📅" },
      { title: "Plan + invoices", body: "Switch plans, see every invoice with PDFs.", href: "/aqua/support/billing", icon: "💳" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <header>
        <Link href="/aqua/support" className="text-[12px] text-brand-cream/55 hover:text-brand-cream">← Aqua support</Link>
        <h1 className="font-display text-3xl text-brand-cream mt-2">Resources + guides</h1>
        <p className="text-[12px] text-brand-cream/55 mt-1">Quick links to every part of the portal.</p>
      </header>

      {RESOURCES.map(group => (
        <section key={group.category}>
          <p className="text-[11px] tracking-[0.18em] uppercase text-brand-cream/45 mb-2">{group.category}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {group.items.map(item => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 flex items-start gap-3 transition-colors group"
              >
                <span className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-base shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-cream group-hover:text-brand-orange transition-colors">{item.title}</p>
                  <p className="text-[11px] text-brand-cream/55 leading-relaxed mt-0.5">{item.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 p-5">
        <p className="text-[10px] tracking-[0.32em] uppercase text-cyan-400 mb-1">Need more?</p>
        <p className="font-display text-xl text-brand-cream mb-2">Talk to the team</p>
        <p className="text-[12px] text-brand-cream/55 max-w-xl mb-3 leading-relaxed">
          Stuck on something? File a feature request or book a 30-minute call — whichever's faster.
        </p>
        <div className="flex gap-2">
          <Link href="/aqua/support/feature-requests" className="px-3 py-2 rounded-lg bg-cyan-500 text-white text-[12px] font-semibold hover:opacity-90">+ New request</Link>
          <Link href="/aqua/support/book-meeting" className="px-3 py-2 rounded-lg border border-white/15 text-brand-cream/85 hover:bg-white/5 text-[12px] font-semibold">Book a meeting</Link>
        </div>
      </section>
    </main>
  );
}
