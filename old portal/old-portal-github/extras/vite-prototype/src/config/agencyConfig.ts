// ============================================================
// Agency Config — The Single Source of Truth
// ============================================================
// This is the "fake database" for your entire agency setup.
// Edit values here to change defaults across the entire app.
// The AgencyConfiguratorView provides a UI to edit these at runtime.
// Changes made through the UI are stored in AppContext (React state).
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

/**
 * A single component slot in a view layout.
 * `component` is a key from componentMap. `props` are passed directly to that component.
 */
export interface ViewLayoutEntry {
  component: string;           // key into componentMap — e.g. 'DashboardWidget', 'CrmView'
  props?: Record<string, unknown>;
}

/**
 * The layout definition for one view, for one role.
 * `layout` is a Tailwind grid class applied as the wrapper (e.g. 'grid-cols-1', 'grid-cols-2').
 * `components` is the ordered list of component slots to render.
 */
export interface ViewLayout {
  layout: string;
  components: ViewLayoutEntry[];
}

/**
 * A role's full set of view layouts, keyed by view ID (matching PortalView strings).
 * Only views listed here use the component-driven renderer.
 * Views not listed fall back to the transitional view lookup.
 */
export type ViewLayouts = Record<string, ViewLayout>;

// ── Role config ───────────────────────────────────────────────────────────────

export interface RoleConfig {
  displayName: string;
  accentColor: string;
  /** Access gate — which view IDs this role can navigate to. '*' = all. */
  allowedViews: string[] | '*';
  canImpersonate: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canAccessConfigurator: boolean;
  labelOverrides: Partial<Record<LabelKey, string>>;
  isSystem?: boolean;
  /**
   * Component-driven layout definitions per view.
   * When defined for a view, DynamicViewRenderer renders from this instead of
   * the transitional full-view component lookup.
   * Optional — omit to keep using the transitional view for that view.
   */
  viewLayouts?: ViewLayouts;
}

