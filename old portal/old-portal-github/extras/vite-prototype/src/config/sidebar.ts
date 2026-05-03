import { LayoutDashboard, Users, Briefcase, MessageSquare, UserCog, History, ShieldAlert, Compass, FileText, Palette, Code2, Monitor, Sparkles, LayoutGrid, HelpCircle, Link2, FolderOpen, Database, CreditCard, Settings } from 'lucide-react';
import { PortalView, AppUser, Client } from '../types';
import { AgencyConfig } from './agencyConfig';

export interface SidebarItemConfig {
  id: string;
  label: string;
  icon: any;
  view: PortalView | string;
  badge?: string | number;
  section?: string;
  onClick: () => void;
  active: boolean;
}

// Data-driven configuration
const LOADOUTS = {
  discovery: {
    'Client Portal': [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
      { id: 'discovery-dashboard', label: 'Discovery Dashboard', icon: Compass, view: 'discovery-dashboard' },
      { id: 'onboarding', label: 'Discovery Form', icon: FileText, view: 'onboarding' },
      { id: 'aqua-ai', label: 'Aqua AI', icon: Sparkles, view: 'aqua-ai' },
      { id: 'resources', label: 'Resources', icon: FolderOpen, view: 'resources' },
    ],
    'Support & Settings': [
      { id: 'support', label: 'Support & Help', icon: HelpCircle, view: 'support' },
      { id: 'your-plan', label: 'Your Plan', icon: CreditCard, view: 'your-plan' },
      { id: 'settings', label: 'Settings', icon: Settings, view: 'data-hub' },
      { id: 'configurator', label: 'Configurator', icon: Settings, view: 'configurator' },
    ]
  },
  design: {
    'Client Portal': [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
      { id: 'design-dashboard', label: 'Design Dashboard', icon: Palette, view: 'design-dashboard' },
      { id: 'collaboration', label: 'Collaboration', icon: Monitor, view: 'collaboration' },
      { id: 'aqua-ai', label: 'Aqua AI', icon: Sparkles, view: 'aqua-ai' },
      { id: 'resources', label: 'Resources', icon: FolderOpen, view: 'resources' },
    ],
    'Support & Settings': [
      { id: 'support', label: 'Support & Help', icon: HelpCircle, view: 'support' },
      { id: 'your-plan', label: 'Your Plan', icon: CreditCard, view: 'your-plan' },
      { id: 'settings', label: 'Settings', icon: Settings, view: 'data-hub' },
      { id: 'configurator', label: 'Configurator', icon: Settings, view: 'configurator' },
    ]
  },
  development: {
    'Client Portal': [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
      { id: 'dev-dashboard', label: 'Dev Dashboard', icon: Code2, view: 'dev-dashboard' },
      { id: 'collaboration', label: 'Collaboration', icon: Monitor, view: 'collaboration' },
      { id: 'aqua-ai', label: 'Aqua AI', icon: Sparkles, view: 'aqua-ai' },
      { id: 'resources', label: 'Resources', icon: FolderOpen, view: 'resources' },
    ],
    'Support & Settings': [
      { id: 'support', label: 'Support & Help', icon: HelpCircle, view: 'support' },
      { id: 'your-plan', label: 'Your Plan', icon: CreditCard, view: 'your-plan' },
      { id: 'settings', label: 'Settings', icon: Settings, view: 'data-hub' },
      { id: 'configurator', label: 'Configurator', icon: Settings, view: 'configurator' },
    ]
  },
  live: {
    'Client Portal': [
      { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, view: 'dashboard' },
      { id: 'aqua-ai', label: 'Aqua AI', icon: Sparkles, view: 'aqua-ai' },
      { id: 'resources', label: 'Resources', icon: FolderOpen, view: 'resources' },
    ],
    'Support & Settings': [
      { id: 'support', label: 'Support & Help', icon: HelpCircle, view: 'support' },
      { id: 'your-plan', label: 'Your Plan', icon: CreditCard, view: 'your-plan' },
      { id: 'settings', label: 'Settings', icon: Settings, view: 'data-hub' },
      { id: 'configurator', label: 'Configurator', icon: Settings, view: 'configurator' },
    ]
  }
};

