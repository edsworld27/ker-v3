/**
 * @aqua/bridge/ui/DashboardWidget — kit-styled dashboard tile shared by every sub-app.
 *
 * Replaces the 7 near-duplicate `*DashboardWidget.tsx` files (Host/CRM/Client/
 * Operations/Finance/People/Revenue) with one canonical implementation. Each
 * per-app file re-exports `DashboardWidget` so the dynamic-import paths stay
 * stable.
 *
 * Wraps kit `KpiCard` — the `color` prop maps to a kit Badge tone for the
 * trend pill so the per-app CSS-var theming (legacy) collapses to one
 * indigo-led palette.
 */
'use client';

import React, { type ComponentType } from 'react';
import { KpiCard } from './kit';

export type IconName = string;

interface DashboardWidgetProps {
  icon: IconName | ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: string;
  /** Legacy theming hint, accepted for back-compat but no longer drives color. */
  color?: string;
}

const FallbackIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ icon, label, value, trend }) => {
  const Icon: ComponentType<{ className?: string }> =
    typeof icon === 'function' ? icon : FallbackIcon;
  const trendKind = trend?.startsWith('+') ? 'up' : trend?.startsWith('-') ? 'down' : 'flat';
  return <KpiCard label={label} value={value} delta={trend} trend={trendKind} icon={Icon} />;
};
