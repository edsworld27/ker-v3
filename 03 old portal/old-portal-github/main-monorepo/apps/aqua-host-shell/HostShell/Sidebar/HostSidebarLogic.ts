import {
  Settings,
  MessageSquare,
  Bell,
  Store,
  Layers,
} from 'lucide-react';
import { BridgeRegistry } from '@aqua/bridge/registry';
import { AgencyConfig } from '@HostShell/bridge/config/HostagencyConfig';
import { HostPortalView, Client, HostUser } from '@HostShell/bridge/types';

interface SubNavItem {
  id: string;
  label: string;
  icon: any;
  view?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SubNavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  view?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SubNavItem[];
  isParent?: boolean;
}

export interface SidebarSectionData {
  section: string;
  items: NavItem[];
  isCollapsible?: boolean;
  id?: string;
}

interface GetSidebarItemsArgs {
  currentUser: HostUser;
  activeClient: Client | null;
  portalView: HostPortalView | string;
  isAgencyRole: boolean;
  impersonatingClientId: string | null;
  hasPermission: (view: HostPortalView | string) => boolean;
  handleViewChange: (view: HostPortalView | string) => void;
  agencyConfig: AgencyConfig;
  appMode?: string;
  setAppMode: (mode: string) => void;
  handleImpersonate?: (clientId: string) => void;
  handleStopImpersonating?: () => void;
  enabledSuiteIds: string[];
  openModal?: (name: string) => void;
}

/**
 * Builds the host shell sidebar from the BridgeRegistry.
 *
 * - Marketplace is always visible.
 * - Each registered suite renders as a nav item, optionally with subItems.
 * - When `enabledSuiteIds` is non-empty, only those suites are shown.
 *   Empty list → permissive demo mode showing every registered suite so
 *   the portal is usable without persisted state.
 * - Suites are grouped by `section` (falls back to "Plugins").
 */
export const getSidebarItems = ({
  portalView,
  handleViewChange,
  enabledSuiteIds,
  openModal,
}: GetSidebarItemsArgs): SidebarSectionData[] => {
  const sections: SidebarSectionData[] = [];

  // 1. Marketplace — always at the top.
  sections.push({
    section: 'AQUA SUITES',
    items: [
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: Store,
        view: 'marketplace',
        active: portalView === 'marketplace',
        onClick: () => handleViewChange('marketplace'),
      },
    ],
  });

  // 2. Registered suites, filtered + grouped.
  const allSuites = BridgeRegistry.getSuites();
  const enabledSet = new Set(enabledSuiteIds || []);
  const visibleSuites = enabledSet.size > 0
    ? allSuites.filter(s => enabledSet.has(s.id))
    : allSuites;

  const grouped = new Map<string, NavItem[]>();
  for (const suite of visibleSuites) {
    const section = suite.section || 'Plugins';
    const view = suite.defaultView || (suite.subItems?.[0]?.view) || suite.id;
    const item: NavItem = {
      id: suite.id,
      label: suite.label,
      icon: suite.icon || Layers,
      view,
      active: portalView === view || portalView === suite.id,
      onClick: () => handleViewChange(view),
      children: suite.subItems?.map(sub => ({
        id: sub.id,
        label: sub.label,
        icon: sub.icon,
        view: sub.view,
        active: portalView === sub.view,
        onClick: () => handleViewChange(sub.view),
      })),
    };
    if (!grouped.has(section)) grouped.set(section, []);
    grouped.get(section)!.push(item);
  }

  for (const [section, items] of grouped) {
    sections.push({ section: section.toUpperCase(), items, isCollapsible: true });
  }

  // 3. Empty-state nudge if nothing is registered yet.
  if (visibleSuites.length === 0) {
    sections.push({
      section: 'GETTING STARTED',
      items: [
        {
          id: 'install-first-plugin',
          label: 'Open Marketplace',
          icon: Store,
          onClick: () => handleViewChange('marketplace'),
        },
      ],
    });
  }

  // 4. Global hub — always at the bottom.
  sections.push({
    section: 'Global Hub',
    items: [
      {
        id: 'inbox',
        label: 'Agency Inbox',
        icon: MessageSquare,
        onClick: () => openModal?.('InboxModal'),
      },
      {
        id: 'notifications',
        label: 'All Notifications',
        icon: Bell,
        onClick: () => openModal?.('NotificationsModal'),
      },
      {
        id: 'global-settings',
        label: 'Settings',
        icon: Settings,
        view: 'global-settings',
        active: portalView === 'global-settings',
        onClick: () => handleViewChange('global-settings'),
      },
    ],
  });

  return sections;
};
