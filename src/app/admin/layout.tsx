"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_EVENT, getSession, isAdmin, type Session } from "@/lib/auth";
import { pendingOrdersCount } from "@/lib/admin/stats";
import { lowStockCount } from "@/lib/admin/inventory";
import { pendingDraftCount, onContentChange } from "@/lib/admin/content";
import { openTicketCount, onTicketsChange } from "@/lib/admin/tickets";

const NAV = [
  { href: "/admin",              label: "Overview",    match: (p: string) => p === "/admin" },
  { href: "/admin/orders",       label: "Orders",      match: (p: string) => p.startsWith("/admin/orders") },
  { href: "/admin/products",     label: "Products",    match: (p: string) => p.startsWith("/admin/products") },
  { href: "/admin/collections",  label: "Collections", match: (p: string) => p.startsWith("/admin/collections") },
  { href: "/admin/inventory",    label: "Inventory",   match: (p: string) => p.startsWith("/admin/inventory") },
  { href: "/admin/reviews",      label: "Reviews",     match: (p: string) => p.startsWith("/admin/reviews") },
  { href: "/admin/customers",    label: "Customers",   match: (p: string) => p.startsWith("/admin/customers") },
  { href: "/admin/support",      label: "Support",     match: (p: string) => p.startsWith("/admin/support") },
  { href: "/admin/blog",         label: "Blog",        match: (p: string) => p.startsWith("/admin/blog") },
  { href: "/admin/faq",          label: "FAQ",         match: (p: string) => p.startsWith("/admin/faq") },
  { href: "/admin/pages",        label: "Pages",       match: (p: string) => p.startsWith("/admin/pages") },
  { href: "/admin/website",      label: "Website",     match: (p: string) => p.startsWith("/admin/website") },
  { href: "/admin/shipping",     label: "Shipping",    match: (p: string) => p.startsWith("/admin/shipping") },
  { href: "/admin/settings",     label: "Settings",    match: (p: string) => p.startsWith("/admin/settings") },
];

const MOBILE_NAV = NAV.filter(n => ["/admin", "/admin/orders", "/admin/blog", "/admin/support", "/admin/website"].includes(n.href));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState(0);
  const [low, setLow] = useState(0);
  const [drafts, setDrafts] = useState(0);
  const [tickets, setTickets] = useState(0);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
    const refresh = () => {
      setSession(getSession());
      setPending(pendingOrdersCount());
      setLow(lowStockCount());
      setDrafts(pendingDraftCount());
      setTickets(openTicketCount());
    };
    refresh();
    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const off1 = onContentChange(refresh);
    const off2 = onTicketsChange(refresh);
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      off1(); off2();
    };
  }, [pathname]);

  if (!hydrated) {
    return <div className="min-h-screen bg-brand-black" />;
  }

  // DEV BYPASS — remove before launch
  const devBypass = true;

  if (!devBypass && !session) {
    if (typeof window !== "undefined") router.replace("/account");
    return null;
  }

  if (!devBypass && session && !isAdmin(session)) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">403 — Not authorised</p>
          <h1 className="font-display text-3xl text-brand-cream mb-3">Admin only</h1>
          <p className="text-sm text-brand-cream/60 mb-6">
            This area is for the Luv &amp; Ker team. Signed in as <span className="text-brand-cream">{session.user.email}</span>.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  function badgeFor(href: string): { count: number; tone: "orange" | "amber" } | null {
    if (href === "/admin/orders" && pending > 0) return { count: pending, tone: "amber" };
    if (href === "/admin/inventory" && low > 0) return { count: low, tone: "orange" };
    if (href === "/admin/website" && drafts > 0) return { count: drafts, tone: "amber" };
    if (href === "/admin/support" && tickets > 0) return { count: tickets, tone: "orange" };
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col bg-brand-black-soft border-r border-white/5">
        <Link href="/" className="px-6 py-6 border-b border-white/5 block">
          <span className="font-display text-base font-bold text-brand-cream">
            LUV <span className="text-brand-orange">&amp;</span> KER
          </span>
          <span className="block text-[10px] tracking-[0.25em] uppercase text-brand-amber mt-0.5">Admin</span>
        </Link>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = item.match(pathname ?? "");
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-brand-orange/15 text-brand-cream border border-brand-orange/30"
                    : "text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream border border-transparent"
                }`}
              >
                <span>{item.label}</span>
                {badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    badge.tone === "orange" ? "bg-brand-orange/30 text-brand-orange" : "bg-brand-amber/25 text-brand-amber"
                  }`}>
                    {badge.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-1.5">
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-brand-orange/25 text-[11px] text-brand-orange/80 hover:text-brand-orange hover:border-brand-orange/50 transition-colors"
          >
            + Add product
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-brand-amber/25 text-[11px] text-brand-amber/80 hover:text-brand-amber hover:border-brand-amber/50 transition-colors"
          >
            + Write a post
          </Link>
        </div>

        <div className="p-4 border-t border-white/5 text-[11px] text-brand-cream/40">
          <p className="truncate">{session?.user.email ?? "dev mode"}</p>
          <Link href="/" className="hover:text-brand-cream transition-colors">View site →</Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-brand-black-soft border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-display text-sm font-bold">
          LUV <span className="text-brand-orange">&amp;</span> KER · Admin
        </Link>
        <Link href="/" className="text-xs text-brand-cream/60">Site →</Link>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-brand-black-soft border-t border-white/5 grid grid-cols-5">
        {MOBILE_NAV.map(item => {
          const active = item.match(pathname ?? "");
          const badge = badgeFor(item.href);
          return (
            <Link key={item.href} href={item.href} className={`relative text-center py-2.5 text-[11px] ${active ? "text-brand-orange" : "text-brand-cream/55"}`}>
              {item.label}
              {badge && <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-brand-orange" />}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
