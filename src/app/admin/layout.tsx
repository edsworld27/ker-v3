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
import { getTeamMemberByEmail, getPermissionsForEmail, type Resource } from "@/lib/admin/team";
import { getBranding, listCustomTabs, onAdminConfigChange, type AdminBranding, type CustomTab } from "@/lib/admin/adminConfig";
import {
  getSidebarLayout, onSidebarLayoutChange, findPanelForPath, walkLinks,
  type SidebarLayout, type SidebarPanel, type SidebarItem, type SidebarGroup,
  type SidebarLink, type BadgeKey,
} from "@/lib/admin/sidebarLayout";
import {
  isPathAllowed, onInstalledPluginsChange, refreshInstalledPlugins,
} from "@/lib/admin/installedPlugins";
import AdminThemeInjector from "@/components/AdminThemeInjector";
import AdminModeSwitcher from "@/components/AdminModeSwitcher";
import CommandPalette from "@/components/admin/CommandPalette";
import SiteSwitcher from "@/components/admin/SiteSwitcher";
import OrgSwitcher from "@/components/admin/OrgSwitcher";
import NotificationBell from "@/components/admin/NotificationBell";

type Counters = Record<BadgeKey, number>;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [counters, setCounters] = useState<Counters>({
    pendingOrders: 0,
    lowStock: 0,
    drafts: 0,
    tickets: 0,
    owedCommissions: 0,
    activeTests: 0,
    activeFunnels: 0,
  });
  const [branding, setBranding] = useState<AdminBranding>(() => getBranding());
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [layout, setLayout] = useState<SidebarLayout>(() => getSidebarLayout());
  const [paletteOpen, setPaletteOpen] = useState(false);

  // The currently drilled-in panel. By default the panel that owns the current
  // page is auto-selected; the admin can override (e.g. click "back" on a
  // page belonging to a panel) and that override sticks until they navigate
  // somewhere else.
  const [override, setOverride] = useState<{ panelId: string | null; forPath: string } | null>(null);

  // Cmd+K (or Ctrl+K) opens the command palette.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
    setBranding(getBranding());
    setCustomTabs(listCustomTabs());
    setLayout(getSidebarLayout());
    const refresh = () => {
      setSession(getSession());
      setCounters({
        pendingOrders:    pendingOrdersCount(),
        lowStock:         lowStockCount(),
        drafts:           pendingDraftCount(),
        tickets:          openTicketCount(),
        owedCommissions:  unpaidCommissionsTotal(),
        activeTests:      listABTests().filter(t => t.status === "running").length,
        activeFunnels:    listFunnels().filter(f => f.status === "active").length,
      });
    };
    refresh();
    const refreshAdminConfig = () => {
      setBranding(getBranding());
      setCustomTabs(listCustomTabs());
    };
    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const off0 = onAdminConfigChange(refreshAdminConfig);
    const off1 = onContentChange(refresh);
    const off2 = onTicketsChange(refresh);
    const off3 = onAffiliatesChange(refresh);
    const off4 = onSidebarLayoutChange(() => setLayout(getSidebarLayout()));
    void refreshInstalledPlugins();
    const off5 = onInstalledPluginsChange(() => {
      // Bump the layout reference so panels re-filter through isPathAllowed.
      setLayout(prev => ({ ...prev }));
    });
    return () => {
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      off0(); off1(); off2(); off3(); off4(); off5();
    };
  }, [pathname]);

  if (!hydrated) {
    return <div className="min-h-screen bg-brand-black" />;
  }

  // Dev bypass — two-flag system:
  //   • Legacy: NEXT_PUBLIC_PORTAL_DEV_BYPASS=1 (kept for back-compat)
  //   • New:    NEXT_PUBLIC_PORTAL_SECURITY in {"false","dev","off"} or unset
  // Either off-state means the admin doesn't require a session.
  const legacyBypass = process.env.NEXT_PUBLIC_PORTAL_DEV_BYPASS === "1";
  const securityEnv = process.env.NEXT_PUBLIC_PORTAL_SECURITY;
  const securityOff = !securityEnv || securityEnv === "false" || securityEnv === "dev" || securityEnv === "off";
  const devBypass = legacyBypass || securityOff;

  if (!devBypass && !session) {
    // Send unauthenticated admins to the dedicated admin login (cyan
    // /login page), NOT the customer storefront login at /account.
    if (typeof window !== "undefined") {
      const next = encodeURIComponent(pathname ?? "/admin");
      router.replace(`/login?next=${next}`);
    }
    return null;
  }

  const isSuperAdmin = devBypass || (session ? isAdmin(session) : false);
  const userEmail = session?.user?.email;

  // Resolve what resources this user can view
  function canView(resource: Resource | undefined): boolean {
    if (!resource) return true;
    if (isSuperAdmin) return true;
    if (!userEmail) return false;
    const member = getTeamMemberByEmail(userEmail);
    if (!member || member.status !== "active") return false;
    const perms = getPermissionsForEmail(userEmail);
    const p = perms.find(x => x.resource === resource);
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

  // Resolve which panel is active. If the user has explicitly chosen one
  // for this exact path, use that; otherwise auto-derive from the pathname.
  const currentPath = pathname ?? "";
  const activePanelId: string | null = override && override.forPath === currentPath
    ? override.panelId
    : findPanelForPath(layout, currentPath);

  function selectPanel(panelId: string | null) {
    setOverride({ panelId, forPath: currentPath });
  }

  const activePanel: SidebarPanel | null = activePanelId
    ? layout.panels.find(p => p.id === activePanelId) ?? null
    : null;

  // Custom (iframe) tabs grouped by their group label, only shown at top level.
  const customGroups = customTabs.reduce<Record<string, CustomTab[]>>((acc, t) => {
    const g = t.group || "Custom";
    (acc[g] ??= []).push(t);
    return acc;
  }, {});

  // Decide which panels are visible to this user. A panel shows if at
  // least one descendant link is both (a) permitted by the team-perms
  // gate AND (b) belongs to a plugin that's installed + enabled on the
  // active org. Primary (agency) orgs see every link regardless.
  const visiblePanels = layout.panels.filter(panel => {
    for (const link of walkLinks(panel.items)) {
      if (canView(link.resource) && isPathAllowed(link.href)) return true;
    }
    return false;
  });

  return (
    <div data-admin-panel className="min-h-screen bg-brand-black text-brand-cream flex">
      <AdminThemeInjector />
      {/* Sidebar */}
      <aside data-admin-sidebar className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col bg-brand-black-soft border-r border-white/5">
        <Link href="/" className="px-6 py-6 border-b border-white/5 flex items-center gap-3">
          {branding.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={branding.logoUrl} alt="" className="h-8 w-auto object-contain shrink-0" />
          )}
          <div className="min-w-0">
            <span className="font-display text-base font-bold text-brand-cream block truncate">
              {branding.panelName.includes("&") ? (
                branding.panelName.split("&").map((p, i, a) => (
                  <span key={i}>{p}{i < a.length - 1 && <span className="text-brand-orange"> &amp; </span>}</span>
                ))
              ) : branding.panelName}
            </span>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-brand-amber mt-0.5">{branding.shortName}</span>
          </div>
        </Link>

        {/* Site switcher — picks which storefront the admin is editing */}
        <div className="px-3 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0"><OrgSwitcher /></div>
            <NotificationBell />
          </div>
          <SiteSwitcher />
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {activePanel ? (
            <PanelView
              panel={activePanel}
              pathname={pathname ?? ""}
              counters={counters}
              canView={canView}
              onBack={() => selectPanel(null)}
            />
          ) : (
            <TopLevelView
              panels={visiblePanels}
              onPick={selectPanel}
              customGroups={customGroups}
              pathname={pathname ?? ""}
            />
          )}
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
          <AdminModeSwitcher />
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-xs text-brand-cream/60 hover:text-brand-cream transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
              Quick search
            </span>
            <kbd className="text-[10px] border border-white/15 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>
        </div>

        <div className="p-4 border-t border-white/5 text-[11px] text-brand-cream/40 space-y-1">
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
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <Link href="/aqua" className="hover:text-cyan-400 transition-colors" title="Back to agency dashboard">↰ Aqua</Link>
            <Link href="/" className="hover:text-brand-cream transition-colors">View site →</Link>
            {branding.githubRepoUrl && (
              <a href={branding.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cream transition-colors" title="View repository">
                Repo ↗
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-brand-black-soft border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-display text-sm font-bold flex items-center gap-2">
          {branding.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={branding.logoUrl} alt="" className="h-5 w-auto object-contain" />
          )}
          <span>{branding.panelName} · {branding.shortName}</span>
        </Link>
        <Link href="/" className="text-xs text-brand-cream/60">Site →</Link>
      </div>

      {/* Mobile bottom tab bar — one button per panel */}
      <MobileTabBar
        panels={visiblePanels}
        activePanelId={activePanelId}
        onPick={selectPanel}
      />

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Command palette (Cmd+K) */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Mobile floating ⌘K button (desktop users use the keyboard shortcut) */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="md:hidden fixed bottom-16 right-4 z-30 w-12 h-12 rounded-full bg-brand-orange text-white shadow-lg shadow-black/40 flex items-center justify-center"
        aria-label="Open command palette"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>
  );
}

// ─── Top-level view (panel buttons) ──────────────────────────────────────────

function TopLevelView({
  panels,
  onPick,
  customGroups,
  pathname,
}: {
  panels: SidebarPanel[];
  onPick: (id: string) => void;
  customGroups: Record<string, CustomTab[]>;
  pathname: string;
}) {
  return (
    <div className="space-y-3">
      <p className="px-1 text-[10px] tracking-[0.22em] uppercase text-brand-cream/35">Panels</p>
      <div className="space-y-1.5">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => onPick(panel.id)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-orange/30 transition-colors text-left group"
          >
            <span className="text-2xl shrink-0">{panel.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-brand-cream">{panel.label}</span>
              {panel.description && (
                <span className="block text-[11px] text-brand-cream/45 truncate">{panel.description}</span>
              )}
            </span>
            <span className="text-brand-cream/30 group-hover:text-brand-orange transition-colors">→</span>
          </button>
        ))}
      </div>

      {Object.keys(customGroups).length > 0 && (
        <div className="space-y-1.5 pt-2">
          <p className="px-1 text-[10px] tracking-[0.22em] uppercase text-brand-cream/35">Custom</p>
          {Object.entries(customGroups).map(([groupLabel, tabs]) => (
            <div key={groupLabel} className="space-y-0.5">
              {groupLabel !== "Custom" && (
                <p className="px-3 text-[10px] tracking-[0.22em] uppercase text-brand-cream/35 mb-1 mt-1">{groupLabel}</p>
              )}
              {tabs.map(t => {
                const href = `/admin/tab/${t.id}`;
                const active = pathname === href;
                if (t.openInNewTab) {
                  return (
                    <a
                      key={t.id}
                      href={t.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream border border-transparent"
                    >
                      <span>{t.icon}</span>
                      <span className="flex-1 truncate">{t.label}</span>
                      <span className="text-[10px] text-brand-cream/30">↗</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={t.id}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-brand-orange/15 text-brand-cream border border-brand-orange/30"
                        : "text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream border border-transparent"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span className="flex-1 truncate">{t.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drilled-in panel view ────────────────────────────────────────────────────

function PanelView({
  panel,
  pathname,
  counters,
  canView,
  onBack,
}: {
  panel: SidebarPanel;
  pathname: string;
  counters: Counters;
  canView: (r: Resource | undefined) => boolean;
  onBack: () => void;
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={onBack}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-brand-cream/55 hover:text-brand-cream hover:bg-white/5 transition-colors"
      >
        <span>←</span>
        <span>All panels</span>
      </button>

      <div className="px-3 pt-1 pb-2 flex items-center gap-2 border-b border-white/5">
        <span className="text-xl">{panel.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-cream truncate">{panel.label}</p>
          {panel.description && (
            <p className="text-[10px] text-brand-cream/40 truncate">{panel.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-0.5 pt-1">
        {panel.items.map(item => (
          <SidebarItemRow
            key={item.id}
            item={item}
            depth={2}
            pathname={pathname}
            counters={counters}
            canView={canView}
          />
        ))}
      </div>
    </div>
  );
}

// Recursive row — dispatches between leaf link and nested folder. `depth`
// counts the panel as level 1, so direct children of a panel render at
// depth=2 and indent grows by one step per level.
function SidebarItemRow({
  item,
  depth,
  pathname,
  counters,
  canView,
}: {
  item: SidebarItem;
  depth: number;
  pathname: string;
  counters: Counters;
  canView: (r: Resource | undefined) => boolean;
}) {
  if (item.type === "link") {
    if (!canView(item.resource)) return null;
    if (!isPathAllowed(item.href)) return null;
    return <SidebarLinkRow link={item} pathname={pathname} counters={counters} depth={depth} />;
  }
  return (
    <SidebarGroupRow
      group={item}
      depth={depth}
      pathname={pathname}
      counters={counters}
      canView={canView}
    />
  );
}

// Indent: 12px base + 12px per level past depth=2. Capped via depth-clamp so
// deeply-nested rows stay readable inside the ~240px sidebar rail.
function indentPx(depth: number): number {
  const steps = Math.max(0, Math.min(depth - 2, 4));
  return 12 + steps * 12;
}

function SidebarLinkRow({
  link,
  pathname,
  counters,
  depth,
}: {
  link: SidebarLink;
  pathname: string;
  counters: Counters;
  depth: number;
}) {
  const active = link.href === "/admin"
    ? pathname === "/admin"
    : pathname === link.href || pathname.startsWith(link.href + "/");
  const badge = badgeFor(link, counters);
  const cls = `flex items-center justify-between pr-3 py-2 rounded-lg text-sm transition-colors ${
    active
      ? "bg-brand-orange/15 text-brand-cream border border-brand-orange/30"
      : "text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream border border-transparent"
  }`;
  const style = { paddingLeft: indentPx(depth) };
  if (link.external || link.href.startsWith("http")) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls} style={style} title={link.label}>
        <span className="flex-1 truncate">{link.label}</span>
        <span className="text-[10px] text-brand-cream/30">↗</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls} style={style} title={link.label}>
      <span className="flex-1 truncate">{link.label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[badge.tone]}`}>
          {badge.count}
        </span>
      )}
    </Link>
  );
}

function SidebarGroupRow({
  group,
  depth,
  pathname,
  counters,
  canView,
}: {
  group: SidebarGroup;
  depth: number;
  pathname: string;
  counters: Counters;
  canView: (r: Resource | undefined) => boolean;
}) {
  // A child folder is visible if any of its descendant links is both
  // permitted by team-perms AND belongs to a plugin installed on the
  // active org (primary org always sees all).
  const visibleChildren = group.items.filter(child => {
    for (const link of walkLinks([child])) {
      if (canView(link.resource) && isPathAllowed(link.href)) return true;
    }
    return false;
  });

  // The group is "open" if any descendant link is the active route — that way
  // direct URL visits unfurl the chain that contains the page.
  let containsActive = false;
  for (const link of walkLinks(group.items)) {
    const isActive = link.href === "/admin"
      ? pathname === "/admin"
      : pathname === link.href || pathname.startsWith(link.href + "/");
    if (isActive) { containsActive = true; break; }
  }

  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const open = containsActive || (userToggled ?? group.defaultOpen !== false);

  if (visibleChildren.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setUserToggled(!open)}
        className="w-full flex items-center justify-between pr-3 py-2 rounded-lg text-sm text-brand-cream/65 hover:bg-white/5 hover:text-brand-cream transition-colors"
        style={{ paddingLeft: indentPx(depth) }}
        title={group.label}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-brand-cream/35 text-[10px] w-3 inline-block shrink-0">{open ? "▾" : "▸"}</span>
          <span className="truncate">{group.label}</span>
        </span>
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {visibleChildren.map(child => (
            <SidebarItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              pathname={pathname}
              counters={counters}
              canView={canView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mobile bottom tab bar ───────────────────────────────────────────────────

function MobileTabBar({
  panels,
  activePanelId,
  onPick,
}: {
  panels: SidebarPanel[];
  activePanelId: string | null;
  onPick: (id: string) => void;
}) {
  // Show up to 5 panels in the mobile bar.
  const visible = panels.slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-brand-black-soft border-t border-white/5 grid" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}>
      {visible.map(panel => {
        const active = activePanelId === panel.id;
        return (
          <button
            key={panel.id}
            onClick={() => onPick(panel.id)}
            className={`relative text-center py-2.5 text-[11px] flex flex-col items-center gap-0.5 ${active ? "text-brand-orange" : "text-brand-cream/55"}`}
          >
            <span className="text-base leading-none">{panel.icon}</span>
            <span>{panel.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const BADGE_COLORS = {
  orange: "bg-brand-orange/30 text-brand-orange",
  amber:  "bg-brand-amber/25 text-brand-amber",
  green:  "bg-green-500/25 text-green-400",
} as const;

function badgeFor(
  link: SidebarLink,
  counters: Counters,
): { count: number | string; tone: keyof typeof BADGE_COLORS } | null {
  if (!link.badgeKey) return null;
  switch (link.badgeKey) {
    case "pendingOrders":
      return counters.pendingOrders > 0 ? { count: counters.pendingOrders, tone: "amber" } : null;
    case "lowStock":
      return counters.lowStock > 0 ? { count: counters.lowStock, tone: "orange" } : null;
    case "drafts":
      return counters.drafts > 0 ? { count: counters.drafts, tone: "amber" } : null;
    case "tickets":
      return counters.tickets > 0 ? { count: counters.tickets, tone: "orange" } : null;
    case "owedCommissions":
      return counters.owedCommissions > 0 ? { count: `£${counters.owedCommissions.toFixed(0)}`, tone: "amber" } : null;
    case "activeTests":
      return counters.activeTests > 0 ? { count: counters.activeTests, tone: "green" } : null;
    case "activeFunnels":
      return counters.activeFunnels > 0 ? { count: counters.activeFunnels, tone: "green" } : null;
    default:
      return null;
  }
}
