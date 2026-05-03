/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================
// Agency Config — The Single Source of Truth
// ============================================================
// This is the "fake database" for your entire agency setup.
// Edit values here to change defaults across the entire app.
// The AgencyConfiguratorView provides a UI to edit these at runtime.
// Changes made through the UI are stored in FinanceContext (React state).
// ============================================================

export type FeatureKey =
  | 'crm'
  | 'website'
  | 'resources'
  | 'aiAssistant'
  | 'collaboration'
  | 'featureRequests'
  | 'supportTickets'
  | 'activityLogs'
  | 'employeeManagement'
  | 'agencyBuilder'
  | 'analytics';

export type LabelKey =
  | 'clients'
  | 'projects'
  | 'team'
  | 'portal'
  | 'dashboard'
  | 'tasks'
  | 'tickets'
  | 'resources'
  | 'support'
  | 'onboarding';

// ── View layout types ─────────────────────────────────────────────────────────

export interface GridItemLayout {
  x: number; y: number; w: number; h: number;
}

export interface ViewLayoutEntry {
  component: string;
  props?: Record<string, unknown>;
  gridItem?: GridItemLayout;
}

export interface ViewLayout {
  layout: string;
  components: ViewLayoutEntry[];
  gridMode?: boolean;
}

export type ViewLayouts = Record<string, ViewLayout>;

// ── Role config ───────────────────────────────────────────────────────────────

export interface RoleConfig {
  displayName: string;
  accentColor: string;
  allowedViews: string[] | '*';
  
  // --- Core Permissions ---
  isFounder?: boolean;
  isInternalStaff: boolean;
  
  // --- Action Permissions ---
  canImpersonate: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canAccessConfigurator: boolean;
  canAccessBridgeControl: boolean;
  canEditTemplates: boolean;
  
  // --- Feature Permissions ---
  canViewFinancials: boolean;
  canManagePayroll: boolean;
  canViewInternalLogs: boolean;
  
  labelOverrides: Partial<Record<LabelKey, string>>;
  isSystem?: boolean;
  viewLayouts?: ViewLayouts;
  styleOverrides?: Partial<AgencyConfig['identity']>;
  textOverrides?: Record<string, string>;
  iconOverrides?: Record<string, string>;
  customCSS?: string;
}

export interface AgencyConfig {
  identity: {
    name: string;
    tagline: string;
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
    bgBase?: string;
    bgSurface?: string;
    textPrimary?: string;
    textMuted?: string;
    borderColor?: string;
    colorScheme?: 'dark' | 'light';
    fontFamily?: string;
    customFontData?: string;
    customFontName?: string;
    successColor?: string;
    errorColor?: string;
    warningColor?: string;
    infoColor?: string;
    tertiaryColor?: string;
    textOnPrimary?: string;
    surfaceGlass?: string;
    borderInner?: string;
    radiusCard?: string;
    radiusButton?: string;
    sidebarBg?: string;
    contentBg?: string;
    viewStyleOverrides?: Record<string, Partial<AgencyConfig['identity']>>;
    textOverrides?: Record<string, string>;
    iconOverrides?: Record<string, string>;
    viewTextOverrides?: Record<string, Record<string, string>>;
    viewIconOverrides?: Record<string, Record<string, string>>;
    navOrder?: string[];
    elementHidden?: Record<string, boolean>;
    customCSS?: string;
    viewCustomCSS?: Record<string, string>;
    elementCSSOverrides?: Record<string, string>;
    templateUIOverrides?: Record<string, Record<string, any>>;
    animationOverrides?: {
      transitionSpeed?: string;
      transitionEase?: string;
      hoverScale?: string;
      hoverBrightness?: string;
      focusRingSize?: string;
      focusRingColor?: string;
    };
  };
  roles: Record<string, RoleConfig>;
  features: Record<FeatureKey, boolean>;
  labels: Record<LabelKey, string>;
  enabledSuiteIds: string[];
}

