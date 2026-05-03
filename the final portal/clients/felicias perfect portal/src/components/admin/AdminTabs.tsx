"use client";

// AdminTabs — horizontal tab strip used by "hub" admin surfaces
// (marketplace family, settings family). Purely a navigation layer:
// each tab is a Link to a sibling page, never replacing or hiding a
// destination. Active state is derived from the current pathname.

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminTab {
  label: string;
  href: string;
  badge?: string | number;
  // When true, only highlight the tab on an exact pathname match.
  // Use for parent-style routes whose children belong to a different tab.
  exact?: boolean;
}

export default function AdminTabs({
  tabs,
  ariaLabel,
}: {
  tabs: AdminTab[];
  ariaLabel?: string;
}) {
  const pathname = usePathname() ?? "";
  const isActive = (tab: AdminTab) =>
    tab.exact
      ? pathname === tab.href
      : pathname === tab.href || pathname.startsWith(tab.href + "/");

  return (
    <nav
      aria-label={ariaLabel ?? "Section"}
      className="border-b border-white/8 overflow-x-auto no-scrollbar"
    >
      <ul className="flex items-center gap-0.5 min-w-max">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[12px] tracking-wide whitespace-nowrap transition-colors ${
                  active
                    ? "text-brand-cream"
                    : "text-brand-cream/55 hover:text-brand-cream/85"
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge !== "" && (
                  <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/8 text-brand-cream/65">
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <span
                    className="absolute inset-x-2 -bottom-px h-px bg-cyan-400"
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
