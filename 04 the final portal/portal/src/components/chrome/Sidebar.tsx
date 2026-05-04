// Sidebar — server-rendered navigation. Reads NavPanel[] from
// buildSidebar(); each panel is a labelled section with NavItems.

import Link from "next/link";
import type { NavPanel } from "@/lib/chrome/sidebarLayout";

interface Props {
  panels: NavPanel[];
  tenantLabel: string;
  currentPath: string;
}

export function Sidebar({ panels, tenantLabel, currentPath }: Props) {
  return (
    <aside className="w-60 shrink-0 border-r border-black/10 bg-white/60 p-4 text-sm">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-black/50">Tenant</div>
        <div className="text-base font-semibold text-black/90">{tenantLabel}</div>
      </div>

      <nav className="flex flex-col gap-5">
        {panels.map(panel => (
          <div key={panel.id}>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-black/50">
              {panel.label}
            </div>
            <ul className="flex flex-col">
              {panel.items.map(item => {
                const active = currentPath === item.href || currentPath.startsWith(item.href + "/");
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={[
                        "flex items-center justify-between rounded-md px-2 py-1.5",
                        active ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium" : "text-black/80 hover:bg-black/5",
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] text-black/70">
                          {String(item.badge)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
