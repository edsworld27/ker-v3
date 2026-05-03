/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { componentMap } from './componentMap';
import type { ViewLayout } from '../config/agencyConfig';

interface DynamicViewRendererProps {
  viewId: string;
  /** Props forwarded to every component in the layout (e.g. view-level callbacks). */
  sharedProps?: Record<string, unknown>;
}

/**
 * ============================================================
 * THE MASTER RENDERER
 * ============================================================
 *
 * This is the only view component the app will ever need.
 *
 * For a given viewId it:
 *   1. Reads the current user's role from AppContext.
 *   2. Looks up that role's viewLayouts entry for this viewId in agencyConfig.
 *   3. If a layout is defined → renders the component list from componentMap.
 *   4. If no layout is defined → falls back to a single transitional view component
 *      resolved by convention (viewId → PascalCase + 'View' key in componentMap).
 *   5. If nothing resolves → renders a clear "not found" state.
 *
 * Zero hardcoded view names. Zero styles. All visual config lives in uiMaster/ui.ts files.
 * ============================================================
 */
export const DynamicViewRenderer: React.FC<DynamicViewRendererProps> = ({
  viewId,
  sharedProps = {},
}) => {
  const { agencyConfig, currentUser, impersonatedUserEmail, users } = useAppContext();

  // ── 1. Resolve the active role ──────────────────────────────────────────────
  const effectiveUser = impersonatedUserEmail
    ? users.find((u) => u.email === impersonatedUserEmail)
    : currentUser;

  const roleId = effectiveUser?.customRoleId ?? effectiveUser?.role ?? 'AgencyEmployee';
  const roleConfig = agencyConfig.roles[roleId];

  // ── 2. Look up the viewLayout for this viewId ───────────────────────────────
  const viewLayout: ViewLayout | undefined = roleConfig?.viewLayouts?.[viewId];

  // ── 3a. Component-driven path — layout defined in agencyConfig ──────────────
  if (viewLayout) {
    return (
      <div className={`grid gap-6 ${viewLayout.layout}`}>
        {viewLayout.components.map((entry, index) => {
          const Component = componentMap[entry.component];
          if (!Component) {
            console.warn(
              `DynamicViewRenderer: "${entry.component}" is not registered in componentMap.`
            );
            return null;
          }
          return <Component key={`${entry.component}-${index}`} {...entry.props} {...sharedProps} />;
        })}
      </div>
    );
  }

  // ── 3b. Transitional fallback — resolve by naming convention ─────────────────
  // Converts 'admin-dashboard' → 'AdminDashboardView', 'crm' → 'CrmView', etc.
  const conventionKey = viewId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'View';

  const FallbackComponent = componentMap[conventionKey] ?? componentMap[
    // Also try without 'View' suffix (e.g. 'RoleBuilder', 'PageBuilder')
    viewId.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')
  ];

  if (FallbackComponent) {
    return <FallbackComponent {...sharedProps} />;
  }

  // ── 4. Nothing found ────────────────────────────────────────────────────────
  console.warn(`DynamicViewRenderer: No layout or fallback found for viewId "${viewId}".`);
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <p className="text-2xl font-bold text-slate-300">View not found</p>
      <p className="mt-2 text-slate-500">
        No component is registered for <code className="text-slate-400">"{viewId}"</code>.
      </p>
    </div>
  );
};
