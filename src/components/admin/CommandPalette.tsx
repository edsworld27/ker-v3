"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { listCustomers } from "@/lib/admin/customers";
import { listOrders } from "@/lib/admin/orders";
import { getProducts } from "@/lib/products";
import { listCustomTabs } from "@/lib/admin/adminConfig";
import { setAdminMode, type AdminMode } from "@/lib/admin/adminConfig";
import { getSession } from "@/lib/auth";
import { logActivity, clearActivity } from "@/lib/admin/activity";
import { listSites, setActiveSiteId } from "@/lib/admin/sites";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon?: string;
  href?: string;
  action?: () => void;
}

const STATIC_PAGES: CommandItem[] = [
  { id: "go-dashboard",   label: "Go to Dashboard",      group: "Navigation", icon: "▦", href: "/admin" },
  { id: "go-orders",      label: "Go to Orders",         group: "Navigation", icon: "▦", href: "/admin/orders" },
  { id: "go-products",    label: "Go to Products",       group: "Navigation", icon: "▦", href: "/admin/products" },
  { id: "go-customers",   label: "Go to Customers",      group: "Navigation", icon: "▦", href: "/admin/customers" },
  { id: "go-marketing",   label: "Go to Marketing",      group: "Navigation", icon: "▦", href: "/admin/marketing" },
  { id: "go-website",     label: "Go to Website",        group: "Navigation", icon: "▦", href: "/admin/website" },
  { id: "go-blog",        label: "Go to Blog",           group: "Navigation", icon: "▦", href: "/admin/blog" },
  { id: "go-pages",       label: "Go to Pages",          group: "Navigation", icon: "▦", href: "/admin/pages" },
  { id: "go-theme",       label: "Go to Theme",          group: "Navigation", icon: "▦", href: "/admin/theme" },
  { id: "go-features",    label: "Go to Feature Flags",  group: "Navigation", icon: "▦", href: "/admin/features" },
  { id: "go-shipping",    label: "Go to Shipping",       group: "Navigation", icon: "▦", href: "/admin/shipping" },
  { id: "go-split-test",  label: "Go to Split Testing",  group: "Navigation", icon: "▦", href: "/admin/split-test" },
  { id: "go-funnels",     label: "Go to Funnels",        group: "Navigation", icon: "▦", href: "/admin/funnels" },
  { id: "go-reviews",     label: "Go to Reviews",        group: "Navigation", icon: "▦", href: "/admin/reviews" },
  { id: "go-inventory",   label: "Go to Inventory",      group: "Navigation", icon: "▦", href: "/admin/inventory" },
  { id: "go-team",        label: "Go to Team",           group: "Navigation", icon: "▦", href: "/admin/team" },
  { id: "go-support",     label: "Go to Support",        group: "Navigation", icon: "▦", href: "/admin/support" },
  { id: "go-settings",    label: "Go to Settings",       group: "Navigation", icon: "▦", href: "/admin/settings" },
  { id: "go-customise",   label: "Go to Customise",      group: "Navigation", icon: "▦", href: "/admin/customise" },
  { id: "go-tooltips",    label: "Edit Tooltips",        group: "Navigation", icon: "▦", href: "/admin/tooltips" },
  { id: "go-activity",    label: "View Activity Log",    group: "Navigation", icon: "▦", href: "/admin/activity" },
  { id: "go-sites",       label: "Manage Sites",         group: "Navigation", icon: "▦", href: "/admin/sites" },
  { id: "go-popup",       label: "Edit Discount Popup",  group: "Navigation", icon: "▦", href: "/admin/popup" },

  { id: "go-storefront",  label: "Open Storefront",      group: "Quick Links", icon: "↗", href: "/" },
  { id: "go-account",     label: "Open Customer Account",group: "Quick Links", icon: "↗", href: "/account" },
];

const ACTIONS: CommandItem[] = [
  { id: "act-mode-dark",     label: "Set admin mode: Dark",     group: "Actions", icon: "◐", action: () => setMode("dark") },
  { id: "act-mode-light",    label: "Set admin mode: Light",    group: "Actions", icon: "◐", action: () => setMode("light") },
  { id: "act-mode-midnight", label: "Set admin mode: Midnight", group: "Actions", icon: "◐", action: () => setMode("midnight") },
  { id: "act-mode-sand",     label: "Set admin mode: Sand",     group: "Actions", icon: "◐", action: () => setMode("sand") },
  { id: "act-export",        label: "Export source code (.zip)", group: "Actions", icon: "↓", action: () => window.open("/api/admin/export-code") },
  { id: "act-clear-log",     label: "Clear activity log",       group: "Actions", icon: "✕", action: () => { if (confirm("Clear activity log?")) clearActivity(); } },
];

