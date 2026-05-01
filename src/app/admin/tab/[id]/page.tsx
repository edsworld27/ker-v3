"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCustomTab, onAdminConfigChange, type CustomTab } from "@/lib/admin/adminConfig";

export default function CustomTabPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const [tab, setTab] = useState<CustomTab | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () => setTab(getCustomTab(id) ?? null);
    refresh();
    return onAdminConfigChange(refresh);
  }, [id]);

  if (tab === undefined) {
    return <div className="p-8 text-brand-cream/40 text-sm">Loading…</div>;
  }

  if (!tab) {
    return (
      <div className="p-8 max-w-xl">
        <Link href="/admin" className="text-[11px] text-brand-cream/40 hover:text-brand-cream">← Admin</Link>
        <h1 className="font-display text-2xl text-brand-cream mt-4 mb-2">Tab not found</h1>
        <p className="text-sm text-brand-cream/55">This custom tab may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen md:h-[100vh] -mt-14 md:mt-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-white/8 shrink-0 bg-brand-black-soft mt-14 md:mt-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">{tab.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-cream truncate">{tab.label}</p>
            <p className="text-[11px] text-brand-cream/35 font-mono truncate">{tab.embedUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={tab.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-3 py-1.5 rounded-lg border border-white/10 text-brand-cream/55 hover:text-brand-cream"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        src={tab.embedUrl}
        title={tab.label}
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
