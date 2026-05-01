// Server-side dashboard layout helpers (G-4). Each org may override the
// default layout. Keeps the data model symmetric across tenants — the
// agency's own dashboard is just another OrgRecord.dashboard entry.

import { getState, mutate } from "./storage";
import type { DashboardLayout, DashboardWidget } from "./types";

export const DEFAULT_DASHBOARD: DashboardLayout = {
  updatedAt: 0,
  widgets: [
    { id: "stat-orders",         type: "stat-orders",         span: 1, visible: true, title: "Orders" },
    { id: "stat-revenue",        type: "stat-revenue",        span: 1, visible: true, title: "Revenue" },
    { id: "stat-sites",          type: "stat-sites",          span: 1, visible: true, title: "Sites" },
    { id: "list-recent-orders",  type: "list-recent-orders",  span: 2, visible: true, title: "Recent orders" },
    { id: "list-recent-activity",type: "list-recent-activity",span: 1, visible: true, title: "Activity" },
    { id: "chart-revenue-trend", type: "chart-revenue-trend", span: 3, visible: true, title: "Revenue trend" },
  ],
};

export function getDashboard(orgId: string): DashboardLayout {
  const org = getState().orgs[orgId];
  return org?.dashboard ?? DEFAULT_DASHBOARD;
}

export function setDashboard(orgId: string, widgets: DashboardWidget[]): DashboardLayout | null {
  let result: DashboardLayout | null = null;
  mutate(state => {
    const org = state.orgs[orgId];
    if (!org) return;
    const next: DashboardLayout = { widgets, updatedAt: Date.now() };
    state.orgs[orgId] = { ...org, dashboard: next };
    result = next;
  });
  return result;
}

export function resetDashboard(orgId: string): DashboardLayout {
  mutate(state => {
    const org = state.orgs[orgId];
    if (!org) return;
    const { dashboard: _drop, ...rest } = org;
    void _drop;
    state.orgs[orgId] = rest;
  });
  return DEFAULT_DASHBOARD;
}