export const getSidebarItems = (params: {
  currentUser: AppUser,
  activeClient: Client | undefined,
  portalView: PortalView | string,
  clients: Client[],
  projects: any[],
  tickets: any[],
  isAgencyRole: boolean,
  impersonatingClientId: string | null,
  hasPermission: (view: PortalView | string) => boolean,
  handleViewChange: (view: PortalView | string) => void,
  setShowEmployeeManagementModal: (show: boolean) => void,
  setShowAppLauncherModal: (show: boolean) => void,
  sidebarCollapsed: boolean,
  agencyConfig: AgencyConfig,
}): { section: string, items: SidebarItemConfig[] }[] => {
  const {
    currentUser,
    activeClient,
    portalView,
    clients,
    projects,
    tickets,
    isAgencyRole,
    impersonatingClientId,
    hasPermission,
    handleViewChange,
    setShowEmployeeManagementModal,
    agencyConfig,
  } = params;

  // Resolve the real (non-impersonated) user's role config for sidebar gating
  const realRoleId = currentUser?.customRoleId || currentUser?.role || 'AgencyEmployee';
  const realRoleConfig = agencyConfig.roles[realRoleId];

  // Helper: resolve label using role overrides then global labels
  const lbl = (key: keyof typeof agencyConfig.labels): string =>
    realRoleConfig?.labelOverrides[key] ?? agencyConfig.labels[key] ?? key;

  // Helper: check if this role's allowedViews includes a given view
  const roleCanView = (view: string): boolean => {
    if (!realRoleConfig) return false;
    if (realRoleConfig.allowedViews === '*') return true;
    return (realRoleConfig.allowedViews as string[]).includes(view);
  };

  const sections: { section: string, items: SidebarItemConfig[] }[] = [];

  if (isAgencyRole && !impersonatingClientId) {
    // Agency Workspace — filter each item by roleCanView
    const allAgencyItems: SidebarItemConfig[] = [
      { id: 'agency-hub', label: lbl('dashboard'), icon: LayoutDashboard, view: 'agency-hub', onClick: () => handleViewChange('agency-hub'), active: portalView === 'agency-hub' },
      { id: 'agency-clients', label: lbl('clients'), icon: Users, view: 'agency-clients', onClick: () => handleViewChange('agency-clients'), active: portalView === 'agency-clients', badge: clients.length },
      { id: 'project-hub', label: lbl('projects'), icon: Briefcase, view: 'project-hub', onClick: () => handleViewChange('project-hub'), active: portalView === 'project-hub', badge: projects.length },
      { id: 'inbox', label: 'Inbox', icon: MessageSquare, view: 'inbox', onClick: () => handleViewChange('inbox'), active: portalView === 'inbox', badge: tickets.filter((t: any) => t.status === 'Open').length },
      { id: 'team', label: lbl('team'), icon: UserCog, view: 'team', onClick: () => setShowEmployeeManagementModal(true), active: false },
    ];

    const agencyItems = allAgencyItems.filter(item =>
      item.id === 'team' ? realRoleConfig?.canManageUsers : roleCanView(item.id)
    );

    if (agencyItems.length > 0) {
      sections.push({ section: agencyConfig.identity.name, items: agencyItems });
    }

    // Admin Tools — visible to roles with canAccessConfigurator or specific views
    const adminItems: SidebarItemConfig[] = [];

    if (roleCanView('admin-dashboard')) {
      adminItems.push({ id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, view: 'admin-dashboard', onClick: () => handleViewChange('admin-dashboard'), active: portalView === 'admin-dashboard' });
    }
    if (roleCanView('logs')) {
      adminItems.push({ id: 'logs', label: 'Activity Logs', icon: History, view: 'logs', onClick: () => handleViewChange('logs'), active: portalView === 'logs' });
    }
    if (roleCanView('ai-sessions')) {
      adminItems.push({ id: 'ai-sessions', label: 'AI Monitor', icon: ShieldAlert, view: 'ai-sessions', onClick: () => handleViewChange('ai-sessions'), active: portalView === 'ai-sessions' });
    }
    if (realRoleConfig?.canAccessConfigurator) {
      adminItems.push({ id: 'agency-configurator', label: 'Configurator', icon: Settings, view: 'agency-configurator', onClick: () => handleViewChange('agency-configurator'), active: portalView === 'agency-configurator' });
    }

    if (adminItems.length > 0) {
      sections.push({ section: 'Admin Tools', items: adminItems });
    }

  } else if (activeClient) {
    // Client-Facing loadout (stage-based, unchanged)
    const stage = activeClient.stage as keyof typeof LOADOUTS;
    const loadout = LOADOUTS[stage];

    if (loadout) {
      Object.entries(loadout).forEach(([sectionTitle, items]) => {
        sections.push({
          section: sectionTitle,
          items: items.map(item => ({
            ...item,
            onClick: () => handleViewChange(item.view),
            active: portalView === item.view
          }))
        });
      });
    }
  }

  return sections;
};
