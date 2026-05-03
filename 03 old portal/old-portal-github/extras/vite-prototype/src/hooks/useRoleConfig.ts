// ============================================================
// useRoleConfig — The Role Selector Hook
// ============================================================
// Call this in any component to get the current user's resolved
// role config: what they can see, what labels they use, what
// features are available to them.
//
// Usage:
//   const { canView, label, feature, canDo, accentColor } = useRoleConfig();
//   if (!canView('crm')) return null;
//   <h1>{label('clients')}</h1>
// ============================================================

import { useAppContext } from '../context/AppContext';
import { agencyConfig as defaultConfig, RoleConfig, LabelKey, FeatureKey } from '../config/agencyConfig';

export interface ResolvedRoleConfig {
  /** The full config object for the current user's role */
  role: RoleConfig;
  /** Returns true if the current role can see this view */
  canView: (view: string) => boolean;
  /** Returns true if the current role can perform this action */
  canDo: (action: 'impersonate' | 'manageUsers' | 'manageRoles' | 'accessConfigurator') => boolean;
  /** Returns the label string, applying role-level and global overrides */
  label: (key: LabelKey) => string;
  /** Returns true if the feature flag is enabled */
  feature: (key: FeatureKey) => boolean;
  /** Agency display name */
  agencyName: string;
  /** Global primary color from identity config */
  primaryColor: string;
  /** This role's accent color */
  accentColor: string;
  /** All role IDs and their display names — useful for dropdowns */
  allRoles: { id: string; displayName: string; accentColor: string }[];
}

export function useRoleConfig(): ResolvedRoleConfig {
  const { currentUser, agencyConfig } = useAppContext();

  // Runtime config (edited via configurator) takes precedence over file defaults
  const config = agencyConfig ?? defaultConfig;

  // Resolve which role config to use:
  // 1. If user has a customRoleId, use that
  // 2. Otherwise use their base role
  // 3. Fall back to AgencyEmployee as a safe default
  const roleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
  const role: RoleConfig =
    config.roles[roleId] ??
    config.roles[currentUser?.role ?? ''] ??
    defaultConfig.roles['AgencyEmployee'];

  const canView = (view: string): boolean => {
    if (role.allowedViews === '*') return true;
    return (role.allowedViews as string[]).includes(view);
  };

  const canDo = (action: 'impersonate' | 'manageUsers' | 'manageRoles' | 'accessConfigurator'): boolean => {
    switch (action) {
      case 'impersonate':        return role.canImpersonate;
      case 'manageUsers':        return role.canManageUsers;
      case 'manageRoles':        return role.canManageRoles;
      case 'accessConfigurator': return role.canAccessConfigurator;
    }
  };

  const label = (key: LabelKey): string =>
    role.labelOverrides[key] ?? config.labels[key] ?? key;

  const feature = (key: FeatureKey): boolean =>
    config.features[key] ?? true;

  const allRoles = Object.entries(config.roles).map(([id, r]) => ({
    id,
    displayName: r.displayName,
    accentColor: r.accentColor,
  }));

  return {
    role,
    canView,
    canDo,
    label,
    feature,
    agencyName: config.identity.name,
    primaryColor: config.identity.primaryColor,
    accentColor: role.accentColor,
    allRoles,
  };
}
