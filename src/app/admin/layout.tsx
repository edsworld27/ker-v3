"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_EVENT, getSession, isAdmin, type Session } from "@/lib/auth";
import { pendingOrdersCount } from "@/lib/admin/stats";
import { lowStockCount } from "@/lib/admin/inventory";
import { pendingDraftCount, onContentChange } from "@/lib/admin/content";
import { openTicketCount, onTicketsChange } from "@/lib/admin/tickets";
import { unpaidCommissionsTotal, onAffiliatesChange } from "@/lib/admin/marketing";
import { listABTests } from "@/lib/admin/abtests";
import { listFunnels } from "@/lib/admin/funnels";
import { getTeamMemberByEmail, getPermissionsForEmail, type Resource, type Action } from "@/lib/admin/team";

interface NavItem { href: string; label: string; match: (p: string) => boolean; resource?: Resource }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Sell",
    items: [
      { href: "/admin",              label: "Overview",     match: (p) => p === "/admin",                      resource: "overview" },
      { href: "/admin/orders",       label: "Orders",       match: (p) => p.startsWith("/admin/orders"),       resource: "orders" },
      { href: "/admin/customers",    label: "Customers",    match: (p) => p.startsWith("/admin/customers"),    resource: "customers" },
      { href: "/admin/marketing",    label: "Marketing",    match: (p) => p.startsWith("/admin/marketing"),    resource: "marketing" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products",     label: "Products",     match: (p) => p.startsWith("/admin/products"),     resource: "products" },
      { href: "/admin/collections",  label: "Collections",  match: (p) => p.startsWith("/admin/collections"),  resource: "collections" },
      { href: "/admin/inventory",    label: "Inventory",    match: (p) => p.startsWith("/admin/inventory"),    resource: "inventory" },
      { href: "/admin/reviews",      label: "Reviews",      match: (p) => p.startsWith("/admin/reviews"),      resource: "reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog",         label: "Blog",         match: (p) => p.startsWith("/admin/blog"),         resource: "blog" },
      { href: "/admin/faq",          label: "FAQ",          match: (p) => p.startsWith("/admin/faq"),          resource: "faq" },
      { href: "/admin/pages",        label: "Pages",        match: (p) => p.startsWith("/admin/pages"),        resource: "pages" },
      { href: "/admin/website",      label: "Website",      match: (p) => p.startsWith("/admin/website"),      resource: "website" },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/admin/theme",        label: "Theme",        match: (p) => p.startsWith("/admin/theme"),        resource: "theme" },
      { href: "/admin/sections",     label: "Sections",     match: (p) => p.startsWith("/admin/sections"),     resource: "sections" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/split-test",   label: "Split test",   match: (p) => p.startsWith("/admin/split-test"),   resource: "split_test" },
      { href: "/admin/funnels",      label: "Funnels",      match: (p) => p.startsWith("/admin/funnels"),      resource: "funnels" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/team",         label: "Team",         match: (p) => p.startsWith("/admin/team"),         resource: "team" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/support",      label: "Support",      match: (p) => p.startsWith("/admin/support"),      resource: "support" },
      { href: "/admin/shipping",     label: "Shipping",     match: (p) => p.startsWith("/admin/shipping"),     resource: "shipping" },
      { href: "/admin/settings",     label: "Settings",     match: (p) => p.startsWith("/admin/settings"),     resource: "settings" },
    ],
  },
];