function setMode(mode: AdminMode) {
  const session = getSession();
  setAdminMode(mode, session?.user.email);
  logActivity({ category: "settings", action: `Admin mode → ${mode}` });
}

function fuzzy(item: string, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const s = item.toLowerCase();
  if (s === q) return 100;
  if (s.startsWith(q)) return 80;
  if (s.includes(q)) return 60;
  // Subsequence match
  let qi = 0;
  for (const ch of s) {
    if (ch === q[qi]) qi++;
    if (qi === q.length) return 40 - (s.length - q.length);
  }
  return 0;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build dynamic items
  const dynamic = useMemo<CommandItem[]>(() => {
    if (!open) return [];
    const customers = listCustomers().slice(0, 20).map(c => ({
      id: `cust-${c.email}`,
      label: c.name,
      hint: c.email,
      group: "Customers",
      icon: "◉",
      href: `/admin/customers/${encodeURIComponent(c.email)}`,
    }));
    const orders = listOrders().slice(0, 20).map(o => ({
      id: `order-${o.id}`,
      label: o.id,
      hint: `${o.customerName} · £${o.total.toFixed(2)} · ${o.status}`,
      group: "Orders",
      icon: "▤",
      href: `/admin/orders/${o.id}`,
    }));
    const products = getProducts({ includeHidden: true }).slice(0, 20).map(p => ({
      id: `prod-${p.slug}`,
      label: p.name,
      hint: p.slug,
      group: "Products",
      icon: "◈",
      href: `/admin/products/${p.slug}`,
    }));
    const tabs = listCustomTabs().map(t => ({
      id: `tab-${t.id}`,
      label: t.label,
      hint: t.embedUrl,
      group: "Custom tabs",
      icon: t.icon || "▦",
      href: `/admin/tab/${t.id}`,
    }));
    const session = getSession();
    const sites = listSites().map(s => ({
      id: `site-${s.id}`,
      label: `Switch to ${s.name}`,
      hint: s.primaryDomain || s.domains[0] || "no domain",
      group: "Switch site",
      icon: "◐",
      action: () => {
        setActiveSiteId(s.id, session?.user.email);
      },
    }));
    return [...customers, ...orders, ...products, ...tabs, ...sites];
  }, [open]);

  const all = useMemo(() => [...STATIC_PAGES, ...ACTIONS, ...dynamic], [dynamic]);

  const filtered = useMemo(() => {
    const q = query.trim();
    const scored = all
      .map(item => ({
        item,
        score: Math.max(
          fuzzy(item.label, q),
          item.hint ? fuzzy(item.hint, q) * 0.7 : 0,
          fuzzy(item.group, q) * 0.5,
        ),
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    return scored.map(s => s.item);
  }, [all, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach(item => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    });
    return [...map.entries()];
  }, [filtered]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Reset active when filter changes
  useEffect(() => { setActive(0); }, [query]);

  function run(item: CommandItem) {
    onClose();
    if (item.href) router.push(item.href);
    else if (item.action) item.action();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  // Scroll active into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-cmd-idx="${active}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-brand-black-soft border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <span className="text-brand-cream/40 text-lg">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command, jump to a page, search customers/orders/products…"
            className="flex-1 bg-transparent text-brand-cream placeholder:text-brand-cream/35 focus:outline-none text-sm"
          />
          <kbd className="text-[10px] text-brand-cream/35 border border-white/15 rounded px-1.5 py-0.5">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-brand-cream/40">
              No matches.
            </div>
          )}
          {grouped.map(([group, items]) => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-brand-cream/30">{group}</p>
              {items.map(item => {
                runningIdx++;
                const isActive = runningIdx === active;
                const idx = runningIdx;
                return (
                  <button
                    key={item.id}
                    data-cmd-idx={idx}
                    onClick={() => run(item)}
                    onMouseEnter={() => setActive(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                      isActive ? "bg-brand-orange/15" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-brand-cream/45 w-5 text-center shrink-0">{item.icon}</span>
                    <span className="text-sm text-brand-cream truncate">{item.label}</span>
                    {item.hint && (
                      <span className="text-[11px] text-brand-cream/40 truncate ml-2">{item.hint}</span>
                    )}
                    {isActive && (
                      <kbd className="ml-auto text-[10px] text-brand-cream/45 border border-white/15 rounded px-1.5 py-0.5 shrink-0">↵</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/8 text-[11px] text-brand-cream/35 flex items-center justify-between">
          <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
          <span className="flex gap-3">
            <span><kbd className="border border-white/15 rounded px-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-white/15 rounded px-1">↵</kbd> select</span>
          </span>
        </div>
      </div>
    </div>
  );
}