// ── Default Configuration ────────────────────────────────────────────────────

export const agencyConfig: AgencyConfig = {
  identity: {
    name: 'Aqua Digital HQ',
    tagline: 'Your Agency Portal',
    logo: null,
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
  },

  roles: {
    Founder: {
      displayName: 'Founder',
      accentColor: '#6366f1',
      allowedViews: '*',
      isFounder: true,
      isInternalStaff: true,
      canImpersonate: true,
      canManageUsers: true,
      canManageRoles: true,
      canAccessConfigurator: true,
      canAccessBridgeControl: true,
      canEditTemplates: true,
      canViewFinancials: true,
      canManagePayroll: true,
      canViewInternalLogs: true,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'DashboardOverviewView', props: {} }],
        },
        'admin-dashboard': {
          layout: 'grid-cols-1',
          components: [
            { component: 'AdminStatsWidget', props: {} },
            { component: 'AdminActivityWidget', props: {} }
          ],
        },
      },
    },
    AgencyManager: {
      displayName: 'Manager',
      accentColor: '#10b981',
      allowedViews: '*',
      isFounder: false,
      isInternalStaff: true,
      canImpersonate: false,
      canManageUsers: true,
      canManageRoles: false,
      canAccessConfigurator: false,
      canAccessBridgeControl: false,
      canEditTemplates: false,
      canViewFinancials: true,
      canManagePayroll: true,
      canViewInternalLogs: true,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'AdminDashboardView', props: {} }],
        },
      },
    },
    AgencyEmployee: {
      displayName: 'Employee',
      accentColor: '#f59e0b',
      allowedViews: [
        'dashboard', 'employee-hub', 'hr-suite', 'attendance-view', 'time-off-hub',
        'benefits-view', 'lms-view', 'performance-view', 'records-view',
        'project-hub', 'task-matrix', 'collaboration-hub', 'inbox-view',
        'founder-hub', 'support-suite', 'resource-hub', 'feedback-hub',
        'payroll-suite', 'you-deserve-it-fund', 'gift-hub',
        'clients-overview', 'onboarding-phase-view', 'ff-production', 'portal', 'client-dashboard', 'iframe-view'
      ],
      isFounder: false,
      isInternalStaff: true,
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      canAccessBridgeControl: false,
      canEditTemplates: false,
      canViewFinancials: false,
      canManagePayroll: false,
      canViewInternalLogs: false,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'DashboardOverviewView', props: {} }],
        },
      },
    },
    ClientOwner: {
      displayName: 'Client',
      accentColor: '#8b5cf6',
      allowedViews: [
        'dashboard', 'onboarding', 'support', 'resources', 'client-resources',
        'crm', 'website', 'collaboration', 'discover', 'aqua-ai', 'feature-request',
        'client-settings', 'data-hub', 'affiliate', 'incubator',
        'clients-overview', 'onboarding-phase-view', 'ff-production', 'portal', 'client-dashboard', 'iframe-view'
      ],
      isFounder: false,
      isInternalStaff: false,
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      canAccessBridgeControl: false,
      canEditTemplates: false,
      canViewFinancials: false,
      canManagePayroll: false,
      canViewInternalLogs: false,
      labelOverrides: {
        team: 'Your Team',
        projects: 'Your Projects',
        portal: 'Your Portal',
      },
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'ClientDashboardView', props: {} }],
        },
      },
    },
  },

  features: {
    crm: true,
    website: true,
    resources: true,
    aiAssistant: true,
    collaboration: true,
    featureRequests: true,
    supportTickets: true,
    activityLogs: true,
    employeeManagement: true,
    agencyBuilder: true,
    analytics: true,
  },

  labels: {
    clients: 'Clients',
    projects: 'Projects',
    team: 'Team',
    portal: 'Portal',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    tickets: 'Tickets',
    resources: 'Resources',
    support: 'Support',
    onboarding: 'Onboarding',
  },

  enabledSuiteIds: [],
};