const NAV: NavItem[] = NAV_GROUPS.flatMap(g => g.items);
const MOBILE_NAV = NAV.filter(n => ["/admin", "/admin/orders", "/admin/marketing", "/admin/support", "/admin/website"].includes(n.href));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState(0);
  const [low, setLow] = useState(0);
  const [drafts, setDrafts] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [owed, setOwed] = useState(0);
  const [activeTests, setActiveTests] = useState(0);
  const [activeFunnels, setActiveFunnels] = useState(0);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
    const refresh = () => {
      setSession(getSession());
      setPending(pendingOrdersCount());
      setLow(lowStockCount());
      setDrafts(pendingDraftCount());
      setTickets(openTicketCount());
      setOwed(unpaidCommissionsTotal());
      setActiveTests(listABTests().filter((t) => t.status === "running").length);
      setActiveFunnels(listFunnels().filter((f) => f.status === "active").length);
    };
    refresh();
    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const off1 = onContentChange(refresh);
    const off2 = onTicketsChange(refresh);
    const off3 = onAffiliatesChange(refresh);
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      off1(); off2(); off3();
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

  const isSuperAdmin = devBypass || (session ? isAdmin(session) : false);
  const userEmail = session?.user?.email;

  // Resolve what resources this user can view
  function canView(resource: Resource): boolean {
    if (isSuperAdmin) return true;
    if (!userEmail) return false;
    const member = getTeamMemberByEmail(userEmail);
    if (!member || member.status !== "active") return false;
    const perms = getPermissionsForEmail(userEmail);
    const p = perms.find((x) => x.resource === resource);
    return p?.actions.includes("view") ?? false;
  }

  if (!devBypass && session && !isSuperAdmin) {
    const member = userEmail ? getTeamMemberByEmail(userEmail) : undefined;
    if (!member || member.status !== "active") {
      return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-xs tracking-[0.28em] uppercase text-brand-orange mb-3">403 — Not authorised</p>
            <h1 className="font-display text-3xl text-brand-cream mb-3">Admin only</h1>
            <p className="text-sm text-brand-cream/60 mb-6">
              You don&apos;t have access to the admin panel. Contact your team admin to be invited.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white text-sm font-semibold">
              Back to site
            </Link>
          </div>
        </div>
      );
    }
  }

  function badgeFor(href: string): { count: number | string; tone: "orange" | "amber" | "green" } | null {
    if (href === "/admin/orders"     && pending > 0)     return { count: pending,                   tone: "amber" };
    if (href === "/admin/inventory"  && low > 0)         return { count: low,                       tone: "orange" };
    if (href === "/admin/website"    && drafts > 0)      return { count: drafts,                    tone: "amber" };
    if (href === "/admin/support"    && tickets > 0)     return { count: tickets,                   tone: "orange" };
    if (href === "/admin/marketing"  && owed > 0)        return { count: `£${owed.toFixed(0)}`,     tone: "amber" };
    if (href === "/admin/split-test" && activeTests > 0) return { count: activeTests,               tone: "green" };
    if (href === "/admin/funnels"    && activeFunnels > 0) return { count: activeFunnels,           tone: "green" };
    return null;
  }

  const BADGE_COLORS = {
    orange: "bg-brand-orange/30 text-brand-orange",
    amber:  "bg-brand-amber/25 text-brand-amber",
    green:  "bg-green-500/25 text-green-400",
  };

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

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => !item.resource || canView(item.resource));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="space-y-0.5">
                <p className="px-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/35 mb-1">{group.label}</p>
                {visibleItems.map(item => {
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
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[badge.tone]}`}>
                          {badge.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="px-3 pb-3 space-y-1.5">
          {canView("products") && (
            <Link
              href="/admin/products/new"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-brand-orange/25 text-[11px] text-brand-orange/80 hover:text-brand-orange hover:border-brand-orange/50 transition-colors"
            >
              + Add product
            </Link>
          )}
          {canView("blog") && (
            <Link
              href="/admin/blog"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-brand-amber/25 text-[11px] text-brand-amber/80 hover:text-brand-amber hover:border-brand-amber/50 transition-colors"
            >
              + Write a post
            </Link>
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-[11px] text-brand-cream/40">
          <p className="truncate">{session?.user.email ?? "dev mode"}</p>
          {isSuperAdmin ? (
            <span className="text-brand-orange/60 text-[10px]">Super admin</span>
          ) : (
            userEmail && getTeamMemberByEmail(userEmail) && (
              <span className="text-brand-cream/30 text-[10px]">
                {getTeamMemberByEmail(userEmail)?.name}
              </span>
            )
          )}
          <br />
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
        {MOBILE_NAV.filter(item => !item.resource || canView(item.resource)).map(item => {
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