export interface AgencyConfig {
  identity: {
    name: string;
    tagline: string;
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  roles: Record<string, RoleConfig>;
  features: Record<FeatureKey, boolean>;
  labels: Record<LabelKey, string>;
}

// ── Edit values below to change app-wide defaults ──────────────────────────

export const agencyConfig: AgencyConfig = {

  // ── Agency identity ──────────────────────────────────────────────────────
  identity: {
    name: 'Aqua Digital HQ',
    tagline: 'Your Agency Portal',
    logo: null,
    primaryColor: '#6366f1',   // change this → updates the whole app's primary accent
    secondaryColor: '#10b981',
  },

  // ── Role definitions ─────────────────────────────────────────────────────
  // allowedViews: '*' means all views. Otherwise list view IDs from PortalView.
  roles: {
    Founder: {
      displayName: 'Founder',
      accentColor: '#6366f1',
      allowedViews: '*',
      canImpersonate: true,
      canManageUsers: true,
      canManageRoles: true,
      canAccessConfigurator: true,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [
            { component: 'DashboardOverviewView', props: {} },
          ],
        },
        'admin-dashboard': {
          layout: 'grid-cols-1',
          components: [
            { component: 'AdminStatsWidget', props: {} },
            { component: 'AdminActivityWidget', props: {} }
          ],
        },
        collaboration: {
          layout: 'grid-cols-2',
          components: [
            { component: 'SyncCard', props: {} },
            { component: 'ProjectTimeline', props: {} },
            { component: 'DesignConcepts', props: {} },
            { component: 'ProjectChat', props: {} },
          ],
        },
        crm: {
          layout: 'grid-cols-1',
          components: [{ component: 'CrmView', props: {} }],
        },
        website: {
          layout: 'grid-cols-1',
          components: [{ component: 'WebsiteView', props: {} }],
        },
        resources: {
          layout: 'grid-cols-1',
          components: [{ component: 'ResourcesView', props: {} }],
        },
        discover: {
          layout: 'grid-cols-1',
          components: [{ component: 'DiscoverView', props: {} }],
        },
        'feature-request': {
          layout: 'grid-cols-1',
          components: [{ component: 'FeatureRequestView', props: {} }],
        },
        support: {
          layout: 'grid-cols-1',
          components: [{ component: 'SupportView', props: {} }],
        },
        'data-hub': {
          layout: 'grid-cols-1',
          components: [{ component: 'DataHubView', props: {} }],
        },
        inbox: {
          layout: 'grid-cols-1',
          components: [{ component: 'InboxView', props: {} }],
        },
        'agency-builder': {
          layout: 'grid-cols-1',
          components: [{ component: 'AgencyBuilderView', props: {} }],
        },
        'agency-clients': {
          layout: 'grid-cols-1',
          components: [ // Renamed ClientsStatsWidget to ClientStatsWidget
            { component: 'ClientStatsWidget', props: {} },
            { component: 'ClientListWidget', props: {} }
          ],
        },
        'agency-hub': {
          layout: 'grid-cols-1',
          components: [{ component: 'AgencyHubView', props: {} }],
        },
        'agency-configurator': {
          layout: 'grid-cols-1',
          components: [{ component: 'AgencyConfiguratorView', props: {} }],
        },
        'global-settings': {
          layout: 'grid-cols-1',
          components: [{ component: 'GlobalSettingsView', props: {} }],
        },
        'employee-management': {
          layout: 'grid-cols-1',
          components: [{ component: 'EmployeeManagementView', props: {} }],
        },
        'client-management': { // New client-management view layout
          layout: 'grid-cols-1',
          components: [
            { component: 'ClientDirectoryWidget', props: {} },
            { component: 'ClientActivityWidget', props: {} }
          ],
        },
        'founder-todos': {
          layout: 'grid-cols-1',
          components: [{ component: 'FounderTodosView', props: {} }],
        },
        'design-dashboard': {
          layout: 'grid-cols-1',
          components: [{ component: 'DesignDashboardView', props: {} }],
        },
        'dev-dashboard': {
          layout: 'grid-cols-1',
          components: [{ component: 'DevDashboardView', props: {} }],
        },
        'onboarding-dashboard': {
          layout: 'grid-cols-1',
          components: [{ component: 'OnboardingDashboardView', props: {} }],
        },
        'discovery-dashboard': {
          layout: 'grid-cols-1',
          components: [{ component: 'DiscoveryDashboardView', props: {} }],
        },
        onboarding: {
          layout: 'grid-cols-1',
          components: [{ component: 'OnboardingView', props: {} }],
        },
        logs: {
          layout: 'grid-cols-1',
          components: [{ component: 'LogsView', props: {} }],
        },
        'support-tickets': {
          layout: 'grid-cols-1',
          components: [{ component: 'SupportTicketsView', props: {} }],
        },
        'project-hub': {
          layout: 'grid-cols-1',
          components: [{ component: 'ProjectHubView', props: {} }],
        },
        'task-board': {
          layout: 'grid-cols-1',
          components: [
            { component: 'TasksStatsWidget', props: {} },
            { component: 'TaskBoardWidget', props: {} }
          ],
        },
        'ai-sessions': {
          layout: 'grid-cols-1',
          components: [{ component: 'AiSessionsView', props: {} }],
        },
        'client-management': {
          layout: 'grid-cols-1',
          components: [{ component: 'ClientManagementView', props: {} }],
        },
        'aqua-ai': {
          layout: 'grid-cols-1',
          components: [{ component: 'AquaAiView', props: {} }],
        },
      },
    },
    AgencyManager: {
      displayName: 'Manager',
      accentColor: '#10b981',
      allowedViews: [
        'dashboard', 'admin-dashboard', 'agency-clients', 'project-hub',
        'task-board', 'agency-communicate', 'support-tickets',
        'employee-profile', 'logs', 'client-management',
      ],
      canImpersonate: false,
      canManageUsers: true,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'AdminDashboardView', props: {} }],
        },
        'admin-dashboard': {
          layout: 'grid-cols-1',
          components: [{ component: 'AdminDashboardView', props: {} }],
        },
        'agency-clients': {
          layout: 'grid-cols-1',
          components: [ // Renamed ClientsStatsWidget to ClientStatsWidget
            { component: 'ClientStatsWidget', props: {} },
            { component: 'ClientListWidget', props: {} }
          ],
        },
        'project-hub': {
          layout: 'grid-cols-1',
          components: [{ component: 'ProjectHubView', props: {} }],
        },
        'task-board': {
          layout: 'grid-cols-1',
          components: [
            { component: 'TasksStatsWidget', props: {} },
            { component: 'TaskBoardWidget', props: {} }
          ],
        },
        'support-tickets': {
          layout: 'grid-cols-1',
          components: [{ component: 'SupportTicketsView', props: {} }],
        },
        logs: {
          layout: 'grid-cols-1',
          components: [{ component: 'LogsView', props: {} }],
        },
        'client-management': { // New client-management view layout
          layout: 'grid-cols-1',
          components: [
            { component: 'ClientDirectoryWidget', props: {} },
            { component: 'ClientActivityWidget', props: {} }
          ],
        },
      },
    },
    AgencyEmployee: {
      displayName: 'Employee',
      accentColor: '#f59e0b',
      allowedViews: [
        'dashboard', 'agency-clients', 'project-hub',
        'task-board', 'agency-communicate', 'employee-profile',
      ],
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [
            { component: 'DashboardOverviewView', props: {} },
          ],
        },
        'agency-clients': {
          layout: 'grid-cols-1',
          components: [ // Renamed ClientsStatsWidget to ClientStatsWidget
            { component: 'ClientStatsWidget', props: {} },
            { component: 'ClientListWidget', props: {} }
          ],
        },
        'project-hub': {
          layout: 'grid-cols-1',
          components: [{ component: 'ProjectHubView', props: {} }],
        },
        'task-board': {
          layout: 'grid-cols-1',
          components: [
            { component: 'TasksStatsWidget', props: {} },
            { component: 'TaskBoardWidget', props: {} }
          ],
        },
        collaboration: {
          layout: 'grid-cols-2',
          components: [
            { component: 'ProjectTimeline', props: {} },
            { component: 'ProjectChat', props: {} },
          ],
        },
      },
    },
    ClientOwner: {
      displayName: 'Client',
      accentColor: '#8b5cf6',
      allowedViews: [
        'dashboard', 'onboarding', 'support', 'resources',
        'crm', 'website', 'collaboration', 'discover', 'aqua-ai', 'feature-request',
      ],
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {
        team: 'Your Team',
        projects: 'Your Projects',
        portal: 'Your Portal',
      },
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'DashboardOverviewView', props: {} }],
        },
        onboarding: {
          layout: 'grid-cols-1',
          components: [{ component: 'OnboardingView', props: {} }],
        },
        support: {
          layout: 'grid-cols-1',
          components: [{ component: 'SupportView', props: {} }],
        },
        resources: {
          layout: 'grid-cols-1',
          components: [{ component: 'ResourcesView', props: {} }],
        },
        crm: {
          layout: 'grid-cols-1',
          components: [{ component: 'CrmView', props: {} }],
        },
        website: {
          layout: 'grid-cols-1',
          components: [{ component: 'WebsiteView', props: {} }],
        },
        collaboration: {
          layout: 'grid-cols-1',
          components: [{ component: 'CollaborationView', props: {} }],
        },
        discover: {
          layout: 'grid-cols-1',
          components: [{ component: 'DiscoverView', props: {} }],
        },
        'aqua-ai': {
          layout: 'grid-cols-1',
          components: [{ component: 'AquaAiView', props: {} }],
        },
        'feature-request': {
          layout: 'grid-cols-1',
          components: [{ component: 'FeatureRequestView', props: {} }],
        },
      },
    },
    ClientEmployee: {
      displayName: 'Client Employee',
      accentColor: '#ec4899',
      allowedViews: ['dashboard', 'support', 'resources', 'collaboration'],
      canImpersonate: false,
      canManageUsers: false,
      canManageRoles: false,
      canAccessConfigurator: false,
      labelOverrides: {},
      isSystem: true,
      viewLayouts: {
        dashboard: {
          layout: 'grid-cols-1',
          components: [{ component: 'DashboardOverviewView', props: {} }],
        },
        support: {
          layout: 'grid-cols-1',
          components: [{ component: 'SupportView', props: {} }],
        },
        resources: {
          layout: 'grid-cols-1',
          components: [{ component: 'ResourcesView', props: {} }],
        },
        collaboration: {
          layout: 'grid-cols-1',
          components: [{ component: 'CollaborationView', props: {} }],
        },
      },
    },
  },

  // ── Feature flags ─────────────────────────────────────────────────────────
  // Set to false to disable a feature globally across all roles.
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

  // ── Global label overrides ────────────────────────────────────────────────
  // Change these to rename things everywhere in the app.
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
};
