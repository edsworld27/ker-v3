"use client";

// Resolves the active org and conditionally mounts AnalyticsTracker.
// Read from the same localStorage cache the site resolver uses, so
// per-tenant tracking just works on the storefront.

import { useEffect, useState } from "react";
import AnalyticsTracker from "./AnalyticsTracker";

export default function AnalyticsResolver() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const ACTIVE_KEY = "lk_active_org_v1";
      const ORGS_CACHE_KEY = "lk_orgs_v1";
      const id = localStorage.getItem(ACTIVE_KEY);
      const cached = localStorage.getItem(ORGS_CACHE_KEY);
      if (!id || !cached) return;
      const orgs = JSON.parse(cached) as Array<{
        id: string;
        plugins?: Array<{ pluginId: string; enabled: boolean; features?: Record<string, boolean> }>;
      }>;
      const org = orgs.find(o => o.id === id);
      const analytics = (org?.plugins ?? []).find(p => p.pluginId === "analytics");
      if (analytics?.enabled && analytics.features?.pageviews !== false) {
        setOrgId(id);
        setEnabled(true);
      }
    } catch { /* tracking disabled */ }
  }, []);

  if (!enabled || !orgId) return null;
  return <AnalyticsTracker orgId={orgId} />;
}
